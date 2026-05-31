import { useState, useEffect, useRef } from 'react';
import { X, Sparkles, AlertCircle } from 'lucide-react';
import PrimaryButton from '../PrimaryButton';
import GlyphImageSelector from './GlyphImageSelector';
import GlyphDetailsForm from './GlyphDetailsForm';
import GlyphSettingsForm from './GlyphSettingsForm';
import GlyphMultimediaUploaders from './GlyphMultimediaUploaders';

const GlyphEditModal = ({ isOpen, onClose, glyph, onSave, isAdding }) => {
  const [formData, setFormData] = useState({
    nombre_maya: '',
    significado_es: '',
    pronunciacion: '',
    descripcion: '',
    imagen_url: '',
    audio_url: '',
    video_url: '',
    clase_modelo: '',
    activo: true
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [audioFile, setAudioFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const fileInputRef = useRef(null);
  const audioInputRef = useRef(null);
  const videoInputRef = useRef(null);

  const [audioPreviewUrl, setAudioPreviewUrl] = useState('');
  const [videoPreviewUrl, setVideoPreviewUrl] = useState('');

  useEffect(() => {
    if (glyph) {
      setFormData({
        nombre_maya: glyph.nombre_maya || '',
        significado_es: glyph.significado_es || '',
        pronunciacion: glyph.pronunciacion || '',
        descripcion: glyph.descripcion || '',
        imagen_url: glyph.imagen_url || '',
        audio_url: glyph.audio_url || '',
        video_url: glyph.video_url || '',
        clase_modelo: glyph.clase_modelo || '',
        activo: glyph.activo !== undefined ? glyph.activo : true
      });
      setImagePreview(glyph.imagen_url || '');
      setImageFile(null);
      setAudioFile(null);
      setVideoFile(null);
      setAudioPreviewUrl(glyph.audio_url || '');
      setVideoPreviewUrl(glyph.video_url || '');
      setErrorMsg('');
    }
  }, [glyph]);

  useEffect(() => {
    return () => {
      if (audioPreviewUrl && audioPreviewUrl.startsWith('blob:')) URL.revokeObjectURL(audioPreviewUrl);
      if (videoPreviewUrl && videoPreviewUrl.startsWith('blob:')) URL.revokeObjectURL(videoPreviewUrl);
    };
  }, [audioPreviewUrl, videoPreviewUrl]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Por favor selecciona un archivo de imagen válido.');
      return;
    }
    setImageFile(file);
    setErrorMsg('');
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleAudioChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('audio/')) {
      setErrorMsg('Por favor selecciona un archivo de audio válido.');
      return;
    }
    setAudioFile(file);
    setErrorMsg('');
    if (audioPreviewUrl && audioPreviewUrl.startsWith('blob:')) URL.revokeObjectURL(audioPreviewUrl);
    setAudioPreviewUrl(URL.createObjectURL(file));
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('video/')) {
      setErrorMsg('Por favor selecciona un archivo de video válido.');
      return;
    }
    setVideoFile(file);
    setErrorMsg('');
    if (videoPreviewUrl && videoPreviewUrl.startsWith('blob:')) URL.revokeObjectURL(videoPreviewUrl);
    setVideoPreviewUrl(URL.createObjectURL(file));
  };

  const handleRemoveAudio = () => {
    setAudioFile(null);
    if (audioPreviewUrl && audioPreviewUrl.startsWith('blob:')) URL.revokeObjectURL(audioPreviewUrl);
    setAudioPreviewUrl('');
    setFormData(prev => ({ ...prev, audio_url: '' }));
  };

  const handleRemoveVideo = () => {
    setVideoFile(null);
    if (videoPreviewUrl && videoPreviewUrl.startsWith('blob:')) URL.revokeObjectURL(videoPreviewUrl);
    setVideoPreviewUrl('');
    setFormData(prev => ({ ...prev, video_url: '' }));
  };

  const uploadFileToServer = async (file) => {
    if (!file) return null;
    try {
      const uploadData = new FormData();
      uploadData.append('file', file);
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/admin/glyphs/upload`, {
        method: 'POST',
        body: uploadData,
      });
      if (response.ok) {
        const result = await response.json();
        if (result.success) return result.url;
      }
    } catch (err) {
      console.error('Error al subir archivo:', err);
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUploading(true);
    setErrorMsg('');

    let finalImageUrl = formData.imagen_url;
    let finalAudioUrl = formData.audio_url;
    let finalVideoUrl = formData.video_url;

    if (imageFile) {
      const url = await uploadFileToServer(imageFile);
      if (url) finalImageUrl = url;
      else finalImageUrl = imagePreview;
    }

    if (audioFile) {
      const url = await uploadFileToServer(audioFile);
      if (url) finalAudioUrl = url;
      else {
        setErrorMsg('Fallo al subir el archivo de audio.');
        setIsUploading(false); return;
      }
    }

    if (videoFile) {
      const url = await uploadFileToServer(videoFile);
      if (url) finalVideoUrl = url;
      else {
        setErrorMsg('Fallo al subir el archivo de video.');
        setIsUploading(false); return;
      }
    }

    if (!finalImageUrl) {
      setErrorMsg('Debes seleccionar una imagen para el glifo.');
      setIsUploading(false); return;
    }

    onSave(glyph?.id, {
      ...formData,
      imagen_url: finalImageUrl,
      audio_url: finalAudioUrl,
      video_url: finalVideoUrl
    });
    setIsUploading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-slate-50 rounded-[28px] w-full max-w-4xl shadow-2xl flex flex-col my-8 max-h-[92vh] border border-slate-200/50 transform transition-all duration-300 scale-100">
        
        {/* Encabezado */}
        <div className="px-8 py-5 border-b border-slate-200/80 bg-white rounded-t-[28px] flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-maya-gold/10 text-maya-gold rounded-xl flex items-center justify-center shadow-inner">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">
                {isAdding ? 'Nuevo Glifo' : 'Editar Glifo'}
              </h2>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Gestión de Catálogo Maya</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            type="button"
            className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 active:scale-95 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
 
        <form onSubmit={handleSubmit} className="flex flex-col overflow-y-auto">
          <div className="p-6 sm:p-8 space-y-6">
            
            {errorMsg && (
              <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-sm animate-shake">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
 
            {/* Información principal (imagen + información) */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm flex flex-col sm:flex-row gap-8 hover:border-slate-300/80 transition-colors duration-300">
              <GlyphImageSelector 
                imagePreview={imagePreview}
                fileInputRef={fileInputRef}
                onFileChange={handleFileChange}
              />
              <GlyphDetailsForm 
                formData={formData}
                onChange={handleChange}
              />
            </div>
 
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <GlyphSettingsForm 
                activo={formData.activo}
                onChange={handleChange}
              />
              <GlyphMultimediaUploaders 
                audioPreviewUrl={audioPreviewUrl}
                videoPreviewUrl={videoPreviewUrl}
                audioFile={audioFile}
                videoFile={videoFile}
                audioInputRef={audioInputRef}
                videoInputRef={videoInputRef}
                onAudioChange={handleAudioChange}
                onVideoChange={handleVideoChange}
                onRemoveAudio={handleRemoveAudio}
                onRemoveVideo={handleRemoveVideo}
              />
            </div>
 
          </div>
 
          {/* Footer de Acciones */}
          <div className="px-8 py-5 bg-white border-t border-slate-200 flex justify-end gap-3 rounded-b-[28px]">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 bg-slate-100 text-slate-700 text-sm font-bold rounded-xl hover:bg-slate-200 transition-all hover:scale-[1.01] active:scale-95 shadow-sm"
            >
              Cancelar
            </button>
            <PrimaryButton 
              type="submit"
              disabled={isUploading}
              className="px-8 py-2.5 rounded-xl text-sm font-bold shadow-md hover:scale-[1.01] active:scale-[0.98] transition-all"
            >
              {isUploading ? 'Guardando...' : isAdding ? 'Registrar Glifo' : 'Guardar Cambios'}
            </PrimaryButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GlyphEditModal;