import { ArrowLeft, Edit2, Trash2 } from 'lucide-react';

const BlockDetailHeader = ({ block, glyphsCount, levelsCount, onBack, onEdit, onDelete }) => {
  const getDifficultyColor = (diff) => {
    switch (diff?.toUpperCase()) {
      case 'BASICO':
      case 'BÁSICO':
        return { bg: 'bg-emerald-50 text-emerald-600 border-emerald-200' };
      case 'INTERMEDIO':
        return { bg: 'bg-amber-50 text-amber-600 border-amber-500/80' };
      case 'AVANZADO':
        return { bg: 'bg-rose-50 text-rose-500 border-rose-200' };
      default:
        return { bg: 'bg-slate-50 text-slate-600 border-slate-200' };
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
      <div className="flex items-center gap-3">
        <button 
          onClick={onBack}
          className="w-10 h-10 bg-white border border-slate-200 hover:bg-slate-50 flex items-center justify-center rounded-2xl shadow-sm transition-all"
          title="Volver a Bloques"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" strokeWidth={2.5} />
        </button>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xl sm:text-2xl font-black text-slate-800 leading-tight">{block.nombre}</h2>
            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black border uppercase tracking-wider shrink-0 flex items-center gap-1 ${getDifficultyColor(block.dificultad).bg}`}>
              {block.dificultad || 'BÁSICO'}
            </span>
          </div>
          <div className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mt-0.5">
            Grupo #{block.numero_grupo || 0} • {glyphsCount} {glyphsCount === 1 ? 'glifo' : 'glifos'} • {levelsCount} {levelsCount === 1 ? 'nivel' : 'niveles'}
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-2 self-start sm:self-center">
        <button 
          onClick={onEdit}
          className="px-4 py-2 text-slate-600 hover:text-emerald-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-2xl transition-all font-bold text-xs flex items-center gap-1.5 shadow-sm hover:shadow active:scale-95"
        >
          <Edit2 className="w-3.5 h-3.5" />
          EDITAR BLOQUE
        </button>
        <button 
          onClick={onDelete}
          className="px-4 py-2 text-slate-600 hover:text-rose-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-2xl transition-all font-bold text-xs flex items-center gap-1.5 shadow-sm hover:shadow active:scale-95"
        >
          <Trash2 className="w-3.5 h-3.5" />
          ELIMINAR BLOQUE
        </button>
      </div>
    </div>
  );
};

export default BlockDetailHeader;
