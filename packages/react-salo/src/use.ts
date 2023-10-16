import type { SuspensePromise } from './promise'

export function use<T>(promise: SuspensePromise<T>): T {
  switch (promise.status) {
    case 'pending':
      throw promise
    case 'fulfilled':
      return promise.result
    case 'rejected':
      throw promise.reason
  }
}
