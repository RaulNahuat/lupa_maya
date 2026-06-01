import { useState } from 'react';
import PinPad from './PinPad';
import PrimaryButton from '../PrimaryButton';
import { loginOffline } from '../../services/auth/offlineAuth';
import { useNavigate } from "react-router-dom";
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const LoginUser = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const { loginUser } = useAuth();
  const { showToast } = useToast();

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
      
      loginUser(user);
      
      if (Number(user.rol_id) === 3) {
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
      <h1 className="text-2xl font-extrabold text-maya-dark mb-1 tracking-tight">
        ¡Hola!
      </h1>
      <p className="text-maya-gray font-medium mb-2 text-sm text-center">Escribe tus datos y tu PIN para jugar</p>

      <form onSubmit={handleSubmit} className="w-full space-y-3">
        <div className="space-y-1">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Usuario"
            className="w-full px-4 py-2 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-maya-gold outline-none transition-all placeholder:text-gray-400 text-maya-dark text-center font-bold shadow-sm"
          />
        </div>

        {/* PIN Display */}
        <div className="flex justify-center gap-2 my-1">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className={`w-3.5 h-3.5 rounded-full border-2 transition-all duration-300 ${
                pin.length > i ? 'bg-maya-gold border-maya-gold scale-110' : 'border-gray-200'
              }`}
            />
          ))}
        </div>

        <PinPad onNumberPress={handleNumberPress} onDelete={handleDelete} />

        <PrimaryButton type="submit" className="mt-2">
          ¡A jugar!
        </PrimaryButton>
      </form>
    </div>
  );
};

export default LoginUser;
