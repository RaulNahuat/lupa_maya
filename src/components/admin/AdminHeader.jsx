import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ModalConfirmation from '../ModalConfirmation';

const AdminHeader = () => {
  const { currentUser, logoutUser } = useAuth();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const name = currentUser?.nombre ? currentUser.nombre : 'Administrador';
  const role = currentUser?.rol || 'Administrador';
  const avatar = currentUser?.avatar || null;

  return (
    <>
      <div className="sticky top-0 bg-white px-4 py-4 sm:px-6 sm:py-6 rounded-b-[2.5rem] sm:rounded-b-[3rem] shadow-[0_15px_30px_-10px_rgba(0,0,0,0.05)] flex items-center justify-between border-gray-50 border-b z-50">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
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
        
        <button 
          onClick={() => setShowLogoutModal(true)}
          className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-full border-2 border-maya-orange-light text-[11px] sm:text-sm text-maya-gold font-bold hover:bg-maya-orange-light transition-all active:scale-95 shadow-sm whitespace-nowrap"
        >
          Cerrar sesión
        </button>
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
    </>
  );
};

export default AdminHeader;
