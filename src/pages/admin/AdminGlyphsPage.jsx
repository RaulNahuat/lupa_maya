import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import AdminHeader from '../../components/admin/AdminHeader';
import GlyphSearchBar from '../../components/admin/GlyphSearchBar';
import FilterTabs from '../../components/admin/FilterTabs';
import GlyphCard from '../../components/admin/GlyphCard';
import AdminBottomNav from '../../components/admin/AdminBottomNav';
import PrimaryButton from '../../components/PrimaryButton';

const MOCK_GLYPHS = [
  { id: 1, name: "K'in", meaning: "Sol", level: "BÁSICO", image: null },
  { id: 2, name: "Aak", meaning: "Tortuga", level: "INTERMEDIO", image: null },
  { id: 3, name: "Ek", meaning: "Estrella", level: "AVANZADO", image: null },
];

const AdminGlyphsPage = () => {
  const [activeFilter, setActiveFilter] = useState('TODOS');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredGlyphs = MOCK_GLYPHS.filter(glyph => {
    const matchesFilter = activeFilter === 'TODOS' || glyph.level === activeFilter;
    const matchesSearch = glyph.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          glyph.meaning.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-maya-cream pb-32">

      <AdminHeader />

      <div className="max-w-md mx-auto p-4 flex flex-col gap-4">

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
          {filteredGlyphs.length > 0 ? (
            filteredGlyphs.map(glyph => (
                <GlyphCard 
                    key={glyph.id} 
                    glyph={glyph} 
                    onEdit={() => console.log('Edit', glyph.id)}
                    onDelete={() => console.log('Delete', glyph.id)}
                />
            ))
          ) : (
            <div className="text-center py-10 opacity-40">
                <span className="font-bold">No se encontraron glifos</span>
            </div>
          )}
        </div>
      </div>

      <AdminBottomNav activeTab="glifos" />
    </div>
  );
};

export default AdminGlyphsPage;
