import { getMediaUrl } from '../../config/api';

const GlyphCard = ({ glyph, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-[0_6px_20px_rgba(0,0,0,0.03)] border border-slate-100 flex gap-4 sm:gap-5 items-center relative transition-all duration-300 hover:shadow-[0_12px_28px_rgba(0,0,0,0.06)] w-full min-w-0">
      {/* Contenedor de la imagen*/}
      <div className="w-20 h-20 sm:w-24 sm:h-24 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 overflow-hidden shrink-0">
        {glyph.image ? (
          <img src={getMediaUrl(glyph.image)} alt={glyph.name} className="w-16 h-16 sm:w-20 sm:h-20 object-contain" />
        ) : (
          <div className="text-slate-200 text-2xl font-black">?</div>
        )}
      </div>

      {/* Contenedor de textos y acciones */}
      <div className="flex flex-col grow min-w-0 gap-1">
        <div className="flex items-baseline gap-1.5 min-w-0">
          <span className="font-black text-slate-850 text-base sm:text-lg truncate" title={glyph.name}>
            {glyph.name}
          </span>
          <span className="text-[8px] sm:text-[9px] font-black text-amber-600 uppercase tracking-widest shrink-0">
            (maya)
          </span>
        </div>
        
        <div className="flex items-baseline gap-1.5 min-w-0">
          <span className="font-bold text-slate-500 text-sm sm:text-base truncate" title={glyph.meaning}>
            {glyph.meaning}
          </span>
          <span className="text-[8px] sm:text-[9px] font-black text-amber-600/80 uppercase tracking-widest shrink-0">
            (español)
          </span>
        </div>

        {/* Botones de acción*/}
        <div className="flex gap-2.5 mt-2 flex-wrap">
          <button 
            onClick={() => onEdit?.(glyph)}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] sm:text-xs font-black rounded-xl shadow-sm active:scale-95 transition-all uppercase tracking-widest shrink-0"
          >
            EDITAR
          </button>
          <button 
            onClick={() => onDelete?.(glyph)}
            className="px-5 py-2 bg-rose-500 hover:bg-rose-600 text-white text-[10px] sm:text-xs font-black rounded-xl shadow-sm active:scale-95 transition-all uppercase tracking-widest shrink-0"
          >
            ELIMINAR
          </button>
        </div>
      </div>
    </div>
  );
};

export default GlyphCard;