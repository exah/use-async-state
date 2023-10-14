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

export interface LoaderResult<Data = unknown> {
  data: Data
  isUpdating: boolean
  update: () => void
}

export interface FetchPayload<Key extends LoaderKey = LoaderKey> {
  key: Key
  signal: AbortSignal
}

export interface Subscriber {
  (): void
}

export interface Loader<Data, Key extends LoaderKey> {
  key: Key
  hash: string
  controller: AbortController | null
  gcTimeout: ReturnType<typeof setTimeout> | null
  fetchedAt: number | null
  updatedAt: number | null
  subscribers: Subscriber[]
  snapshot: LoaderSnapshot<Data>
  shouldInit: boolean
  shouldUpdate: boolean
  subscribe: (subscriber: Subscriber) => () => void
  notify: () => void
  scheduleGC: () => void
  unscheduleGC: () => void
  fetch: (shouldUpdate?: boolean) => void
}

export interface LoaderSnapshot<Data> {
  promise: Promise<Data>
  isUpdating: boolean
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
