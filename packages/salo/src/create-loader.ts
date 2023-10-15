import type {
  LoaderOptions,
  LoaderKey,
  LoaderClient,
  LoaderSnapshot,
  Loader,
} from './types'
import { exposePromiseState } from './use'

const DEFAULT_STALE_TIME = 1000 // 1 Second
const DEFAULT_CACHE_TIME = 5 * 60 * 1000 // 5 Minutes

export function createLoader<Data, Key extends LoaderKey>(
  client: LoaderClient<Data, Key>,
  {
    key,
    fetch,
    cacheTime = DEFAULT_CACHE_TIME,
    staleTime = DEFAULT_STALE_TIME,
  }: LoaderOptions<Data, Key>
): Loader<Data, Key> {
  const loader: Loader<Data, Key> = {
    key: key,
    hash: JSON.stringify(key),
    state: 'inactive',
    fetchedAt: null,
    updatedAt: null,
    controller: null,
    gcTimeout: null,
    subscribers: [],
    snapshot: {
      get promise() {
        return Promise.reject(new Error('Promise is required'))
      },
      isPending: false,
    },
    get shouldInit() {
      return loader.fetchedAt === null
    },
    get shouldUpdate() {
      return (
        loader.updatedAt === null || Date.now() - loader.updatedAt > staleTime
      )
    },
    shouldInvalidate: false,
    subscribe: (subscriber) => {
      loader.subscribers.push(subscriber)
      loader.state = 'active'
      loader.unscheduleGC()

      return () => {
        loader.subscribers = loader.subscribers.filter((d) => d !== subscriber)
        loader.cancel()

        if (loader.subscribers.length === 0) {
          loader.scheduleGC()
          loader.state = 'inactive'
        }
      }
    },
    notify: () => loader.subscribers.forEach((subscriber) => subscriber()),
    scheduleGC: () => {
      loader.gcTimeout = setTimeout(() => {
        client.loaders = client.loaders.filter((d) => d !== loader)
        loader.gcTimeout = null
      }, cacheTime)
    },
    unscheduleGC: () => {
      if (loader.gcTimeout !== null) {
        clearTimeout(loader.gcTimeout)
      }
    },
    cancel: () => {
      loader.controller?.abort(new Error('Request is cancelled'))
      loader.controller = null
    },
    fetch: async (shouldUpdate = false) => {
      if (
        !shouldUpdate &&
        !loader.shouldInit &&
        !loader.shouldUpdate &&
        !loader.shouldInvalidate
      ) {
        return Promise.resolve()
      }

      const controller = new AbortController()
      const promise = Promise.resolve(fetch({ key, signal: controller.signal }))

      exposePromiseState(promise)

      if (loader.shouldInit) loader.snapshot = { promise, isPending: true }
      loader.snapshot.isPending = true

      loader.cancel()
      loader.controller = controller
      loader.fetchedAt = Date.now()
      loader.shouldInvalidate = false

      try {
        await promise
        loader.updatedAt = Date.now()
      } finally {
        loader.snapshot = { promise, isPending: false }
        loader.controller = null

        loader.notify()
      }
    },
    invalidate: () => (loader.shouldInvalidate = true),
  }

  return loader
}
