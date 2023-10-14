export type LoaderKey = readonly (string | number)[]

export interface LoaderOptions<
  Data = unknown,
  Key extends LoaderKey = LoaderKey
> {
  key: Key
  fetch: (payload: FetchPayload<Key>) => Promise<Data> | Data
  staleTime?: number
  cacheTime?: number
}

export interface LoaderResult<
  Data = unknown,
  Key extends LoaderKey = LoaderKey
> {
  key: Key
  data: Data
  updatedAt: number
  isUpdating: boolean
  update: () => void
}

export interface FetchPayload<Key extends LoaderKey = LoaderKey> {
  key: Key
  signal: AbortSignal
}

export interface Subscriber {
  notify: () => void
}

export interface Loader<Data, Key extends LoaderKey> {
  key: Key
  hash: string
  controller: AbortController | null
  promise: Promise<Data> | null
  gcTimeout: ReturnType<typeof setTimeout> | null
  updatedAt: number | null
  subscribers: Subscriber[]
  subscribe: (subscriber: Subscriber) => () => void
  scheduleGC: () => void
  unscheduleGC: () => void
  fetch: (subscriber: Subscriber) => void
}

export interface LoaderState<Data> {
  status: 'success' | 'error' | 'loading'
  data: Data | undefined
  updatedAt: number | undefined
  isFetching: boolean
  error: unknown
}

export interface LoaderClient<Data, Key extends LoaderKey> {
  loaders: Loader<Data, Key>[]
  getLoader: (options: LoaderOptions<Data, Key>) => Loader<Data, Key>
}

export interface LoaderObserver<Data> extends Subscriber {
  subscribe: (callback: () => void) => () => void
  fetch: () => void
  hash: string
  isFetching: boolean
  promise: Promise<Data>
  updatedAt: number
}
