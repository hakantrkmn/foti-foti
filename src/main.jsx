import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { VercelAnalytics } from './components/Analytics.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    <VercelAnalytics />
  </StrictMode>,
)
