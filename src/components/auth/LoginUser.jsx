import { useState } from 'react';
import PinPad from './PinPad';
import PrimaryButton from '../PrimaryButton';

const LoginUser = () => {
  const [nombre, setNombre] = useState('');
  const [pin, setPin] = useState('');

  const handleNumberPress = (num) => {
    if (pin.length < 4) {
      setPin(prev => prev + num);
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login Niño:', { nombre, pin });
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
