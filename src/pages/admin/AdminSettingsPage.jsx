import { useState } from 'react';
import AdminPageShell from '../../components/admin/AdminPageShell';
import PrimaryButton from '../../components/PrimaryButton';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { db } from '../../data/db';
import { procesarColaSincronizacion } from '../../services/syncService';
import bcrypt from 'bcryptjs';

const AdminSettingsPage = () => {
  const { currentUser, loginUser } = useAuth();
  const [form, setForm] = useState({
    email: currentUser?.email || currentUser?.username || '',
    password: '',
    confirmPassword: ''
  });
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    if (!currentUser) return;
    setSaving(true);
    try {
      if (form.password && form.password !== form.confirmPassword) {
        showToast('Contraseñas no coinciden', 'Asegúrate de escribir la misma contraseña en ambos campos.', 'warning');
        setSaving(false);
        return;
      }

      const localId = currentUser.local_id;
      const payload = {
        ...currentUser,
        email: form.email,
        updated_at: new Date().toISOString(),
        sync_status: 'PENDIENTE'
      };

      if (form.password) {
        const hash = bcrypt.hashSync(form.password, 10);
        payload.password_hash = hash;
      }

      // Actualizar localmente y encolar la edición para que el syncService la suba al servidor
      await db.transaction('rw', db.admins, db.cola_sincronizacion, async () => {
        await db.admins.put(payload);
        await db.cola_sincronizacion.add({
          entidad: 'admins',
          entidad_id: payload.local_id || null,
          accion: 'EDITAR',
          datos: payload,
          estado: 'PENDIENTE',
          created_at: new Date().getTime()
        });
      });

      loginUser(payload);
      showToast('Cambios guardados', 'Tu correo/contraseña se actualizaron y se encolaron para sincronizar.', 'success');
      // Limpiar campos de contraseña en el formulario
      setForm(prev => ({ ...prev, password: '', confirmPassword: '' }));
      if (navigator.onLine) await procesarColaSincronizacion(localId);
    } catch (err) {
      console.error('Error actualizando admin:', err);
      showToast('Error', 'No se pudo actualizar tu perfil. Revisa la consola.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminPageShell activeTab="glifos">
      <div className="mt-2 px-1">
        <h1 className="text-2xl font-black text-maya-dark uppercase">Configuración del Panel</h1>
          <p className="text-sm text-gray-600 mt-2">Modifica tu correo y contraseña.</p>
      </div>

      <div className="space-y-4 mt-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <h2 className="font-bold text-maya-dark">Tu perfil</h2>
          <div className="mt-3 grid grid-cols-1 gap-3">
            <input name="email" value={form.email} onChange={handleChange} placeholder="Correo electrónico" className="w-full px-4 py-3 rounded-2xl bg-white border-2 border-maya-dark/10 outline-none" />
            <input name="password" value={form.password} onChange={handleChange} placeholder="Nueva contraseña" type="password" className="w-full px-4 py-3 rounded-2xl bg-white border-2 border-maya-dark/10 outline-none" />
            <input name="confirmPassword" value={form.confirmPassword} onChange={handleChange} placeholder="Confirmar contraseña" type="password" className="w-full px-4 py-3 rounded-2xl bg-white border-2 border-maya-dark/10 outline-none" />
            <div className="flex gap-3">
              <PrimaryButton onClick={handleSave} disabled={saving} className="px-4 py-3">{saving ? 'Guardando...' : 'Guardar cambios'}</PrimaryButton>
            </div>
          </div>
        </div>
      </div>
    </AdminPageShell>
  );
};

export default AdminSettingsPage;
