import React from 'react';
import { Layers } from 'lucide-react';

const TeacherBlockCard = ({
  block,
  glyphs,
  groupBlockActivations,
  onToggleGroupBlock
}) => {
  const blockGlyphs = glyphs.filter(glyph => Number(glyph.grupo_id) === Number(block.id));

  const getDifficultyColor = (diff) => {
    switch (diff?.toUpperCase()) {
      case 'BASICO':
      case 'BÁSICO':
        return { bg: 'bg-emerald-50 text-emerald-600 border-emerald-200', dot: 'bg-emerald-500' };
      case 'INTERMEDIO':
        return { bg: 'bg-amber-50 text-amber-600 border-amber-500/80', dot: 'bg-amber-500' };
      case 'AVANZADO':
        return { bg: 'bg-rose-50 text-rose-500 border-rose-200', dot: 'bg-rose-500' };
      default:
        return { bg: 'bg-slate-50 text-slate-600 border-slate-200', dot: 'bg-slate-500' };
    }
  };

  const diffStyle = getDifficultyColor(block.dificultad);
  const isActivo = groupBlockActivations[block.id] !== undefined 
    ? groupBlockActivations[block.id] 
    : (block.activo !== false);

  return (
    <div 
      className="bg-white rounded-4xl p-4 sm:p-5 shadow-sm border border-gray-100 flex items-center justify-between gap-4 transition-transform hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex gap-4 items-center select-none flex-1 min-w-0">
        <div 
          className="w-16 h-16 rounded-3xl flex items-center justify-center shrink-0 shadow-xs"
          style={{ backgroundColor: block.color || '#10B981' }}
        >
          <Layers className="w-8 h-8 text-white/95" strokeWidth={2.5} />
        </div>

        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className="font-black text-maya-dark text-base leading-tight truncate">
              {block.nombre}
            </h3>
            <span className={`px-2 py-0.5 rounded-full text-[8px] font-black border uppercase tracking-widest shrink-0 flex items-center gap-1 ${diffStyle.bg}`}>
              <span className={`w-1 h-1 rounded-full ${diffStyle.dot}`}></span>
              {block.dificultad || 'BÁSICO'}
            </span>
          </div>
          <p className="text-xs text-slate-400 font-bold truncate mb-2 pr-2">
            {block.descripcion || 'Sin descripción asignada.'}
          </p>
          <div>
            <span className="bg-slate-50 text-slate-500 text-[9px] font-black px-2.5 py-0.5 rounded-full border border-slate-200/60 tracking-wider">
              {blockGlyphs.length} {blockGlyphs.length === 1 ? 'GLIFO' : 'GLIFOS'}
            </span>
          </div>
        </div>
      </div>

      {/* Interruptor Grupal 3D */}
      <div className="flex flex-col items-center gap-1.5 shrink-0 pl-2 border-l border-slate-100">
        <button
          onClick={() => onToggleGroupBlock(block)}
          className={`w-14 h-8 rounded-full p-1 transition-all duration-300 outline-none flex items-center relative ${
            isActivo 
              ? 'bg-[#01805E] shadow-inner shadow-green-950/20' 
              : 'bg-slate-200'
          }`}
          type="button"
        >
          <div 
            className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-300 flex items-center justify-center font-bold text-[9px] ${
              isActivo ? 'translate-x-6 text-[#01805E]' : 'translate-x-0 text-slate-400'
            }`}
          >
            {isActivo ? 'SÍ' : 'NO'}
          </div>
        </button>
        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
          {isActivo ? 'ACTIVO' : 'OCULTO'}
        </span>
      </div>
    </div>
  );
};

export default TeacherBlockCard;
