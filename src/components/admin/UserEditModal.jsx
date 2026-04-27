import { useState, useEffect } from 'react';
import { X, User, School, MapPin, GraduationCap, Lock } from 'lucide-react';
import PrimaryButton from '../PrimaryButton';

const UserEditModal = ({ isOpen, onClose, user, onSave, isAdding }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    username: '',
    escuela: '',
    lugar_procedencia: '',
    genero: 'Femenino',
    grado: '1er Grado',
    pin: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        nombre: user.nombre || '',
        apellido: user.apellido || '',
        username: user.username || '',
        escuela: user.escuela || '',
        lugar_procedencia: user.lugar_procedencia || '',
        genero: user.genero || 'Femenino',
        grado: user.grado || '1er Grado',
        pin: user.pin || ''
      });
    }
  }, [user]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(user?.id, formData);
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
            {isAdding ? 'Añadir Usuario' : 'Editar Usuario'}
          </h2>
          <p className="text-maya-gold font-bold text-sm tracking-widest uppercase">
            Información del Perfil
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-black text-maya-dark/60 ml-2 uppercase">Nombre</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-maya-gold" />
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border-2 border-transparent focus:border-maya-gold outline-none font-bold text-maya-dark transition-all"
                  required
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-black text-maya-dark/60 ml-2 uppercase">Apellido</label>
              <input
                type="text"
                name="apellido"
                value={formData.apellido}
                onChange={handleChange}
                className="w-full px-4 py-4 rounded-2xl bg-white border-2 border-transparent focus:border-maya-gold outline-none font-bold text-maya-dark transition-all"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-black text-maya-dark/60 ml-2 uppercase">Usuario (Login)</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full px-6 py-4 rounded-2xl bg-white border-2 border-transparent focus:border-maya-gold outline-none font-bold text-maya-dark transition-all"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-black text-maya-dark/60 ml-2 uppercase">PIN (4 números)</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-maya-gold" />
                <input
                  type="text"
                  name="pin"
                  maxLength={4}
                  pattern="\d{4}"
                  placeholder="1234"
                  value={formData.pin}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border-2 border-transparent focus:border-maya-gold outline-none font-bold text-maya-dark transition-all"
                  required={isAdding}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-black text-maya-dark/60 ml-2 uppercase">Género</label>
              <select
                name="genero"
                value={formData.genero}
                onChange={handleChange}
                className="w-full px-6 py-4 rounded-2xl bg-white border-2 border-transparent focus:border-maya-gold outline-none font-bold text-maya-dark appearance-none transition-all cursor-pointer"
              >
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-black text-maya-dark/60 ml-2 uppercase">Grado</label>
              <div className="relative">
                <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-maya-gold" />
                <input
                  type="text"
                  name="grado"
                  value={formData.grado}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border-2 border-transparent focus:border-maya-gold outline-none font-bold text-maya-dark transition-all"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-black text-maya-dark/60 ml-2 uppercase">Escuela</label>
            <div className="relative">
              <School className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-maya-gold" />
              <input
                type="text"
                name="escuela"
                value={formData.escuela}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border-2 border-transparent focus:border-maya-gold outline-none font-bold text-maya-dark transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-black text-maya-dark/60 ml-2 uppercase">Lugar de Procedencia</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-maya-gold" />
              <input
                type="text"
                name="lugar_procedencia"
                value={formData.lugar_procedencia}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border-2 border-transparent focus:border-maya-gold outline-none font-bold text-maya-dark transition-all"
              />
            </div>
          </div>

          <div className="pt-4">
            <PrimaryButton 
              type="submit"
              className="w-full py-6 rounded-[28px] shadow-[0_8px_0_0_#B8851A] hover:translate-y-0.5 hover:shadow-[0_6px_0_0_#B8851A] transition-all"
            >
              <span className="text-xl font-black uppercase tracking-widest">
                {isAdding ? 'Crear Usuario' : 'Guardar Cambios'}
              </span>
            </PrimaryButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserEditModal;
