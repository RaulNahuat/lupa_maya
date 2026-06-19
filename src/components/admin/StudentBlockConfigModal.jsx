import React from 'react';
import { X, Info, ShieldAlert } from 'lucide-react';

const StudentBlockConfigModal = ({
  isOpen,
  onClose,
  student,
  blocks,
  groupBlockActivations,
  studentBlockActivations,
  onToggleStudentBlock,
  onClearStudentOverride
}) => {
  if (!isOpen || !student) return null;

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
            Restringir: {student.nombre}
          </h2>
          <p className="text-[10px] text-maya-gold font-bold tracking-widest uppercase">
            Ajustes individuales de bloques
          </p>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex gap-3 text-amber-800 text-[11px] leading-relaxed">
            <Info className="w-5 h-5 shrink-0 text-amber-500" />
            <p>
              Por defecto, los alumnos heredan la configuración del grupo. Puedes sobrescribirla para este alumno específico usando los botones.
            </p>
          </div>

          {blocks.map(block => {
            const blockId = Number(block.id);
            
            const isGroupActivo = groupBlockActivations[blockId] !== undefined 
              ? groupBlockActivations[blockId] 
              : (block.activo !== false);

            const customActivo = studentBlockActivations[student.id]?.[blockId];
            const hasOverride = customActivo !== undefined;

            return (
              <div 
                key={block.id}
                className="bg-white p-4 rounded-3xl border border-slate-100 flex flex-col gap-3 shadow-xs"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h4 className="font-black text-maya-dark text-sm leading-tight">{block.nombre}</h4>
                    <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                      Estado grupal: <span className={`font-black ${isGroupActivo ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {isGroupActivo ? 'ACTIVO' : 'OCULTO'}
                      </span>
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onToggleStudentBlock(student, block, true)}
                      className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider transition-all border ${
                        hasOverride && customActivo === true 
                          ? 'bg-[#01805E] border-[#01805E] text-white shadow-xs' 
                          : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                      }`}
                      type="button"
                    >
                      Habilitar
                    </button>
                    <button
                      onClick={() => onToggleStudentBlock(student, block, false)}
                      className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider transition-all border ${
                        hasOverride && customActivo === false 
                          ? 'bg-[#E14D4B] border-[#E14D4B] text-white shadow-xs' 
                          : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                      }`}
                      type="button"
                    >
                      Ocultar
                    </button>
                  </div>
                </div>

                {hasOverride && (
                  <div className="flex items-center justify-between border-t border-dashed border-slate-100 pt-2 text-[10px]">
                    <span className="text-amber-600 font-black flex items-center gap-1">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      Personalizado ({customActivo ? 'Habilitado' : 'Oculto'})
                    </span>
                    <button
                      onClick={() => onClearStudentOverride(student, block)}
                      className="text-slate-400 hover:text-slate-600 underline font-black uppercase tracking-wider text-[9px]"
                      type="button"
                    >
                      Heredar del grupo
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StudentBlockConfigModal;
