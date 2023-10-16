import { useReducer, useEffect } from 'react'
import { useLoaderClient } from './loader-client-context'

export function DevTools() {
  const client = useLoaderClient()
  const [, rerender] = useReducer((index) => index + 1, 0)

  useEffect(() => client.subscribe(rerender), [client])

  return (
    <>
      <ul>
        {client.loaders.map((loader) => (
          <li key={loader.hash.toString()}>
            <details>
              <summary>
                {JSON.stringify(loader.key)}: {loader.state}{' '}
                {loader.stale ? 'stale' : 'fresh'}{' '}
                {loader.snapshot.promise.status}
                <button
                  type="button"
                  onClick={() => loader.fetch()}
                  disabled={loader.snapshot.pending}
                >
                  {loader.snapshot.pending ? 'Fetching...' : 'Fetch'}
                </button>
                <button type="button" onClick={() => loader.invalidate()}>
                  Invalidate
                </button>
                <button type="button" onClick={() => loader.remove()}>
                  Remove
                </button>
              </summary>
              {loader.snapshot.promise.status === 'fulfilled' && (
                <code>
                  <pre>
                    {JSON.stringify(loader.snapshot.promise.result, null, 2)}
                  </pre>
                </code>
              )}
              {loader.snapshot.promise.status === 'rejected' && (
                <code>
                  <pre>{String(loader.snapshot.promise.reason)}</pre>
                </code>
              )}
              <code>
                <pre>{JSON.stringify(loader, null, 2)}</pre>
              </code>
            </details>
          </li>
        ))}
      </ul>
      <button type="button" onClick={() => client.invalidate()}>
        Invalidate all
      </button>
      <button type="button" onClick={() => client.reset()}>
        Reset all
      </button>
    </>
  )
}
