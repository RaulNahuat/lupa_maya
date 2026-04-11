import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ModalConfirmation from '../ModalConfirmation';

const AdminHeader = () => {
  const { currentUser, logoutUser } = useAuth();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const name = currentUser?.nombre || currentUser?.email || 'Administrador';
  const role = currentUser?.rol || 'Administrador';
  const avatar = currentUser?.avatar || null;

  return (
    <>
      <div className="bg-white px-6 py-6 rounded-b-[3rem] shadow-[0_15px_30px_-10px_rgba(0,0,0,0.05)] flex items-center justify-between border-gray-50 border-b relative z-20">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full border-[3px] border-maya-gold p-1 bg-white shadow-sm shrink-0">
            <div className="w-full h-full rounded-full overflow-hidden bg-maya-orange-light">
            {avatar ? (
              <img src={avatar} alt={name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-maya-gold font-black text-2xl uppercase">
                {name.charAt(0)}
              </div>
            )}
            </div>
          </div>
          <div className="flex flex-col">
            <h2 className="text-maya-dark font-black text-lg leading-tight truncate max-w-[120px]">{name}</h2>
            <span className="text-maya-gold font-bold text-sm tracking-wide">{role}</span>
          </div>
        </div>
        
        <button 
          onClick={() => setShowLogoutModal(true)}
          className="px-5 py-2.5 rounded-full border-2 border-maya-orange-light text-maya-gold font-bold text-sm hover:bg-maya-orange-light transition-all active:scale-95 shadow-sm"
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
