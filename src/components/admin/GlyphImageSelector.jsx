import { Upload } from 'lucide-react';

const GlyphImageSelector = ({ imagePreview, fileInputRef, onFileChange }) => {
  return (
    <div className="shrink-0 flex flex-col items-center">
      <div className="flex items-center gap-1.5 mb-3">
        <span className="w-1.5 h-1.5 bg-maya-gold rounded-full"></span>
        <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">
          Ilustración
        </h3>
      </div>
      <div 
        onClick={() => fileInputRef.current?.click()}
        className="w-40 h-40 sm:w-48 sm:h-48 bg-slate-50/50 border-2 border-dashed border-slate-200 hover:border-maya-gold/60 hover:bg-amber-50/10 rounded-2xl flex flex-col items-center justify-center cursor-pointer relative overflow-hidden group transition-all duration-300 shadow-inner"
      >
        {imagePreview ? (
          <>
            <img src={imagePreview} alt="Vista Previa" className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute inset-0 bg-slate-900/35 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity backdrop-blur-[2px] duration-300">
              <div className="flex items-center gap-1.5 text-xs font-bold bg-white/25 px-3 py-1.5 rounded-full shadow-md">
                <Upload className="w-3.5 h-3.5" /> Reemplazar
              </div>
            </div>
          </>
        ) : (
          <div className="text-center p-4">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm mx-auto mb-2.5 group-hover:text-maya-gold group-hover:scale-110 transition-all border border-slate-100">
              <Upload className="w-4.5 h-4.5 text-slate-400 group-hover:text-maya-gold" />
            </div>
            <span className="text-xs font-bold text-slate-500 block">Subir imagen</span>
          </div>
        )}
      </div>
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={onFileChange} 
        accept="image/*" 
        className="hidden" 
      />
    </div>
  );
};

export default GlyphImageSelector;
