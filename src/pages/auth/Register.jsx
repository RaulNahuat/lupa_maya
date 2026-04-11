import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import PinPad from '../../components/auth/PinPad';
import SecondaryButton from '../../components/SecondaryButton';
import mayaCharacter from '../../assets/maya-character.png';
import { registroOffline } from '../../services/auth/offlineAuth';
import { procesarColaSincronizacion } from '../../services/syncService';
import { useGameStore } from '../../store/game/useGameStore';
import Navbar from "../../components/Navbar";

const Register = () => {
  const { loginUser } = useAuth();
  const { showToast } = useToast();
  const initLevels = useGameStore(s => s.initLevels);
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const navigate = useNavigate();

  const dotsToShow = pin.length < 4 ? pin.length : confirmPin.length;
  const labelText = pin.length < 4 ? "Elige tu PIN de 4 números" : "Confirma tu PIN";

  const handleRegister = async (e) => {
    e.preventDefault();
    if (pin !== confirmPin) {
      showToast('PIN no coincide', 'Asegúrate de escribir el mismo PIN en ambos pasos.', 'warning');
      return;
    }
    try {
      const nuevoUsuario = await registroOffline({
        nombre: e.target.nombre.value,
        apellido: e.target.apellido.value,
        pin,
        rol: 'NINO',
      });
      
      showToast('¡Cuenta creada!', 'Bienvenido a Lupa Maya.', 'success');
      
      loginUser(nuevoUsuario);

      await procesarColaSincronizacion(nuevoUsuario.local_id);
      await initLevels(nuevoUsuario);

      navigate('/map');
    } catch (error) {
      console.error('Error al registrar usuario:', error);
      showToast('Error de registro', String(error), 'error');
    }
  };

  const handlePinPress = (num) => {
    if (pin.length < 4) setPin(prev => prev + num);
    else if (confirmPin.length < 4) setConfirmPin(prev => prev + num);
  };

  const handlePinDelete = () => {
    if (confirmPin.length > 0) setConfirmPin(prev => prev.slice(0, -1));
    else setPin(prev => prev.slice(0, -1));
  };

  return (
    <div className="min-h-screen bg-maya-cream flex items-center justify-center p-4 pt-24 relative overflow-hidden">
      <Navbar />
      <div className="absolute top-[-10%] left-[-5%] w-64 h-64 bg-[#02845E]/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-5%] right-[-5%] w-96 h-96 bg-maya-dark/5 rounded-full blur-3xl"></div>

      <div className="max-w-md w-full bg-white rounded-4xl p-8 shadow-2xl flex flex-col items-center border border-gray-50 relative z-10">

        <div className="mb-6 relative">
          <div className="absolute -inset-4 bg-maya-green-light rounded-full blur-2xl opacity-40"></div>
          <img
            src={mayaCharacter}
            alt="Maya"
            className="w-24 h-24 object-contain relative z-10 transition-transform duration-500 hover:scale-105"
          />
        </div>

        <h1 className="text-3xl font-extrabold text-maya-dark mb-2 tracking-tight">
          ¡Únete!
        </h1>
        <p className="text-maya-gray font-medium mb-8 text-sm">Crea tu aventura con nombre y PIN</p>

        <form className="w-full space-y-4" onSubmit={handleRegister}>
          <div className="space-y-3">
            <input
              type="text"
              name="nombre"
              required
              placeholder="Escribe tu primer nombre"
              className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-[#02845E] outline-none transition-all placeholder:text-gray-400 text-maya-dark text-center font-bold shadow-sm"
            />
            <input
              type="text"
              name="apellido"
              required
              placeholder="Escribe tu primer apellido"
              className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-[#02845E] outline-none transition-all placeholder:text-gray-400 text-maya-dark text-center font-bold shadow-sm"
            />
          </div>

          <div className="space-y-4 flex flex-col items-center pt-4">
            <div className="flex flex-col items-center gap-2">
              <span className="text-sm font-bold text-maya-gray">{labelText}</span>
              <div className="flex gap-2">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-3.5 h-3.5 rounded-full border-2 transition-all duration-300 ${dotsToShow > i ? 'bg-[#02845E] border-[#02845E] scale-110' : 'border-gray-200'
                      }`}
                  />
                ))}
              </div>
            </div>

            <PinPad onNumberPress={handlePinPress} onDelete={handlePinDelete} />
          </div>

          <SecondaryButton type="submit" className="mt-6">
            ¡CREAR MI CUENTA!
          </SecondaryButton>
        </form>

        <div className="mt-8 flex flex-col items-center gap-4 w-full pt-6 border-t border-gray-50">
          <p className="text-sm font-bold text-gray-400">
            ¿Ya tienes una cuenta? <Link to="/login" className="text-maya-gold underline">Iniciar sesión</Link>
          </p>

          <button className="w-full py-3 rounded-2xl border-2 border-gray-100 font-bold text-gray-400 hover:border-maya-dark hover:text-maya-dark transition-all text-sm bg-white shadow-sm">
            Continuar como <span className="text-maya-dark font-black">invitado</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Register;
