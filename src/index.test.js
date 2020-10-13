import { renderHook } from '@testing-library/react-hooks'
import { useAsyncState } from './index'

test('should set initial state', async () => {
  const { result } = renderHook(() => useAsyncState())

  const [state] = result.current
  expect(state).toEqual({ type: 'idle' })
})
