import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Layers, FolderPlus, ArrowRight, ChevronRight, HelpCircle, Search } from 'lucide-react';
import AdminPageShell from '../../components/admin/AdminPageShell';
import GlyphSearchBar from '../../components/admin/GlyphSearchBar';
import FilterTabs from '../../components/admin/FilterTabs';
import Pagination from '../../components/admin/Pagination';
import PrimaryButton from '../../components/PrimaryButton';
import BlockEditModal from '../../components/admin/BlockEditModal';
import { db } from '../../data/db';
import { procesarColaSincronizacion } from '../../services/syncService';

const AdminGlyphsPage = () => {
  const navigate = useNavigate();
  const [blocks, setBlocks] = useState([]);
  const [glyphs, setGlyphs] = useState([]);
  const [activeFilter, setActiveFilter] = useState('TODOS');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const blocksPerPage = 10;

  // Estados para CRUD de Bloques
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const [blocksData, glyphsData] = await Promise.all([
        db.grupos_niveles.toArray(),
        db.glifos.toArray()
      ]);
      
      const sortedBlocks = blocksData.sort((a, b) => (a.numero_grupo || 0) - (b.numero_grupo || 0));
      setBlocks(sortedBlocks);
      setGlyphs(glyphsData);
    } catch (error) {
      console.error("Error al obtener bloques de la BD local:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter, searchQuery]);

  const normalize = (str) => {
    if (!str) return '';
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  };

  const filteredBlocks = blocks.filter(block => {
    const blockDiff = normalize(block.dificultad || 'BASICO');
    const normalizedFilter = normalize(activeFilter);
    const matchesFilter = normalizedFilter === 'todos' || blockDiff === normalizedFilter || 
                          (normalizedFilter === 'basico' && blockDiff === 'basico') ||
                          (normalizedFilter === 'básico' && blockDiff === 'basico');

    if (!matchesFilter) return false;
    if (!searchQuery) return true;

    const query = normalize(searchQuery);
    const matchesBlockName = normalize(block.nombre).includes(query) || normalize(block.descripcion).includes(query);
    
    const hasMatchingGlyph = glyphs.some(glyph => 
      Number(glyph.grupo_id) === Number(block.id) && (
        normalize(glyph.nombre_maya).includes(query) ||
        normalize(glyph.significado_es).includes(query)
      )
    );

    return matchesBlockName || hasMatchingGlyph;
  });

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

  const handleAddNewBlock = () => {
    setSelectedBlock({
      nombre: '',
      numero_grupo: '',
      dificultad: 'BASICO',
      color: '#10B981',
      descripcion: ''
    });
    setIsAddingNew(true);
    setIsEditModalOpen(true);
  };

  const handleSaveBlock = async (id, data) => {
    try {
      const isNew = !id;
      const blockId = id ? Number(id) : Date.now();
      const blockData = {
        ...data,
        id: blockId,
        activo: true,
        version: 1
      };

      await db.transaction('rw', db.grupos_niveles, db.cola_sincronizacion, async () => {
        await db.grupos_niveles.put(blockData);
        await db.cola_sincronizacion.add({
          entidad: 'grupos_niveles',
          accion: isNew ? 'CREAR' : 'EDITAR',
          datos: blockData,
          estado: 'PENDIENTE',
          created_at: new Date().getTime()
        });
      });

      setIsEditModalOpen(false);
      fetchAllData();

      if (navigator.onLine) procesarColaSincronizacion();
    } catch (error) {
      console.error("Error al guardar el bloque en Dexie:", error);
      alert("Error al guardar bloque: " + error.message);
    }
  };

  const totalPages = Math.max(1, Math.ceil(filteredBlocks.length / blocksPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * blocksPerPage;
  const paginatedBlocks = filteredBlocks.slice(startIndex, startIndex + blocksPerPage);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  return (
    <AdminPageShell activeTab="glifos">
        {/* Botón principal (Añadir Nuevo Bloque) */}
        <div className="mt-2 px-1">
          <PrimaryButton 
            onClick={handleAddNewBlock}
            className="relative flex items-center justify-center gap-3 sm:gap-4 py-4 sm:py-5 w-full rounded-2xl sm:rounded-3xl shadow-[0_6px_0_0_#B8851A] sm:shadow-[0_8px_0_0_#B8851A] hover:translate-y-0.5 hover:shadow-[0_4px_0_0_#B8851A] sm:hover:shadow-[0_6px_0_0_#B8851A] transition-all group"
          >
            <div className="w-10 h-10 bg-white/20 group-hover:bg-white/30 rounded-xl flex items-center justify-center border border-white/40 shrink-0 transition-colors">
              <Plus className="w-6 h-6 text-white" strokeWidth={3} />
            </div>
            <span className="text-sm sm:text-lg font-black tracking-widest uppercase">
              Añadir Nuevo Bloque
            </span>
          </PrimaryButton>
        </div>

        {/* Controles: buscador y filtros */}
        <div className="space-y-3 mt-6">
          <GlyphSearchBar onSearch={setSearchQuery} />
          <FilterTabs activeFilter={activeFilter} onFilterChange={setActiveFilter} />
        </div>

        {/* Contenido (Tarjetas de bloques) */}
        <div className="mt-6">
          {isLoading ? (
            // Estado de carga
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 animate-pulse">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white rounded-3xl p-4 sm:p-5 flex gap-4 items-center border border-slate-100 shadow-sm h-28">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-200 rounded-2xl shrink-0"></div>
                  <div className="flex-1 space-y-3">
                    <div className="h-5 bg-slate-200 w-1/2 rounded-md"></div>
                    <div className="h-3 bg-slate-200 w-3/4 rounded-md"></div>
                    <div className="h-4 bg-slate-200 w-20 rounded-full mt-2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : paginatedBlocks.length > 0 ? (
            // Grid de tarjetas
            <>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {paginatedBlocks.map(block => {
                  const blockGlyphs = glyphs.filter(glyph => Number(glyph.grupo_id) === Number(block.id));
                  const diffStyle = getDifficultyColor(block.dificultad);

                  return (
                    <div 
                      key={block.id} 
                      onClick={() => navigate(`/admin/glyphs/block/${block.id}`)}
                      className="bg-white rounded-3xl p-4 sm:p-5 shadow-sm border border-slate-100 hover:border-slate-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-pointer group flex items-center justify-between gap-4"
                    >
                      <div className="flex gap-4 sm:gap-5 items-center select-none flex-1 min-w-0">
                        {/* Icono de bloque */}
                        <div 
                          className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-transform duration-300 group-hover:scale-105 group-hover:shadow-md"
                          style={{ backgroundColor: block.color || '#10B981' }}
                        >
                          <Layers className="w-8 h-8 text-white/90 group-hover:text-white transition-colors" strokeWidth={2} />
                        </div>

                        {/* Información del bloque */}
                        <div className="flex flex-col flex-1 min-w-0">
                          <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
                            <h3 className="font-bold text-slate-800 text-base sm:text-lg leading-tight group-hover:text-emerald-700 transition-colors truncate">
                              {block.nombre}
                            </h3>
                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black border uppercase tracking-widest shrink-0 flex items-center gap-1.5 ${diffStyle.bg}`}>
                              <span className={`w-1 h-1 rounded-full ${diffStyle.dot}`}></span>
                              {block.dificultad || 'BÁSICO'}
                            </span>
                          </div>
                          
                          <p className="text-xs text-slate-500 font-medium truncate mb-3 pr-2">
                            {block.descripcion || 'Sin descripción asignada.'}
                          </p>
                          
                          <div className="flex items-center gap-2">
                            <span className="bg-slate-50 text-slate-600 text-[10px] font-bold px-3 py-1 rounded-lg border border-slate-200 tracking-wide">
                              {blockGlyphs.length} {blockGlyphs.length === 1 ? 'GLIFO' : 'GLIFOS'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Indicador de acción*/}
                      <div className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full bg-slate-50 group-hover:bg-emerald-50 border border-transparent group-hover:border-emerald-100 transition-colors shrink-0">
                        <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 transition-all group-hover:translate-x-0.5" />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Paginación */}
              <div className="mt-6">
                <Pagination
                  currentPage={safeCurrentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            </>
          ) : (
            // Estado vacío (No hay resultados)
            <div className="text-center py-16 bg-white/50 rounded-3xl border border-slate-200 border-dashed mt-4">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100">
                {searchQuery ? <Search className="w-8 h-8 text-slate-300" /> : <FolderPlus className="w-8 h-8 text-slate-300" />}
              </div>
              <h4 className="font-extrabold text-slate-600 uppercase tracking-widest text-sm mb-2">
                {searchQuery ? 'Sin Resultados' : 'Sin Bloques'}
              </h4>
              <p className="text-sm text-slate-500 font-medium max-w-sm mx-auto">
                {searchQuery 
                  ? `No encontramos bloques ni glifos que coincidan con "${searchQuery}".` 
                  : 'Aún no has registrado ningún bloque de aprendizaje.'}
              </p>
            </div>
          )}
        </div>

        {/* Modal de Edición/Creación de Bloques */}
        <BlockEditModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          block={selectedBlock}
          onSave={handleSaveBlock}
          isAdding={isAddingNew}
        />
    </AdminPageShell>
  );
};

export default AdminGlyphsPage;