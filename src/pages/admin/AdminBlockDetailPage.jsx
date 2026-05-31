import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, ArrowLeft, Edit2, Trash2, Search, HelpCircle } from 'lucide-react';
import AdminPageShell from '../../components/admin/AdminPageShell';
import GlyphCard from '../../components/admin/GlyphCard';
import Pagination from '../../components/admin/Pagination';
import BlockEditModal from '../../components/admin/BlockEditModal';
import GlyphEditModal from '../../components/admin/GlyphEditModal';
import ModalConfirmation from '../../components/ModalConfirmation';
import { db } from '../../data/db';
import { procesarColaSincronizacion } from '../../services/syncService';

const AdminBlockDetailPage = () => {
  const { blockId } = useParams();
  const navigate = useNavigate();
  const [block, setBlock] = useState(null);
  const [glyphs, setGlyphs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const glyphsPerPage = 10;

  // Estados para el CRUD de bloques
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Estados para el CRUD de glifos
  const [isGlyphModalOpen, setIsGlyphModalOpen] = useState(false);
  const [isDeleteGlyphModalOpen, setIsDeleteGlyphModalOpen] = useState(false);
  const [selectedGlyph, setSelectedGlyph] = useState(null);
  const [isAddingGlyph, setIsAddingGlyph] = useState(false);

  const fetchBlockData = async () => {
    setIsLoading(true);
    try {
      const [blockData, allGlyphs] = await Promise.all([
        db.grupos_niveles.get(Number(blockId)),
        db.glifos.where('grupo_id').equals(Number(blockId)).toArray()
      ]);

      if (blockData) {
        setBlock(blockData);
        setGlyphs(allGlyphs);
        setIsLoading(false);
      } else {
        // Si es un ID temporal, darle un momento al servicio de sincronización para redirigir la URL
        if (Number(blockId) > 1000000000000) {
          // Mantener isLoading como true para permanecer en el estado de carga
          await new Promise(resolve => setTimeout(resolve, 1500));
          // Si la URL del navegador sigue siendo la ID temporal anterior, volver a la lista
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
      console.error("Error al obtener datos del bloque y sus glifos:", error);
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

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const normalize = (str) => {
    if (!str) return '';
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  };

  const getDifficultyColor = (diff) => {
    switch (diff?.toUpperCase()) {
      case 'BASICO':
      case 'BÁSICO':
        return { bg: 'bg-emerald-50 text-emerald-600 border-emerald-200', dot: 'bg-emerald-500' };
      case 'INTERMEDIO':
        return { bg: 'bg-amber-50 text-amber-600 border-amber-500/80', dot: 'bg-amber-500' };
      case 'AVANZADO':
        return { bg: 'bg-rose-50 text-rose-500 border-rose-200', dot: 'bg-rose-500' };
      default:
        return { bg: 'bg-slate-50 text-slate-600 border-slate-200', dot: 'bg-slate-500' };
    }
  };

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

  const handleAddGlyphToBlock = () => {
    setSelectedGlyph({
      nombre_maya: '',
      significado_es: '',
      pronunciacion: '',
      imagen_url: ''
    });
    setIsAddingGlyph(true);
    setIsGlyphModalOpen(true);
  };

  const handleEditGlyph = (glyph) => {
    setSelectedGlyph(glyph);
    setIsAddingGlyph(false);
    setIsGlyphModalOpen(true);
  };

  const handleDeleteGlyph = (glyph) => {
    setSelectedGlyph(glyph);
    setIsDeleteGlyphModalOpen(true);
  };

  const confirmDeleteGlyph = async () => {
    if (!selectedGlyph) return;

    try {
      await db.transaction('rw', db.glifos, db.cola_sincronizacion, async () => {
        await db.glifos.delete(selectedGlyph.id);
        await db.cola_sincronizacion.add({
          entidad: 'glifos',
          accion: 'ELIMINAR',
          datos: { id: selectedGlyph.id },
          estado: 'PENDIENTE',
          created_at: new Date().getTime()
        });
      });

      setIsDeleteGlyphModalOpen(false);
      setSelectedGlyph(null);

      if (navigator.onLine) {
        await procesarColaSincronizacion();
      }
      fetchBlockData();
    } catch (error) {
      console.error("Error al eliminar el glifo:", error);
    }
  };

  const handleSaveGlyph = async (id, data) => {
    try {
      const isNew = !id;
      const glyphId = id ? Number(id) : Date.now();
      const glyphData = {
        ...data,
        id: glyphId,
        grupo_id: Number(blockId),
        activo: true,
        version: 1
      };

      await db.transaction('rw', db.glifos, db.cola_sincronizacion, async () => {
        await db.glifos.put(glyphData);
        await db.cola_sincronizacion.add({
          entidad: 'glifos',
          accion: isNew ? 'CREAR' : 'EDITAR',
          datos: glyphData,
          estado: 'PENDIENTE',
          created_at: new Date().getTime()
        });
      });

      setIsGlyphModalOpen(false);
      setSelectedGlyph(null);

      if (navigator.onLine) {
        await procesarColaSincronizacion();
      }
      fetchBlockData();
    } catch (error) {
      console.error("Error al guardar el glifo en Dexie:", error);
      alert("Error al guardar el glifo: " + error.message);
    }
  };

  const visibleGlyphs = glyphs.filter(glyph => {
    if (!searchQuery) return true;
    const query = normalize(searchQuery);
    return normalize(glyph.nombre_maya).includes(query) ||
           normalize(glyph.significado_es).includes(query) ||
           normalize(glyph.pronunciacion).includes(query);
  });

  const totalPages = Math.max(1, Math.ceil(visibleGlyphs.length / glyphsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * glyphsPerPage;
  const paginatedGlyphs = visibleGlyphs.slice(startIndex, startIndex + glyphsPerPage);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

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
        {/**Header de bloque */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/admin/glyphs')}
              className="w-10 h-10 bg-white border border-slate-200 hover:bg-slate-50 flex items-center justify-center rounded-2xl shadow-sm transition-all"
              title="Volver a Bloques"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" strokeWidth={2.5} />
            </button>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-black text-slate-800 leading-tight">{block.nombre}</h2>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black border uppercase tracking-wider shrink-0 flex items-center gap-1 ${getDifficultyColor(block.dificultad).bg}`}>
                  {block.dificultad || 'BÁSICO'}
                </span>
              </div>
              <div className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                Grupo #{block.numero_grupo || 0} • {glyphs.length} {glyphs.length === 1 ? 'glifo' : 'glifos'}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 self-start sm:self-center">
            <button 
              onClick={(e) => handleEditBlock(block, e)}
              className="px-4 py-2 text-slate-600 hover:text-emerald-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-2xl transition-all font-bold text-xs flex items-center gap-1.5 shadow-sm hover:shadow active:scale-95"
            >
              <Edit2 className="w-3.5 h-3.5" />
              EDITAR
            </button>
            <button 
              onClick={(e) => handleDeleteBlock(block, e)}
              className="px-4 py-2 text-slate-600 hover:text-rose-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-2xl transition-all font-bold text-xs flex items-center gap-1.5 shadow-sm hover:shadow active:scale-95"
            >
              <Trash2 className="w-3.5 h-3.5" />
              ELIMINAR
            </button>
          </div>
        </div>

        {/* Buscador de glifos en el bloque */}
        <div className="relative">
          <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder={`Buscar glifo...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3 py-3 bg-white border border-slate-200 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.01)] focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 font-medium text-slate-700 placeholder-slate-400 transition-all text-xs"
          />
        </div>

        {/* Grid de glifos */}
        <div className="space-y-3">
          <button
            onClick={() => handleAddGlyphToBlock(block.id)}
            className="w-full py-3.5 border-2 border-dashed border-slate-200 hover:border-emerald-500 rounded-2xl flex items-center justify-center gap-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50/20 transition-all font-bold text-xs tracking-wider uppercase bg-white shadow-sm"
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            <span>AÑADIR GLIFO A ESTE BLOQUE</span>
          </button>

          {paginatedGlyphs.length > 0 ? (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-1">
                {paginatedGlyphs.map(glyph => (
                  <GlyphCard 
                    key={glyph.id} 
                    glyph={{
                      ...glyph,
                      name: glyph.nombre_maya,
                      meaning: glyph.significado_es,
                      image: glyph.imagen_url,
                      level: block.dificultad || 'BÁSICO'
                    }} 
                    onEdit={() => handleEditGlyph(glyph)}
                    onDelete={() => handleDeleteGlyph(glyph)}
                  />
                ))}
              </div>

              {/* Paginación de Glifos */}
              <div className="mt-4">
                <Pagination
                  currentPage={safeCurrentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            </>
          ) : (
            <div className="text-center py-10 bg-white rounded-2xl border border-slate-100 shadow-sm p-6 max-w-sm mx-auto mt-4">
              <HelpCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h4 className="font-extrabold text-slate-600 uppercase tracking-wider text-xs mb-1">
                {searchQuery ? 'Sin Resultados' : 'Bloque Vacío'}
              </h4>
              <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                {searchQuery 
                  ? 'No encontramos coincidencias.' 
                  : 'Aún no hay glifos registrados en este bloque.'}
              </p>
            </div>
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

      {/* Modal para añadir/editar glifo */}
      <GlyphEditModal
        isOpen={isGlyphModalOpen}
        onClose={() => setIsGlyphModalOpen(false)}
        glyph={selectedGlyph}
        onSave={handleSaveGlyph}
        isAdding={isAddingGlyph}
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

      {/* Confirmación para eliminar glifo */}
      <ModalConfirmation
        isOpen={isDeleteGlyphModalOpen}
        title="¿Eliminar Glifo?"
        message={`¿Estás seguro de que deseas eliminar el glifo "${selectedGlyph?.nombre_maya}"? Esta acción no se puede deshacer.`}
        onConfirm={confirmDeleteGlyph}
        onCancel={() => setIsDeleteGlyphModalOpen(false)}
        confirmText="Eliminar"
        cancelText="Cancelar"
      />
    </AdminPageShell>
  );
};

export default AdminBlockDetailPage;
