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
    staleTime = DEFAULT_STALE_TIME,
    cacheTime = DEFAULT_CACHE_TIME,
  }: LoaderOptions<Data, Key>
): Loader<Data, Key> {
  let snapshot: LoaderSnapshot<Data>
  const loader: Loader<Data, Key> = {
    key,
    hash: JSON.stringify(key),
    fetchedAt: null,
    updatedAt: null,
    controller: null,
    gcTimeout: null,
    subscribers: [],
    get snapshot() {
      return snapshot
    },
    get shouldInit() {
      return loader.fetchedAt === null
    },
    get shouldUpdate() {
      return (
        loader.updatedAt === null || Date.now() - loader.updatedAt > staleTime
      )
    },
    subscribe: (subscriber) => {
      loader.subscribers.push(subscriber)
      loader.unscheduleGC()

      return () => {
        loader.subscribers = loader.subscribers.filter((d) => d !== subscriber)
        loader.controller?.abort()
        loader.controller = null

        if (loader.subscribers.length === 0) {
          loader.scheduleGC()
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
    fetch: (shouldUpdate = false) => {
      if (!shouldUpdate && !loader.shouldInit && !loader.shouldUpdate) {
        return
      }

      const controller = new AbortController()
      const promise = Promise.resolve(
        fetch({ key: key, signal: controller.signal })
      )

      exposePromiseState(promise)

      snapshot ??= { promise, isUpdating: true }
      snapshot.isUpdating = true

      loader.controller = controller
      loader.fetchedAt = Date.now()

      promise
        .then(() => {
          loader.updatedAt = Date.now()
        })
        .finally(() => {
          snapshot = { promise, isUpdating: false }

          loader.controller = null
          loader.notify()
        })
    },
  }

  return loader
}
