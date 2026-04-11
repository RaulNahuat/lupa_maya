import { Mail, Award } from 'lucide-react';

const UserCard = ({ user, onEdit, onDelete }) => {
  const isInactive = user.status?.toLowerCase() === 'inactivo';

  return (
    <div className="bg-white rounded-4xl p-4 shadow-sm border border-gray-100 mb-4 transition-transform hover:-translate-y-0.5 relative">
      {/* Badge de estado en la esquina superior derecha */}
      <div className="absolute top-5 right-5 flex items-center gap-1.5">
        <span className="text-xs font-bold lowercase text-gray-400 tracking-wide">
          {user.status?.toLowerCase()}
        </span>
        <div className={`w-3.5 h-3.5 rounded-full ${isInactive ? 'bg-[#E14D4B]' : 'bg-[#00D0B0]'}`}></div>
      </div>

      <div className="flex gap-4 items-center">
        {/* Avatar del usuario (sin borde dorado molesto) */}
        <div className="w-24 h-24 rounded-full flex items-center justify-center shrink-0 overflow-hidden bg-gray-50">
          {user.avatar ? (
            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
          ) : (
            <div className="text-maya-gold text-3xl font-black">{user.name.charAt(0)}</div>
          )}
        </div>

        {/* Información alineada a la izquierda con los botones */}
        <div className="flex flex-col flex-1 pr-14 pt-1">
          <h3 className="font-black text-maya-dark text-[17px] mb-1 leading-tight">{user.name}</h3>
          
          <div className="flex flex-wrap items-center gap-x-1.5 text-[11px]">
            <span className="font-extrabold text-maya-dark">Correo:</span>
            <span className="font-bold text-gray-500">{user.email}</span>
          </div>

          <div className="flex flex-wrap items-center gap-x-1.5 text-[11px] mt-0.5 mb-2.5">
            <span className="font-extrabold text-maya-dark">Progreso:</span>
            <span className="font-bold text-gray-500">
              Nivel {user.level}, {user.stars} estrellas, {user.badges} insignias
            </span>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={() => onEdit?.(user)}
              className="px-5 py-1.5 bg-[#01805E] text-white text-[10px] font-black rounded-full shadow-md shadow-green-900/20 active:scale-95 transition-all tracking-wider"
            >
              EDITAR
            </button>
            <button 
              onClick={() => onDelete?.(user)}
              className="px-5 py-1.5 bg-[#E14D4B] text-white text-[10px] font-black rounded-full shadow-md shadow-red-900/20 active:scale-95 transition-all tracking-wider"
            >
              ELIMINAR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserCard;
