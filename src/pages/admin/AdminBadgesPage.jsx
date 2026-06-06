import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Award, Trash2, Edit3, ArrowLeft, ShieldAlert } from 'lucide-react';
import AdminPageShell from '../../components/admin/AdminPageShell';
import PrimaryButton from '../../components/PrimaryButton';
import BadgeEditModal from '../../components/admin/BadgeEditModal';
import ModalConfirmation from '../../components/ModalConfirmation';
import Pagination from '../../components/admin/Pagination';
import { db } from '../../data/db';
import { procesarColaSincronizacion } from '../../services/syncService';
import { useToast } from '../../context/ToastContext';
import { API_BASE_URL } from '../../config/api';

const AdminBadgesPage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [badges, setBadges] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Estados para modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Estados para confirmación de borrado
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [badgeToDelete, setBadgeToDelete] = useState(null);

  // Estados de paginación
  const [currentPage, setCurrentPage] = useState(1);
  const badgesPerPage = 10;

  const totalPages = Math.max(1, Math.ceil(badges.length / badgesPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * badgesPerPage;
  const paginatedBadges = badges.slice(startIndex, startIndex + badgesPerPage);

  const fetchBadges = async () => {
    setIsLoading(true);
    try {
      const data = await db.insignias.toArray();
      setBadges(data);
    } catch (error) {
      console.error("Error al obtener insignias de la BD local:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBadges();
  }, []);

  const handleAddNewBadge = () => {
    setSelectedBadge(null);
    setIsAddingNew(true);
    setIsModalOpen(true);
  };

  const handleEditBadge = (badge) => {
    setSelectedBadge(badge);
    setIsAddingNew(false);
    setIsModalOpen(true);
  };

  const handleSaveBadge = async (id, data) => {
    try {
      const isNew = !id;
      const badgeId = id ? Number(id) : Date.now();
      const badgeData = {
        ...data,
        id: badgeId,
        version: 1
      };

      await db.transaction('rw', db.insignias, db.cola_sincronizacion, async () => {
        await db.insignias.put(badgeData);
        await db.cola_sincronizacion.add({
          entidad: 'insignias',
          accion: isNew ? 'CREAR' : 'EDITAR',
          datos: badgeData,
          estado: 'PENDIENTE',
          created_at: new Date().getTime()
        });
      });

      setIsModalOpen(false);
      fetchBadges();

      showToast(
        isNew ? 'Insignia Creada' : 'Insignia Guardada',
        `La insignia "${data.nombre}" se guardó localmente y está en cola de sincronización.`,
        'success'
      );

      if (navigator.onLine) procesarColaSincronizacion();
    } catch (error) {
      console.error("Error al guardar insignia en Dexie:", error);
      showToast('Error', 'No se pudo guardar la insignia: ' + error.message, 'error');
    }
  };

  const handleDeleteBadge = (badge) => {
    setBadgeToDelete(badge);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteBadge = async () => {
    if (!badgeToDelete) return;
    try {
      await db.transaction('rw', db.insignias, db.cola_sincronizacion, async () => {
        await db.insignias.delete(badgeToDelete.id);
        await db.cola_sincronizacion.add({
          entidad: 'insignias',
          accion: 'ELIMINAR',
          datos: { id: badgeToDelete.id, nombre: badgeToDelete.nombre },
          estado: 'PENDIENTE',
          created_at: new Date().getTime()
        });
      });

      setIsDeleteModalOpen(false);
      setBadgeToDelete(null);
      fetchBadges();

      showToast(
        'Insignia Eliminada',
        `La insignia "${badgeToDelete.nombre}" se eliminó localmente y se notificará al servidor.`,
        'success'
      );

      if (navigator.onLine) procesarColaSincronizacion();
    } catch (error) {
      console.error("Error al eliminar insignia en Dexie:", error);
      showToast('Error', 'No se pudo eliminar la insignia: ' + error.message, 'error');
    }
  };

  return (
    <AdminPageShell activeTab="lobby">
      {/* Botón de retroceso */}
      <div className="flex items-center gap-2 mt-2 px-1">
        <button 
          onClick={() => navigate('/admin')}
          className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-slate-100 shadow-xs hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <span className="font-extrabold text-slate-700 text-sm">Volver al Panel</span>
      </div>

      {/* Botón principal */}
      <div className="mt-2 px-1">
        <PrimaryButton 
          onClick={handleAddNewBadge}
          className="relative flex items-center justify-center gap-3 py-4 w-full rounded-3xl shadow-[0_6px_0_0_#B8851A] hover:translate-y-0.5 hover:shadow-[0_4px_0_0_#B8851A] transition-all group"
        >
          <div className="w-10 h-10 bg-white/20 group-hover:bg-white/30 rounded-xl flex items-center justify-center border border-white/40 shrink-0 transition-colors">
            <Plus className="w-6 h-6 text-white" strokeWidth={3} />
          </div>
          <span className="text-sm sm:text-base font-black tracking-widest uppercase">
            Añadir Nueva Insignia
          </span>
        </PrimaryButton>
      </div>

      {/* Título de sección */}
      <div className="mt-6 px-1 flex justify-between items-center">
        <h2 className="text-xl font-black text-maya-dark uppercase tracking-tight">
          Insignias Disponibles
        </h2>
        <span className="bg-maya-gold/20 text-maya-dark/80 text-[10px] font-black px-2.5 py-1 rounded-full border border-maya-gold/30 uppercase tracking-widest">
          {badges.length} Registradas
        </span>
      </div>

      {/* Lista de insignias */}
      <div className="mt-4 space-y-3">
        {isLoading ? (
          <div className="space-y-3 animate-pulse">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm h-28"></div>
            ))}
          </div>
        ) : paginatedBadges.length > 0 ? (
          paginatedBadges.map(badge => (
            <div 
              key={badge.id}
              className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs flex items-center gap-4 hover:shadow-md hover:border-slate-200 transition-all group"
            >
              {/* Icono */}
              <div className="w-16 h-16 rounded-2xl bg-amber-50/50 border border-amber-100 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                {badge.icono_url ? (
                  <img 
                    src={badge.icono_url.startsWith('http') || badge.icono_url.startsWith('data:') ? badge.icono_url : `${API_BASE_URL}${badge.icono_url}`} 
                    alt={badge.nombre}
                    className="w-12 h-12 object-contain"
                  />
                ) : (
                  <Award className="w-8 h-8 text-maya-gold" />
                )}
              </div>

              {/* Contenido */}
              <div className="flex-1 min-w-0">
                <h3 className="font-extrabold text-slate-800 text-base leading-tight mb-0.5 truncate">
                  {badge.nombre}
                </h3>
                <p className="text-xs text-slate-500 font-medium line-clamp-2 leading-relaxed mb-2">
                  {badge.descripcion || 'Sin descripción asignada.'}
                </p>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">
                    {badge.tipo_condicion}: {badge.valor_condicion}
                  </span>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex flex-col gap-2 pl-3 border-l border-slate-100 shrink-0">
                <button
                  onClick={() => handleEditBadge(badge)}
                  className="w-8 h-8 rounded-full bg-slate-50 hover:bg-amber-50 hover:text-amber-600 text-slate-400 flex items-center justify-center border border-slate-100 transition-colors cursor-pointer"
                  title="Editar Insignia"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteBadge(badge)}
                  className="w-8 h-8 rounded-full bg-slate-50 hover:bg-rose-50 hover:text-rose-600 text-slate-400 flex items-center justify-center border border-slate-100 transition-colors cursor-pointer"
                  title="Eliminar Insignia"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-white/50 rounded-3xl border border-slate-200 border-dashed mt-2">
            <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-xs border border-slate-100 text-slate-300">
              <Award className="w-7 h-7" />
            </div>
            <h4 className="font-extrabold text-slate-600 uppercase tracking-widest text-xs mb-1">
              Sin Insignias
            </h4>
            <p className="text-xs text-slate-500 font-medium max-w-xs mx-auto">
              Aún no has registrado ninguna insignia en el sistema.
            </p>
          </div>
        )}
      </div>

      {/* Paginación */}
      <Pagination
        currentPage={safeCurrentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      <BadgeEditModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        badge={selectedBadge}
        onSave={handleSaveBadge}
        isAdding={isAddingNew}
      />

      {/* Modal de confirmación de borrado */}
      <ModalConfirmation
        isOpen={isDeleteModalOpen}
        title="Eliminar Insignia"
        message={`¿Estás seguro de que deseas eliminar la insignia "${badgeToDelete?.nombre}"? Esto también removerá la insignia a todos los usuarios que la tengan.`}
        onConfirm={confirmDeleteBadge}
        onCancel={() => {
          setIsDeleteModalOpen(false);
          setBadgeToDelete(null);
        }}
        confirmText="Eliminar"
      />
    </AdminPageShell>
  );
};

export default AdminBadgesPage;
