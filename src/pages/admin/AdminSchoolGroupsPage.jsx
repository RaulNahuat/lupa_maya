import { useState, useEffect } from 'react';
import { Plus, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AdminPageShell from '../../components/admin/AdminPageShell';
import PrimaryButton from '../../components/PrimaryButton';
import ModalConfirmation from '../../components/ModalConfirmation';
import GroupCard from '../../components/admin/GroupCard';
import GroupEditModal from '../../components/admin/GroupEditModal';
import GroupStudentsModal from '../../components/admin/GroupStudentsModal';
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

  // Modales
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isStudentsModalOpen, setIsStudentsModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [localGroups, localUsers] = await Promise.all([
        db.grupos_escolares.toArray(),
        db.usuarios.toArray()
      ]);

      setGroups(localGroups);
      setTeachers(localUsers.filter(u => Number(u.rol_id) === 3 && !u.deleted_at));
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
    setIsEditModalOpen(true);
  };

  const handleEdit = (group) => {
    setSelectedGroup(group);
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
        await db.grupos_escolares.delete(localId);

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

  const handleSave = async (formData) => {
    try {
      const teacherIdNum = formData.docente_id ? Number(formData.docente_id) : null;

      if (!selectedGroup) {
        const local_id = crypto.randomUUID();
        const nuevoGrupo = {
          nombre: formData.nombre,
          descripcion: formData.descripcion,
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

        showToast('Grupo Creado', `El grupo "${formData.nombre}" ha sido creado con éxito.`, 'success');
      } else {
        const localId = selectedGroup.local_id;
        const payload = {
          nombre: formData.nombre,
          descripcion: formData.descripcion,
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

  const handleManageStudents = (group) => {
    setSelectedGroup(group);
    setIsStudentsModalOpen(true);
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
          groups.map(group => (
            <GroupCard
              key={group.local_id || group.id}
              group={group}
              students={students}
              teachers={teachers}
              onManageStudents={handleManageStudents}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))
        ) : (
          <div className="text-center py-10 bg-white/50 rounded-4xl border border-dashed border-gray-300">
            <span className="font-bold uppercase tracking-widest text-xs text-slate-400">No se encontraron grupos escolares</span>
          </div>
        )}
      </div>

      <GroupEditModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedGroup(null);
        }}
        onSave={handleSave}
        group={selectedGroup}
        teachers={teachers}
      />

      {/* MODAL DE GESTIÓN DE ALUMNOS */}
      <GroupStudentsModal
        isOpen={isStudentsModalOpen}
        onClose={() => {
          setIsStudentsModalOpen(false);
          setSelectedGroup(null);
        }}
        group={selectedGroup}
        students={students}
        groups={groups}
        onAddStudent={handleAddStudentToGroup}
        onRemoveStudent={handleRemoveStudentFromGroup}
      />

      <ModalConfirmation
        isOpen={isDeleteModalOpen}
        title="¿Eliminar Grupo?"
        message={`¿Estás seguro de que quieres eliminar a ${selectedGroup?.nombre}? Esta acción desvinculará a los alumnos de este grupo.`}
        onConfirm={confirmDelete}
        onCancel={() => {
          setIsDeleteModalOpen(false);
          setSelectedGroup(null);
        }}
        confirmText="Eliminar"
        cancelText="Cancelar"
      />
    </AdminPageShell>
  );
};

export default AdminSchoolGroupsPage;