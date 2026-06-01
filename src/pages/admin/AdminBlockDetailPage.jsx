import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, Layers } from 'lucide-react';
import AdminPageShell from '../../components/admin/AdminPageShell';
import BlockEditModal from '../../components/admin/BlockEditModal';
import BlockDetailHeader from '../../components/admin/BlockDetailHeader';
import GlyphsSection from '../../components/admin/GlyphsSection';
import LevelsSection from '../../components/admin/LevelsSection';
import ModalConfirmation from '../../components/ModalConfirmation';
import { db } from '../../data/db';
import { procesarColaSincronizacion } from '../../services/syncService';

const AdminBlockDetailPage = () => {
  const { blockId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [block, setBlock] = useState(null);
  const [glyphs, setGlyphs] = useState([]);
  const [levels, setLevels] = useState([]);
  const [activeSubTab, setActiveSubTab] = useState(location.state?.tab || 'glyphs'); // 'glyphs' o 'levels'
  const [isLoading, setIsLoading] = useState(true);

  // Estados para el CRUD de bloques
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [globalMaxLevel, setGlobalMaxLevel] = useState(0);

  const fetchBlockData = async () => {
    setIsLoading(true);
    try {
      const [blockData, allGlyphs, allLevels, totalGlobalLevels] = await Promise.all([
        db.grupos_niveles.get(Number(blockId)),
        db.glifos.where('grupo_id').equals(Number(blockId)).toArray(),
        db.niveles.where('grupo_id').equals(Number(blockId)).toArray(),
        db.niveles.toArray()
      ]);

      if (blockData) {
        setBlock(blockData);
        setGlyphs(allGlyphs);
        const sorted = allLevels.sort((a, b) => (a.posicion_bloque || 0) - (b.posicion_bloque || 0));
        setLevels(sorted);
        
        const maxGlobal = totalGlobalLevels.length > 0
          ? Math.max(...totalGlobalLevels.map(l => l.numero || 0))
          : 0;
        setGlobalMaxLevel(maxGlobal);

        setIsLoading(false);
      } else {
        if (Number(blockId) > 1000000000000) {
          await new Promise(resolve => setTimeout(resolve, 1500));
          if (window.location.pathname === `/admin/glyphs/block/${blockId}`) {
            navigate('/admin/glyphs');
            setIsLoading(false);
          }
          return;
        }
        console.error("Bloque no encontrado");
        navigate('/admin/glyphs');
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error al obtener datos del bloque:", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBlockData();
  }, [blockId]);

  useEffect(() => {
    const handleIdSynced = (e) => {
      if (Number(e.detail.oldId) === Number(blockId)) {
        navigate(`/admin/glyphs/block/${e.detail.newId}`, { replace: true });
      }
    };

    window.addEventListener('block-id-synced', handleIdSynced);
    return () => window.removeEventListener('block-id-synced', handleIdSynced);
  }, [blockId, navigate]);

  const handleEditBlock = (block, e) => {
    e.stopPropagation();
    setIsEditModalOpen(true);
  };

  const handleSaveBlock = async (id, data) => {
    try {
      const blockData = {
        ...data,
        id: Number(id),
        activo: true,
        version: 1
      };
      
      await db.transaction('rw', db.grupos_niveles, db.cola_sincronizacion, async () => {
        await db.grupos_niveles.put(blockData);
        await db.cola_sincronizacion.add({
          entidad: 'grupos_niveles',
          accion: 'EDITAR',
          datos: blockData,
          estado: 'PENDIENTE',
          created_at: new Date().getTime()
        });
      });

      setBlock(blockData);
      setIsEditModalOpen(false);

      if (navigator.onLine) procesarColaSincronizacion();
    } catch (error) {
      console.error("Error al actualizar el bloque en Dexie:", error);
      alert("Error al actualizar bloque: " + error.message);
    }
  };

  const handleDeleteBlock = (block, e) => {
    e.stopPropagation();
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteBlock = async () => {
    try {
      await db.transaction('rw', db.grupos_niveles, db.glifos, db.cola_sincronizacion, async () => {
        await db.grupos_niveles.delete(block.id);
        await db.glifos.where('grupo_id').equals(block.id).delete();
        await db.cola_sincronizacion.add({
          entidad: 'grupos_niveles',
          accion: 'ELIMINAR',
          datos: { id: block.id },
          estado: 'PENDIENTE',
          created_at: new Date().getTime()
        });
      });

      setIsDeleteModalOpen(false);

      if (navigator.onLine) {
        await procesarColaSincronizacion();
      }
      navigate('/admin/glyphs');
    } catch (error) {
      console.error("Error al eliminar el bloque:", error);
    }
  };

  const isGlyphsTab = activeSubTab === 'glyphs';

  if (isLoading) {
    return (
      <AdminPageShell activeTab="glifos">
        <div className="text-center py-20 opacity-40">
          <span className="font-bold uppercase tracking-widest animate-pulse text-xs text-maya-dark">Cargando bloque...</span>
        </div>
      </AdminPageShell>
    );
  }

  if (!block) return null;

  return (
    <AdminPageShell activeTab="glifos">
      <div className="space-y-4 px-1 sm:px-0">
        
        {/* Header de bloque */}
        <BlockDetailHeader
          block={block}
          glyphsCount={glyphs.length}
          levelsCount={levels.length}
          onBack={() => navigate('/admin/glyphs')}
          onEdit={(e) => handleEditBlock(block, e)}
          onDelete={(e) => handleDeleteBlock(block, e)}
        />

        {/* Tabs de Selección (Glifos vs Niveles) */}
        <div className="flex border-b border-slate-100 bg-white p-1 rounded-2xl shadow-sm gap-1">
          <button
            onClick={() => setActiveSubTab('glyphs')}
            className={`flex-1 py-2.5 text-center rounded-xl font-extrabold text-[11px] tracking-wider uppercase transition-all flex items-center justify-center gap-2 ${
              isGlyphsTab
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Glifos ({glyphs.length})
          </button>
          <button
            onClick={() => setActiveSubTab('levels')}
            className={`flex-1 py-2.5 text-center rounded-xl font-extrabold text-[11px] tracking-wider uppercase transition-all flex items-center justify-center gap-2 ${
              !isGlyphsTab
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Niveles ({levels.length})
          </button>
        </div>

        {/* Listado dinámico por sub-secciones */}
        <div className="space-y-3">
          {isGlyphsTab ? (
            <GlyphsSection
              blockId={blockId}
              blockDifficulty={block.dificultad}
              glyphs={glyphs}
              onRefresh={fetchBlockData}
            />
          ) : (
            <LevelsSection
              blockId={blockId}
              levels={levels}
              globalMaxLevel={globalMaxLevel}
              onRefresh={fetchBlockData}
            />
          )}
        </div>
      </div>

      {/* Modal para editar bloque */}
      <BlockEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        block={block}
        onSave={handleSaveBlock}
        isAdding={false}
      />

      {/* Confirmación para eliminar bloque */}
      <ModalConfirmation
        isOpen={isDeleteModalOpen}
        title="¿Eliminar Bloque?"
        message={`¿Estás seguro de que deseas eliminar el bloque "${block?.nombre}" y TODOS sus glifos asociados? Esta acción no se puede deshacer.`}
        onConfirm={confirmDeleteBlock}
        onCancel={() => setIsDeleteModalOpen(false)}
        confirmText="Eliminar"
        cancelText="Cancelar"
      />
    </AdminPageShell>
  );
};

export default AdminBlockDetailPage;
