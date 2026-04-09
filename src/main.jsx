import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'

import { registerSW } from 'virtual:pwa-register'
import { initSyncSyncService } from './services/syncService'

registerSW({ immediate: true })
initSyncSyncService();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter> 
      <App />
    </BrowserRouter>
  </StrictMode>,
)
