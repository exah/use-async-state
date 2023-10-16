import { useParams } from 'react-router-dom'
import { useLoader } from '@exah/salo'
import * as api from '../api'

export function StoryPage() {
  const params = useParams<{ id: `${number}` }>()
  const result = useLoader({
    key: ['story', params.id],
    fetch: ({ signal }) => api.getItem(Number(params.id), signal),
  })

  return (
    <>
      <h3>
        <a href={result.data.url} target="_blank">
          {result.data.title}
        </a>
      </h3>
      {result.data.text ? (
        <section dangerouslySetInnerHTML={{ __html: result.data.text }} />
      ) : null}
    </>
  )
}
