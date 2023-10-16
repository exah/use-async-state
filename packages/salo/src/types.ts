export type LoaderKey = [unknown, ...unknown[]]

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
  update: (options?: FetchOptions) => void
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
  hash: string[]
  state: LoaderState
  controller: AbortController | null
  gcTimeout: ReturnType<typeof setTimeout> | null
  updatedAt: number | null
  subscribers: Subscriber[]
  snapshot: LoaderSnapshot<Data>
  isStale: boolean
  promise: Promise<Data> | null
  shouldInit: () => boolean
  shouldInvalidate: () => boolean
  subscribe: (subscriber: Subscriber) => () => void
  notify: () => void
  scheduleGC: () => void
  unscheduleGC: () => void
  fetch: (options?: FetchOptions) => Promise<Data>
  invalidate: () => void
  cancel: () => void
}

export interface FetchOptions {
  cancelFetch?: boolean
}

export interface LoaderSnapshot<Data> {
  promise: Promise<Data>
  pending: boolean
}

export type InvalidateType = 'auto' | 'all'
export type LoaderState = 'active' | 'inactive'

export interface LoaderFilters<Data, Key extends LoaderKey> {
  key?: Key
  state?: LoaderState
  exact?: boolean
  stale?: boolean
  pending?: boolean
  predicate?: (loader: Loader<Data, Key>) => boolean
}

export interface InvalidateOptions<Data, Key extends LoaderKey>
  extends LoaderFilters<Data, Key>,
    FetchOptions {
  type?: InvalidateType
}

export interface LoaderClient<Data, Key extends LoaderKey> {
  loaders: Loader<Data, Key>[]
  find(filters: LoaderFilters<Data, Key>): Loader<Data, Key>[]
  getOrCreate(options: LoaderOptions<Data, Key>): Loader<Data, Key>
  invalidate(options?: InvalidateOptions<Data, Key>): Promise<void>
  reset(): void
}
