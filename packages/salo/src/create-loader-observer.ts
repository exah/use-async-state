import type {
  LoaderClient,
  LoaderOptions,
  LoaderKey,
  LoaderObserver,
} from './types'

const DEFAULT_STALE_TIME = 1000 // 1 Second
const DEFAULT_CACHE_TIME = 5 * 60 * 1000 // 5 Minutes

export function createLoaderObserver<Data, Key extends LoaderKey>(
  client: LoaderClient<Data, Key>,
  {
    key,
    fetch,
    staleTime = DEFAULT_STALE_TIME,
    cacheTime = DEFAULT_CACHE_TIME,
  }: LoaderOptions<Data, Key>
) {
  const loader = client.getLoader({ key, fetch, staleTime, cacheTime })
  const observer: LoaderObserver<Data> = {
    notify: () => {},
    subscribe: (callback) => {
      observer.notify = callback
      observer.fetch()

      return loader.subscribe(observer)
    },
    fetch: () => {
      if (observer.isFetching) {
        return
      }

      if (
        loader.updatedAt === null ||
        Date.now() - loader.updatedAt > staleTime
      ) {
        loader.fetch(observer)
      }
    },
    get hash() {
      return loader.hash
    },
    get isFetching() {
      return loader.controller !== null
    },
    get updatedAt() {
      if (loader.updatedAt === null) {
        throw new Error('loader.updatedAt is required, call `.fetch` first')
      }

      return loader.updatedAt
    },
    get promise() {
      if (loader.promise === null) {
        throw new Error('loader.promise is required, call `.fetch` first')
      }

      return loader.promise
    },
  }

  return observer
}
