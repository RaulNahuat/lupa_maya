import { useState, useEffect } from 'react';
import { X, Layers, Hash, Sparkles, Palette, FileText } from 'lucide-react';
import PrimaryButton from '../PrimaryButton';

const BlockEditModal = ({ isOpen, onClose, block, onSave, isAdding }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    numero_grupo: '',
    dificultad: 'BASICO',
    color: '#10B981',
    descripcion: ''
  });

  useEffect(() => {
    if (block) {
      setFormData({
        nombre: block.nombre || '',
        numero_grupo: block.numero_grupo || '',
        dificultad: block.dificultad || 'BASICO',
        color: block.color || '#10B981',
        descripcion: block.descripcion || ''
      });
    }
  }, [block]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(block?.id, {
      ...formData,
      numero_grupo: Number(formData.numero_grupo)
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-maya-cream rounded-[40px] p-8 w-full max-w-lg shadow-2xl flex flex-col relative transform transition-all zoom-in-95 duration-200 border-4 border-maya-gold/20 my-8">
        
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-white/50 text-maya-dark hover:bg-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="mb-8">
          <h2 className="text-3xl font-black text-maya-dark uppercase tracking-tight">
            {isAdding ? 'Añadir Bloque' : 'Editar Bloque'}
          </h2>
          <p className="text-maya-gold font-bold text-sm tracking-widest uppercase">
            Glifos por Bloques
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-black text-maya-dark/60 ml-2 uppercase">Nombre del Bloque</label>
            <div className="relative">
              <Layers className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-maya-gold" />
              <input
                type="text"
                name="nombre"
                placeholder="Ej. Días, Meses, Animales"
                value={formData.nombre}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border-2 border-transparent focus:border-maya-gold outline-none font-bold text-maya-dark transition-all"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-black text-maya-dark/60 ml-2 uppercase">Número de Grupo</label>
              <div className="relative">
                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-maya-gold" />
                <input
                  type="number"
                  name="numero_grupo"
                  placeholder="Ej. 1"
                  value={formData.numero_grupo}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border-2 border-transparent focus:border-maya-gold outline-none font-bold text-maya-dark transition-all"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-black text-maya-dark/60 ml-2 uppercase">Dificultad</label>
              <div className="relative">
                <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-maya-gold pointer-events-none" />
                <select
                  name="dificultad"
                  value={formData.dificultad}
                  onChange={handleChange}
                  className="w-full pl-12 pr-6 py-4 rounded-2xl bg-white border-2 border-transparent focus:border-maya-gold outline-none font-bold text-maya-dark appearance-none transition-all cursor-pointer"
                >
                  <option value="BASICO">Básico</option>
                  <option value="INTERMEDIO">Intermedio</option>
                  <option value="AVANZADO">Avanzado</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-black text-maya-dark/60 ml-2 uppercase">Color del Bloque</label>
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Palette className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-maya-gold" />
                <input
                  type="text"
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border-2 border-transparent focus:border-maya-gold outline-none font-bold text-maya-dark transition-all"
                  required
                />
              </div>
              <input
                type="color"
                name="color"
                value={formData.color}
                onChange={handleChange}
                className="w-14 h-14 rounded-2xl bg-white border-2 border-transparent shadow-sm cursor-pointer outline-none shrink-0"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-black text-maya-dark/60 ml-2 uppercase">Descripción</label>
            <div className="relative">
              <FileText className="absolute left-4 top-5 w-5 h-5 text-maya-gold" />
              <textarea
                name="descripcion"
                rows={3}
                placeholder="Breve descripción del bloque..."
                value={formData.descripcion}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border-2 border-transparent focus:border-maya-gold outline-none font-bold text-maya-dark transition-all resize-none"
              />
            </div>
          </div>

          <div className="pt-4">
            <PrimaryButton 
              type="submit"
              className="w-full py-6 rounded-[28px] shadow-[0_8px_0_0_#B8851A] hover:translate-y-0.5 hover:shadow-[0_6px_0_0_#B8851A] transition-all"
            >
              <span className="text-xl font-black uppercase tracking-widest">
                {isAdding ? 'Crear Bloque' : 'Guardar Cambios'}
              </span>
            </PrimaryButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BlockEditModal;
