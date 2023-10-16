import React from 'react'
import ReactDOM from 'react-dom/client'
import { Demo } from './demo.js'
import './main.css'

const rootElement = document.getElementById('root')

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <Demo />
    </React.StrictMode>
  )
}
