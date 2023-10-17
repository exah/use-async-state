import { Link } from 'react-router-dom'
import { useLoader } from 'react-salo'
import * as api from '../api'

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
            )}{' '}
            ({post.score})
          </li>
        ))}
      </ul>
    </>
  )
}
