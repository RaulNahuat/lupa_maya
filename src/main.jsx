import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'

import { registerSW } from 'virtual:pwa-register'
import { initSocket } from './services/socketService'
import { sincronizarInicialmente } from './services/syncService'

import { AuthProvider } from './context/AuthContext.jsx'
import { AdminProvider } from './context/AdminContext.jsx'
import { ToastProvider } from './context/ToastContext.jsx'
import ToastContainer from './components/ToastContainer.jsx'

//Si hay un update listo, se aplicará automáticamente sin que el usuario tenga que borrar la caché manualmente.
const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    updateSW(true);
  },
});
sincronizarInicialmente().catch(() => {
  // AuthProvider mostrará el estado local y permitirá reintentar desde la interfaz.
});
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
