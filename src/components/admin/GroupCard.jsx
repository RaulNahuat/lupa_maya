import React from 'react';
import { Users, BookOpen } from 'lucide-react';

const GroupCard = ({
  group,
  students,
  teachers,
  onManageStudents,
  onEdit,
  onDelete
}) => {
  const count = students.filter(s => s.grupo_escolar_id === (group.id || group.local_id)).length;
  const initials = group.nombre
    ? group.nombre.split(' ').map(n => n.charAt(0)).join('').substring(0, 2).toUpperCase()
    : '';

  const getTeacherNameById = (id) => {
    const t = teachers.find(x => Number(x.id) === Number(id));
    return t ? `${t.nombre} ${t.apellido || ''}`.trim() || t.username : 'Sin docente asignado';
  };

  return (
    <div 
      className="bg-white rounded-3xl p-3.5 sm:p-4 shadow-sm border border-gray-100 flex flex-col gap-3 transition-transform hover:-translate-y-0.5 hover:shadow-md relative mb-3"
    >
      <div className="flex gap-3 sm:gap-4 items-center select-none">
        {/* Icono/Iniciales con Degradado Maya */}
        <div 
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shrink-0 text-white font-black text-base sm:text-lg shadow-xs"
          style={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}
        >
          {initials || <BookOpen className="w-5 h-5 text-white/90" />}
        </div>

        <div className="flex flex-col flex-1 min-w-0">
          <h3 className="font-black text-maya-dark text-sm sm:text-base leading-tight mb-0.5 truncate">
            {group.nombre}
          </h3>
          <p className="text-[11px] text-slate-400 font-bold mb-2 line-clamp-1 pr-6">
            {group.descripcion || 'Sin descripción.'}
          </p>
          
          <div className="flex flex-wrap gap-1.5 items-center">
            <span className="bg-emerald-50 text-emerald-600 text-[8px] sm:text-[9px] font-black border border-emerald-100/60 px-2 py-0.5 rounded-full uppercase tracking-wider">
              Docente: {getTeacherNameById(group.docente_id)}
            </span>
            <span className="bg-slate-50 text-slate-500 text-[8px] sm:text-[9px] font-black border border-slate-200/50 px-2 py-0.5 rounded-full uppercase tracking-wider">
              {count} {count === 1 ? 'Alumno' : 'Alumnos'}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 border-t border-slate-100 pt-2.5">
        <button
          onClick={() => onManageStudents(group)}
          className="flex-1 py-2 bg-maya-gold text-white text-[9px] font-black tracking-widest uppercase rounded-full shadow-sm hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-1.5"
        >
          <Users className="w-3.5 h-3.5" />
          GESTIONAR ALUMNOS
        </button>

        <div className="flex gap-1">
          <button 
            onClick={() => onEdit(group)}
            className="px-3 py-2 bg-[#01805E] text-white text-[8px] sm:text-[9px] font-black rounded-full shadow-sm hover:opacity-90 active:scale-95 transition-all uppercase tracking-wider"
          >
            EDITAR
          </button>
          <button 
            onClick={() => onDelete(group)}
            className="px-3 py-2 bg-[#E14D4B] text-white text-[8px] sm:text-[9px] font-black rounded-full shadow-sm hover:opacity-90 active:scale-95 transition-all uppercase tracking-wider"
          >
            ELIMINAR
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupCard;
