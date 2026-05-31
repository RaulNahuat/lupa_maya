import { Trash2 } from 'lucide-react';

const LevelCard = ({ level, onConfigure, onDelete }) => {
  const isAprendizaje = level.tipo === 'APRENDIZAJE';

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex items-center justify-between group">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
          isAprendizaje 
            ? 'bg-amber-50 text-amber-600 border border-amber-200 shadow-sm' 
            : 'bg-emerald-50 text-emerald-600 border border-emerald-200 shadow-sm'
        }`}>
          {level.numero}
        </div>
        <div>
          <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5">
            Nivel {level.numero}
          </h3>
          <div className="flex items-center gap-2 mt-0.5">
            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black border uppercase tracking-wider ${
              isAprendizaje
                ? 'bg-amber-50 text-amber-600 border-amber-200'
                : 'bg-emerald-50 text-emerald-600 border-emerald-200'
            }`}>
              {level.tipo}
            </span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Secuencia: {level.orden_secuencia}
            </span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-2.5 opacity-80 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={onConfigure}
          className="px-3.5 py-2 bg-slate-900 text-white hover:bg-emerald-600 rounded-xl font-bold text-[9px] tracking-wider uppercase transition-all active:scale-95 shadow-sm"
          title="Configurar Actividad"
        >
          Configurar
        </button>
        <button 
          onClick={onDelete}
          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-slate-50 rounded-xl transition-all active:scale-95"
          title="Eliminar Nivel"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default LevelCard;
