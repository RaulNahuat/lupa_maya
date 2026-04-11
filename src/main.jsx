import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'

import { registerSW } from 'virtual:pwa-register'
import { initSocket } from './services/socketService'
import { descargarCambios } from './services/syncService'

import { AuthProvider } from './context/AuthContext.jsx'
import { AdminProvider } from './context/AdminContext.jsx'
import { ToastProvider } from './context/ToastContext.jsx'
import ToastContainer from './components/ToastContainer.jsx'

registerSW({ immediate: true })
descargarCambios(null); // Pull inicial de usuarios y niveles (público)
initSocket();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter> 
      <ToastProvider>
        <AuthProvider>
          <AdminProvider>
            <App />
            <ToastContainer />
          </AdminProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  </StrictMode>,
)
