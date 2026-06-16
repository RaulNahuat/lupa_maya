import { useNavigate } from 'react-router-dom';
import { Sparkles, Home, Users } from 'lucide-react';

const AdminBottomNav = ({ activeTab = 'glifos' }) => {
  const navigate = useNavigate();

  return (
    <div className="fixed bottom-0 left-0 right-0 h-24 bg-white border-t border-gray-100 px-6 pt-3 pb-5 flex items-center justify-between rounded-t-4xl shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)] z-40">
      <button 
        onClick={() => navigate('/admin/glyphs')}
        className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'glifos' ? 'text-maya-gold scale-110' : 'text-gray-400 opacity-60 hover:opacity-100'}`}
      >
        <div className="h-12 flex items-center justify-center">
          <Sparkles className={`w-7 h-7 ${activeTab === 'glifos' ? 'fill-current' : ''}`} />
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest">Glifos</span>
      </button>

      <button
        onClick={() => navigate('/admin')}
        className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'lobby' ? 'text-maya-gold scale-110' : 'text-gray-400 opacity-60 hover:opacity-100'}`}
      >
        <div className="relative w-12 h-12 flex items-center justify-center">
          <div className={`absolute inset-0 bg-white rounded-full border-2 border-maya-cream shadow-md transition-colors ${activeTab === 'lobby' ? 'border-maya-gold/30' : ''}`} />
          <div className={`absolute w-8 h-8 rounded-full flex items-center justify-center shadow-inner transition-colors z-10 ${activeTab === 'lobby' ? 'bg-maya-gold' : 'bg-maya-dark'}`}>
            <Home className="w-[16px] h-[16px] text-white" />
          </div>
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest">Inicio</span>
      </button>

      <button
        onClick={() => navigate('/admin/users')}
        className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'usuarios' ? 'text-maya-gold scale-110' : 'text-gray-400 opacity-60 hover:opacity-100'}`}
      >
        <div className="h-12 flex items-center justify-center">
          <Users className={`w-7 h-7 ${activeTab === 'usuarios' ? 'fill-current' : ''}`} />
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest">Usuarios</span>
      </button>
    </div>
  );
};

export default AdminBottomNav;
