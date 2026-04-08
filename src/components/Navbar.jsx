import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Scan, User, UserPlus, ChevronDown, ShieldCheck, Users } from 'lucide-react';

const Navbar = ({ isAdminMode, setIsAdminMode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isAuthPage = ['/login', '/register'].includes(location.pathname);

  const handleModeSelection = (admin) => {
    setIsAdminMode(admin);
    setIsOpen(false);
    navigate('/login');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 z-50 shadow-sm">
      {/* Sección del logo */}
      <button 
        onClick={() => navigate('/login')}
        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
      >
        <div className="w-10 h-10 bg-maya-orange-light rounded-lg flex items-center justify-center border-2 border-maya-gold">
          <Scan className="text-maya-gold w-6 h-6" />
        </div>
        <span className="text-xl font-bold text-maya-dark tracking-tight">
          Glifo<span className="text-maya-dark">Aventura</span>
        </span>
      </button>

      {/* Iconos de acción */}
      <div className="flex items-center gap-4">
        {isAuthPage && (
          <div className="relative flex items-center gap-3">
            
            {/* Dropdown de Acceso */}
            <div className="relative">
              <button 
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all border shadow-sm ${
                  isOpen ? 'border-maya-gold bg-maya-orange-light' : 'border-gray-100 bg-white hover:border-maya-gold'
                }`}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center ${isAdminMode ? 'bg-maya-gold text-white' : 'bg-maya-orange-light text-maya-gold'}`}>
                  {isAdminMode ? <ShieldCheck size={16} /> : <Users size={16} />}
                </div>
                <span className="text-xs font-bold text-maya-dark hidden sm:block">
                  {isAdminMode ? 'Administrador' : 'Niños'}
                </span>
                <ChevronDown size={14} className={`text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Menú Desplegable */}
              {isOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-20 animate-in fade-in slide-in-from-top-2 duration-200">
                    <p className="px-4 py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">Cambiar acceso</p>
                    <button 
                      onClick={() => handleModeSelection(false)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold transition-colors ${!isAdminMode ? 'text-maya-gold bg-maya-orange-light' : 'text-maya-dark hover:bg-gray-50'}`}
                    >
                      <Users size={18} /> Acceso Niños
                    </button>
                    <button 
                      onClick={() => handleModeSelection(true)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold transition-colors ${isAdminMode ? 'text-maya-gold bg-maya-orange-light' : 'text-maya-dark hover:bg-gray-50'}`}
                    >
                      <ShieldCheck size={18} /> Administrador
                    </button>
                  </div>
                </>
              )}
            </div>

            <div className="h-8 w-px bg-gray-100 mx-1"></div>

            <button 
              onClick={() => navigate('/register')}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95 ${
                location.pathname === '/register' 
                  ? 'bg-maya-dark text-white shadow-lg' 
                  : 'bg-maya-green-light text-maya-dark border border-transparent hover:border-maya-dark/20'
              }`}
              title="Registrarse"
            >
              <UserPlus className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
