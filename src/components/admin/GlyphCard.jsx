const GlyphCard = ({ glyph, onEdit, onDelete }) => {
  const getLevelColor = (level) => {
    switch (level?.toUpperCase()) {
      case 'BÁSICO': return 'bg-[#00D0B0]';
      case 'INTERMEDIO': return 'bg-[#FFB82E]';
      case 'AVANZADO': return 'bg-[#FF5C5C]';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] p-4 sm:p-5 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)] border border-gray-100 relative mb-4 sm:mb-5 transition-transform hover:scale-[1.01]">
      {/* Badge de nivel */}
      <div className="absolute top-4 right-4 sm:right-5 flex items-center gap-2">
        <span className="text-[10px] sm:text-[11px] font-bold text-gray-400 tracking-wider">
          {glyph.level}
        </span>
        <div className={`w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full ${getLevelColor(glyph.level)} shadow-sm shadow-black/10`}></div>
      </div>

      <div className="flex gap-3 sm:gap-4 items-center">
        {/* Para cargar las imagenes del glifo */}
        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-50 rounded-2xl flex items-center justify-center border-2 border-gray-100 overflow-hidden shrink-0">
          {glyph.image ? (
            <img src={glyph.image} alt={glyph.name} className="w-16 h-16 sm:w-20 sm:h-20 object-contain" />
          ) : (
            <div className="text-gray-200 text-2xl sm:text-3xl font-black">?</div>
          )}
        </div>

        <div className="flex flex-col gap-1 grow">
          <div className="flex items-baseline gap-1.5">
            <span className="font-bold text-maya-dark text-[14px] sm:text-base">{glyph.name}</span>
            <span className="text-[9px] sm:text-[10px] font-black text-maya-gold uppercase tracking-tighter">(maya)</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-bold text-maya-dark text-[14px] sm:text-base">{glyph.meaning}</span>
            <span className="text-[9px] sm:text-[10px] font-black text-maya-gold uppercase tracking-tighter">(español)</span>
          </div>

          <div className="flex gap-2 mt-2 flex-wrap">
            <button 
              onClick={() => onEdit?.(glyph)}
              className="px-4 sm:px-6 py-1.5 bg-[#01805E] text-white text-[9px] sm:text-[10px] font-black rounded-full shadow-md shadow-green-900/20 active:scale-95 transition-all uppercase tracking-widest"
            >
              EDITAR
            </button>
            <button 
              onClick={() => onDelete?.(glyph)}
              className="px-4 sm:px-6 py-1.5 bg-[#E14D4B] text-white text-[9px] sm:text-[10px] font-black rounded-full shadow-md shadow-red-900/20 active:scale-95 transition-all uppercase tracking-widest"
            >
              ELIMINAR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlyphCard;
