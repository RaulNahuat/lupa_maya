import React from 'react';
import { ArrowRight } from 'lucide-react';

const TeacherStudentCard = ({ student, onConfigure }) => {
  const initials = student.nombre
    ? student.nombre.split(' ').map(n => n.charAt(0)).join('').substring(0, 2).toUpperCase()
    : 'U';

  return (
    <div 
      className="bg-white rounded-4xl p-3 sm:p-4 shadow-sm border border-gray-100 flex items-center justify-between gap-4 transition-transform hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex gap-4 items-center min-w-0">
        <div 
          className="w-14 h-14 rounded-full flex items-center justify-center shrink-0 text-maya-gold font-black text-lg shadow-inner"
          style={{ background: 'linear-gradient(135deg, rgba(1,128,94,0.06), rgba(225,77,75,0.04))' }}
        >
          {initials || 'U'}
        </div>

        <div className="min-w-0">
          <h3 className="font-black text-maya-dark text-[15px] sm:text-base leading-tight truncate">
            {student.nombre} {student.apellido || ''}
          </h3>
          <p className="text-xs text-slate-400 font-bold truncate mt-0.5">
            {student.username} • {student.grado}
          </p>
        </div>
      </div>

      <button
        onClick={() => onConfigure(student)}
        className="px-4 py-2 bg-maya-gold text-white text-[9px] font-black rounded-full shadow-md shadow-amber-900/10 hover:opacity-90 active:scale-95 transition-all uppercase tracking-widest flex items-center gap-1.5 shrink-0"
        type="button"
      >
        AJUSTES
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

export default TeacherStudentCard;
