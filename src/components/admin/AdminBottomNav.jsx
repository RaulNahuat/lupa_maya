import { useNavigate } from 'react-router-dom';
import { Sparkles, Settings, Users } from 'lucide-react';

const AdminBottomNav = ({ activeTab = 'glifos' }) => {
  const navigate = useNavigate();

  return (
    <div className="fixed bottom-0 left-0 right-0 h-24 bg-white border-t border-gray-100 px-6 pb-6 flex items-center justify-between rounded-t-4xl shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)] z-40">
      <button 
        onClick={() => navigate('/admin/glyphs')}
        className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'glifos' ? 'text-maya-gold scale-110' : 'text-gray-400 opacity-60 hover:opacity-100'}`}
      >
        <Sparkles className={`w-7 h-7 ${activeTab === 'glifos' ? 'fill-current' : ''}`} />
        <span className="text-[10px] font-black uppercase tracking-widest">Glifos</span>
      </button>

      <div className="relative -top-8">
        <div className="absolute -inset-6 bg-maya-gold/10 rounded-full blur-2xl opacity-40 animate-pulse"></div>
        <button 
          onClick={() => navigate('/dashboard')}
          className="relative w-20 h-20 bg-white rounded-full border-[6px] border-maya-cream flex items-center justify-center shadow-2xl hover:scale-110 active:scale-90 transition-all z-10"
        >
          <div className="w-14 h-14 bg-maya-dark rounded-full flex items-center justify-center shadow-inner">
            <Settings className="w-8 h-8 text-white" />
          </div>
        </button>
      </div>

      <button 
        onClick={() => navigate('/admin/users')}
        className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'usuarios' ? 'text-maya-gold scale-110' : 'text-gray-400 opacity-60 hover:opacity-100'}`}
      >
        <Users className={`w-7 h-7 ${activeTab === 'usuarios' ? 'fill-current' : ''}`} />
        <span className="text-[10px] font-black uppercase tracking-widest">Usuarios</span>
      </button>
    </div>
  );
};

export default AdminBottomNav;
