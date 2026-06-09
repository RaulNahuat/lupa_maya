import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, HelpCircle } from 'lucide-react';
import LevelCard from './LevelCard';
import Pagination from './Pagination';
import LevelEditModal from './LevelEditModal';
import ModalConfirmation from '../ModalConfirmation';
import { db } from '../../data/db';
import { procesarColaSincronizacion } from '../../services/syncService';

const LevelsSection = ({ blockId, levels, globalMaxLevel, onRefresh }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Estados para el CRUD de niveles
  const [isLevelModalOpen, setIsLevelModalOpen] = useState(false);
  const [isDeleteLevelModalOpen, setIsDeleteLevelModalOpen] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [isAddingLevel, setIsAddingLevel] = useState(false);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const normalize = (str) => {
    if (!str) return '';
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  };

  const handleAddLevelToBlock = () => {
    setSelectedLevel(null);
    setIsAddingLevel(true);
    setIsLevelModalOpen(true);
  };

  const handleDeleteLevel = (level) => {
    setSelectedLevel(level);
    setIsDeleteLevelModalOpen(true);
  };

  const confirmDeleteLevel = async () => {
    if (!selectedLevel) return;

    try {
      await db.transaction('rw', db.niveles, db.cola_sincronizacion, async () => {
        await db.niveles.delete(selectedLevel.id);
        await db.cola_sincronizacion.add({
          entidad: 'niveles',
          accion: 'ELIMINAR',
          datos: { id: selectedLevel.id, numero: selectedLevel.numero },
          estado: 'PENDIENTE',
          created_at: new Date().getTime()
        });
      });

      setIsDeleteLevelModalOpen(false);
      setSelectedLevel(null);

      if (navigator.onLine) {
        await procesarColaSincronizacion();
      }
      onRefresh();
    } catch (error) {
      console.error("Error al eliminar el nivel:", error);
    }
  };

  const handleSaveLevel = async (id, data) => {
    try {
      const isNew = !id;
      const levelId = id ? Number(id) : Date.now();
      const levelData = {
        ...data,
        id: levelId,
        grupo_id: Number(blockId),
        activo: true,
        version: 1
      };

      await db.transaction('rw', db.niveles, db.cola_sincronizacion, async () => {
        await db.niveles.put(levelData);
        await db.cola_sincronizacion.add({
          entidad: 'niveles',
          accion: isNew ? 'CREAR' : 'EDITAR',
          datos: levelData,
          estado: 'PENDIENTE',
          created_at: new Date().getTime()
        });
      });

      setIsLevelModalOpen(false);
      setSelectedLevel(null);

      if (navigator.onLine) {
        await procesarColaSincronizacion();
      }
      onRefresh();
    } catch (error) {
      console.error("Error al guardar el nivel en Dexie:", error);
      throw error;
    }
  };

  const visibleLevels = levels.filter(level => {
    if (!searchQuery) return true;
    const query = normalize(searchQuery);
    return level.numero.toString().includes(query) ||
           normalize(level.tipo).includes(query);
  });

  const totalPages = Math.max(1, Math.ceil(visibleLevels.length / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * itemsPerPage;
  const paginatedLevels = visibleLevels.slice(startIndex, startIndex + itemsPerPage);

  const nextSuggestedNumber = levels.length + 1;

  return (
    <div className="space-y-4">
      {/* Buscador de niveles */}
      <div className="relative">
        <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-slate-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          placeholder="Buscar nivel por número o tipo..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-3 py-3 bg-white border border-slate-200 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.01)] focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 font-medium text-slate-700 placeholder-slate-400 transition-all text-xs"
        />
      </div>

      <button
        onClick={handleAddLevelToBlock}
        className="w-full py-3.5 border-2 border-dashed border-slate-200 hover:border-emerald-500 rounded-2xl flex items-center justify-center gap-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50/20 transition-all font-bold text-xs tracking-wider uppercase bg-white shadow-sm"
      >
        <Plus className="w-4 h-4" strokeWidth={2.5} />
        <span>AÑADIR NIVEL A ESTE BLOQUE</span>
      </button>

      {paginatedLevels.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-4">
            {paginatedLevels.map(level => (
              <LevelCard
                key={level.id}
                level={level}
                onConfigure={() => navigate(`/admin/glyphs/block/${blockId}/level/${level.id}`)}
                onDelete={() => handleDeleteLevel(level)}
              />
            ))}
          </div>

          {/* Paginación */}
          <div className="mt-4">
            <Pagination
              currentPage={safeCurrentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </>
      ) : (
        <div className="text-center py-10 bg-white rounded-2xl border border-slate-100 shadow-sm p-6 max-w-sm mx-auto">
          <HelpCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h4 className="font-extrabold text-slate-600 uppercase tracking-wider text-xs mb-1">
            {searchQuery ? 'Sin Resultados' : 'Sin Niveles'}
          </h4>
          <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
            {searchQuery 
              ? 'No encontramos coincidencias.' 
              : 'Aún no hay niveles registrados en este bloque.'}
          </p>
        </div>
      )}

      {/* Modal para añadir/editar nivel */}
      <LevelEditModal
        isOpen={isLevelModalOpen}
        onClose={() => setIsLevelModalOpen(false)}
        level={selectedLevel}
        onSave={handleSaveLevel}
        isAdding={isAddingLevel}
        nextSuggestedNumber={nextSuggestedNumber}
      />

      {/* Confirmación para eliminar nivel */}
      <ModalConfirmation
        isOpen={isDeleteLevelModalOpen}
        title="¿Eliminar Nivel?"
        message={`¿Estás seguro de que deseas eliminar el nivel "${selectedLevel?.numero}"? Esta acción no se puede deshacer.`}
        onConfirm={confirmDeleteLevel}
        onCancel={() => setIsDeleteLevelModalOpen(false)}
        confirmText="Eliminar"
        cancelText="Cancelar"
      />
    </div>
  );
};

export default LevelsSection;
