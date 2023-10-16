import { useTransition, useSyncExternalStore } from 'react'
import type { LoaderKey, LoaderOptions, LoaderResult } from 'salo'
import { useClient } from './use-client'
import { use } from './use'

export function useLoader<Data, Key extends LoaderKey = LoaderKey>(
  options: LoaderOptions<Data, Key>
): LoaderResult<Data> {
  const [isPending, startTransition] = useTransition()

  const client = useClient<Data, Key>()
  const loader = client.getOrCreate(options)

  if (loader.shouldInit()) {
    loader.fetch()
  }

  const state = useSyncExternalStore(
    loader.subscribe,
    () => loader.snapshot,
    () => loader.snapshot
  )

  return {
    data: use(state.promise),
    isUpdating: state.pending || isPending,
    update: (options) =>
      startTransition(() => {
        loader.fetch(options)
      }),
  }
}
