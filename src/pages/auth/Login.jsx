import { Link } from 'react-router-dom';
import LoginUser from '../../components/auth/LoginUser';
import LoginAdmin from '../../components/auth/LoginAdmin';
import mayaCharacter from '../../assets/maya-character.png';
import { useAdmin } from '../../context/AdminContext';
import Navbar from '../../components/Navbar';

const Login = () => {
  const { isAdminMode } = useAdmin();
  return (
    <div className="min-h-screen bg-maya-cream flex items-center justify-center pt-17 relative overflow-hidden">
      <Navbar />
      <div className="absolute top-[-10%] left-[-5%] w-64 h-64 bg-maya-gold/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-5%] right-[-5%] w-96 h-96 bg-maya-dark/5 rounded-full blur-3xl"></div>

      <div className="max-w-sm w-full p-5 flex flex-col items-center relative z-10 transition-all duration-500">

        <div className="mb-5 relative">
          <img
            src={mayaCharacter}
            alt="Ilustración de personaje maya"
            className="w-30 h-30 object-contain rounded-full border border-gray-400 relative z-10 transition-transform duration-500 hover:scale-105 shadow-[0_5px_0_#9CA3AF]"
          />
        </div>

        <div className="w-full transition-all duration-500 transform">
          {isAdminMode ? <LoginAdmin /> : <LoginUser />}
        </div>

        {!isAdminMode && (
          <div className="mt-3 flex flex-col items-center w-full gap-3">
            <div className="flex items-center gap-3 w-full">
              <div className="flex-1 h-px bg-gray-300"></div>
              <span className="text-md text-gray-400 font-medium">o</span>
              <div className="flex-1 h-px bg-gray-300"></div>
            </div>

            <Link
              to="/register"
              className="w-full py-4 rounded-2xl border border-brown font-semibold text-brown hover:border-maya-gold hover:text-maya-gold transition-all flex justify-center gap-1 text-md shadow-[0_4px_0_#7A5000]"
            >
              ¿Aún no tienes cuenta?{' '}
              <span className="text-maya-gold underline font-bold">Regístrate</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
