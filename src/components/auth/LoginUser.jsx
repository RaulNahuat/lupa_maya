import { useState } from 'react';
import PinPad from './PinPad';
import PrimaryButton from '../PrimaryButton';
import { loginOffline } from '../../services/auth/offlineAuth';
import { procesarColaSincronizacion } from '../../services/syncService';
import { useNavigate } from "react-router-dom";
import { useGameStore } from '../../store/game/useGameStore';

const LoginUser = () => {
  const navigate = useNavigate();
  const [nombre, setNombre] = useState('');
  const [pin, setPin] = useState('');
  const setCurrentUser = useGameStore((s) => s.setCurrentUser);

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
    try {
      const user = await loginOffline({ nombre, pin });
      console.log('Login Niño exitoso:', user);
      
      setCurrentUser({
        ...user,
        local_id: user.local_id || Date.now(),
      });
      
      procesarColaSincronizacion();
      navigate('/map');
      
    } catch (error) {
      console.error(error);
      alert(error);
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      <h1 className="text-3xl font-extrabold text-maya-dark mb-2 tracking-tight">
        ¡Hola!
      </h1>
      <p className="text-maya-gray font-medium mb-4 text-sm">Escribe tu nombre y PIN para jugar</p>

      <form onSubmit={handleSubmit} className="w-full space-y-4">
        <div className="space-y-1">
          <input 
            type="text" 
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="¿Cómo te llamas?" 
            className="w-full px-5 py-3 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-maya-gold outline-none transition-all placeholder:text-gray-400 text-maya-dark text-center font-bold shadow-sm"
          />
        </div>

        {/* PIN Display */}
        <div className="flex justify-center gap-2.5 my-2">
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

        <PrimaryButton 
          type="submit" 
          className="mt-6"
          disabled={!nombre || pin.length < 4}
        >
          ¡A jugar!
        </PrimaryButton>
      </form>
    </div>
  );
};

export default LoginUser;
