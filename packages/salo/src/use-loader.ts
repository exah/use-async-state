import { useRef, useEffect, useReducer, useTransition } from 'react'
import type {
  LoaderKey,
  LoaderOptions,
  LoaderResult,
  LoaderObserver,
} from './types'
import { createLoaderObserver } from './create-loader-observer'
import { useLoaderClient } from './loader-client-context'
import { use } from './use'

export function useLoader<Data, Key extends LoaderKey = LoaderKey>(
  options: LoaderOptions<Data, Key>
): LoaderResult<Data, Key> {
  const client = useLoaderClient<Data, Key>()
  const observerRef = useRef<LoaderObserver<Data> | null>(null)
  const [isPending, startTransition] = useTransition()
  const [_, rerender] = useReducer((i) => i + 1, 0)

  if (observerRef.current === null) {
    observerRef.current = createLoaderObserver<Data, Key>(client, options)
    observerRef.current.fetch()
  }

  useEffect(() => {
    if (observerRef.current) {
      return observerRef.current.subscribe(rerender)
    }
  }, [observerRef.current.hash])

  return {
    key: options.key,
    data: use(observerRef.current.promise),
    updatedAt: observerRef.current.updatedAt,
    update: () => {
      startTransition(() => {
        observerRef.current?.fetch()
      })
    },
    isUpdating: isPending || observerRef.current.isFetching,
  }
}
