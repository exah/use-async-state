import type { LoaderOptions, LoaderKey, LoaderClient, Loader } from './types'
import { exposePromiseState } from './use'

const DEFAULT_STALE_TIME = 1000 // 1 Second
const DEFAULT_CACHE_TIME = 5 * 60 * 1000 // 5 Minutes
const DEFAULT_SNAPSHOT = {
  get promise() {
    return Promise.reject(new Error('Promise is required'))
  },
  isPending: false,
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
    key: key,
    hash: JSON.stringify(key),
    state: 'inactive',
    updatedAt: null,
    controller: null,
    gcTimeout: null,
    subscribers: [],
    snapshot: DEFAULT_SNAPSHOT,
    isStale: true,
    shouldInit: () => loader.snapshot === DEFAULT_SNAPSHOT,
    shouldInvalidate: () =>
      loader.isStale ||
      (loader.updatedAt !== null && Date.now() - loader.updatedAt > staleTime),
    subscribe: (subscriber) => {
      loader.subscribers.push(subscriber)
      loader.state = 'active'
      loader.unscheduleGC()

      if (loader.shouldInvalidate()) {
        loader.fetch()
      }

      return () => {
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
      loader.controller?.abort(new CancellationError())
      loader.controller = null
    },
    fetch: () => {
      const handleError = (error: unknown) => {
        if (error instanceof CancellationError) {
          return loader.snapshot.promise
        }

        throw error
      }

      const controller = new AbortController()
      const promise = Promise.resolve(
        fetch({ key, signal: controller.signal })
      ).catch(handleError)

      exposePromiseState(promise)

      if (loader.shouldInit()) {
        loader.snapshot = { promise, isPending: true }
      } else {
        loader.snapshot.isPending = true
      }

      loader.cancel()
      loader.controller = controller
      loader.isStale = false

      return promise
        .catch(handleError)
        .then(() => {
          loader.updatedAt = Date.now()
        })
        .finally(() => {
          loader.snapshot = { promise, isPending: false }
          loader.controller = null

          loader.notify()
        })
    },
    invalidate: () => (loader.isStale = true),
  }

  return loader
}
