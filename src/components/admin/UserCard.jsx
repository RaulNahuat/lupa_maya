import { Mail, Award } from 'lucide-react';

const UserCard = ({ user, onEdit, onDelete }) => {
  const isInactive = user.status?.toLowerCase() === 'inactivo';

  return (
    <div className="bg-white rounded-[2.5rem] p-5 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)] border border-gray-100 relative mb-5 transition-transform hover:scale-[1.01]">
      {/* Badge de estado */}
      <div className="absolute top-4 right-5 flex items-center gap-2">
        <span className={`text-[11px] font-bold tracking-wider ${isInactive ? 'text-red-400' : 'text-[#00D0B0]'}`}>
          {user.status?.toLowerCase()}
        </span>
        <div className={`w-3.5 h-3.5 rounded-full ${isInactive ? 'bg-[#FF5C5C]' : 'bg-[#00D0B0]'} shadow-sm shadow-black/10`}></div>
      </div>

      <div className="flex gap-4 items-center">
        {/* Avatar del usuario */}
        <div className="w-24 h-24 bg-maya-orange-light rounded-full flex items-center justify-center border-2 border-maya-gold overflow-hidden shrink-0">
          {user.avatar ? (
            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
          ) : (
            <div className="text-maya-gold text-3xl font-black">{user.name.charAt(0)}</div>
          )}
        </div>

        {/* Información */}
        <div className="flex flex-col gap-0.5 grow">
          <h3 className="font-black text-maya-dark text-lg leading-tight">{user.name}</h3>
          
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-[10px] font-black text-maya-dark uppercase">Correo:</span>
            <span className="text-[10px] font-bold text-gray-400 truncate">{user.email}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-black text-maya-dark uppercase">Progreso:</span>
            <span className="text-[10px] font-bold text-gray-400">
              Nivel {user.level}, {user.stars} estrellas, {user.badges} insignias
            </span>
          </div>

          <div className="flex gap-2 mt-3">
            <button 
              onClick={() => onEdit?.(user)}
              className="px-6 py-1.5 bg-[#01805E] text-white text-[10px] font-black rounded-full shadow-md shadow-green-900/20 active:scale-95 transition-all uppercase tracking-widest"
            >
              EDITAR
            </button>
            <button 
              onClick={() => onDelete?.(user)}
              className="px-6 py-1.5 bg-[#E14D4B] text-white text-[10px] font-black rounded-full shadow-md shadow-red-900/20 active:scale-95 transition-all uppercase tracking-widest"
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
