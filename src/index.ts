import { useReducer, useMemo } from 'react'

export type AsyncState<T> =
  // initial
  | { isReady: false; isLoading: false; error: null; result: undefined }
  // pending
  | { isReady: boolean; isLoading: true; error: null; result?: T }
  // resolved
  | { isReady: true; isLoading: false; error: null; result: T }
  // rejected
  | { isReady: false; isLoading: false; error: Error; result?: T }

type Merge = <A, B>(a: A, b: B) => {} & A & B
type Update = <A, B>(prev: A, next: B) => A | B | (A & B)

type Action<T> =
  | { type: ActionTypes.START }
  | { type: ActionTypes.FINISH; payload: T | Error; update: Update }

type Reducer<DefaultType> = <T = DefaultType>(
  state: AsyncState<T>,
  action: Action<T>
) => AsyncState<T>

const enum ActionTypes {
  START,
  FINISH,
}

export const INITIAL_STATE: AsyncState<undefined> = {
  isReady: false,
  isLoading: false,
  error: null,
  result: undefined,
}

const right: Update = (_, b) => b
const merge: Merge = (a, b) => Object.assign({}, a, b)

const reducer: Reducer<unknown> = (state, action) => {
  switch (action.type) {
    case ActionTypes.START: {
      return merge(state, { isLoading: true })
    }
    case ActionTypes.FINISH: {
      if (action.payload instanceof Error) {
        return merge(state, {
          isReady: false,
          isLoading: false,
          error: action.payload,
        })
      }

      return {
        isReady: true,
        isLoading: false,
        error: null,
        result: action.update(state.result, action.payload),
      }
    }
  }
}

export function useAsyncState<T>(initialState?: AsyncState<T>) {
  const [state, dispatch] = useReducer<Reducer<T>>(
    reducer,
    merge(INITIAL_STATE, initialState)
  )

  const actions = useMemo(() => {
    function start() {
      dispatch({ type: ActionTypes.START })
    }

    function finish(payload: T, update = right) {
      dispatch({ type: ActionTypes.FINISH, payload, update })
    }

    function capture(promise: Promise<T>, update?: Update) {
      let isCancelled = false

      function cleanup() {
        isCancelled = true
      }

      function handler(payload: T) {
        if (!isCancelled) finish(payload, update)
      }

      actions.start()
      Promise.resolve()
        .then(() => promise)
        .then(handler, handler)

      return cleanup
    }

    return { start, finish, capture }
  }, [dispatch])

  return [state, actions] as const
}
