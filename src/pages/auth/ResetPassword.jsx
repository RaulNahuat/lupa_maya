import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PrimaryButton from '../../components/PrimaryButton';
import { useToast } from '../../context/ToastContext';
import Navbar from '../../components/Navbar';
import mayaCharacter from '../../assets/maya-character.png';
import { db } from '../../data/db';

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      showToast('Enlace inválido', 'No se encontró un token válido en la dirección de la página.', 'error');
      return;
    }

    if (!newPassword.trim()) {
      showToast('Faltan datos', 'Por favor, escribe tu nueva contraseña.', 'warning');
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast('Contraseñas no coinciden', 'La contraseña y la confirmación no son iguales.', 'warning');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al restablecer la contraseña.');
      }

      // Actualizar localmente en IndexedDB si existe el admin con el local_id devuelto
      if (data.local_id) {
        const localAdmin = await db.admins.where('local_id').equals(data.local_id).first();
        if (localAdmin) {
          await db.admins.update(data.local_id, {
            password_hash: data.password_hash,
            sync_status: 'SINCRONIZADO',
            updated_at: new Date().toISOString()
          });
          console.log('Password hash actualizado en base de datos local');
        }
      }

      showToast('¡Éxito!', 'Tu contraseña ha sido restablecida correctamente.', 'success');
      navigate('/login');
    } catch (error) {
      showToast('Error', error.message || String(error), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="md:min-h-screen md:bg-gray-700 md:flex md:items-center md:justify-center">
      <div className="w-full md:w-[390px] md:max-h-[844px] h-screen flex flex-col bg-maya-cream md:overflow-hidden md:rounded-3xl md:shadow-2xl relative overflow-hidden">
        <Navbar />

        <div className="flex-1 flex items-start justify-center overflow-y-auto">
          <div className="w-full px-screen flex flex-col items-center relative z-10 pt-4 pb-6">
            
            {/* Avatar */}
            <div className="mb-4">
              <img
                src={mayaCharacter}
                alt="Ilustración de personaje maya"
                className="object-contain rounded-full border border-gray-400 relative z-10 transition-transform duration-500 hover:scale-105 shadow-[0_5px_0_#9CA3AF] size-avatar"
              />
            </div>

            <div className="w-full flex flex-col items-center">
              <h1 className="text-3xl font-extrabold text-maya-dark mb-4 tracking-tight text-center">
                Nueva Contraseña
              </h1>
              <p className="text-gray-600 text-center mb-6 text-sm">
                Escribe tu nueva contraseña de administrador a continuación.
              </p>

              <form onSubmit={handleSubmit} className="w-full space-y-5">
                <div className="space-y-1">
                  <input 
                    type="password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Nueva contraseña" 
                    className="w-full px-5 py-3 rounded-2xl border border-gray-400 bg-white focus:bg-white focus:ring-2 focus:ring-maya-gold outline-none transition-all placeholder:text-gray-400 text-maya-dark shadow-[0_4px_0_#9CA3AF]"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-1">
                  <input 
                    type="password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirmar nueva contraseña" 
                    className="w-full px-5 py-3 rounded-2xl border border-gray-400 bg-white focus:bg-white focus:ring-2 focus:ring-maya-gold outline-none transition-all placeholder:text-gray-400 text-maya-dark shadow-[0_4px_0_#9CA3AF]"
                    disabled={isSubmitting}
                  />
                </div>

                <PrimaryButton type="submit" className="mt-4" disabled={isSubmitting}>
                  {isSubmitting ? 'Guardando...' : 'Restablecer contraseña'}
                </PrimaryButton>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
