import type { LoaderSnapshot } from './types'
import { toSuspensePromise } from './promise'

const SECOND = 1000
const MINUTE = 60 * SECOND

export const IDLE_CALLBACK_TIMEOUT = SECOND / 4
export const DEFAULT_STALE_TIME = SECOND
export const DEFAULT_CACHE_TIME = 5 * MINUTE

export const DEFAULT_SNAPSHOT: LoaderSnapshot<never> = {
  get promise() {
    return toSuspensePromise(Promise.reject(new Error('Promise is required')))
  },
  pending: false,
}
