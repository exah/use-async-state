import isPlainObject from 'is-plain-obj'
import type { LoaderKey, Loader, LoaderFilter } from './types'

const stringify = (input: unknown) =>
  JSON.stringify(input, (_, value: unknown) =>
    isPlainObject(value) ? Object.entries(value).sort() : value
  )

export const getHash = (key: LoaderKey) => key.map(stringify)

export const matchFilterKey = (
  hashA: string[],
  hashB: string[],
  exact: boolean | undefined
) =>
  exact
    ? hashA.join() === hashB.join()
    : hashA.reduce((acc, part, index) => acc && part === hashB[index], true)

export const matchFilter = <Data, Key extends LoaderKey>(
  filter: LoaderFilter<Data, Key>
) => {
  if (filter.predicate) {
    return filter.predicate
  }

  const hash = filter.key ? getHash(filter.key) : undefined

  return (loader: Loader<Data, Key>) =>
    (!hash || matchFilterKey(hash, loader.hash, filter.exact)) &&
    (!filter.state || filter.state === loader.state) &&
    (!filter.stale || filter.stale === loader.isStale) &&
    (!filter.pending || filter.pending === loader.snapshot.pending)
}
