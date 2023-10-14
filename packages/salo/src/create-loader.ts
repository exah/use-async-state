import type { LoaderOptions, LoaderKey, LoaderClient, Loader } from './types'

export function createLoader<Data, Key extends LoaderKey>(
  client: LoaderClient<Data, Key>,
  options: LoaderOptions<Data, Key>
): Loader<Data, Key> {
  const loader: Loader<Data, Key> = {
    key: options.key,
    hash: JSON.stringify(options.key),
    promise: null,
    updatedAt: null,
    controller: null,
    gcTimeout: null,
    subscribers: [],
    subscribe: (subscriber) => {
      loader.subscribers.push(subscriber)
      loader.unscheduleGC()

      return () => {
        loader.subscribers = loader.subscribers.filter((d) => d !== subscriber)
        loader.controller?.abort('Cancelled')
        loader.controller = null

        if (loader.subscribers.length === 0) {
          loader.scheduleGC()
        }
      }
    },
    scheduleGC: () => {
      loader.gcTimeout = setTimeout(() => {
        client.loaders = client.loaders.filter((d) => d !== loader)
        loader.gcTimeout = null
      }, options.cacheTime)
    },
    unscheduleGC: () => {
      if (loader.gcTimeout !== null) {
        clearTimeout(loader.gcTimeout)
      }
    },
    fetch: (parent) => {
      loader.controller = new AbortController()
      const promise = Promise.resolve(
        options.fetch({ key: options.key, signal: loader.controller.signal })
      )

      if (loader.promise === null) {
        loader.promise = promise
      }

      loader.promise
        .then(() => {
          loader.updatedAt = Date.now()
          loader.promise = promise
        })
        .finally(() => {
          loader.subscribers.forEach(
            (subscriber) => parent !== subscriber && subscriber.notify()
          )

          loader.controller = null
        })
    },
  }

  return loader
}
