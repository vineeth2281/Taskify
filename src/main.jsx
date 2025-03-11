import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import TaskifyApp from './App'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <TaskifyApp />
  </StrictMode>,
)
