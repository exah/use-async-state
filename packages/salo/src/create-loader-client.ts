import type { LoaderKey, LoaderClient } from './types'
import { createLoader } from './create-loader'

export function createLoaderClient<Data, Key extends LoaderKey>() {
  const client: LoaderClient<Data, Key> = {
    loaders: [],
    getLoader: (options) => {
      const hash = JSON.stringify(options.key)
      let loader = client.loaders.find((loader) => loader.hash === hash)

      if (!loader) {
        loader = createLoader(client, options)
        client.loaders.push(loader)
      }

      return loader
    },
  }

  return client
}
