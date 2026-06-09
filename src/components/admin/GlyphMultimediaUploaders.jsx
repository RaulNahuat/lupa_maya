import { Upload, Trash2, Volume2, Video } from 'lucide-react';
import { getMediaUrl } from '../../config/api';

const GlyphMultimediaUploaders = ({
  audioPreviewUrl,
  videoPreviewUrl,
  audioFile,
  videoFile,
  audioInputRef,
  videoInputRef,
  onAudioChange,
  onVideoChange,
  onRemoveAudio,
  onRemoveVideo,
}) => {
  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm md:col-span-2 hover:border-slate-300/80 transition-colors duration-300">
      <div className="flex items-center gap-1.5 mb-4">
        <span className="w-1.5 h-1.5 bg-maya-gold rounded-full"></span>
        <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Recursos Multimedia</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        
        {/* Audio */}
        <div className="space-y-2">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5 uppercase tracking-wider">
              <Volume2 className="w-4 h-4 text-maya-gold" /> Audio
            </label>
            {audioPreviewUrl && (
              <button 
                type="button" 
                onClick={onRemoveAudio} 
                className="text-xs font-semibold text-rose-500 hover:text-rose-600 flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" /> Quitar
              </button>
            )}
          </div>
          {audioPreviewUrl ? (
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex flex-col gap-1.5 shadow-inner">
              <audio src={getMediaUrl(audioPreviewUrl)} controls className="w-full h-8" />
              <span className="text-[10px] text-slate-400 px-1 truncate font-medium">
                {audioFile ? audioFile.name : 'Audio cargado'}
              </span>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => audioInputRef.current?.click()}
              className="w-full py-4 bg-slate-50 hover:bg-slate-100/70 border border-dashed border-slate-200 hover:border-slate-300 rounded-xl flex flex-col items-center justify-center gap-1 text-slate-500 hover:text-slate-700 transition-all group"
            >
              <Upload className="w-4 h-4 text-slate-400 group-hover:text-slate-500 transition-transform group-hover:-translate-y-0.5" />
              <span className="text-xs font-semibold">Cargar audio</span>
            </button>
          )}
          <input 
            type="file" 
            ref={audioInputRef} 
            onChange={onAudioChange} 
            accept="audio/*" 
            className="hidden" 
          />
        </div>

        {/* Video */}
        <div className="space-y-2">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5 uppercase tracking-wider">
              <Video className="w-4 h-4 text-maya-gold" /> Video
            </label>
            {videoPreviewUrl && (
              <button 
                type="button" 
                onClick={onRemoveVideo} 
                className="text-xs font-semibold text-rose-500 hover:text-rose-600 flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" /> Quitar
              </button>
            )}
          </div>
          {videoPreviewUrl ? (
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex flex-col items-center gap-1.5 shadow-inner">
              <video src={getMediaUrl(videoPreviewUrl)} controls className="w-full max-h-[85px] rounded-lg bg-black object-contain shadow-md" />
              <span className="text-[10px] text-slate-400 px-1 truncate font-medium self-start w-full">
                {videoFile ? videoFile.name : 'Video cargado'}
              </span>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => videoInputRef.current?.click()}
              className="w-full py-4 bg-slate-50 hover:bg-slate-100/70 border border-dashed border-slate-200 hover:border-slate-300 rounded-xl flex flex-col items-center justify-center gap-1 text-slate-500 hover:text-slate-700 transition-all group"
            >
              <Upload className="w-4 h-4 text-slate-400 group-hover:text-slate-500 transition-transform group-hover:-translate-y-0.5" />
              <span className="text-xs font-semibold">Cargar video</span>
            </button>
          )}
          <input 
            type="file" 
            ref={videoInputRef} 
            onChange={onVideoChange} 
            accept="video/*" 
            className="hidden" 
          />
        </div>

      </div>
    </div>
  );
};

export default GlyphMultimediaUploaders;
