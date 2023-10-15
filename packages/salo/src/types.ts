export type LoaderKey = readonly unknown[]

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
  state: LoaderState
  controller: AbortController | null
  gcTimeout: ReturnType<typeof setTimeout> | null
  fetchedAt: number | null
  updatedAt: number | null
  subscribers: Subscriber[]
  snapshot: LoaderSnapshot<Data>
  shouldInit: boolean
  shouldUpdate: boolean
  shouldInvalidate: boolean
  subscribe: (subscriber: Subscriber) => () => void
  notify: () => void
  scheduleGC: () => void
  unscheduleGC: () => void
  fetch: (shouldUpdate?: boolean) => Promise<void>
  invalidate: () => void
  cancel: () => void
}

export interface LoaderSnapshot<Data> {
  promise: Promise<Data>
  isPending: boolean
}

export type InvalidateType = 'auto' | 'all'
export type LoaderState = 'active' | 'inactive'

export type Predicate<Data, Key extends LoaderKey> =
  | Key
  | ((loader: Loader<Data, Key>) => boolean)

export interface LoaderFilters<Key extends LoaderKey> {
  key?: Key
  state?: LoaderState
  exact?: boolean
  predicate?: (loader: Loader<never, Key>) => boolean
}

export interface InvalidateOptions<Key extends LoaderKey>
  extends LoaderFilters<Key> {
  type?: InvalidateType
}

export interface LoaderClient<Data, Key extends LoaderKey> {
  loaders: Loader<Data, Key>[]
  find(filters: LoaderFilters<Key>): Loader<Data, Key>[]
  getOrCreate(options: LoaderOptions<Data, Key>): Loader<Data, Key>
  invalidate(options?: InvalidateOptions<Key>): Promise<void>
  reset(): void
}
