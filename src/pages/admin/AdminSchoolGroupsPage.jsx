import { useState, useEffect } from 'react';
import { Plus, Users, Edit, Trash2, ArrowLeft, Check, X, ShieldAlert, BookOpen, GraduationCap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AdminPageShell from '../../components/admin/AdminPageShell';
import PrimaryButton from '../../components/PrimaryButton';
import ModalConfirmation from '../../components/ModalConfirmation';
import { db } from '../../data/db';
import { useToast } from '../../context/ToastContext';
import { procesarColaSincronizacion } from '../../services/syncService';

const AdminSchoolGroupsPage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [groups, setGroups] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modales y formularios
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Formulario de grupo
  const [groupName, setGroupName] = useState('');
  const [groupDesc, setGroupDesc] = useState('');
  const [groupTeacherId, setGroupTeacherId] = useState('');

  // Estudiantes del grupo seleccionado para edición avanzada
  const [isStudentsModalOpen, setIsStudentsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('INSCRITOS'); // INSCRITOS o DISPONIBLES

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [localGroups, localUsers] = await Promise.all([
        db.grupos_escolares.toArray(),
        db.usuarios.toArray()
      ]);

      setGroups(localGroups);
      // Filtrar docentes (usuarios con rol_id 3)
      setTeachers(localUsers.filter(u => Number(u.rol_id) === 3 && !u.deleted_at));
      // Filtrar estudiantes (usuarios con rol_id 2)
      setStudents(localUsers.filter(u => Number(u.rol_id) === 2 && !u.deleted_at));
    } catch (error) {
      console.error("Error al cargar datos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddNew = () => {
    setSelectedGroup(null);
    setGroupName('');
    setGroupDesc('');
    setGroupTeacherId('');
    setIsAddingNew(true);
    setIsEditModalOpen(true);
  };

  const handleEdit = (group) => {
    setSelectedGroup(group);
    setGroupName(group.nombre);
    setGroupDesc(group.descripcion || '');
    setGroupTeacherId(group.docente_id || '');
    setIsAddingNew(false);
    setIsEditModalOpen(true);
  };

  const handleDelete = (group) => {
    setSelectedGroup(group);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedGroup) return;

    try {
      const localId = selectedGroup.local_id;

      await db.transaction('rw', db.grupos_escolares, db.usuarios, db.cola_sincronizacion, async () => {
        // Eliminar grupo
        await db.grupos_escolares.delete(localId);

        // Desvincular alumnos locales
        const alumnosGrupo = await db.usuarios.where('grupo_escolar_id').equals(selectedGroup.id || localId).toArray();
        for (const u of alumnosGrupo) {
          await db.usuarios.update(u.local_id, { grupo_escolar_id: null });
          await db.cola_sincronizacion.add({
            entidad: 'usuarios',
            accion: 'EDITAR',
            datos: { ...u, grupo_escolar_id: null },
            estado: 'PENDIENTE',
            created_at: new Date().getTime()
          });
        }

        // Registrar eliminación en cola
        await db.cola_sincronizacion.add({
          entidad: 'grupos_escolares',
          accion: 'ELIMINAR',
          datos: { local_id: localId },
          estado: 'PENDIENTE',
          created_at: new Date().getTime()
        });
      });

      showToast('Grupo Eliminado', `El grupo "${selectedGroup.nombre}" ha sido eliminado.`, 'success');
      setIsDeleteModalOpen(false);
      setSelectedGroup(null);
      loadData();

      if (navigator.onLine) procesarColaSincronizacion();
    } catch (error) {
      console.error(error);
      showToast('Error', 'No se pudo eliminar el grupo.', 'error');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const teacherIdNum = groupTeacherId ? Number(groupTeacherId) : null;

      if (isAddingNew) {
        const local_id = crypto.randomUUID();
        const nuevoGrupo = {
          nombre: groupName,
          descripcion: groupDesc,
          docente_id: teacherIdNum,
          local_id,
          sync_status: 'PENDIENTE',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        await db.transaction('rw', db.grupos_escolares, db.cola_sincronizacion, async () => {
          await db.grupos_escolares.add(nuevoGrupo);
          await db.cola_sincronizacion.add({
            entidad: 'grupos_escolares',
            accion: 'CREAR',
            datos: nuevoGrupo,
            estado: 'PENDIENTE',
            created_at: new Date().getTime()
          });
        });

        showToast('Grupo Creado', `El grupo "${groupName}" ha sido creado con éxito.`, 'success');
      } else {
        const localId = selectedGroup.local_id;
        const payload = {
          nombre: groupName,
          descripcion: groupDesc,
          docente_id: teacherIdNum,
          updated_at: new Date().toISOString()
        };

        await db.transaction('rw', db.grupos_escolares, db.cola_sincronizacion, async () => {
          await db.grupos_escolares.update(localId, payload);
          await db.cola_sincronizacion.add({
            entidad: 'grupos_escolares',
            accion: 'EDITAR',
            datos: { ...payload, local_id: localId, id: selectedGroup.id },
            estado: 'PENDIENTE',
            created_at: new Date().getTime()
          });
        });

        showToast('Grupo Actualizado', 'Los datos del grupo han sido guardados.', 'success');
      }

      setIsEditModalOpen(false);
      setSelectedGroup(null);
      loadData();

      if (navigator.onLine) procesarColaSincronizacion();
    } catch (error) {
      console.error(error);
      showToast('Error', 'No se pudo guardar el grupo.', 'error');
    }
  };

  // Gestión de Alumnos del Grupo
  const handleManageStudents = (group) => {
    setSelectedGroup(group);
    setIsStudentsModalOpen(true);
    setActiveTab('INSCRITOS');
  };

  const handleAddStudentToGroup = async (student) => {
    try {
      const groupIdVal = selectedGroup.id || selectedGroup.local_id;

      await db.transaction('rw', db.usuarios, db.cola_sincronizacion, async () => {
        await db.usuarios.update(student.local_id, { grupo_escolar_id: groupIdVal });
        await db.cola_sincronizacion.add({
          entidad: 'usuarios',
          accion: 'EDITAR',
          datos: { ...student, grupo_escolar_id: groupIdVal },
          estado: 'PENDIENTE',
          created_at: new Date().getTime()
        });
      });

      showToast('Alumno Añadido', `Se añadió a ${student.nombre} al grupo.`, 'success');
      loadData();
      if (navigator.onLine) procesarColaSincronizacion();
    } catch (error) {
      console.error(error);
    }
  };

  const handleRemoveStudentFromGroup = async (student) => {
    try {
      await db.transaction('rw', db.usuarios, db.cola_sincronizacion, async () => {
        await db.usuarios.update(student.local_id, { grupo_escolar_id: null });
        await db.cola_sincronizacion.add({
          entidad: 'usuarios',
          accion: 'EDITAR',
          datos: { ...student, grupo_escolar_id: null },
          estado: 'PENDIENTE',
          created_at: new Date().getTime()
        });
      });

      showToast('Alumno Removido', `Se removió a ${student.nombre} del grupo.`, 'success');
      loadData();
      if (navigator.onLine) procesarColaSincronizacion();
    } catch (error) {
      console.error(error);
    }
  };

  const getGroupNameById = (id) => {
    const g = groups.find(x => x.id === id || x.local_id === id);
    return g ? g.nombre : 'Sin grupo';
  };

  const getTeacherNameById = (id) => {
    const t = teachers.find(x => Number(x.id) === Number(id));
    return t ? `${t.nombre} ${t.apellido || ''}`.trim() || t.username : 'Sin docente asignado';
  };

  const groupStudents = selectedGroup 
    ? students.filter(s => s.grupo_escolar_id === (selectedGroup.id || selectedGroup.local_id)) 
    : [];

  const availableStudents = students.filter(s => s.grupo_escolar_id !== (selectedGroup?.id || selectedGroup?.local_id));

  return (
    <AdminPageShell activeTab="lobby">
      <div className="flex items-center gap-3 mt-2 px-1">
        <button 
          onClick={() => navigate('/admin')}
          className="p-2.5 rounded-full bg-white/60 hover:bg-white text-maya-dark transition-colors shadow-xs"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-black text-maya-dark uppercase tracking-tight">Grupos Escolares</h1>
      </div>

      <div className="mt-2 px-1">
        <PrimaryButton 
          onClick={handleAddNew}
          className="relative flex items-center justify-center gap-4 py-6 rounded-3xl shadow-[0_8px_0_0_#B8851A] hover:translate-y-0.5 hover:shadow-[0_6px_0_0_#B8851A] transition-all"
        >
          <div className="w-10 h-10 bg-white/30 rounded-xl flex items-center justify-center border border-white/40">
            <Plus className="w-7 h-7 text-white" strokeWidth={4} />
          </div>
          <span className="text-lg font-black tracking-widest uppercase">AÑADIR NUEVO GRUPO</span>
        </PrimaryButton>
      </div>

      <div className="mt-4 space-y-4">
        {isLoading ? (
          <div className="text-center py-10 opacity-40">
            <span className="font-bold uppercase tracking-widest animate-pulse text-xs">Cargando...</span>
          </div>
        ) : groups.length > 0 ? (
          groups.map(group => {
            const count = students.filter(s => s.grupo_escolar_id === (group.id || group.local_id)).length;
            const initials = group.nombre.split(' ').map(n => n.charAt(0)).join('').substring(0, 2).toUpperCase();

            return (
              <div 
                key={group.local_id || group.id}
                className="bg-white rounded-4xl p-4 sm:p-5 shadow-sm border border-gray-100 flex flex-col gap-4 transition-transform hover:-translate-y-0.5 hover:shadow-md relative"
              >
                <div className="flex gap-4 items-start select-none">
                  {/* Icono/Iniciales con Degradado Maya */}
                  <div 
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl flex items-center justify-center shrink-0 text-white font-black text-xl sm:text-2xl shadow-xs"
                    style={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}
                  >
                    {initials || <BookOpen className="w-8 h-8 text-white/90" />}
                  </div>

                  <div className="flex flex-col flex-1 min-w-0 pt-0.5">
                    <h3 className="font-black text-maya-dark text-base sm:text-[18px] leading-tight mb-1 truncate">
                      {group.nombre}
                    </h3>
                    <p className="text-xs text-slate-400 font-bold mb-3 line-clamp-1 pr-6">
                      {group.descripcion || 'Sin descripción.'}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 items-center">
                      <span className="bg-emerald-50 text-emerald-600 text-[9px] font-black border border-emerald-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
                        Docente: {getTeacherNameById(group.docente_id)}
                      </span>
                      <span className="bg-slate-50 text-slate-500 text-[9px] font-black border border-slate-200/60 px-2.5 py-1 rounded-full uppercase tracking-wider">
                        {count} {count === 1 ? 'Alumno' : 'Alumnos'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 border-t border-slate-100 pt-3.5">
                  <button
                    onClick={() => handleManageStudents(group)}
                    className="flex-1 py-2.5 bg-maya-gold text-white text-[10px] font-black tracking-widest uppercase rounded-full shadow-md shadow-amber-900/10 hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <Users className="w-4 h-4" />
                    GESTIONAR ALUMNOS
                  </button>

                  <div className="flex gap-1.5">
                    <button 
                      onClick={() => handleEdit(group)}
                      className="px-3.5 py-2.5 bg-[#01805E] text-white text-[9px] font-black rounded-full shadow-md shadow-green-900/25 hover:opacity-90 active:scale-95 transition-all uppercase tracking-wider"
                    >
                      EDITAR
                    </button>
                    <button 
                      onClick={() => handleDelete(group)}
                      className="px-3.5 py-2.5 bg-[#E14D4B] text-white text-[9px] font-black rounded-full shadow-md shadow-red-900/25 hover:opacity-90 active:scale-95 transition-all uppercase tracking-wider"
                    >
                      ELIMINAR
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-10 bg-white/50 rounded-4xl border border-dashed border-gray-300">
            <span className="font-bold uppercase tracking-widest text-xs text-slate-400">No se encontraron grupos escolares</span>
          </div>
        )}
      </div>

      {/* MODAL DE EDICIÓN / ADICIÓN */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-maya-cream rounded-[40px] p-8 w-full max-w-lg shadow-2xl flex flex-col relative border-4 border-maya-gold/20 my-8">
            <button 
              onClick={() => setIsEditModalOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-full bg-white/50 text-maya-dark hover:bg-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="mb-6">
              <h2 className="text-3xl font-black text-maya-dark uppercase tracking-tight">
                {isAddingNew ? 'Crear Grupo' : 'Editar Grupo'}
              </h2>
              <p className="text-maya-gold font-bold text-sm tracking-widest uppercase">Ajustes Generales</p>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
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
                    {isAddingNew ? 'Crear Grupo' : 'Guardar Cambios'}
                  </span>
                </PrimaryButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE GESTIÓN DE ALUMNOS */}
      {isStudentsModalOpen && selectedGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-maya-cream rounded-[40px] p-6 w-full max-w-lg shadow-2xl flex flex-col relative border-4 border-maya-gold/20 h-[80vh] my-8">
            <button 
              onClick={() => setIsStudentsModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/50 text-maya-dark hover:bg-white transition-colors z-10"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="mb-4 pr-10">
              <h2 className="text-2xl font-black text-maya-dark uppercase tracking-tight truncate">
                Alumnos: {selectedGroup.nombre}
              </h2>
              <p className="text-[10px] text-maya-gold font-bold tracking-widest uppercase">
                Administrar matrícula
              </p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-4 bg-slate-200/50 p-1.5 rounded-2xl">
              <button
                onClick={() => setActiveTab('INSCRITOS')}
                className={`flex-1 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${
                  activeTab === 'INSCRITOS' 
                    ? 'bg-white text-maya-dark shadow-xs' 
                    : 'text-slate-400 hover:text-maya-dark'
                }`}
              >
                Inscritos ({groupStudents.length})
              </button>
              <button
                onClick={() => setActiveTab('DISPONIBLES')}
                className={`flex-1 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${
                  activeTab === 'DISPONIBLES' 
                    ? 'bg-white text-maya-dark shadow-xs' 
                    : 'text-slate-400 hover:text-maya-dark'
                }`}
              >
                Disponibles ({availableStudents.length})
              </button>
            </div>

            {/* Listado con scroll */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {activeTab === 'INSCRITOS' ? (
                groupStudents.length > 0 ? (
                  groupStudents.map(student => (
                    <div 
                      key={student.local_id || student.id}
                      className="bg-white p-3.5 rounded-3xl border border-slate-100 flex items-center justify-between gap-4"
                    >
                      <div className="min-w-0">
                        <p className="font-black text-maya-dark text-sm truncate">{student.nombre} {student.apellido}</p>
                        <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider">{student.username} • {student.grado}</p>
                      </div>
                      <button
                        onClick={() => handleRemoveStudentFromGroup(student)}
                        className="px-4 py-2 bg-[#E14D4B] text-white text-[8px] font-black rounded-full hover:opacity-95 active:scale-95 transition-all uppercase tracking-wider shrink-0"
                        title="Sacar del grupo"
                      >
                        REMOVER
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 opacity-30">
                    <p className="text-xs font-bold uppercase tracking-wider">No hay alumnos inscritos en este grupo.</p>
                  </div>
                )
              ) : (
                availableStudents.length > 0 ? (
                  availableStudents.map(student => (
                    <div 
                      key={student.local_id || student.id}
                      className="bg-white p-3.5 rounded-3xl border border-slate-100 flex items-center justify-between gap-4"
                    >
                      <div className="min-w-0">
                        <p className="font-black text-maya-dark text-sm truncate">{student.nombre} {student.apellido}</p>
                        <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider">
                          {student.username} • {student.grado} {student.grupo_escolar_id ? `(${getGroupNameById(student.grupo_escolar_id)})` : ''}
                        </p>
                      </div>
                      <button
                        onClick={() => handleAddStudentToGroup(student)}
                        className="px-4 py-2 bg-[#01805E] text-white text-[8px] font-black rounded-full hover:opacity-95 active:scale-95 transition-all uppercase tracking-wider shrink-0"
                        title="Añadir al grupo"
                      >
                        AGREGAR
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 opacity-30">
                    <p className="text-xs font-bold uppercase tracking-wider">No hay alumnos disponibles para añadir.</p>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMACIÓN DE ELIMINACIÓN */}
      <ModalConfirmation
        isOpen={isDeleteModalOpen}
        title="¿Eliminar Grupo?"
        message={`¿Estás seguro de que quieres eliminar a ${selectedGroup?.nombre}? Esta acción desvinculará a los alumnos de este grupo.`}
        onConfirm={confirmDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
        confirmText="Eliminar"
        cancelText="Cancelar"
      />
    </AdminPageShell>
  );
};

export default AdminSchoolGroupsPage;
