import React, { useState } from 'react';
import { X } from 'lucide-react';

const GroupStudentsModal = ({
  isOpen,
  onClose,
  group,
  students,
  groups,
  onAddStudent,
  onRemoveStudent
}) => {
  const [activeTab, setActiveTab] = useState('INSCRITOS'); // INSCRITOS o DISPONIBLES

  if (!isOpen || !group) return null;

  const groupIdVal = group.id || group.local_id;

  const groupStudents = students.filter(
    s => s.grupo_escolar_id === groupIdVal
  );

  const availableStudents = students.filter(
    s => s.grupo_escolar_id !== groupIdVal
  );

  const getGroupNameById = (id) => {
    const g = groups.find(x => x.id === id || x.local_id === id);
    return g ? g.nombre : 'Sin grupo';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-maya-cream rounded-[40px] p-6 w-full max-w-lg shadow-2xl flex flex-col relative border-4 border-maya-gold/20 h-[80vh] my-8">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/50 text-maya-dark hover:bg-white transition-colors z-10"
          type="button"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="mb-4 pr-10">
          <h2 className="text-2xl font-black text-maya-dark uppercase tracking-tight truncate">
            Alumnos: {group.nombre}
          </h2>
          <p className="text-[10px] text-maya-gold font-bold tracking-widest uppercase">
            Administrar matrícula
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4 bg-slate-200/50 p-1.5 rounded-2xl">
          <button
            onClick={() => setActiveTab('INSCRITOS')}
            className={`flex-1 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${
              activeTab === 'INSCRITOS' 
                ? 'bg-white text-maya-dark shadow-xs' 
                : 'text-slate-400 hover:text-maya-dark'
            }`}
            type="button"
          >
            Inscritos ({groupStudents.length})
          </button>
          <button
            onClick={() => setActiveTab('DISPONIBLES')}
            className={`flex-1 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${
              activeTab === 'DISPONIBLES' 
                ? 'bg-white text-maya-dark shadow-xs' 
                : 'text-slate-400 hover:text-maya-dark'
            }`}
            type="button"
          >
            Disponibles ({availableStudents.length})
          </button>
        </div>

        {/* Listado con scroll */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {activeTab === 'INSCRITOS' ? (
            groupStudents.length > 0 ? (
              groupStudents.map(student => (
                <div 
                  key={student.local_id || student.id}
                  className="bg-white p-3.5 rounded-3xl border border-slate-100 flex items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <p className="font-black text-maya-dark text-sm truncate">{student.nombre} {student.apellido}</p>
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider">{student.username} • {student.grado}</p>
                  </div>
                  <button
                    onClick={() => onRemoveStudent(student)}
                    className="px-4 py-2 bg-[#E14D4B] text-white text-[8px] font-black rounded-full hover:opacity-95 active:scale-95 transition-all uppercase tracking-wider shrink-0"
                    title="Sacar del grupo"
                    type="button"
                  >
                    REMOVER
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-10 opacity-30">
                <p className="text-xs font-bold uppercase tracking-wider">No hay alumnos inscritos en este grupo.</p>
              </div>
            )
          ) : (
            availableStudents.length > 0 ? (
              availableStudents.map(student => (
                <div 
                  key={student.local_id || student.id}
                  className="bg-white p-3.5 rounded-3xl border border-slate-100 flex items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <p className="font-black text-maya-dark text-sm truncate">{student.nombre} {student.apellido}</p>
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider">
                      {student.username} • {student.grado} {student.grupo_escolar_id ? `(${getGroupNameById(student.grupo_escolar_id)})` : ''}
                    </p>
                  </div>
                  <button
                    onClick={() => onAddStudent(student)}
                    className="px-4 py-2 bg-[#01805E] text-white text-[8px] font-black rounded-full hover:opacity-95 active:scale-95 transition-all uppercase tracking-wider shrink-0"
                    title="Añadir al grupo"
                    type="button"
                  >
                    AGREGAR
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-10 opacity-30">
                <p className="text-xs font-bold uppercase tracking-wider">No hay alumnos disponibles para añadir.</p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default GroupStudentsModal;
