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
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [isSending, setIsSending] = useState(false);

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

      if (Number(user.rol_id) === 3) {
        showToast('¡Bienvenido!', `Hola Docente, suerte en tu jornada.`, 'success');
        procesarColaSincronizacion();
        navigate('/docente');
      } else {
        showToast('¡Bienvenido!', `Hola Administrador, suerte en tu jornada.`, 'success');
        procesarColaSincronizacion();
        navigate('/admin');
      }
    } catch (error) {
      showToast('Error de acceso', String(error), 'error');
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();

    if (!forgotEmail.trim()) {
      showToast('Faltan datos', 'Por favor, escribe tu correo electrónico.', 'warning');
      return;
    }

    setIsSending(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Error al enviar el correo.');
      }

      showToast('Correo enviado', data.message, 'success');
      setForgotEmail('');
      setIsForgotPassword(false);
    } catch (error) {
      showToast('Error', error.message || String(error), 'error');
    } finally {
      setIsSending(false);
    }
  };

  if (isForgotPassword) {
    return (
      <div className="w-full flex flex-col items-center">
        <h1 className="text-3xl font-extrabold text-maya-dark mb-4 tracking-tight">
          Recuperar Contraseña
        </h1>
        <p className="text-gray-600 text-center mb-6 text-sm">
          Ingresa tu correo de administrador para recibir un enlace de recuperación.
        </p>

        <form onSubmit={handleForgotPassword} className="w-full space-y-5">
          <div className="space-y-1">
            <input 
              type="email" 
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              placeholder="Correo electrónico de administrador" 
              className="w-full px-5 py-3 rounded-2xl border border-gray-400 bg-white focus:bg-white focus:ring-2 focus:ring-maya-gold outline-none transition-all placeholder:text-gray-400 text-maya-dark shadow-[0_4px_0_#9CA3AF]"
              disabled={isSending}
            />
          </div>

          <PrimaryButton type="submit" className="mt-4" disabled={isSending}>
            {isSending ? 'Enviando...' : 'Enviar enlace'}
          </PrimaryButton>
        </form>

        <div className="mt-8 flex flex-col items-center gap-4 w-full">
          <button 
            type="button"
            onClick={() => setIsForgotPassword(false)}
            className="text-md font-semibold text-brown/80 hover:text-maya-dark transition-colors cursor-pointer"
          >
            Volver al inicio de sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center">
      <h1 className="text-3xl font-extrabold text-maya-dark mb-8 tracking-tight">
        Administración
      </h1>

      <form onSubmit={handleSubmit} className="w-full space-y-5">
        <div className="space-y-1">
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Correo electrónico" 
            className="w-full px-5 py-3 rounded-2xl border border-gray-400 bg-white focus:bg-white focus:ring-2 focus:ring-maya-gold outline-none transition-all placeholder:text-gray-400 text-maya-dark shadow-[0_4px_0_#9CA3AF]"
          />
        </div>
        
        <div className="space-y-1">
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña" 
            className="w-full px-5 py-3 rounded-2xl border border-gray-400 bg-white focus:bg-white focus:ring-2 focus:ring-maya-gold outline-none transition-all placeholder:text-gray-400 text-maya-dark shadow-[0_4px_0_#9CA3AF]"
          />
        </div>

        <PrimaryButton type="submit" className="mt-4">
          Entrar al Panel
        </PrimaryButton>
      </form>

      <div className="mt-8 flex flex-col items-center gap-4 w-full">
        <button 
          type="button"
          onClick={() => setIsForgotPassword(true)}
          className="text-md font-semibold text-brown/80 hover:text-maya-dark transition-colors cursor-pointer"
        >
          ¿Olvidaste tu contraseña?
        </button>
      </div>
    </div>
  );
};

export default LoginAdmin;
