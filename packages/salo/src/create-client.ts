import type { LoaderKey, LoaderClient } from './types'
import { createLoader } from './create-loader'
import { requestIdleCallback } from './idle-callback'
import { matchFilter } from './filters'
import { IDLE_CALLBACK_TIMEOUT } from './contstants'

export function createClient<Data, Key extends LoaderKey>() {
  const client: LoaderClient<Data, Key> = {
    loaders: [],
    subscribers: [],
    find: (filter) => client.loaders.filter(matchFilter(filter)),
    findOne: (filter) => client.loaders.find(matchFilter(filter)),
    getOrCreate: (options) => {
      let loader = client.findOne({ key: options.key, exact: true })

      if (!loader) {
        loader = createLoader(client, options)
        client.loaders.push(loader)
      }

      return loader
    },
    invalidate: async (options = {}) => {
      const { type = 'auto' } = options
      const loaders = client.find(options)

      await Promise.all(
        loaders.map((loader) => {
          if (type === 'auto' && loader.state === 'inactive') {
            return loader.invalidate()
          }

          return loader.fetch(options)
        })
      )
      return
    },
    reset: () => {
      client.loaders = []
      client.notify()
    },
    subscribe: (subscriber) => {
      client.subscribers.push(subscriber)

      return () => {
        client.subscribers = client.subscribers.filter((d) => d !== subscriber)
      }
    },
    notify: () =>
      requestIdleCallback(
        () => client.subscribers.forEach((subscriber) => subscriber()),
        { timeout: IDLE_CALLBACK_TIMEOUT }
      ),
  }

  return client
}
