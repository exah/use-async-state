import { renderHook } from '@testing-library/react-hooks'
import { useAsyncState } from './index'

test('should set initial state', async () => {
  const { result } = renderHook(() =>
    useAsyncState({ isReady: true, result: 'foo' })
  )

  expect(result.current[0]).toEqual({
    isReady: true,
    isLoading: false,
    error: null,
    result: 'foo',
  })
})
