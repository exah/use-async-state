import type { LoaderKey, LoaderClient } from './types'
import { createLoader } from './create-loader'

export function createLoaderClient<Data, Key extends LoaderKey>() {
  const client: LoaderClient<Data, Key> = {
    loaders: [],
    find: (filters) => {
      if (
        filters.key === undefined &&
        filters.state === undefined &&
        filters.predicate === undefined
      ) {
        return client.loaders
      }

      const hash = JSON.stringify(filters.key)
      return client.loaders.filter((loader) => loader.hash === hash)
    },
    getOrCreate: (options) => {
      let [loader] = client.find(options)

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

          return loader.fetch(true)
        })
      )
      return
    },
    reset: () => {
      client.loaders = []
    },
  }

  return client
}
