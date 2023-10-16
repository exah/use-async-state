interface PendingStatus {
  status: 'pending'
}

interface RejectedStatus {
  status: 'rejected'
  reason: unknown
}

interface FulfilledStatus<T> {
  status: 'fulfilled'
  result: T
}

interface PendingPromise<T> extends Promise<T>, PendingStatus {}
interface RejectedPromise extends Promise<never>, RejectedStatus {}
interface FulfilledPromise<T> extends Promise<T>, FulfilledStatus<T> {}

export type SuspensePromise<T> =
  | PendingPromise<T>
  | RejectedPromise
  | FulfilledPromise<T>

export function toSuspensePromise<T>(input: Promise<T>): SuspensePromise<T> {
  const promise = Object.assign<Promise<T>, PendingStatus>(
    Promise.resolve(input),
    { status: 'pending' }
  )

  promise.then(
    (value) =>
      Object.assign<Promise<T>, FulfilledStatus<T>>(promise, {
        status: 'fulfilled',
        result: value,
      }),
    (error) =>
      Object.assign<Promise<T>, RejectedStatus>(promise, {
        status: 'rejected',
        reason: error,
      })
  )

  return promise
}
