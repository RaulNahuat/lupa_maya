const UserCard = ({ user, onEdit, onDelete }) => {
  const gradeLabel = user.grado || 'sin grado';

  return (
    <div className="bg-white rounded-[2rem] sm:rounded-4xl p-3 sm:p-4 shadow-sm border border-gray-100 mb-3 sm:mb-4 transition-transform hover:-translate-y-0.5 hover:shadow-md relative">
      {/* Badge de estado en la esquina superior derecha */}
      <div className="absolute top-4 right-4 sm:top-5 sm:right-5 flex items-center gap-1.5">
        <span className="text-[10px] sm:text-xs font-bold uppercase text-gray-400 tracking-wide">
          {gradeLabel}
        </span>
        <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-maya-gold shadow-sm shadow-black/10"></div>
      </div>

      <div className="flex gap-3 sm:gap-4 items-center">
        {/* Avatar del usuario (sin borde dorado molesto) */}
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center shrink-0 overflow-hidden bg-gray-50">
          {user.avatar ? (
            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
          ) : (
            <div
              className="flex items-center justify-center w-full h-full text-maya-gold text-2xl sm:text-3xl font-black"
              style={{ background: 'linear-gradient(135deg, rgba(1,128,94,0.06), rgba(225,77,75,0.04))' }}
            >
              {user.name ? String(user.name).charAt(0) : 'U'}
            </div>
          )}
        </div>

        {/* Información alineada a la izquierda con los botones */}
        <div className="flex flex-col flex-1 pr-10 sm:pr-14 pt-1">
          <h3 className="font-black text-maya-dark text-[15px] sm:text-[17px] mb-1 leading-tight">{user.name}</h3>

          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] sm:text-[11px] font-extrabold text-maya-dark">username:</span>
            <span className="text-[10px] sm:text-[11px] font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">{user.username}</span>
          </div>

          <div className="flex items-center gap-2 text-[10px] sm:text-[11px] mt-0.5 mb-2.5">
            <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">Nivel {user.level ?? 0}</span>
            <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">⭐ {user.stars ?? 0}</span>
            <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">🏅 {user.badges ?? 0}</span>
          </div>

          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => onEdit?.(user)}
              type="button"
              aria-label={`Editar ${user.name}`}
              className="px-4 sm:px-5 py-1.5 bg-[#01805E] text-white text-[9px] sm:text-[10px] font-black rounded-full shadow-md shadow-green-900/20 active:scale-95 transition-all tracking-wider focus:outline-none focus:ring-2 focus:ring-[#01805E]/30"
            >
              EDITAR
            </button>
            <button
              onClick={() => onDelete?.(user)}
              type="button"
              aria-label={`Eliminar ${user.name}`}
              className="px-4 sm:px-5 py-1.5 bg-[#E14D4B] text-white text-[9px] sm:text-[10px] font-black rounded-full shadow-md shadow-red-900/20 active:scale-95 transition-all tracking-wider focus:outline-none focus:ring-2 focus:ring-[#E14D4B]/30"
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
