import { useState } from 'react';
import { Plus } from 'lucide-react';
import AdminHeader from '../../components/admin/AdminHeader';
import GlyphSearchBar from '../../components/admin/GlyphSearchBar';
import FilterTabs from '../../components/admin/FilterTabs';
import UserCard from '../../components/admin/UserCard';
import AdminBottomNav from '../../components/admin/AdminBottomNav';
import PrimaryButton from '../../components/PrimaryButton';

const MOCK_USERS = [
  { id: 1, name: "Juanito Pech", email: "juanito.pech@gmail.com", level: 15, stars: 22, badges: 10, status: "ACTIVO", avatar: null },
  { id: 2, name: "María Canché", email: "maria.canche@gmail.com", level: 12, stars: 18, badges: 5, status: "ACTIVO", avatar: null },
  { id: 3, name: "Pedro Cocom", email: "pedro.cocom@gmail.com", level: 25, stars: 40, badges: 20, status: "INACTIVO", avatar: null },
];

const AdminUsersPage = () => {
  const [activeFilter, setActiveFilter] = useState('TODOS');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsers = MOCK_USERS.filter(user => {
    const matchesFilter = activeFilter === 'TODOS' || user.status === activeFilter;
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          user.email.toLowerCase().includes(searchQuery.toLowerCase());
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
                <span className="text-lg font-black tracking-widest uppercase">AÑADIR NUEVO USUARIO</span>
            </PrimaryButton>
        </div>

        <div className="space-y-2">
            <GlyphSearchBar onSearch={setSearchQuery} />
            <FilterTabs 
                filters={['TODOS', 'ACTIVOS', 'INACTIVOS']} 
                activeFilter={activeFilter} 
                onFilterChange={setActiveFilter} 
            />
        </div>

        <div className="mt-4">
          {filteredUsers.length > 0 ? (
            filteredUsers.map(user => (
                <UserCard 
                    key={user.id} 
                    user={user} 
                    onEdit={() => console.log('Edit User', user.id)}
                    onDelete={() => console.log('Delete User', user.id)}
                />
            ))
          ) : (
            <div className="text-center py-10 opacity-40">
                <span className="font-bold">No se encontraron usuarios</span>
            </div>
          )}
        </div>
      </div>

      <AdminBottomNav activeTab="usuarios" />
    </div>
  );
};

export default AdminUsersPage;
