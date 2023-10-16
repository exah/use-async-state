import type {
  LoaderOptions,
  LoaderKey,
  LoaderClient,
  LoaderSnapshot,
  Loader,
} from './types'
import { toSuspensePromise } from './promise'
import { getHash } from './filters'

const DEFAULT_STALE_TIME = 1000 // 1 Second
const DEFAULT_CACHE_TIME = 5 * 60 * 1000 // 5 Minutes
const DEFAULT_SNAPSHOT: LoaderSnapshot<never> = {
  get promise() {
    return toSuspensePromise(Promise.reject(new Error('Promise is required')))
  },
  pending: false,
}

class CancellationError extends Error {
  constructor() {
    super('Request is cancelled')
  }
}

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
    key,
    hash: getHash(key),
    state: 'inactive',
    updatedAt: null,
    failedAt: null,
    controller: null,
    gcTimeout: null,
    subscribers: [],
    snapshot: DEFAULT_SNAPSHOT,
    promise: null,
    stale: true,
    shouldInit: () =>
      loader.snapshot === DEFAULT_SNAPSHOT ||
      (loader.failedAt !== null && Date.now() - loader.failedAt > staleTime),
    shouldInvalidate: () =>
      loader.stale ||
      (loader.updatedAt !== null && Date.now() - loader.updatedAt > staleTime),
    subscribe: (subscriber) => {
      console.log('loader.subscribe', loader.key)
      loader.subscribers.push(subscriber)
      loader.state = 'active'
      loader.unscheduleGC()

      if (loader.shouldInvalidate()) {
        loader.fetch()
      }

      return () => {
        console.log('loader.unsubscribe', loader.key)
        loader.subscribers = loader.subscribers.filter((d) => d !== subscriber)

        if (loader.subscribers.length === 0) {
          loader.cancel()
          loader.scheduleGC()
          loader.state = 'inactive'
        }
      }
    },
    notify: () => loader.subscribers.forEach((subscriber) => subscriber()),
    scheduleGC: () => {
      loader.gcTimeout = setTimeout(() => {
        loader.remove()
        loader.gcTimeout = null
      }, cacheTime)
    },
    unscheduleGC: () => {
      if (loader.gcTimeout !== null) {
        clearTimeout(loader.gcTimeout)
      }
    },
    cancel: () => {
      loader.controller?.abort(new CancellationError())
      loader.controller = null
    },
    remove: () => {
      client.loaders = client.loaders.filter((d) => d !== loader)
    },
    fetch: (options) => {
      console.log('loader.fetch', loader.key)

      if (loader.promise && !options?.cancelFetch) {
        return loader.promise
      }

      const handleError = (error: unknown) => {
        if (error instanceof CancellationError) {
          return loader.snapshot.promise
        }

        throw error
      }

      const controller = new AbortController()
      const promise = toSuspensePromise(
        Promise.resolve(fetch({ key, signal: controller.signal })).catch(
          handleError
        )
      )

      if (loader.shouldInit()) {
        loader.snapshot = { promise, pending: true }
      } else {
        loader.snapshot.pending = true
      }

      loader.cancel()
      loader.controller = controller
      loader.stale = false
      loader.promise = promise

      promise
        .then(() => {
          loader.updatedAt = Date.now()
        })
        .catch(() => {
          loader.failedAt = Date.now()
          loader.invalidate()
        })
        .finally(() => {
          loader.snapshot = { promise, pending: false }
          loader.controller = null
          loader.promise = null

          loader.notify()
        })

      return promise
    },
    invalidate: () => (loader.stale = true),
  }

  return loader
}
