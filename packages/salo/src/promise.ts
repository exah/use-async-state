interface PendingPromise<T> extends Promise<T> {
  status: 'pending'
}

interface RejectedPromise extends Promise<never> {
  status: 'rejected'
  reason: unknown
}

interface FulfilledPromise<T> extends Promise<T> {
  status: 'fulfilled'
  result: T
}

export type SuspensePromise<T> =
  | PendingPromise<T>
  | RejectedPromise
  | FulfilledPromise<T>

interface PromiseTemplate<T> extends Promise<T> {
  status?: 'pending' | 'rejected' | 'fulfilled'
  result?: T
  reason?: unknown
}

export function toSuspensePromise<T>(
  input: Promise<T> | T
): SuspensePromise<T> {
  const promise: PromiseTemplate<T> = Promise.resolve(input)

  promise.status = 'pending'
  promise.then(
    (value) => {
      promise.status = 'fulfilled'
      promise.result = value
    },
    (error) => {
      promise.status = 'rejected'
      promise.reason = error
    }
  )

  assertPromise(promise)
  return promise
}

function assertPromise<T>(_: Promise<T>): asserts _ is SuspensePromise<T> {}
