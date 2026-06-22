import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import PrimaryButton from '../PrimaryButton';

const GroupEditModal = ({
  isOpen,
  onClose,
  onSave,
  group,
  teachers
}) => {
  const [groupName, setGroupName] = useState('');
  const [groupDesc, setGroupDesc] = useState('');
  const [groupTeacherId, setGroupTeacherId] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (group) {
        setGroupName(group.nombre || '');
        setGroupDesc(group.descripcion || '');
        setGroupTeacherId(group.docente_id || '');
      } else {
        setGroupName('');
        setGroupDesc('');
        setGroupTeacherId('');
      }
    }
  }, [isOpen, group]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      nombre: groupName,
      descripcion: groupDesc,
      docente_id: groupTeacherId
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-maya-cream rounded-[40px] p-8 w-full max-w-lg shadow-2xl flex flex-col relative border-4 border-maya-gold/20 my-8">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-white/50 text-maya-dark hover:bg-white transition-colors"
          type="button"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="mb-6">
          <h2 className="text-3xl font-black text-maya-dark uppercase tracking-tight">
            {!group ? 'Crear Grupo' : 'Editar Grupo'}
          </h2>
          <p className="text-maya-gold font-bold text-sm tracking-widest uppercase">Ajustes Generales</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-black text-maya-dark/60 ml-2 uppercase">Nombre del Grupo</label>
            <input
              type="text"
              placeholder="Ej: 3er Grado A"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full px-6 py-4 rounded-2xl bg-white border-2 border-transparent focus:border-maya-gold outline-none font-bold text-maya-dark transition-all"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-black text-maya-dark/60 ml-2 uppercase">Descripción</label>
            <textarea
              placeholder="Añade detalles sobre la escuela o el aula..."
              value={groupDesc}
              onChange={(e) => setGroupDesc(e.target.value)}
              className="w-full px-6 py-4 rounded-2xl bg-white border-2 border-transparent focus:border-maya-gold outline-none font-bold text-maya-dark transition-all h-24 resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-black text-maya-dark/60 ml-2 uppercase">Docente Asignado</label>
            <select
              value={groupTeacherId}
              onChange={(e) => setGroupTeacherId(e.target.value)}
              className="w-full px-6 py-4 rounded-2xl bg-white border-2 border-transparent focus:border-maya-gold outline-none font-bold text-maya-dark transition-all cursor-pointer"
            >
              <option value="">Selecciona un docente...</option>
              {teachers.map(t => (
                <option key={t.id} value={t.id}>{`${t.nombre} ${t.apellido || ''}`.trim() || t.username}</option>
              ))}
            </select>
          </div>

          <div className="pt-4">
            <PrimaryButton type="submit" className="w-full py-6 rounded-[28px] shadow-[0_8px_0_0_#B8851A]">
              <span className="text-xl font-black uppercase tracking-widest">
                {!group ? 'Crear Grupo' : 'Guardar Cambios'}
              </span>
            </PrimaryButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GroupEditModal;
