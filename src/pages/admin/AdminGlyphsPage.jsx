import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import AdminPageShell from '../../components/admin/AdminPageShell';
import GlyphSearchBar from '../../components/admin/GlyphSearchBar';
import FilterTabs from '../../components/admin/FilterTabs';
import Pagination from '../../components/admin/Pagination';
import GlyphCard from '../../components/admin/GlyphCard';
import PrimaryButton from '../../components/PrimaryButton';
import { db } from '../../data/db';

const AdminGlyphsPage = () => {
  const [glyphs, setGlyphs] = useState([]);
  const [activeFilter, setActiveFilter] = useState('TODOS');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const glyphsPerPage = 10;

  useEffect(() => {
    const fetchGlyphs = async () => {
      setIsLoading(true);
      try {
        const data = await db.glifos.toArray();
        setGlyphs(data);
      } catch (error) {
        console.error("Error al obtener glifos de la BD local:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGlyphs();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter, searchQuery]);

  const filteredGlyphs = glyphs.filter(glyph => {
    const normalizedLevel = (glyph.level === 'BASICO' ? 'BÁSICO' : glyph.level) || 'BÁSICO';
    const matchesFilter = activeFilter === 'TODOS' || normalizedLevel === activeFilter;
    const matchesSearch = (glyph.nombre_maya || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (glyph.significado_es || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const totalPages = Math.max(1, Math.ceil(filteredGlyphs.length / glyphsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * glyphsPerPage;
  const paginatedGlyphs = filteredGlyphs.slice(startIndex, startIndex + glyphsPerPage);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  return (
    <AdminPageShell activeTab="glifos">

        <div className="mt-2 px-1">
            <PrimaryButton className="relative flex items-center justify-center gap-4 py-6 rounded-3xl shadow-[0_8px_0_0_#B8851A] hover:translate-y-0.5 hover:shadow-[0_6px_0_0_#B8851A] transition-all">
                <div className="w-10 h-10 bg-white/30 rounded-xl flex items-center justify-center border border-white/40">
                    <Plus className="w-7 h-7 text-white" strokeWidth={4} />
                </div>
                <span className="text-lg font-black tracking-widest">AÑADIR NUEVO GLIFO</span>
            </PrimaryButton>
        </div>

        <div className="space-y-2">
            <GlyphSearchBar onSearch={setSearchQuery} />
            <FilterTabs activeFilter={activeFilter} onFilterChange={setActiveFilter} />
        </div>

        <div className="mt-4">
          {isLoading ? (
            <div className="text-center py-10 opacity-40">
              <span className="font-bold uppercase tracking-widest animate-pulse">Cargando...</span>
            </div>
          ) : paginatedGlyphs.length > 0 ? (
            <>
            {paginatedGlyphs.map(glyph => (
                <GlyphCard 
                    key={glyph.id} 
                    glyph={{
                      ...glyph,
                      name: glyph.nombre_maya,
                      meaning: glyph.significado_es,
                      image: glyph.imagen_url,
                      level: (glyph.level === 'BASICO' ? 'BÁSICO' : glyph.level) || 'BÁSICO'
                    }} 
                    onEdit={() => console.log('Edit', glyph.id)}
                    onDelete={() => console.log('Delete', glyph.id)}
                />
            ))}

            <Pagination
              currentPage={safeCurrentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
            </>
          ) : (
            <div className="text-center py-10 opacity-40">
                <span className="font-bold">No se encontraron glifos</span>
            </div>
          )}
            </div>
        </AdminPageShell>
  );
};

export default AdminGlyphsPage;
