import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Layers, Search, LogOut, Info } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import ModalConfirmation from '../../components/ModalConfirmation';
import GlyphSearchBar from '../../components/admin/GlyphSearchBar';
import FilterTabs from '../../components/admin/FilterTabs';
import Pagination from '../../components/admin/Pagination';
import { db } from '../../data/db';
import { procesarColaSincronizacion } from '../../services/syncService';

const DocenteLobbyPage = () => {
  const navigate = useNavigate();
  const { currentUser, logoutUser } = useAuth();
  const { showToast } = useToast();
  
  const [blocks, setBlocks] = useState([]);
  const [glyphs, setGlyphs] = useState([]);
  const [activeFilter, setActiveFilter] = useState('TODOS');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const blocksPerPage = 10;

  const docenteName = currentUser?.nombre || 'Docente';

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
      console.error("Error al obtener datos:", error);
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

  const handleToggleActive = async (block) => {
    const nuevoEstado = block.activo === false ? true : false;
    
    try {
      const blockData = {
        ...block,
        activo: nuevoEstado,
        updated_at: new Date().toISOString()
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

      // Actualizar estado local
      setBlocks(prev => prev.map(b => b.id === block.id ? blockData : b));
      
      showToast(
        nuevoEstado ? 'Bloque Habilitado' : 'Bloque Deshabilitado',
        `El bloque "${block.nombre}" ahora ${nuevoEstado ? 'aparece' : 'está oculto'} en el mapa de los estudiantes.`,
        'success'
      );

      if (navigator.onLine) {
        procesarColaSincronizacion();
      }
    } catch (error) {
      console.error("Error al actualizar estado en Dexie:", error);
      showToast('Error', 'No se pudo guardar el cambio localmente.', 'error');
    }
  };

  const totalPages = Math.max(1, Math.ceil(filteredBlocks.length / blocksPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * blocksPerPage;
  const paginatedBlocks = filteredBlocks.slice(startIndex, startIndex + blocksPerPage);

  return (
    <div className="min-h-screen bg-maya-cream pb-16">
      {/*header */}
      <div className="sticky top-0 bg-white px-4 py-4 sm:px-6 sm:py-6 rounded-b-[2.5rem] sm:rounded-b-[3rem] shadow-[0_15px_30px_-10px_rgba(0,0,0,0.05)] flex items-center justify-between border-gray-50 border-b z-50">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border-[3px] border-maya-gold p-1 bg-white shadow-sm shrink-0 flex items-center justify-center">
            <div className="w-full h-full rounded-full overflow-hidden bg-maya-orange-light flex items-center justify-center text-maya-gold font-black text-lg uppercase">
              {docenteName.charAt(0)}
            </div>
          </div>
          <div className="flex flex-col">
            <h2 className="text-maya-dark font-black text-sm sm:text-base leading-tight truncate max-w-[120px] sm:max-w-[180px]">{docenteName}</h2>
            <span className="text-maya-gold font-bold text-xs tracking-wide">Docente Autorizado</span>
          </div>
        </div>

        <h1 className="hidden md:block text-xl font-black text-maya-dark tracking-tight">
          Gestión de Mapa Escolar
        </h1>
        
        <button 
          onClick={() => setShowLogoutModal(true)}
          className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-full border-2 border-maya-orange-light text-[11px] sm:text-sm text-maya-gold font-bold hover:bg-maya-orange-light transition-all active:scale-95 shadow-sm whitespace-nowrap"
        >
          Cerrar sesión
        </button>
      </div>

      {/*contenido principal */}
      <div className="max-w-xl mx-auto px-4 py-6 flex flex-col gap-4">
        
        {/* Banner informativo */}
        <div className="relative overflow-hidden bg-linear-to-br from-white to-maya-cream/40 rounded-3xl p-5 border border-maya-gold/20 shadow-xs">
          <div className="absolute top-[-30%] right-[-10%] w-36 h-36 bg-maya-gold/10 rounded-full blur-2xl"></div>
          <div className="relative z-10 flex gap-4 items-start">
            <div className="w-10 h-10 rounded-xl bg-maya-gold/15 flex items-center justify-center text-maya-gold shrink-0">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-maya-dark tracking-tight">
                Control de Bloques de Glifos
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                Usa los interruptores para habilitar o deshabilitar bloques enteros en el mapa de juego. Los estudiantes solo verán y jugarán los niveles de los bloques activados.
              </p>
            </div>
          </div>
        </div>

        {/* Buscador y filtros */}
        <div className="space-y-3 mt-2">
          <GlyphSearchBar onSearch={setSearchQuery} />
          <FilterTabs activeFilter={activeFilter} onFilterChange={setActiveFilter} />
        </div>

        {/* Listado de bloques */}
        <div className="mt-2 space-y-3.5">
          {isLoading ? (
            <div className="text-center py-16 opacity-40">
              <span className="font-bold uppercase tracking-widest animate-pulse text-xs text-maya-dark">Cargando catálogo...</span>
            </div>
          ) : paginatedBlocks.length > 0 ? (
            <>
              {paginatedBlocks.map(block => {
                const blockGlyphs = glyphs.filter(glyph => Number(glyph.grupo_id) === Number(block.id));
                const diffStyle = getDifficultyColor(block.dificultad);
                const isActivo = block.activo !== false;

                return (
                  <div 
                    key={block.id} 
                    className="bg-white rounded-3xl p-4 sm:p-5 shadow-xs border border-slate-100/80 flex items-center justify-between gap-4 transition-all duration-300 hover:shadow-md"
                  >
                    <div className="flex gap-4 items-center select-none flex-1 min-w-0">
                      {/* Icono de bloque */}
                      <div 
                        className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-xs"
                        style={{ backgroundColor: block.color || '#10B981' }}
                      >
                        <Layers className="w-7 h-7 text-white/90" strokeWidth={2.5} />
                      </div>

                      {/* Info */}
                      <div className="flex flex-col flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="font-extrabold text-slate-800 text-sm sm:text-base leading-tight truncate">
                            {block.nombre}
                          </h3>
                          <span className={`px-2 py-0.5 rounded-full text-[8px] font-black border uppercase tracking-widest shrink-0 flex items-center gap-1 ${diffStyle.bg}`}>
                            <span className={`w-1 h-1 rounded-full ${diffStyle.dot}`}></span>
                            {block.dificultad || 'BÁSICO'}
                          </span>
                        </div>
                        
                        <p className="text-[11px] text-slate-400 font-medium truncate mb-2 pr-2">
                          {block.descripcion || 'Sin descripción asignada.'}
                        </p>
                        
                        <div>
                          <span className="bg-slate-50 text-slate-500 text-[9px] font-bold px-2.5 py-0.5 rounded-md border border-slate-200/60 tracking-wide">
                            {blockGlyphs.length} {blockGlyphs.length === 1 ? 'GLIFO' : 'GLIFOS'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/*Interruptor */}
                    <div className="flex flex-col items-center gap-1.5 shrink-0 pl-2 border-l border-slate-100">
                      <button
                        onClick={() => handleToggleActive(block)}
                        className={`w-14 h-8 rounded-full p-1 transition-all duration-300 outline-none flex items-center relative ${
                          isActivo 
                            ? 'bg-linear-to-r from-emerald-400 to-emerald-500 shadow-[0_2px_10px_rgba(16,185,129,0.25)]' 
                            : 'bg-slate-200'
                        }`}
                      >
                        <div 
                          className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-300 flex items-center justify-center font-bold text-[9px] ${
                            isActivo 
                              ? 'translate-x-6 text-emerald-500' 
                              : 'translate-x-0 text-slate-400'
                          }`}
                        >
                          {isActivo ? 'SÍ' : 'NO'}
                        </div>
                      </button>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                        {isActivo ? 'ACTIVO' : 'OCULTO'}
                      </span>
                    </div>
                  </div>
                );
              })}

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
            <div className="text-center py-16 bg-white/50 rounded-3xl border border-slate-200 border-dashed">
              <h4 className="font-extrabold text-slate-400 uppercase tracking-widest text-xs">
                Sin bloques encontrados
              </h4>
            </div>
          )}
        </div>

      </div>

      {/* CONFIRMACIÓN CERRAR SESIÓN */}
      <ModalConfirmation 
        isOpen={showLogoutModal}
        title="¿Salir de la cuenta?"
        message="Tendrás que volver a ingresar tus credenciales para gestionar el mapa."
        confirmText="Cerrar sesión"
        cancelText="Cancelar"
        onConfirm={() => {
          logoutUser();
          navigate('/login');
        }}
        onCancel={() => setShowLogoutModal(false)}
      />
    </div>
  );
};

export default DocenteLobbyPage;
