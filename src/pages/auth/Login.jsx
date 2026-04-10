import { Link } from 'react-router-dom';
import LoginUser from '../../components/auth/LoginUser';
import LoginAdmin from '../../components/auth/LoginAdmin';
import mayaCharacter from '../../assets/maya-character.png';
import { useAdmin } from '../../context/AdminContext';
import Navbar from '../../components/Navbar';

const Login = () => {
  const { isAdminMode } = useAdmin();
  return (
    <div className="min-h-screen bg-maya-cream flex items-center justify-center p-4 pt-24 relative overflow-hidden">
      <Navbar />
      <div className="absolute top-[-10%] left-[-5%] w-64 h-64 bg-maya-gold/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-5%] right-[-5%] w-96 h-96 bg-maya-dark/5 rounded-full blur-3xl"></div>

      <div className="max-w-sm w-full bg-white rounded-4xl p-8 shadow-2xl flex flex-col items-center border border-gray-50 relative z-10 transition-all duration-500">

        <div className="mb-6 relative">
          <div className="absolute -inset-4 bg-maya-orange-light rounded-full blur-2xl opacity-40"></div>
          <img
            src={mayaCharacter}
            alt="Ilustración de personaje maya"
            className="w-32 h-32 object-contain relative z-10 transition-transform duration-500 hover:scale-105"
          />
        </div>

        <div className="w-full transition-all duration-500 transform">
          {isAdminMode ? <LoginAdmin /> : <LoginUser />}
        </div>
        <div className="mt-6 flex flex-col items-center gap-3 w-full pt-4 border-t border-gray-50">
          {!isAdminMode && (
            <Link
              to="/register"
              className="w-full py-3 rounded-2xl border-2 border-gray-100 font-bold text-gray-400 hover:border-maya-gold hover:text-maya-gold transition-all flex justify-center gap-1 text-sm bg-white shadow-sm"
            >
              ¿No tienes cuenta? <span className="text-maya-gold underline">Regístrate</span>
            </Link>
          )}

          <button className="w-full py-3 rounded-2xl border-2 border-gray-100 font-bold text-gray-400 hover:border-maya-dark hover:text-maya-dark transition-all text-sm bg-white shadow-sm">
            Continuar como <span className="text-maya-dark font-black">invitado</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
