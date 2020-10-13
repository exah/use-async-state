import { useState, useMemo } from 'react'

const merge = <A, B>(a: A, b: B): Omit<A, keyof B> & B =>
  Object.assign({}, a, b)

export interface AsyncActions<T> {
  start(): void
  finish(payload: T | Error): void
}

export type AsyncState<T> =
  | { type: 'idle'; data?: undefined; error?: undefined }
  | { type: 'loading'; data?: T; error?: Error }
  | { type: 'ready'; data: T; error?: undefined }
  | { type: 'updating'; data: T; error?: undefined }
  | { type: 'failed'; data?: T; error: Error }

export function useAsyncState<T>() {
  const [state, setState] = useState<AsyncState<T>>({ type: 'idle' })

  const actions = useMemo<AsyncActions<T>>(
    () => ({
      start() {
        setState((prev) => {
          if (prev.type === 'ready') {
            return merge(prev, { type: 'updating' })
          }

          return merge(prev, { type: 'loading' })
        })
      },
      finish(payload) {
        setState((prev) => {
          if (payload instanceof Error) {
            return merge(prev, { type: 'failed', error: payload })
          }

          return { type: 'ready', data: payload }
        })
      },
    }),
    []
  )

  return [state, actions] as const
}
