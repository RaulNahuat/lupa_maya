import React from 'react';

const TeacherHeader = ({ docenteName, onLogoutClick }) => {
  return (
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

      <button 
        onClick={onLogoutClick}
        className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-full border-2 border-maya-orange-light text-[11px] sm:text-sm text-maya-gold font-bold hover:bg-maya-orange-light transition-all active:scale-95 shadow-sm whitespace-nowrap"
        type="button"
      >
        Cerrar sesión
      </button>
    </div>
  );
};

export default TeacherHeader;
