const GlyphDetailsForm = ({ formData, onChange }) => {
  return (
    <div className="flex-1 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Nombre Maya */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Nombre Maya</label>
          <input
            type="text"
            name="nombre_maya"
            value={formData.nombre_maya}
            onChange={onChange}
            placeholder="ej. B'alam"
            className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200/80 hover:border-slate-300 rounded-xl focus:bg-white focus:border-maya-gold focus:ring-4 focus:ring-maya-gold/10 outline-none transition-all text-sm font-semibold text-slate-800 shadow-sm"
            required
          />
        </div>

        {/* Significado */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Significado</label>
          <input
            type="text"
            name="significado_es"
            value={formData.significado_es}
            onChange={onChange}
            placeholder="ej. Jaguar"
            className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200/80 hover:border-slate-300 rounded-xl focus:bg-white focus:border-maya-gold focus:ring-4 focus:ring-maya-gold/10 outline-none transition-all text-sm font-semibold text-slate-800 shadow-sm"
            required
          />
        </div>

        {/* Pronunciación */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Pronunciación</label>
          <input
            type="text"
            name="pronunciacion"
            value={formData.pronunciacion}
            onChange={onChange}
            placeholder="ej. Bah-lam"
            className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200/80 hover:border-slate-300 rounded-xl focus:bg-white focus:border-maya-gold focus:ring-4 focus:ring-maya-gold/10 outline-none transition-all text-sm font-semibold text-slate-800 shadow-sm"
            required
          />
        </div>

        {/* Clase Modelo IA */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Clase (Modelo IA)</label>
          <input
            type="text"
            name="clase_modelo"
            value={formData.clase_modelo}
            onChange={onChange}
            placeholder="ej. balam"
            className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200/80 hover:border-slate-300 rounded-xl focus:bg-white focus:border-maya-gold focus:ring-4 focus:ring-maya-gold/10 outline-none transition-all text-sm font-semibold text-slate-800 shadow-sm"
          />
        </div>
      </div>

      {/* Descripción */}
      <div className="space-y-1.5 pt-1.5">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Descripción y Contexto</label>
        <textarea
          name="descripcion"
          value={formData.descripcion}
          onChange={onChange}
          placeholder="Escribe el contexto arqueológico e histórico..."
          className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200/80 hover:border-slate-300 rounded-xl focus:bg-white focus:border-maya-gold focus:ring-4 focus:ring-maya-gold/10 outline-none transition-all text-sm font-medium text-slate-800 min-h-[90px] resize-y shadow-sm"
        />
      </div>
    </div>
  );
};

export default GlyphDetailsForm;
