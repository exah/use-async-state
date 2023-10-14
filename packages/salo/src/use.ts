interface PendingPromise<T> extends globalThis.Promise<T> {
  status: 'pending'
}

interface RejectedPromise<T> extends globalThis.Promise<T> {
  status: 'rejected'
  reason: unknown
}

interface FulfilledPromise<T> extends globalThis.Promise<T> {
  status: 'fulfilled'
  value: T
}

interface FallbackPromise<T> extends globalThis.Promise<T> {
  status?: undefined
}

interface StatefulPromise<T> extends globalThis.Promise<T> {
  status?: 'pending' | 'rejected' | 'fulfilled'
  value?: T
  reason?: unknown
}

type Promise<T> =
  | PendingPromise<T>
  | RejectedPromise<T>
  | FulfilledPromise<T>
  | FallbackPromise<T>

function exposePromiseState<T>(promise: StatefulPromise<T>): void {
  promise.status = 'pending'

  promise.then(
    (value) => {
      promise.status = 'fulfilled'
      promise.value = value
    },
    (error) => {
      promise.status = 'rejected'
      promise.reason = error
    }
  )
}

export function use<T>(promise: Promise<T>): T {
  switch (promise.status) {
    case 'pending':
      throw promise
    case 'fulfilled':
      return promise.value
    case 'rejected':
      throw promise.reason
    default:
      exposePromiseState(promise)
      throw promise
  }
}
