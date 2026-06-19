import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ModalConfirmation from '../ModalConfirmation';
import { forzarSincronizacionCompleta } from '../../services/syncService';
import { RefreshCw } from 'lucide-react';

const AdminHeader = () => {
  const { currentUser, logoutUser } = useAuth();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const name = currentUser?.nombre ? currentUser.nombre : 'Administrador';
  const role = currentUser?.rol || 'Administrador';
  const avatar = currentUser?.avatar || null;

  const handleForceSync = async () => {
    setShowSyncModal(false);
    setIsSyncing(true);
    try {
      await forzarSincronizacionCompleta(currentUser?.local_id);
      window.location.reload();
    } catch (error) {
      console.error("Error al forzar la sincronización:", error);
      setIsSyncing(false);
    }
  };

  return (
    <>
      <div className="sticky top-0 bg-white px-4 py-4 sm:px-6 sm:py-6 rounded-b-[2.5rem] sm:rounded-b-[3rem] shadow-[0_15px_30px_-10px_rgba(0,0,0,0.05)] flex items-center justify-between border-gray-50 border-b z-50">
        <div 
          onClick={() => navigate('/admin')}
          className="flex items-center gap-3 sm:gap-4 min-w-0 cursor-pointer hover:opacity-80 active:scale-[0.98] transition-all"
          title="Ir al Lobby del Administrador"
        >
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-[3px] border-maya-gold p-1 bg-white shadow-sm shrink-0">
            <div className="w-full h-full rounded-full overflow-hidden bg-maya-orange-light">
            {avatar ? (
              <img src={avatar} alt={name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-maya-gold font-black text-xl sm:text-2xl uppercase">
                {name.charAt(0)}
              </div>
            )}
            </div>
          </div>
          <div className="flex flex-col">
            <h2 className="text-maya-dark font-black text-base sm:text-lg leading-tight truncate max-w-[96px] sm:max-w-[120px]">{name}</h2>
            <span className="text-maya-gold font-bold text-xs sm:text-sm tracking-wide">{role}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-3">
          <button 
            onClick={() => setShowSyncModal(true)}
            disabled={isSyncing}
            className="p-2 sm:px-4 sm:py-2.5 rounded-full border-2 border-maya-orange-light text-[11px] sm:text-sm text-maya-gold font-bold hover:bg-maya-orange-light transition-all active:scale-95 shadow-sm flex items-center gap-1.5 disabled:opacity-50"
            title="Forzar actualización de datos desde el servidor"
          >
            <RefreshCw size={14} className={isSyncing ? "animate-spin" : ""} />
            <span className="hidden sm:inline">{isSyncing ? "Sincronizando..." : "Recargar Datos"}</span>
          </button>

          <button 
            onClick={() => setShowLogoutModal(true)}
            className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-full border-2 border-maya-orange-light text-[11px] sm:text-sm text-maya-gold font-bold hover:bg-maya-orange-light transition-all active:scale-95 shadow-sm whitespace-nowrap"
          >
            Cerrar sesión
          </button>
        </div>
      </div>

      <ModalConfirmation 
        isOpen={showLogoutModal}
        title="¿Salir del Panel?"
        message="Tendrás que volver a ingresar tus credenciales para administrar el juego."
        confirmText="Cerrar sesión"
        cancelText="Cancelar"
        onConfirm={() => {
          logoutUser();
          navigate('/login');
        }}
        onCancel={() => setShowLogoutModal(false)}
      />

      <ModalConfirmation 
        isOpen={showSyncModal}
        title="¿Sincronizar y Limpiar Caché?"
        message="Se eliminarán los datos locales temporales y se descargarán nuevamente desde la base de datos real del servidor. Tu sesión y cambios pendientes están seguros. ¿Deseas continuar?"
        confirmText="Confirmar"
        cancelText="Cancelar"
        onConfirm={handleForceSync}
        onCancel={() => setShowSyncModal(false)}
      />
    </>
  );
};

export default AdminHeader;
