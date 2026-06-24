import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import ModalConfirmation from '../ModalConfirmation';
import { forzarSincronizacionCompleta } from '../../services/syncService';
import { RefreshCw } from 'lucide-react';

const TeacherHeader = ({ docenteName, onLogoutClick }) => {
  const { currentUser } = useAuth();
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleForceSync = async () => {
    setShowSyncModal(false);
    setIsSyncing(true);
    try {
      await forzarSincronizacionCompleta(currentUser?.local_id);
      window.location.reload();
    } catch (error) {
      console.error("Error al forzar la sincronización del docente:", error);
      setIsSyncing(false);
    }
  };

  return (
    <>
      <div className="sticky top-0 bg-white px-4 py-4 sm:px-6 sm:py-6 rounded-b-[2.5rem] sm:rounded-b-[3rem] shadow-[0_15px_30px_-10px_rgba(0,0,0,0.05)] flex items-center justify-between border-gray-50 border-b z-50">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border-[3px] border-maya-gold p-1 bg-white shadow-sm shrink-0 flex items-center justify-center">
            <div className="w-full h-full rounded-full overflow-hidden bg-maya-orange-light flex items-center justify-center text-maya-gold font-black text-lg uppercase">
              {docenteName.charAt(0)}
            </div>
          </div>
          <div className="flex flex-col">
            <h2 className="text-maya-dark font-black text-sm sm:text-base leading-tight truncate max-w-[120px] sm:max-w-[180px]">
              {docenteName}
            </h2>
            <span className="text-maya-gold font-bold text-xs tracking-wide">Docente Autorizado</span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button 
            onClick={() => setShowSyncModal(true)}
            disabled={isSyncing}
            className="p-2 sm:px-4 sm:py-2.5 rounded-full border-2 border-maya-orange-light text-[11px] sm:text-sm text-maya-gold font-bold hover:bg-maya-orange-light transition-all active:scale-95 shadow-sm flex items-center gap-1.5 disabled:opacity-50"
            title="Forzar actualización de datos desde el servidor"
            type="button"
          >
            <RefreshCw size={14} className={isSyncing ? "animate-spin" : ""} />
            <span className="hidden sm:inline">{isSyncing ? "Sincronizando..." : "Recargar Datos"}</span>
          </button>

          <button 
            onClick={onLogoutClick}
            className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-full border-2 border-maya-orange-light text-[11px] sm:text-sm text-maya-gold font-bold hover:bg-maya-orange-light transition-all active:scale-95 shadow-sm whitespace-nowrap"
            type="button"
          >
            Cerrar sesión
          </button>
        </div>
      </div>

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

export default TeacherHeader;

