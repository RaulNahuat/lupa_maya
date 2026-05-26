import { useEffect, useState } from 'react';
import AdminPageShell from '../../components/admin/AdminPageShell';
import PrimaryButton from '../../components/PrimaryButton';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { db } from '../../data/db';
import { procesarColaSincronizacion } from '../../services/syncService';
import bcrypt from 'bcryptjs';
import { API_BASE_URL } from '../../config/api';

const AdminSettingsPage = () => {
  const { currentUser, loginUser } = useAuth();
  const [form, setForm] = useState({
    email: currentUser?.email || currentUser?.username || '',
    password: '',
    confirmPassword: ''
  });
  const [modelForm, setModelForm] = useState({
    isActive: false,
    modelFile: null,
    weightsFile: null,
    metadataFile: null
  });
  const [activeModel, setActiveModel] = useState(null);
  const [uploadingModel, setUploadingModel] = useState(false);
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchActiveModel = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/ai-models/active`);
        const result = await response.json();

        if (result.success) {
          setActiveModel(result.data);
        } else if (response.status !== 404) {
          console.warn('No se pudo obtener el modelo activo:', result.message);
        }
      } catch (error) {
        console.warn('No se pudo cargar el modelo activo:', error);
      }
    };

    fetchActiveModel();
  }, []);

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleModelFieldChange = (e) => {
    const { name, type, checked, value, files } = e.target;

    setModelForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'file' ? files?.[0] || null : value
    }));
  };

  const handleUploadModel = async () => {
    if (!modelForm.modelFile || !modelForm.weightsFile || !modelForm.metadataFile) {
      showToast('Faltan archivos', 'Debes seleccionar model.json, weights.bin y metadata.json.', 'warning');
      return;
    }

    const formData = new FormData();
    formData.append('is_active', String(modelForm.isActive));
    formData.append('model.json', modelForm.modelFile);
    formData.append('weights.bin', modelForm.weightsFile);
    formData.append('metadata.json', modelForm.metadataFile);

    setUploadingModel(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/ai-models`, {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'No se pudo subir el modelo');
      }

      showToast('Modelo subido', 'Los archivos se guardaron correctamente en el servidor.', 'success');
      setActiveModel(result.data);
      setModelForm({
        isActive: false,
        modelFile: null,
        weightsFile: null,
        metadataFile: null
      });
    } catch (error) {
      console.error('Error subiendo modelo IA:', error);
      showToast('Error al subir modelo', error.message, 'error');
    } finally {
      setUploadingModel(false);
    }
  };

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

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-4 mt-4">
          <div>
            <h2 className="font-bold text-maya-dark">Modelo de IA</h2>
            <p className="text-sm text-gray-600 mt-1">
              Sube model.json, weights.bin y metadata.json juntos. La versión se genera automáticamente en el backend.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <label className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white border-2 border-maya-dark/10 cursor-pointer">
              <span className="text-sm font-bold text-maya-dark shrink-0">model.json</span>
              <input name="modelFile" type="file" accept="application/json,.json" onChange={handleModelFieldChange} className="w-full text-sm" />
            </label>

            <label className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white border-2 border-maya-dark/10 cursor-pointer">
              <span className="text-sm font-bold text-maya-dark shrink-0">weights.bin</span>
              <input name="weightsFile" type="file" accept=".bin,application/octet-stream" onChange={handleModelFieldChange} className="w-full text-sm" />
            </label>

            <label className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white border-2 border-maya-dark/10 cursor-pointer">
              <span className="text-sm font-bold text-maya-dark shrink-0">metadata.json</span>
              <input name="metadataFile" type="file" accept="application/json,.json" onChange={handleModelFieldChange} className="w-full text-sm" />
            </label>

            <label className="flex items-center gap-3 text-sm font-bold text-maya-dark">
              <input name="isActive" type="checkbox" checked={modelForm.isActive} onChange={handleModelFieldChange} className="w-4 h-4 accent-[var(--maya-gold)]" />
              Marcar como modelo activo
            </label>

            <div className="flex gap-3">
              <PrimaryButton onClick={handleUploadModel} disabled={uploadingModel} className="px-4 py-3">
                {uploadingModel ? 'Subiendo...' : 'Subir modelo IA'}
              </PrimaryButton>
            </div>

            <div className="rounded-2xl bg-maya-cream/70 border border-maya-dark/10 p-4 text-sm text-gray-700">
              <p className="font-bold text-maya-dark">Modelo activo actual</p>
              {activeModel ? (
                <div className="mt-2 space-y-1">
                  <p>Versión: {activeModel.version}</p>
                  <p>Estado: {activeModel.is_active ? 'Activo' : 'Inactivo'}</p>
                  <p className="break-all">Ruta: {activeModel.model_url}</p>
                </div>
              ) : (
                <p className="mt-2">Todavía no hay un modelo activo.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminPageShell>
  );
};

export default AdminSettingsPage;
