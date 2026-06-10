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
  const labelText = pin.length < 4 ? "Elige un PIN de 4 números" : "Confirma tu PIN";

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
        username: e.target.username.value,
        escuela: e.target.escuela.value,
        lugar_procedencia: e.target.lugar_procedencia.value,
        genero: e.target.genero.value,
        grado: e.target.grado.value,
        pin,
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
    <div className="md:min-h-screen md:bg-gray-800 md:flex md:items-center md:justify-center">
      <div className="w-full md:w-[390px] md:max-h-[844px] h-screen flex flex-col bg-maya-cream md:overflow-hidden md:rounded-3xl md:shadow-2xl relative overflow-hidden">
      
      <Navbar />

      {/* Contenido scrolleable */}
      <div className="flex-1 overflow-y-auto">
        <div className="w-full px-screen flex flex-col items-center relative z-10 pt-5 pb-8">

        {/* Avatar */}
        <div className="mb-5">
          <img
            src={mayaCharacter}
            alt="Maya"
            className="object-contain rounded-full border border-gray-400 transition-transform duration-500 hover:scale-105 shadow-[0_5px_0_#9CA3AF] size-avatar"
          />
        </div>

        <h1 className="text-title font-extrabold text-maya-dark mb-1 tracking-tight">
          ¡Únete a la aventura!
        </h1>
        <p className="text-maya-gray font-medium mb-7 text-md text-center">Completa lo siguiente para comenzar a jugar</p>

        <form className="w-full space-y-3" onSubmit={handleRegister}>
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                name="nombre"
                required
                placeholder="Nombre"
                className="w-1/2 px-4 rounded-2xl border border-gray-400 bg-white focus:bg-white focus:ring-2 focus:ring-maya-gold outline-none transition-all placeholder:text-gray-400 text-maya-dark font-semibold shadow-[0_3px_0_#9CA3AF] py-input"
              />
              <input
                type="text"
                name="apellido"
                required
                placeholder="Apellido"
                className="w-1/2 px-4 rounded-2xl border border-gray-400 bg-white focus:bg-white focus:ring-2 focus:ring-maya-gold outline-none transition-all placeholder:text-gray-400 text-maya-dark font-semibold shadow-[0_3px_0_#9CA3AF] py-input"
              />
            </div>
            <input
              type="text"
              name="username"
              required
              placeholder="Usuario (Como te llamarás en el juego)"
              className="w-full px-4 rounded-2xl border border-gray-400 bg-white focus:bg-white focus:ring-2 focus:ring-maya-gold outline-none transition-all placeholder:text-gray-400 text-maya-dark font-semibold shadow-[0_3px_0_#9CA3AF] py-input"
            />
            <input
              type="text"
              name="escuela"
              required
              placeholder="Escuela"
              className="w-full px-4 rounded-2xl border border-gray-400 bg-white focus:bg-white focus:ring-2 focus:ring-maya-gold outline-none transition-all placeholder:text-gray-400 text-maya-dark font-semibold shadow-[0_3px_0_#9CA3AF] py-input"
            />
            <input
              type="text"
              name="lugar_procedencia"
              required
              placeholder="Lugar de procedencia"
              className="w-full px-4 rounded-2xl border border-gray-400 bg-white focus:bg-white focus:ring-2 focus:ring-maya-gold outline-none transition-all placeholder:text-gray-400 text-maya-dark font-semibold shadow-[0_3px_0_#9CA3AF] py-input"
            />
            <div className="flex gap-3">
              <div className="relative w-1/2">
                <select
                  name="genero"
                  required
                  defaultValue=""
                  className="w-full px-4 rounded-2xl border border-gray-400 bg-white focus:bg-white focus:ring-2 focus:ring-maya-gold outline-none transition-all text-gray-400 font-semibold shadow-[0_3px_0_#9CA3AF] appearance-none py-input"
                >
                  <option value="" disabled className="text-gray-400">Género</option>
                  <option value="Masculino" className="text-maya-dark">Masculino</option>
                  <option value="Femenino" className="text-maya-dark">Femenino</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-gray-400">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
              </div>
              <input
                type="text"
                name="grado"
                required
                placeholder="Grado"
                className="w-1/2 px-4 rounded-2xl border border-gray-400 bg-white focus:bg-white focus:ring-2 focus:ring-maya-gold outline-none transition-all placeholder:text-gray-400 text-maya-dark font-semibold shadow-[0_3px_0_#9CA3AF] py-input"
              />
            </div>
          </div>

          {/* PIN */}
          <div className="flex flex-col items-center gap-4 pt-3">
            <span className="text-md font-bold text-maya-gray">{labelText}</span>
            <div className="flex gap-2">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className={`rounded-full border-2 transition-all duration-300 size-pin-dot ${
                    dotsToShow > i ? 'bg-maya-gold border-maya-gold scale-110' : 'border-gray-300'
                  }`}
                />
              ))}
            </div>

            <PinPad onNumberPress={handlePinPress} onDelete={handlePinDelete} />
          </div>

          <SecondaryButton type="submit" className="mt-6">
            ¡CREAR MI CUENTA!
          </SecondaryButton>
        </form>

        <div className="mt-7 pt-5 border-t border-gray-300 w-full text-center">
          <p className="text-md font-semibold text-gray-500">
            ¿Ya tienes una cuenta? <Link to="/login" className="text-maya-gold underline">Inicia sesión</Link>
          </p>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default Register;
