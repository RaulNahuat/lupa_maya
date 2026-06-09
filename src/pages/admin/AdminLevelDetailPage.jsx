import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Edit2, Check, X, HelpCircle, AlertCircle, BookOpen, Layers, Target, CheckCircle2, Settings } from 'lucide-react';
import AdminPageShell from '../../components/admin/AdminPageShell';
import ModalConfirmation from '../../components/ModalConfirmation';
import PrimaryButton from '../../components/PrimaryButton';
import LevelEditModal from '../../components/admin/LevelEditModal';
import { db } from '../../data/db';
import { procesarColaSincronizacion } from '../../services/syncService';
import { getMediaUrl } from '../../config/api';

const AdminLevelDetailPage = () => {
  const { blockId, levelId } = useParams();
  const navigate = useNavigate();

  const [block, setBlock] = useState(null);
  const [level, setLevel] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLevelEditOpen, setIsLevelEditOpen] = useState(false);

  // Estados para APRENDIZAJE (Preguntas y Opciones)
  const [questions, setQuestions] = useState([]);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [isDeleteQuestionModalOpen, setIsDeleteQuestionModalOpen] = useState(false);

  // Formulario de Pregunta
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState([
    { text: '', es_correcta: true },
    { text: '', es_correcta: false },
    { text: '', es_correcta: false },
    { text: '', es_correcta: false }
  ]);
  const [selectedGlyphId, setSelectedGlyphId] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Estados para BÚSQUEDA (Glifos del Bloque y Objetivo)
  const [blockGlyphs, setBlockGlyphs] = useState([]);
  const [objectiveGlyphId, setObjectiveGlyphId] = useState(null);

  const fetchLevelData = async () => {
    setIsLoading(true);
    try {
      const [blockData, levelData, allBlockGlyphs] = await Promise.all([
        db.grupos_niveles.get(Number(blockId)),
        db.niveles.get(Number(levelId)),
        db.glifos.where('grupo_id').equals(Number(blockId)).toArray()
      ]);

      if (!blockData || !levelData) {
        console.error("Bloque o Nivel no encontrado");
        navigate(`/admin/glyphs/block/${blockId}`);
        return;
      }

      setBlock(blockData);
      setLevel(levelData);
      setBlockGlyphs(allBlockGlyphs);

      if (levelData.tipo === 'APRENDIZAJE') {
        const rawQuestions = await db.preguntas
          .where('nivel_id')
          .equals(Number(levelId))
          .toArray();

        // Cargar las opciones de cada pregunta
        const loadedQuestions = await Promise.all(
          rawQuestions.map(async (q) => {
            const opts = await db.opciones_respuestas
              .where('preguntas_id')
              .equals(q.id)
              .toArray();
            return { ...q, opciones: opts };
          })
        );
        setQuestions(loadedQuestions);
      } else if (levelData.tipo === 'BUSQUEDA') {
        const obj = await db.nivel_glifos_objetivos
          .where('nivel_id')
          .equals(Number(levelId))
          .first();
        if (obj) {
          setObjectiveGlyphId(obj.glifo_id);
        }
      }

      setIsLoading(false);
    } catch (error) {
      console.error("Error al obtener datos del nivel:", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLevelData();
  }, [blockId, levelId]);

  // --- HANDLERS APRENDIZAJE ---
  const handleOpenAddQuestion = () => {
    setQuestionText('');
    setOptions([
      { text: '', es_correcta: true },
      { text: '', es_correcta: false },
      { text: '', es_correcta: false },
      { text: '', es_correcta: false }
    ]);
    setSelectedGlyphId('');
    setErrorMsg('');
    setIsAddingQuestion(true);
    setIsQuestionModalOpen(true);
  };

  const handleOpenEditQuestion = (q) => {
    setSelectedQuestion(q);
    setQuestionText(q.texto_pregunta);
    setSelectedGlyphId(q.glifo_id || '');
    
    // Rellenar las 4 opciones
    const preOptions = [...q.opciones];
    const filledOptions = Array.from({ length: 4 }).map((_, i) => {
      if (preOptions[i]) {
        return { text: preOptions[i].texto_opcion, es_correcta: !!preOptions[i].es_correcta, id: preOptions[i].id };
      }
      return { text: '', es_correcta: i === 0 };
    });
    setOptions(filledOptions);
    setErrorMsg('');
    setIsAddingQuestion(false);
    setIsQuestionModalOpen(true);
  };

  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!questionText.trim()) {
      setErrorMsg('Por favor ingresa el texto de la pregunta.');
      return;
    }

    if (options.some(opt => !opt.text.trim())) {
      setErrorMsg('Por favor rellena las 4 opciones de respuesta.');
      return;
    }

    if (!options.some(opt => opt.es_correcta)) {
      setErrorMsg('Debes seleccionar cuál es la opción correcta.');
      return;
    }

    try {
      const isNew = isAddingQuestion;
      const qId = isNew ? Date.now() : selectedQuestion.id;
      const linkedGlyph = selectedGlyphId 
        ? blockGlyphs.find(g => g.id === Number(selectedGlyphId)) 
        : null;

      const qData = {
        id: qId,
        nivel_id: Number(levelId),
        texto_pregunta: questionText.trim(),
        glifo_id: selectedGlyphId ? Number(selectedGlyphId) : null,
        glifo: linkedGlyph ? {
          imagen_url: linkedGlyph.imagen_url,
          nombre_maya: linkedGlyph.nombre_maya,
          significado_es: linkedGlyph.significado_es,
          audio_url: linkedGlyph.audio_url
        } : null,
        activa: true,
        version: 1
      };

      await db.transaction('rw', db.preguntas, db.opciones_respuestas, db.cola_sincronizacion, async () => {
        // Guardar Pregunta
        await db.preguntas.put(qData);
        await db.cola_sincronizacion.add({
          entidad: 'preguntas',
          accion: isNew ? 'CREAR' : 'EDITAR',
          datos: qData,
          estado: 'PENDIENTE',
          created_at: new Date().getTime()
        });

        // Guardar Respuestas
        for (let i = 0; i < options.length; i++) {
          const opt = options[i];
          const optId = opt.id || (Date.now() + i + 1);
          const optData = {
            id: optId,
            preguntas_id: qId,
            texto_opcion: opt.text.trim(),
            es_correcta: opt.es_correcta ? 1 : 0,
            version: 1
          };

          await db.opciones_respuestas.put(optData);
          await db.cola_sincronizacion.add({
            entidad: 'opciones_respuestas',
            accion: opt.id ? 'EDITAR' : 'CREAR',
            datos: optData,
            estado: 'PENDIENTE',
            created_at: new Date().getTime()
          });
        }
      });

      setIsQuestionModalOpen(false);
      setSelectedQuestion(null);

      if (navigator.onLine) {
        await procesarColaSincronizacion();
      }
      fetchLevelData();
    } catch (error) {
      console.error("Error al guardar pregunta:", error);
      setErrorMsg("Ocurrió un error al guardar la pregunta.");
    }
  };

  const handleDeleteQuestion = (q) => {
    setSelectedQuestion(q);
    setIsDeleteQuestionModalOpen(true);
  };

  const confirmDeleteQuestion = async () => {
    if (!selectedQuestion) return;

    try {
      await db.transaction('rw', db.preguntas, db.opciones_respuestas, db.cola_sincronizacion, async () => {
        // Eliminar opciones primero
        for (const opt of selectedQuestion.opciones) {
          await db.opciones_respuestas.delete(opt.id);
          await db.cola_sincronizacion.add({
            entidad: 'opciones_respuestas',
            accion: 'ELIMINAR',
            datos: { id: opt.id },
            estado: 'PENDIENTE',
            created_at: new Date().getTime()
          });
        }

        // Eliminar pregunta
        await db.preguntas.delete(selectedQuestion.id);
        await db.cola_sincronizacion.add({
          entidad: 'preguntas',
          accion: 'ELIMINAR',
          datos: { id: selectedQuestion.id },
          estado: 'PENDIENTE',
          created_at: new Date().getTime()
        });
      });

      setIsDeleteQuestionModalOpen(false);
      setSelectedQuestion(null);

      if (navigator.onLine) {
        await procesarColaSincronizacion();
      }
      fetchLevelData();
    } catch (error) {
      console.error("Error al eliminar la pregunta:", error);
    }
  };

  // --- HANDLERS BÚSQUEDA ---
  const handleSelectObjectiveGlyph = async (glyph) => {
    try {
      const isRemoving = objectiveGlyphId === glyph.id;
      
      await db.transaction('rw', db.nivel_glifos_objetivos, db.cola_sincronizacion, async () => {
        // Borrar cualquier objetivo previo del nivel
        const previos = await db.nivel_glifos_objetivos
          .where('nivel_id')
          .equals(Number(levelId))
          .toArray();

        for (const prev of previos) {
          await db.nivel_glifos_objetivos.delete(prev.id);
          await db.cola_sincronizacion.add({
            entidad: 'nivel_glifos_objetivos',
            accion: 'ELIMINAR',
            datos: { id: prev.id },
            estado: 'PENDIENTE',
            created_at: new Date().getTime()
          });
        }

        if (!isRemoving) {
          // Crea el nuevo objetivo
          const nuevoObj = {
            id: Date.now(),
            nivel_id: Number(levelId),
            glifo_id: glyph.id,
            orden_aparicion: 1,
            glifo: {
              imagen_url: glyph.imagen_url,
              nombre_maya: glyph.nombre_maya,
              significado_es: glyph.significado_es
            },
            version: 1
          };

          await db.nivel_glifos_objetivos.put(nuevoObj);
          await db.cola_sincronizacion.add({
            entidad: 'nivel_glifos_objetivos',
            accion: 'CREAR',
            datos: nuevoObj,
            estado: 'PENDIENTE',
            created_at: new Date().getTime()
          });
        }
      });

      setObjectiveGlyphId(isRemoving ? null : glyph.id);

      if (navigator.onLine) {
        await procesarColaSincronizacion();
      }
    } catch (error) {
      console.error("Error al asignar glifo objetivo:", error);
    }
  };

  const handleSaveLevelSettings = async (id, data) => {
    try {
      const levelData = {
        ...level,
        ...data,
        activo: true,
        version: (level.version || 1) + 1
      };

      await db.transaction('rw', db.niveles, db.cola_sincronizacion, async () => {
        await db.niveles.put(levelData);
        await db.cola_sincronizacion.add({
          entidad: 'niveles',
          accion: 'EDITAR',
          datos: levelData,
          estado: 'PENDIENTE',
          created_at: new Date().getTime()
        });
      });

      setLevel(levelData);
      setIsLevelEditOpen(false);

      if (navigator.onLine) {
        await procesarColaSincronizacion();
      }
      fetchLevelData();
    } catch (error) {
      console.error("Error al actualizar nivel en Dexie:", error);
      throw error;
    }
  };

  if (isLoading) {
    return (
      <AdminPageShell activeTab="glifos">
        <div className="text-center py-20 opacity-40">
          <span className="font-bold uppercase tracking-widest animate-pulse text-xs text-maya-dark">Cargando actividad...</span>
        </div>
      </AdminPageShell>
    );
  }

  const isAprendizaje = level.tipo === 'APRENDIZAJE';

  return (
    <AdminPageShell activeTab="glifos">
      <div className="space-y-4 px-1 sm:px-0">
        
        {/* Cabecera */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate(`/admin/glyphs/block/${blockId}`, { state: { tab: 'levels' } })}
              className="w-10 h-10 bg-white border border-slate-200 hover:bg-slate-50 flex items-center justify-center rounded-2xl shadow-sm transition-all"
              title="Volver al Bloque"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" strokeWidth={2.5} />
            </button>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-black text-slate-800 leading-tight">Actividad de Nivel {level.numero}</h2>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black border uppercase tracking-wider flex items-center gap-1 ${
                  isAprendizaje
                    ? 'bg-amber-50 text-amber-600 border-amber-200'
                    : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                }`}>
                  {level.tipo}
                </span>
              </div>
              <div className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                Bloque: {block.nombre} • Posición de Bloque: {level.posicion_bloque}
              </div>
            </div>
          </div>

          <button 
            onClick={() => setIsLevelEditOpen(true)}
            className="px-4 py-2 text-slate-600 hover:text-emerald-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-2xl transition-all font-bold text-xs flex items-center gap-1.5 shadow-sm hover:shadow active:scale-95 self-start sm:self-center"
          >
            <Settings className="w-3.5 h-3.5" />
            EDITAR PARÁMETROS
          </button>
        </div>

        {/* CONTENIDO CASO APRENDIZAJE */}
        {isAprendizaje ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-amber-500" />
                Cuestionario del Nivel ({questions.length})
              </h3>
              <PrimaryButton 
                onClick={handleOpenAddQuestion}
                className="px-4 py-2 text-xs font-bold shadow flex items-center gap-1 bg-amber-500 hover:bg-amber-600 rounded-2xl transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                AÑADIR PREGUNTA
              </PrimaryButton>
            </div>

            {questions.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {questions.map((q, idx) => (
                  <div key={q.id} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group relative overflow-hidden">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 font-extrabold text-[10px] flex items-center justify-center">
                            {idx + 1}
                          </span>
                          {q.glifo && (
                            <span className="px-2 py-0.5 rounded-full text-[8px] font-black bg-maya-gold/10 text-maya-gold border border-maya-gold/20 uppercase tracking-wider">
                              Glifo: {q.glifo.nombre_maya}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 transition-opacity">
                          <button 
                            onClick={() => handleOpenEditQuestion(q)}
                            className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-slate-50 rounded-lg transition-all"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => handleDeleteQuestion(q)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-50 rounded-lg transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <p className="font-extrabold text-slate-700 text-sm leading-relaxed pr-12">{q.texto_pregunta}</p>
                      
                      {/* Listado de Opciones */}
                      <div className="space-y-1.5 pt-2">
                        {q.opciones.map((opt) => (
                          <div key={opt.id} className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between ${
                            opt.es_correcta 
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                              : 'bg-slate-50/50 border-slate-100 text-slate-500'
                          }`}>
                            <span>{opt.texto_opcion}</span>
                            {opt.es_correcta === 1 && (
                              <Check className="w-3.5 h-3.5 text-emerald-600" strokeWidth={3} />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-2xl border border-slate-100 shadow-sm p-6 max-w-sm mx-auto">
                <HelpCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <h4 className="font-extrabold text-slate-600 uppercase tracking-wider text-xs mb-1">Sin Preguntas</h4>
                <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                  Aún no has configurado preguntas en este nivel de aprendizaje.
                </p>
              </div>
            )}
          </div>
        ) : (
          /* CONTENIDO CASO BÚSQUEDA */
          <div className="space-y-4">
            <div className="flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <Target className="w-4.5 h-4.5 text-emerald-500" />
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">
                Selección de Glifo Objetivo
              </h3>
            </div>
            
            <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
              Selecciona exactamente un glifo del bloque como el objetivo principal de este nivel de búsqueda. El usuario lo buscará mediante la cámara de realidad aumentada.
            </p>
 
            {blockGlyphs.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {blockGlyphs.map(g => {
                  const isSelected = objectiveGlyphId === g.id;
                  return (
                    <button
                      key={g.id}
                      onClick={() => handleSelectObjectiveGlyph(g)}
                      className={`relative bg-white border rounded-[22px] p-3 text-center transition-all group overflow-hidden ${
                        isSelected 
                          ? 'border-emerald-500 shadow-md ring-2 ring-emerald-500/10' 
                          : 'border-slate-200 hover:border-slate-300 shadow-sm hover:shadow active:scale-95'
                      }`}
                    >
                      <div className="aspect-square bg-slate-50 rounded-xl overflow-hidden mb-3 relative flex items-center justify-center border border-slate-100/50">
                        {g.imagen_url ? (
                          <img 
                            src={getMediaUrl(g.imagen_url)} 
                            alt={g.nombre_maya} 
                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                          />
                        ) : (
                          <HelpCircle className="w-8 h-8 text-slate-300" />
                        )}
                        
                        {isSelected && (
                          <div className="absolute inset-0 bg-emerald-500/10 backdrop-blur-[0.5px] flex items-center justify-center">
                            <div className="w-7 h-7 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white animate-in zoom-in duration-200">
                              <Check className="w-4.5 h-4.5" strokeWidth={3} />
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <h4 className="font-extrabold text-slate-800 text-xs truncate leading-tight uppercase">
                        {g.nombre_maya}
                      </h4>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider truncate mt-0.5">
                        {g.significado_es}
                      </p>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-2xl border border-slate-100 shadow-sm p-6 max-w-sm mx-auto">
                <HelpCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <h4 className="font-extrabold text-slate-600 uppercase tracking-wider text-xs mb-1">Sin Glifos</h4>
                <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                  Primero debes registrar glifos en este bloque para poder configurar el objetivo.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL DE EDICIÓN/CREACIÓN DE PREGUNTAS */}
      {isQuestionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-slate-50 rounded-[28px] w-full max-w-lg shadow-2xl flex flex-col my-8 border border-slate-200/50">
            
            {/* Cabecera */}
            <div className="px-6 py-4 border-b border-slate-200 bg-white rounded-t-[28px] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-amber-500/10 text-amber-500 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-slate-800 tracking-tight">
                    {isAddingQuestion ? 'Nueva Pregunta' : 'Editar Pregunta'}
                  </h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Contenido Evaluativo</p>
                </div>
              </div>
              <button 
                onClick={() => setIsQuestionModalOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 active:scale-95 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="flex flex-col">
              <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                
                {errorMsg && (
                  <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Texto de la Pregunta */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Enunciado de la Pregunta</label>
                  <input
                    type="text"
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    placeholder="ej. ¿Qué significa el glifo de arriba?"
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all text-sm font-semibold text-slate-800"
                    required
                  />
                </div>

                {/* Glifo Relacionado (Opcional) */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Glifo de Referencia (Opcional)</label>
                  <select
                    value={selectedGlyphId}
                    onChange={(e) => setSelectedGlyphId(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all text-sm font-semibold text-slate-800 cursor-pointer"
                  >
                    <option value="">-- Ninguno (Sin glifo visual) --</option>
                    {blockGlyphs.map(g => (
                      <option key={g.id} value={g.id}>
                        {g.nombre_maya.toUpperCase()} ({g.significado_es})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Opciones de respuesta */}
                <div className="space-y-3 pt-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1 block">Opciones de Respuesta</label>
                  
                  {options.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setOptions(options.map((o, i) => ({
                            ...o,
                            es_correcta: i === idx
                          })));
                        }}
                        className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                          opt.es_correcta
                            ? 'bg-emerald-500 text-white shadow-sm ring-4 ring-emerald-500/10 scale-105'
                            : 'bg-slate-200 text-slate-500 hover:bg-slate-300 active:scale-95'
                        }`}
                        title="Marcar como Correcta"
                      >
                        <Check className="w-4 h-4" strokeWidth={3} />
                      </button>
                      
                      <input
                        type="text"
                        value={opt.text}
                        onChange={(e) => {
                          const val = e.target.value;
                          setOptions(options.map((o, i) => i === idx ? { ...o, text: val } : o));
                        }}
                        placeholder={`Opción ${String.fromCharCode(65 + idx)}`}
                        className={`w-full px-4 py-2 bg-white border rounded-xl focus:outline-none focus:ring-4 transition-all text-xs font-bold text-slate-700 ${
                          opt.es_correcta
                            ? 'border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500/10'
                            : 'border-slate-200 focus:border-amber-500 focus:ring-amber-500/10'
                        }`}
                        required
                      />
                    </div>
                  ))}
                </div>

              </div>

              {/* Botones de Footer */}
              <div className="px-6 py-4 bg-white border-t border-slate-200 flex justify-end gap-3 rounded-b-[28px]">
                <button
                  type="button"
                  onClick={() => setIsQuestionModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-200 transition-all hover:scale-[1.01] active:scale-95"
                >
                  Cancelar
                </button>
                <PrimaryButton 
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 rounded-lg text-xs font-bold shadow-md hover:scale-[1.01] active:scale-[0.98] transition-all"
                >
                  {isAddingQuestion ? 'Crear Pregunta' : 'Guardar Cambios'}
                </PrimaryButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRMACIÓN ELIMINACIÓN PREGUNTA */}
      <ModalConfirmation
        isOpen={isDeleteQuestionModalOpen}
        title="¿Eliminar Pregunta?"
        message="¿Estás seguro de que deseas eliminar esta pregunta y todas sus opciones asociadas? Esta acción no se puede deshacer."
        onConfirm={confirmDeleteQuestion}
        onCancel={() => setIsDeleteQuestionModalOpen(false)}
        confirmText="Eliminar"
        cancelText="Cancelar"
      />

      {/* MODAL DE EDICIÓN DE PARÁMETROS BÁSICOS DEL NIVEL */}
      <LevelEditModal
        isOpen={isLevelEditOpen}
        onClose={() => setIsLevelEditOpen(false)}
        level={level}
        onSave={handleSaveLevelSettings}
        isAdding={false}
      />

    </AdminPageShell>
  );
};

export default AdminLevelDetailPage;
