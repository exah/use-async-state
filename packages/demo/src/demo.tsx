import { Suspense } from 'react'
import { ErrorBoundary, DevTools } from '@exah/salo'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { TopStoriesPage } from './pages/top-stories-page'
import { StoryPage } from './pages/story-page'
import { ErrorStatus } from './components/error-status'
import { LoadingStatus } from './components/loading-status'

export function Demo() {
  return (
    <>
      <BrowserRouter>
        <ErrorBoundary fallback={<ErrorStatus />}>
          <Suspense fallback={<LoadingStatus />}>
            <Routes>
              <Route index element={<TopStoriesPage />} />
              <Route path="story/:id" element={<StoryPage />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </BrowserRouter>
      <DevTools />
    </>
  )
}
