import { useState } from 'react';
import PinPad from './PinPad';
import PrimaryButton from '../PrimaryButton';
import { loginOffline } from '../../services/auth/offlineAuth';
import { useNavigate } from "react-router-dom";
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useAdmin } from '../../context/AdminContext';
import { User, Lock } from "lucide-react"

const LoginUser = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const { loginUser } = useAuth();
  const { showToast } = useToast();
  const { loginMode } = useAdmin();

  const isDocente = loginMode === 'docente';

  const handleNumberPress = (num) => {
    if (pin.length < 4) {
      setPin(prev => prev + num);
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username.trim()) {
      showToast('Faltan datos', 'Por favor, escribe tu usuario.', 'warning');
      return;
    }

    if (pin.length < 4) {
      showToast('PIN incompleto', 'Asegúrate de ingresar los 4 números de tu PIN.', 'warning');
      return;
    }

    try {
      const user = await loginOffline({ username, pin });
      
      const userRol = Number(user.rol_id);

      if (isDocente && userRol !== 3) {
        showToast('Acceso denegado', 'Esta cuenta pertenece a un estudiante. Por favor, inicia sesión como Alumno.', 'warning');
        return;
      }
      if (!isDocente && userRol === 3) {
        showToast('Acceso denegado', 'Esta cuenta pertenece a un docente. Por favor, selecciona la opción de Docente.', 'warning');
        return;
      }

      loginUser(user);
      
      if (userRol === 3) {
        showToast('¡Bienvenido, Docente!', `Hola ${user.nombre}, listo para gestionar.`, 'success');
        navigate('/docente');
      } else {
        showToast('¡Bienvenido!', `Hola ${user.nombre}, prepárate para jugar.`, 'success');
        navigate('/map');
      }

    } catch (error) {
      console.error(error);
      showToast('Error de acceso', String(error), 'error');
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      <h1 className="text-title font-extrabold text-maya-dark mb-1 tracking-tight text-center">
        {isDocente ? 'Portal de Docentes' : '¡Hola, explorador!'}
      </h1>
      <p className="text-maya-gray font-medium mb-6 text-md text-center">
        {isDocente ? 'Ingresa tus credenciales para gestionar tus grupos' : 'Ingresa para descubrir los glifos mayas'}
      </p>

      <form onSubmit={handleSubmit} className="w-full space-y-5">
        <div className="space-y-2 pb-2">
          <label className='flex items-center gap-2 font-medium text-md'> 
            <User size={18}/>
            {isDocente ? 'Nombre de usuario' : 'Tu nombre de explorador'}
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder={isDocente ? "Escribe tu usuario docente..." : "Escribe tu usuario..."}
            className="w-full px-4 py-3 rounded-2xl border border-gray-400 bg-white focus:bg-white focus:ring-2 focus:ring-maya-gold outline-none transition-all placeholder:text-gray-400 font-semibold shadow-[0_4px_0_#9CA3AF]"
          />
        </div>

        {/* PIN Display */}
        <div className="flex flex-col items-center w-full gap-4">
          <label className="flex items-center gap-2 font-medium text-md self-start">
            <Lock size={18} />
            {isDocente ? 'Tu PIN de acceso (4 dígitos)' : 'Tu PIN secreto (4 dígitos)'}
          </label>

          {/* Círculos indicadores */}
          <div className="flex justify-center gap-2">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className={`rounded-full border transition-all duration-300 size-pin-dot ${
                  pin.length > i ? 'bg-maya-gold border-maya-gold scale-110' : 'bg-white border-gray-400'
                }`}
              />
            ))}
          </div>

          {/* PinPad */}
          <PinPad onNumberPress={handleNumberPress} onDelete={handleDelete} />
        </div>

        <PrimaryButton type="submit" className="mt-3">
          {isDocente ? 'Entrar al Panel' : '¡A jugar!'}
        </PrimaryButton>
      </form>
    </div>
  );
};

export default LoginUser;
