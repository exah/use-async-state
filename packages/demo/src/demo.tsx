import { useState, Suspense } from 'react'
import {
  useLoader,
  useLoaderClient,
  useCaughtError,
  ErrorBoundary,
} from '@exah/salo'

function LoadingStatus() {
  return <>Loading...</>
}

function ErrorStatus() {
  const error = useCaughtError()

  if (error instanceof Error) {
    return error.message
  }

  return <>Something went wrong</>
}

interface Post {
  id: number
  userId: number
  title: string
  body: string
}

interface ViewPostProps {
  id: number
}

function ViewPost({ id }: ViewPostProps) {
  const result = useLoader({
    key: ['posts', id],
    fetch: async ({ signal }): Promise<Post> => {
      await new Promise((resolve) => setTimeout(resolve, 500))
      const res = await fetch(
        `https://jsonplaceholder.typicode.com/posts/${id}`,
        { signal }
      )

      return res.json()
    },
  })

  return (
    <>
      <h3>{result.data.title}</h3>
      <p>{result.data.body}</p>
    </>
  )
}

function PostsTable() {
  const [id, setId] = useState<number | null>(null)
  const client = useLoaderClient()

  const result = useLoader({
    key: ['posts'],
    fetch: async ({ signal }): Promise<Post[]> => {
      await new Promise((resolve) => setTimeout(resolve, 500))
      const res = await fetch('https://jsonplaceholder.typicode.com/posts', {
        signal,
      })

      return res.json()
    },
  })

  return (
    <>
      <table>
        <tbody>
          {result.data.slice(0, 5).map((post, index) => (
            <tr key={post.id}>
              <td valign="top" width={320}>
                {post.title}
              </td>
              <td valign="top">
                <button onClick={() => setId(post.id)}>View</button>
              </td>
              {index === 0 && id !== null && (
                <td rowSpan={result.data.length} valign="top">
                  <Suspense fallback={<LoadingStatus />}>
                    <ViewPost id={id} />
                  </Suspense>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      <button
        type="button"
        onClick={() => result.update()}
        disabled={result.isUpdating}
      >
        {result.isUpdating ? 'Updating...' : 'Update'}
      </button>
      <button type="button" onClick={() => client.invalidate()}>
        Invalidate
      </button>
      <button type="button" onClick={() => client.reset()}>
        Reset
      </button>
    </>
  )
}

export function Demo() {
  return (
    <>
      <h2>Posts:</h2>
      <div>
        <ErrorBoundary fallback={<ErrorStatus />}>
          <Suspense fallback={<LoadingStatus />}>
            <PostsTable />
          </Suspense>
        </ErrorBoundary>
      </div>
    </>
  )
}
