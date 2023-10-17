import type { LoaderOptions, LoaderKey, LoaderClient, Loader } from './types'
import { toSuspensePromise } from './promise'
import { requestIdleCallback } from './idle-callback'
import { getHash } from './filters'
import {
  DEFAULT_CACHE_TIME,
  DEFAULT_STALE_TIME,
  DEFAULT_SNAPSHOT,
  IDLE_CALLBACK_TIMEOUT,
} from './contstants'

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
      loader.subscribers.push(subscriber)
      loader.state = 'active'
      loader.unscheduleGC()
      client.notify()

      if (loader.shouldInvalidate()) {
        loader.fetch()
      }

      return () => {
        loader.subscribers = loader.subscribers.filter((d) => d !== subscriber)
        client.notify()

        if (loader.subscribers.length === 0) {
          loader.state = 'inactive'
          loader.cancel()
          loader.scheduleGC()
        }
      }
    },
    notify: () =>
      requestIdleCallback(
        () => loader.subscribers.forEach((subscriber) => subscriber()),
        { timeout: IDLE_CALLBACK_TIMEOUT }
      ),
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
      client.notify()
    },
    fetch: (options) => {
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

      client.notify()
      loader.cancel()
      loader.controller = controller
      loader.stale = false
      loader.promise = promise

      promise
        .then(() => {
          loader.updatedAt = Date.now()
          loader.failedAt = null
        })
        .catch(() => {
          loader.failedAt = Date.now()
          loader.updatedAt = null
          loader.invalidate()
        })
        .finally(() => {
          loader.snapshot = { promise, pending: false }
          loader.controller = null
          loader.promise = null

          loader.notify()
          client.notify()
        })

      return promise
    },
    invalidate: () => {
      loader.stale = true
      client.notify()
    },
  }

  return loader
}
