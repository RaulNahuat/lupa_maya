import { useState, useEffect, useCallback } from 'react';
import { Plus } from 'lucide-react';
import AdminPageShell from '../../components/admin/AdminPageShell';
import GlyphSearchBar from '../../components/admin/GlyphSearchBar';
import FilterTabs from '../../components/admin/FilterTabs';
import Pagination from '../../components/admin/Pagination';
import UserCard from '../../components/admin/UserCard';
import PrimaryButton from '../../components/PrimaryButton';
import UserEditModal from '../../components/admin/UserEditModal';
import ModalConfirmation from '../../components/ModalConfirmation';
import { db } from '../../data/db';
import { procesarColaSincronizacion } from '../../services/syncService';
import bcrypt from 'bcryptjs';

const AdminUsersPage = () => {

  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('TODOS');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const localUsers = await db.usuarios.toArray();
      
      const processed = localUsers.map(u => ({
        ...u,
        id: u.id || u.local_id,
        name: `${u.nombre} ${u.apellido || ''}`,
        email: u.username,
        level: 0,
        stars: 0,
        badges: 0,
        status: u.deleted_at ? "INACTIVOS" : "ACTIVOS"
      }));

      setUsers(processed);

      if (navigator.onLine) {
        await procesarColaSincronizacion();
        const updatedUsers = await db.usuarios.toArray();
        setUsers(updatedUsers.map(u => ({
          ...u,
          id: u.id || u.local_id,
          name: `${u.nombre} ${u.apellido || ''}`,
          email: u.username,
          level: 0,
          stars: 0,
          badges: 0,
          status: u.deleted_at ? "INACTIVOS" : "ACTIVOS"
        })));
      }
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter, searchQuery]);

  const handleEdit = (user) => {
    setSelectedUser(user);
    setIsAddingNew(false);
    setIsEditModalOpen(true);
  };

  const handleAddNew = () => {
    setSelectedUser({
      nombre: '',
      apellido: '',
      username: '',
      escuela: '',
      lugar_procedencia: '',
      genero: '',
      grado: '',
      pin: ''
    });
    setIsAddingNew(true);
    setIsEditModalOpen(true);
  };

  const handleDelete = (user) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedUser) return;

    try {
      const localId = selectedUser.local_id;
      
      await db.transaction('rw', db.usuarios, db.cola_sincronizacion, async () => {
        await db.usuarios.update(localId, { deleted_at: new Date().toISOString() });
        
        await db.cola_sincronizacion.add({
          entidad: 'usuarios',
          accion: 'ELIMINAR',
          datos: { id: selectedUser.id, local_id: localId },
          estado: 'PENDIENTE',
          created_at: new Date().getTime()
        });
      });

      setUsers(prev => prev.filter(u => u.local_id !== localId));
      setIsDeleteModalOpen(false);
      setSelectedUser(null);
      
      if (navigator.onLine) procesarColaSincronizacion();

    } catch (error) {
      console.error("Error eliminando usuario:", error);
    }
  };

  const handleSave = async (id, updatedData) => {
    try {
      if (isAddingNew) {
        const local_id = crypto.randomUUID();
        const payload = { ...updatedData };
        
        if (payload.pin) {
          payload.pin_hash = bcrypt.hashSync(String(payload.pin), 10);
          delete payload.pin;
        }

        const nuevoUsuario = {
          ...payload,
          local_id,
          sync_status: 'PENDIENTE',
          created_at: new Date().toISOString()
        };

        await db.transaction('rw', db.usuarios, db.cola_sincronizacion, async () => {
          await db.usuarios.add(nuevoUsuario);
          await db.cola_sincronizacion.add({
            entidad: 'usuarios',
            accion: 'CREAR',
            datos: nuevoUsuario,
            estado: 'PENDIENTE',
            created_at: new Date().getTime()
          });
        });
      } else {
        const localId = selectedUser.local_id;
        const payload = { ...updatedData };

        if (payload.pin) {
          payload.pin_hash = bcrypt.hashSync(String(payload.pin), 10);
          delete payload.pin;
        }

        await db.transaction('rw', db.usuarios, db.cola_sincronizacion, async () => {
          await db.usuarios.update(localId, payload);
          await db.cola_sincronizacion.add({
            entidad: 'usuarios',
            accion: 'EDITAR',
            datos: { ...payload, id: selectedUser.id, local_id: localId },
            estado: 'PENDIENTE',
            created_at: new Date().getTime()
          });
        });
      }

      fetchUsers();
      setIsEditModalOpen(false);
      setSelectedUser(null);
      
      if (navigator.onLine) procesarColaSincronizacion();
      
    } catch (error) {
      console.error("Error actualizando/creando usuario:", error);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesFilter = activeFilter === 'TODOS' || user.genero === activeFilter;
    const matchesSearch = (user.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (user.email?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const genderFilters = ['TODOS', ...Array.from(new Set(users.map(u => u.genero).filter(Boolean)))];

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / usersPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * usersPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + usersPerPage);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const goToPage = (page) => {
    setCurrentPage(Math.min(Math.max(page, 1), totalPages));
  };

  return (
    <AdminPageShell activeTab="usuarios">
        <div className="mt-2 px-1">
          <PrimaryButton 
            onClick={handleAddNew}
            className="relative flex items-center justify-center gap-4 py-6 rounded-3xl shadow-[0_8px_0_0_#B8851A] hover:translate-y-0.5 hover:shadow-[0_6px_0_0_#B8851A] transition-all"
          >
            <div className="w-10 h-10 bg-white/30 rounded-xl flex items-center justify-center border border-white/40">
              <Plus className="w-7 h-7 text-white" strokeWidth={4} />
            </div>
            <span className="text-lg font-black tracking-widest uppercase">AÑADIR NUEVO USUARIO</span>
          </PrimaryButton>
        </div>

        <div className="space-y-2">
          <GlyphSearchBar onSearch={setSearchQuery} />
          <FilterTabs
            filters={genderFilters}
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
          />
        </div>

        <div className="mt-4">
          {isLoading ? (
            <div className="text-center py-10 opacity-40">
              <span className="font-bold uppercase tracking-widest animate-pulse">Cargando...</span>
            </div>
          ) : paginatedUsers.length > 0 ? (
            <>
              {paginatedUsers.map(user => (
                <UserCard
                  key={user.local_id || user.id}
                  user={user}
                  onEdit={() => handleEdit(user)}
                  onDelete={() => handleDelete(user)}
                />
              ))}

              <Pagination
                currentPage={safeCurrentPage}
                totalPages={totalPages}
                onPageChange={goToPage}
              />
            </>
          ) : (
            <div className="text-center py-10 opacity-40">
              <span className="font-bold uppercase tracking-widest">No se encontraron usuarios</span>
            </div>
          )}
        </div>

      {/* Modals */}
      <UserEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={selectedUser}
        onSave={handleSave}
        isAdding={isAddingNew}
      />

      <ModalConfirmation
        isOpen={isDeleteModalOpen}
        title="¿Eliminar Usuario?"
        message={`¿Estás seguro de que quieres eliminar a ${selectedUser?.name}? Esta acción no se puede deshacer.`}
        onConfirm={confirmDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
        confirmText="Eliminar"
        cancelText="Cancelar"
      />
    </AdminPageShell>
  );
};

export default AdminUsersPage;
