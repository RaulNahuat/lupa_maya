import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'

import { registerSW } from 'virtual:pwa-register'
import { initSyncService } from './services/syncService'
import { initSocket } from './services/socketService'

import { AdminProvider } from './context/AdminContext.jsx'

registerSW({ immediate: true })
initSyncService();
initSocket();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter> 
      <AdminProvider>
        <App />
      </AdminProvider>
    </BrowserRouter>
  </StrictMode>,
)
