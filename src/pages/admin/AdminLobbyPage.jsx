import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  Users, 
  Settings, 
  ChevronRight
} from 'lucide-react';
import AdminPageShell from '../../components/admin/AdminPageShell';
import { useAuth } from '../../context/AuthContext';

const AdminLobbyPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const adminName = currentUser?.nombre || 'Administrador';

  return (
    <AdminPageShell activeTab="lobby">
      {/* Saludo de bienvenida */}
      <div className="relative overflow-hidden bg-linear-to-br from-white to-maya-cream/30 rounded-3xl p-5 border border-maya-gold/20 shadow-sm mt-2">
        <div className="absolute top-[-30%] right-[-10%] w-36 h-36 bg-maya-gold/10 rounded-full blur-2xl"></div>
        <div className="relative z-10">
          <h1 className="text-xl sm:text-2xl font-black text-maya-dark tracking-tight">
            ¡Hola, <span className="text-maya-gold">{adminName}</span>!
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1.5 leading-relaxed">
            Te damos la bienvenida al gestor de Lupa Maya. Administra contenidos, jugadores y parámetros del sistema de forma segura.
          </p>
        </div>
      </div>

      {/*Accesos */}
      <div className="space-y-3 mt-4">
        {/* Acceso: Configuración */}
        <div 
          onClick={() => navigate('/admin/settings')}
          className="bg-white p-5 rounded-4xl border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 transition-all cursor-pointer group flex items-center justify-between gap-4"
        >
          <div className="flex gap-4 items-center min-w-0">
            <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 group-hover:scale-105 transition-all">
              <Settings className="w-7 h-7 group-hover:rotate-45 transition-all duration-300" />
            </div>
            <div className="flex flex-col min-w-0">
              <h3 className="font-extrabold text-slate-800 text-base leading-tight mb-1 group-hover:text-amber-600 transition-colors">
                Configuración del Juego
              </h3>
              <p className="text-xs text-slate-500 font-medium line-clamp-1">
                Administra parámetros del servidor y sincronizaciones locales.
              </p>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-slate-50 group-hover:bg-amber-50 flex items-center justify-center shrink-0 transition-colors">
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 transition-all group-hover:translate-x-0.5" />
          </div>
        </div>

        {/* Acceso: Glifos */}
        <div 
          onClick={() => navigate('/admin/glyphs')}
          className="bg-white p-5 rounded-4xl border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 transition-all cursor-pointer group flex items-center justify-between gap-4"
        >
          <div className="flex gap-4 items-center min-w-0">
            <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500 group-hover:scale-105 transition-all">
              <Sparkles className="w-7 h-7 fill-emerald-100 group-hover:fill-emerald-200 transition-colors" />
            </div>
            <div className="flex flex-col min-w-0">
              <h3 className="font-extrabold text-slate-800 text-base leading-tight mb-1 group-hover:text-emerald-600 transition-colors">
                Catálogo de Glifos
              </h3>
              <p className="text-xs text-slate-500 font-medium line-clamp-1">
                Agrega glifos, edita bloques y asocia significados.
              </p>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-slate-50 group-hover:bg-emerald-50 flex items-center justify-center shrink-0 transition-colors">
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-all group-hover:translate-x-0.5" />
          </div>
        </div>

        {/* Acceso: Usuarios */}
        <div 
          onClick={() => navigate('/admin/users')}
          className="bg-white p-5 rounded-4xl border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 transition-all cursor-pointer group flex items-center justify-between gap-4"
        >
          <div className="flex gap-4 items-center min-w-0">
            <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-500 group-hover:scale-105 transition-all">
              <Users className="w-7 h-7 fill-indigo-100 group-hover:fill-indigo-200 transition-colors" />
            </div>
            <div className="flex flex-col min-w-0">
              <h3 className="font-extrabold text-slate-800 text-base leading-tight mb-1 group-hover:text-indigo-600 transition-colors">
                Control de Usuarios
              </h3>
              <p className="text-xs text-slate-500 font-medium line-clamp-1">
                Visualiza el progreso de los jugadores y edita sus perfiles.
              </p>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-slate-50 group-hover:bg-indigo-50 flex items-center justify-center shrink-0 transition-colors">
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-all group-hover:translate-x-0.5" />
          </div>
        </div>
      </div>
    </AdminPageShell>
  );
};

export default AdminLobbyPage;
