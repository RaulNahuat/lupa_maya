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
      className="bg-white rounded-4xl p-4 sm:p-5 shadow-sm border border-gray-100 flex flex-col gap-4 transition-transform hover:-translate-y-0.5 hover:shadow-md relative"
    >
      <div className="flex gap-4 items-start select-none">
        {/* Icono/Iniciales con Degradado Maya */}
        <div 
          className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl flex items-center justify-center shrink-0 text-white font-black text-xl sm:text-2xl shadow-xs"
          style={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}
        >
          {initials || <BookOpen className="w-8 h-8 text-white/90" />}
        </div>

        <div className="flex flex-col flex-1 min-w-0 pt-0.5">
          <h3 className="font-black text-maya-dark text-base sm:text-[18px] leading-tight mb-1 truncate">
            {group.nombre}
          </h3>
          <p className="text-xs text-slate-400 font-bold mb-3 line-clamp-1 pr-6">
            {group.descripcion || 'Sin descripción.'}
          </p>
          
          <div className="flex flex-wrap gap-2 items-center">
            <span className="bg-emerald-50 text-emerald-600 text-[9px] font-black border border-emerald-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
              Docente: {getTeacherNameById(group.docente_id)}
            </span>
            <span className="bg-slate-50 text-slate-500 text-[9px] font-black border border-slate-200/60 px-2.5 py-1 rounded-full uppercase tracking-wider">
              {count} {count === 1 ? 'Alumno' : 'Alumnos'}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 border-t border-slate-100 pt-3.5">
        <button
          onClick={() => onManageStudents(group)}
          className="flex-1 py-2.5 bg-maya-gold text-white text-[10px] font-black tracking-widest uppercase rounded-full shadow-md shadow-amber-900/10 hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <Users className="w-4 h-4" />
          GESTIONAR ALUMNOS
        </button>

        <div className="flex gap-1.5">
          <button 
            onClick={() => onEdit(group)}
            className="px-3.5 py-2.5 bg-[#01805E] text-white text-[9px] font-black rounded-full shadow-md shadow-green-900/25 hover:opacity-90 active:scale-95 transition-all uppercase tracking-wider"
          >
            EDITAR
          </button>
          <button 
            onClick={() => onDelete(group)}
            className="px-3.5 py-2.5 bg-[#E14D4B] text-white text-[9px] font-black rounded-full shadow-md shadow-red-900/25 hover:opacity-90 active:scale-95 transition-all uppercase tracking-wider"
          >
            ELIMINAR
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupCard;
