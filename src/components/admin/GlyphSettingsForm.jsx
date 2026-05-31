const GlyphSettingsForm = ({ activo, onChange }) => {
  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm flex flex-col justify-center hover:border-slate-300/80 transition-colors duration-300">
      <div className="flex items-center gap-1.5 mb-4">
        <span className="w-1.5 h-1.5 bg-maya-gold rounded-full"></span>
        <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Ajustes</h3>
      </div>
      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
        <div>
          <h4 className="text-sm font-bold text-slate-700">Visibilidad</h4>
          <p className="text-[11px] text-slate-400 mt-0.5">Mostrar en el mapa</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer select-none">
          <input 
            type="checkbox" 
            name="activo" 
            checked={activo} 
            onChange={onChange} 
            className="sr-only peer" 
          />
          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-maya-gold shadow-inner"></div>
        </label>
      </div>
    </div>
  );
};

export default GlyphSettingsForm;
