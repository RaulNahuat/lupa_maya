import { useState, useEffect } from 'react';
import { Plus, Search, HelpCircle } from 'lucide-react';
import GlyphCard from './GlyphCard';
import Pagination from './Pagination';
import GlyphEditModal from './GlyphEditModal';
import ModalConfirmation from '../ModalConfirmation';
import { db } from '../../data/db';
import { procesarColaSincronizacion } from '../../services/syncService';

const GlyphsSection = ({ blockId, blockDifficulty, glyphs, onRefresh }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Estados para el CRUD de glifos
  const [isGlyphModalOpen, setIsGlyphModalOpen] = useState(false);
  const [isDeleteGlyphModalOpen, setIsDeleteGlyphModalOpen] = useState(false);
  const [selectedGlyph, setSelectedGlyph] = useState(null);
  const [isAddingGlyph, setIsAddingGlyph] = useState(false);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const normalize = (str) => {
    if (!str) return '';
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
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
      onRefresh();
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
      onRefresh();
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

  const totalPages = Math.max(1, Math.ceil(visibleGlyphs.length / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * itemsPerPage;
  const paginatedGlyphs = visibleGlyphs.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="space-y-4">
      {/* Buscador de glifos */}
      <div className="relative">
        <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-slate-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          placeholder="Buscar glifo..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-3 py-3 bg-white border border-slate-200 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.01)] focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 font-medium text-slate-700 placeholder-slate-400 transition-all text-xs"
        />
      </div>

      <button
        onClick={handleAddGlyphToBlock}
        className="w-full py-3.5 border-2 border-dashed border-slate-200 hover:border-emerald-500 rounded-2xl flex items-center justify-center gap-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50/20 transition-all font-bold text-xs tracking-wider uppercase bg-white shadow-sm"
      >
        <Plus className="w-4 h-4" strokeWidth={2.5} />
        <span>AÑADIR GLIFO A ESTE BLOQUE</span>
      </button>

      {paginatedGlyphs.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-4">
            {paginatedGlyphs.map(glyph => (
              <GlyphCard 
                key={glyph.id} 
                glyph={{
                  ...glyph,
                  name: glyph.nombre_maya,
                  meaning: glyph.significado_es,
                  image: glyph.imagen_url,
                  level: blockDifficulty || 'BÁSICO'
                }} 
                onEdit={() => handleEditGlyph(glyph)}
                onDelete={() => handleDeleteGlyph(glyph)}
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
            {searchQuery ? 'Sin Resultados' : 'Bloque Vacío'}
          </h4>
          <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
            {searchQuery 
              ? 'No encontramos coincidencias.' 
              : 'Aún no hay glifos registrados en este bloque.'}
          </p>
        </div>
      )}

      {/* Modal para añadir/editar glifo */}
      <GlyphEditModal
        isOpen={isGlyphModalOpen}
        onClose={() => setIsGlyphModalOpen(false)}
        glyph={selectedGlyph}
        onSave={handleSaveGlyph}
        isAdding={isAddingGlyph}
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
    </div>
  );
};

export default GlyphsSection;
