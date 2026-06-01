import { useState, useEffect } from 'react';
import { X, Sparkles, AlertCircle, Layers, Settings, Hash } from 'lucide-react';
import PrimaryButton from '../PrimaryButton';

const LevelEditModal = ({ isOpen, onClose, level, onSave, isAdding, nextSuggestedNumber = 1 }) => {
  const [formData, setFormData] = useState({
    numero: '',
    tipo: 'APRENDIZAJE',
    posicion_bloque: ''
  });
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (level) {
      setFormData({
        numero: level.numero || '',
        tipo: level.tipo || 'APRENDIZAJE',
        posicion_bloque: level.posicion_bloque || ''
      });
      setErrorMsg('');
    } else if (isAdding) {
      setFormData({
        numero: nextSuggestedNumber,
        tipo: 'APRENDIZAJE',
        posicion_bloque: nextSuggestedNumber
      });
      setErrorMsg('');
    }
  }, [level, isAdding, nextSuggestedNumber]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    const num = parseInt(formData.numero);
    const pos = parseInt(formData.posicion_bloque);

    if (isNaN(num) || num <= 0) {
      setErrorMsg('Por favor ingresa un número de nivel válido (mayor a 0).');
      setIsSubmitting(false);
      return;
    }

    if (isNaN(pos) || pos <= 0) {
      setErrorMsg('Por favor ingresa una posición de bloque válida (mayor a 0).');
      setIsSubmitting(false);
      return;
    }

    try {
      await onSave(level?.id, {
        numero: num,
        tipo: formData.tipo,
        posicion_bloque: pos
      });
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Error al guardar el nivel.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-slate-50 rounded-[28px] w-full max-w-md shadow-2xl flex flex-col my-8 border border-slate-200/50">
        
        {/* Encabezado */}
        <div className="px-6 py-4 border-b border-slate-200/80 bg-white rounded-t-[28px] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-maya-gold/10 text-maya-gold rounded-lg flex items-center justify-center shadow-inner">
              <Layers className="w-4.5 h-4.5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-800 tracking-tight">
                {isAdding ? 'Nuevo Nivel' : 'Editar Nivel'}
              </h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Catálogo del Bloque</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            type="button"
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 active:scale-95 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="p-6 space-y-4">
            
            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Número de Nivel */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Número de Nivel</label>
              <div className="relative group">
                <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="number"
                  name="numero"
                  value={formData.numero}
                  onChange={handleChange}
                  placeholder="ej. 5"
                  min="1"
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:border-maya-gold focus:ring-4 focus:ring-maya-gold/10 outline-none transition-all text-sm font-semibold text-slate-800"
                  required
                />
              </div>
            </div>

            {/* Tipo de Nivel */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Tipo de Actividad</label>
              <div className="relative group">
                <Settings className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select
                  name="tipo"
                  value={formData.tipo}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:border-maya-gold focus:ring-4 focus:ring-maya-gold/10 outline-none transition-all text-sm font-semibold text-slate-800 appearance-none cursor-pointer"
                  required
                >
                  <option value="APRENDIZAJE">APRENDIZAJE (Teoría y Quiz)</option>
                  <option value="BUSQUEDA">BÚSQUEDA (Reconocimiento Cámara IA)</option>
                </select>
              </div>
            </div>

            {/* Posición en Bloque */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Posición en Bloque</label>
              <div className="relative group">
                <Layers className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="number"
                  name="posicion_bloque"
                  value={formData.posicion_bloque}
                  onChange={handleChange}
                  placeholder="ej. 5"
                  min="1"
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:border-maya-gold focus:ring-4 focus:ring-maya-gold/10 outline-none transition-all text-sm font-semibold text-slate-800"
                  required
                />
              </div>
            </div>

          </div>

          {/* Footer de Acciones */}
          <div className="px-6 py-4 bg-white border-t border-slate-200 flex justify-end gap-3 rounded-b-[28px]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-200 transition-all hover:scale-[1.01] active:scale-95 shadow-sm"
            >
              Cancelar
            </button>
            <PrimaryButton 
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-lg text-xs font-bold shadow-md hover:scale-[1.01] active:scale-[0.98] transition-all"
            >
              {isSubmitting ? 'Guardando...' : isAdding ? 'Crear Nivel' : 'Guardar Cambios'}
            </PrimaryButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LevelEditModal;
