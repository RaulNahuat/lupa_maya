import { useState } from 'react';
import PrimaryButton from '../PrimaryButton';
import { loginOffline } from '../../services/auth/offlineAuth';
import { procesarColaSincronizacion } from '../../services/syncService';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const LoginAdmin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { loginUser } = useAuth();
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      showToast('Faltan datos', 'Por favor, escribe tu correo electrónico.', 'warning');
      return;
    }
    if (!password.trim()) {
      showToast('Faltan datos', 'Por favor, escribe tu contraseña.', 'warning');
      return;
    }

    try {
      const user = await loginOffline({ email, password }, true);
      console.log('Login Admin exitoso:', user);

      loginUser(user);

      showToast('¡Bienvenido!', `Hola Administrador, suerte en tu jornada.`, 'success');

      procesarColaSincronizacion();
      
      navigate('/admin');
    } catch (error) {
      showToast('Error de acceso', String(error), 'error');
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      <h1 className="text-3xl font-extrabold text-maya-dark mb-8 tracking-tight">
        Administración
      </h1>

      <form onSubmit={handleSubmit} className="w-full space-y-4">
        <div className="space-y-1">
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Correo electrónico" 
            className="w-full px-5 py-3.5 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-maya-gold outline-none transition-all placeholder:text-gray-400 text-maya-dark shadow-sm"
          />
        </div>
        
        <div className="space-y-1">
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña" 
            className="w-full px-5 py-3.5 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-maya-gold outline-none transition-all placeholder:text-gray-400 text-maya-dark shadow-sm"
          />
        </div>

        <PrimaryButton type="submit" className="mt-4">
          Entrar al Panel
        </PrimaryButton>
      </form>

      <div className="mt-8 flex flex-col items-center gap-4 w-full">
        <a href="#" className="text-sm font-bold text-gray-400 hover:text-maya-dark transition-colors">
          ¿Olvidaste tu contraseña?
        </a>
      </div>
    </div>
  );
};

export default LoginAdmin;
