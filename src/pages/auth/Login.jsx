import { Link } from 'react-router-dom';
import LoginUser from '../../components/auth/LoginUser';
import LoginAdmin from '../../components/auth/LoginAdmin';
import mayaCharacter from '../../assets/maya-character.png';
import { useAdmin } from '../../context/AdminContext';
import Navbar from '../../components/Navbar';
import ForgotPasswordModal from '../../components/auth/ForgotPasswordModal';
import { useState } from 'react';

const Login = () => {
  const { loginMode } = useAdmin();
  const [showForgotModal, setShowForgotModal] = useState(false);

  const isAdmin = loginMode === 'admin';
  const isAlumno = loginMode === 'alumno';

  return (
    <div className="md:min-h-screen md:bg-gray-700 md:flex md:items-center md:justify-center">
      <div className="w-full md:w-[390px] md:max-h-[844px] h-screen flex flex-col bg-maya-cream md:overflow-hidden md:rounded-3xl md:shadow-2xl relative overflow-hidden">
        <Navbar />

        <div className="flex-1 flex items-start justify-center overflow-y-auto">
          <div className="w-full px-screen flex flex-col items-center relative z-10 pt-4 pb-6">

            {/* Avatar */}
            <div className="mb-3">
              <img
                src={mayaCharacter}
                alt="Ilustración de personaje maya"
                className="object-contain rounded-full border border-gray-400 relative z-10 transition-transform duration-500 hover:scale-105 shadow-[0_5px_0_#9CA3AF] size-avatar"
              />
            </div>

            <div className="w-full transition-all duration-500 transform">
              {isAdmin ? <LoginAdmin /> : <LoginUser />}
            </div>

            {isAlumno && (
              <div className="mt-3 w-full">
                <Link
                  to="/register"
                  className="w-full py-4 rounded-2xl border border-brown font-semibold text-brown hover:border-maya-gold hover:text-maya-gold transition-all flex justify-center gap-1 text-md shadow-[0_4px_0_#7A5000]"
                >
                  ¿Aún no tienes cuenta?{' '}
                  <span className="text-maya-gold underline font-bold">Regístrate</span>
                </Link>
              </div>
            )}

            {!isAdmin && (
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="mt-5 text-md font-semibold text-brown hover:text-maya-dark transition-colors cursor-pointer"
              >
                ¿Olvidaste tu contraseña?
              </button>
            )}

            {/*loginMode === 'alumno' && (
              <div className="mt-3 flex flex-col items-center w-full gap-3">
                <Link
                  to="/register"
                  className="w-full py-4 rounded-2xl border border-brown font-semibold text-brown hover:border-maya-gold hover:text-maya-gold transition-all flex justify-center gap-1 text-md shadow-[0_4px_0_#7A5000]"
                >
                  ¿Aún no tienes cuenta?{' '}
                  <span className="text-maya-gold underline font-bold">Regístrate</span>
                </Link>

                <div className="mt-2 flex flex-col items-center gap-4 w-full">
                  <button 
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className="text-md font-semibold text-brown hover:text-maya-dark transition-colors cursor-pointer"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
                <ForgotPasswordModal
                  isOpen={showForgotModal}
                  onClose={() => setShowForgotModal(false)}
                />
              </div>
            )*/}
          </div>
        </div>
      </div>

      <ForgotPasswordModal
        isOpen={showForgotModal}
        onClose={() => setShowForgotModal(false)}
      />
    </div>
  );
};

export default Login;
