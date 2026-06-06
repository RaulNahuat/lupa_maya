import { useState, useEffect, useRef } from 'react';
import { X, Award, FileText, Image as ImageIcon, Sparkles, Hash, Upload, Loader } from 'lucide-react';
import PrimaryButton from '../PrimaryButton';
import { API_BASE_URL } from '../../config/api';

const BadgeEditModal = ({ isOpen, onClose, badge, onSave, isAdding }) => {
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    icono_url: '',
    tipo_condicion: 'ESCANEOS',
    valor_condicion: 1
  });

  useEffect(() => {
    if (badge) {
      setFormData({
        nombre: badge.nombre || '',
        descripcion: badge.descripcion || '',
        icono_url: badge.icono_url || '',
        tipo_condicion: badge.tipo_condicion || 'ESCANEOS',
        valor_condicion: badge.valor_condicion || 1
      });
    } else {
      setFormData({
        nombre: '',
        descripcion: '',
        icono_url: '',
        tipo_condicion: 'ESCANEOS',
        valor_condicion: 1
      });
    }
  }, [badge, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const uploadData = new FormData();
    uploadData.append('file', file);

    setIsUploading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/badges/upload`, {
        method: 'POST',
        body: uploadData
      });

      if (!response.ok) {
        throw new Error('Error al subir el archivo');
      }

      const result = await response.json();
      if (result.success && result.url) {
        setFormData(prev => ({ ...prev, icono_url: result.url }));
      }
    } catch (err) {
      console.error(err);
      alert('Ocurrió un error al subir el icono. Por favor, intente de nuevo.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.icono_url) {
      alert('Por favor, selecciona o sube un icono para la insignia.');
      return;
    }
    onSave(badge?.id, {
      ...formData,
      valor_condicion: Number(formData.valor_condicion)
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

        <div className="mb-6">
          <h2 className="text-3xl font-black text-maya-dark uppercase tracking-tight">
            {isAdding ? 'Añadir Insignia' : 'Editar Insignia'}
          </h2>
          <p className="text-maya-gold font-bold text-sm tracking-widest uppercase">
            Administración de Logros
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nombre de insignia */}
          <div className="space-y-1">
            <label className="text-xs font-black text-maya-dark/60 ml-2 uppercase">Nombre de la Insignia</label>
            <div className="relative">
              <Award className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-maya-gold" />
              <input
                type="text"
                name="nombre"
                placeholder="Ej. Descubridor Maya"
                value={formData.nombre}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white border-2 border-transparent focus:border-maya-gold outline-none font-bold text-maya-dark transition-all"
                required
              />
            </div>
          </div>

          {/* Icono de insignia (Imagen) */}
          <div className="space-y-1">
            <label className="text-xs font-black text-maya-dark/60 ml-2 uppercase">Icono de la Insignia</label>
            <div className="flex gap-3 items-center">
              {formData.icono_url ? (
                <div className="w-16 h-16 rounded-2xl border-2 border-maya-gold/30 bg-white flex items-center justify-center overflow-hidden shrink-0">
                  <img 
                    src={formData.icono_url.startsWith('http') || formData.icono_url.startsWith('data:') ? formData.icono_url : `${API_BASE_URL}${formData.icono_url}`} 
                    alt="Vista previa" 
                    className="w-12 h-12 object-contain"
                  />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-2xl border-2 border-dashed border-maya-gold/40 bg-white/50 flex items-center justify-center text-maya-gold shrink-0">
                  <ImageIcon className="w-8 h-8 opacity-60" />
                </div>
              )}
              
              <div className="flex-1">
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-3.5 px-4 rounded-2xl border-2 border-dashed border-maya-gold/40 hover:border-maya-gold bg-white hover:bg-amber-50/20 text-maya-dark font-extrabold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isUploading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin text-maya-gold" />
                      <span>Subiendo...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 text-maya-gold" />
                      <span>Seleccionar Icono</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Condición y valor */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-black text-maya-dark/60 ml-2 uppercase">Tipo de Condición</label>
              <div className="relative">
                <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-maya-gold pointer-events-none" />
                <select
                  name="tipo_condicion"
                  value={formData.tipo_condicion}
                  onChange={handleChange}
                  className="w-full pl-12 pr-6 py-3.5 rounded-2xl bg-white border-2 border-transparent focus:border-maya-gold outline-none font-bold text-maya-dark appearance-none transition-all cursor-pointer"
                >
                  <option value="NIVELES">Niveles Totales</option>
                  <option value="ESCANEOS">Escaneos Totales</option>
                  <option value="RACHA">Racha de Niveles</option>
                  <option value="RACHA_ESCANEOS">Racha de Escaneos</option>
                </select>
              </div>
            </div>
            
            <div className="space-y-1">
              <label className="text-xs font-black text-maya-dark/60 ml-2 uppercase">Valor Requerido</label>
              <div className="relative">
                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-maya-gold" />
                <input
                  type="number"
                  name="valor_condicion"
                  min="1"
                  placeholder="Ej. 5"
                  value={formData.valor_condicion}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white border-2 border-transparent focus:border-maya-gold outline-none font-bold text-maya-dark transition-all"
                  required
                />
              </div>
            </div>
          </div>

          {/* Texto explicativo dinámico de la condición seleccionada */}
          <div className="bg-white/60 border border-maya-gold/20 rounded-2xl p-4 text-[11px] sm:text-xs text-slate-600 font-semibold leading-relaxed shadow-inner">
            <span className="font-black text-maya-dark uppercase block mb-1 tracking-wide">¿Cómo funciona esta condición?</span>
            {formData.tipo_condicion === 'NIVELES' && (
              <span>El jugador desbloquea la insignia al completar este número total de niveles acumulados en su partida (cuenta tanto niveles de Aprendizaje como de Búsqueda).</span>
            )}
            {formData.tipo_condicion === 'ESCANEOS' && (
              <span>El jugador desbloquea la insignia al realizar este número de escaneos exitosos en total (cuenta únicamente niveles completados de tipo Búsqueda).</span>
            )}
            {formData.tipo_condicion === 'RACHA' && (
              <span>El jugador debe completar este número de niveles (de cualquier tipo) seguidos, sin cometer ningún error (aprobados en el 1er intento). Fallar en un nivel reinicia la racha a 0.</span>
            )}
            {formData.tipo_condicion === 'RACHA_ESCANEOS' && (
              <span>El jugador debe completar este número de niveles de tipo Búsqueda (escaneos) seguidos y sin errores (aprobados en el 1er intento). Fallar en un escaneo reinicia esta racha a 0.</span>
            )}
          </div>

          {/* Descripción */}
          <div className="space-y-1">
            <label className="text-xs font-black text-maya-dark/60 ml-2 uppercase">Descripción / Mensaje</label>
            <div className="relative">
              <FileText className="absolute left-4 top-4 w-5 h-5 text-maya-gold" />
              <textarea
                name="descripcion"
                rows={3}
                placeholder="Breve descripción del logro..."
                value={formData.descripcion}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white border-2 border-transparent focus:border-maya-gold outline-none font-bold text-maya-dark transition-all resize-none"
              />
            </div>
          </div>

          <div className="pt-2">
            <PrimaryButton 
              type="submit"
              disabled={isUploading}
              className="w-full py-5 rounded-[28px] shadow-[0_8px_0_0_#B8851A] hover:translate-y-0.5 hover:shadow-[0_6px_0_0_#B8851A] transition-all disabled:opacity-50"
            >
              <span className="text-lg font-black uppercase tracking-widest">
                {isAdding ? 'Crear Insignia' : 'Guardar Cambios'}
              </span>
            </PrimaryButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BadgeEditModal;
