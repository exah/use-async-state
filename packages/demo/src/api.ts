import * as YF from 'ya-fetch'

export const api = YF.create({
  resource: 'https://hacker-news.firebaseio.com/v0',
})

export const getTopStories = (limit: number, signal: AbortSignal) =>
  api
    .get(`/topstories.json`, { signal })
    .json<number[]>()
    .then((ids) =>
      Promise.all(ids.slice(0, limit).map((id) => getItem(id, signal)))
    )

export const getItem = (id: number, signal: AbortSignal) =>
  api.get(`/item/${id}.json`, { signal }).json<{
    by: string
    descendants: number
    id: number
    kids: number[]
    score: number
    time: number
    title: string
    text?: string
    type: 'story'
    url?: string
  }>()
