import { useTransition, useSyncExternalStore } from 'react'
import type { LoaderKey, LoaderOptions, LoaderResult } from './types'
import { useLoaderClient } from './loader-client-context'
import { use } from './use'

export function useLoader<Data, Key extends LoaderKey = LoaderKey>(
  options: LoaderOptions<Data, Key>
): LoaderResult<Data> {
  const [isPending, startTransition] = useTransition()

  const client = useLoaderClient<Data, Key>()
  const loader = client.getLoader(options)

  if (loader.shouldInit) {
    loader.fetch()
  }

  const state = useSyncExternalStore(
    loader.subscribe,
    () => loader.snapshot,
    () => loader.snapshot
  )

  return {
    data: use(state.promise),
    isUpdating: state.isUpdating || isPending,
    update: () => startTransition(() => loader.fetch(true)),
  }
}
