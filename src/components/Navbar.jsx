import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Scan, User, UserPlus, ChevronDown, ShieldCheck, Users, Search, GraduationCap } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
const Navbar = () => {
  const { loginMode, setLoginMode } = useAdmin();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isAuthPage = ['/login', '/register'].includes(location.pathname);
  const isAdminRoute = location.pathname.startsWith('/admin');

  if (isAdminRoute) return null;

  const handleModeSelection = (mode) => {
    setLoginMode(mode);
    setIsOpen(false);
    navigate('/login');
  };

  return (
    <nav className="w-full h-14 bg-white border-b border-gray-100 flex items-center justify-between px-4 z-50 shadow-sm shrink-0">
      {/* Sección del logo */}
      <button 
        onClick={() => navigate('/login')}
        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
      >
        <div className="w-9 h-8.5 bg-brown rounded-xl flex items-center justify-center">
          <Search className="text-white w-6 h-6" strokeWidth={3}/>
        </div>
        <span className="text-xl font-bold text-brown tracking-tight">
          Glifo<span>Aventura</span>
        </span>
      </button>

      {/* Iconos de acción */}
      <div className="flex items-center gap-4">
        {isAuthPage && (
          <div className="relative flex items-center gap-2">
            
            {/* Dropdown de Acceso */}
            <div className="relative">
              <button 
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-1 px-2 py-1.5 rounded-full transition-all ${
                  isOpen ? 'border-maya-gold bg-maya-orange-light' : 'border-gray-100 bg-maya-orange-light hover:border-maya-gold'
                }`}
              >
                <div className={`w-6 h-7 rounded-full flex items-center justify-center ${loginMode === 'admin' ? 'bg-maya-gold text-white' : loginMode === 'docente' ? 'bg-maya-gold text-white' : 'bg-maya-orange-light text-maya-gold'}`}>
                  {loginMode === 'admin' && <ShieldCheck size={16} />}
                  {loginMode === 'docente' && <GraduationCap size={16} />}
                  {loginMode === 'alumno' && <Users size={16} />}
                </div>
                <span className="text-xs font-bold text-maya-dark hidden">
                  {loginMode === 'admin' ? 'Administrador' : loginMode === 'docente' ? 'Docente' : 'Alumno'}
                </span>
                <ChevronDown size={14} className={`text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Menú Desplegable */}
              {isOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-1 z-20 animate-in fade-in slide-in-from-top-2 duration-200">
                    <p className="px-4 py-2 text-sm font-bold text-gray-400">Iniciar como...</p>
                    <button 
                      onClick={() => handleModeSelection('alumno')}
                      className={`w-full flex items-center gap-2.5 px-4 py-3 text-sm font-bold transition-colors ${loginMode === 'alumno' ? 'text-maya-gold bg-maya-orange-light' : 'text-maya-dark hover:bg-gray-50'}`}
                    >
                      <Users size={18} /> Alumno
                    </button>
                    <button 
                      onClick={() => handleModeSelection('docente')}
                      className={`w-full flex items-center gap-2.5 px-4 py-3 text-sm font-bold transition-colors ${loginMode === 'docente' ? 'text-maya-gold bg-maya-orange-light' : 'text-maya-dark hover:bg-gray-50'}`}
                    >
                      <GraduationCap size={18} /> Docente
                    </button>
                    <button 
                      onClick={() => handleModeSelection('admin')}
                      className={`w-full flex items-center gap-2.5 px-4 py-3 text-sm font-bold transition-colors ${loginMode === 'admin' ? 'text-maya-gold bg-maya-orange-light' : 'text-maya-dark hover:bg-gray-50'}`}
                    >
                      <ShieldCheck size={18} /> Administrador
                    </button>
                  </div>
                </>
              )}
            </div>

            <div className="h-8 w-px bg-gray-200 mx-1"></div>

            <button 
              onClick={() => navigate('/register')}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95 ${
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
