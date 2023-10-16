import type { LoaderKey, LoaderClient } from './types'
import { createLoader } from './create-loader'

const matchFilterKey = (
  hashA: string[],
  hashB: string[],
  exact: boolean | undefined
) =>
  exact
    ? hashA.join() === hashB.join()
    : hashA.some((part, index) => part === hashB[index])

export function createLoaderClient<Data, Key extends LoaderKey>() {
  const client: LoaderClient<Data, Key> = {
    loaders: [],
    find: (filters) => {
      if (filters.predicate) {
        return client.loaders.filter(filters.predicate)
      }

      const hash = filters.key
        ? filters.key.map((part) => JSON.stringify(part))
        : undefined

      return client.loaders.filter(
        (loader) =>
          (!hash || matchFilterKey(hash, loader.hash, filters.exact)) &&
          (!filters.state || filters.state === loader.state) &&
          (!filters.stale || filters.stale === loader.isStale) &&
          (!filters.pending || filters.pending === loader.snapshot.pending)
      )
    },
    getOrCreate: (options) => {
      let [loader] = client.find({ key: options.key, exact: true })

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
    },
  }

  return client
}
