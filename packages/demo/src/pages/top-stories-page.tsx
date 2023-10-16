import { useLoader } from '@exah/salo'
import * as api from '../api'
import { Link } from 'react-router-dom'

export function TopStoriesPage() {
  const result = useLoader({
    key: ['stories'],
    fetch: ({ signal }) => api.getTopStories(10, signal),
  })

  return (
    <>
      <button
        type="button"
        onClick={() => result.update()}
        disabled={result.isUpdating}
      >
        {result.isUpdating ? 'Updating...' : 'Update'}
      </button>
      <ul>
        {result.data.map((post) => (
          <li key={post.id}>
            <Link to={`story/${post.id}`}>{post.title}</Link>{' '}
            {post.url && (
              <a href={post.url} target="_blank">
                Open
              </a>
            )}
          </li>
        ))}
      </ul>
    </>
  )
}
