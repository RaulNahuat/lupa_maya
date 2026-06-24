import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { X, Volume2 } from "lucide-react"
import { useGameStore } from "../../store/game/useGameStore"
import { getMediaUrl } from "../../config/api"
import { calculateStars } from "../../utils/calculateStars"
import { db } from "../../data/db"
import CompletedLevelModal from "./CompletedLevelModal"

const sonidoCorrecto = new Audio('/assets/sounds/correcto.mp3')
const sonidoError = new Audio('/assets/sounds/incorrecto.mp3')
const sonidoWin = new Audio('/assets/sounds/win.mp3')

export default function GlyphPickLevel({ level, onComplete }) {
  const navigate = useNavigate()
  const levels = useGameStore((s) => s.levels)
  const { contenido } = level

  const numeroNivel = levels.findIndex((l) => l.id === level.id) + 1
  const glifoCorrecto = contenido.glifo

  const [opciones, setOpciones] = useState([])
  const [selected, setSelected] = useState(null)
  const [answered, setAnswered] = useState(false)
  const [esCorrecta, setEsCorrecta] = useState(false)
  const [fallos, setFallos] = useState(0)
  const [falloActual, setFalloActual] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [estrellasFinales, setEstrellasFinales] = useState(0)
  const [nivelSiguiente, setNivelSiguiente] = useState(null)

  useEffect(() => {
    generarOpciones()
  }, [level.id])

  const generarOpciones = async () => {
    const grupoId = level.grupo_id

    const todos = await db.glifos.toArray()
    const distractores = todos
      .filter(g => 
        g.id !== glifoCorrecto?.id && 
        g.imagen_url &&
        g.grupo_id === grupoId
      )
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)

    const todas = [...distractores, glifoCorrecto].sort(() => Math.random() - 0.5)
    setOpciones(todas)
  }

  const handleSelect = (glifo) => {
    if (answered) return
    setSelected(glifo)

    const correcto = glifo.id === glifoCorrecto.id
    setAnswered(true)
    setEsCorrecta(correcto)

    if (correcto) {
      sonidoCorrecto.play()
    } else {
      sonidoError.play()
      if (!falloActual) {
        setFallos(prev => prev + 1)
        setFalloActual(true)
      }
      setTimeout(() => {
        setSelected(null)
        setAnswered(false)
        setEsCorrecta(false)
      }, 1500)
    }
  }

  const handleContinue = async () => {
    const estrellas = calculateStars(1, fallos)
    const aprobado = fallos === 0
    const intentos = fallos === 0 ? 1 : fallos + 1

    await onComplete(level.id, estrellas, intentos, aprobado)

    const indexActual = levels.findIndex((l) => l.id === level.id)
    const siguiente = levels[indexActual + 1] ?? null

    setEstrellasFinales(estrellas)
    setNivelSiguiente(siguiente)
    sonidoWin.play()
    setShowModal(true)
  }

  const handleContinuarModal = () => {
    sonidoWin.pause()
    sonidoWin.currentTime = 0
    setShowModal(false)
    if (nivelSiguiente) {
      navigate(`/level/${nivelSiguiente.id}`)
    } else {
      navigate("/map")
    }
  }

  const getCardStyle = (glifo) => {
    if (!answered || selected?.id !== glifo.id) {
      return selected?.id === glifo.id
        ? "border-2 border-maya-gold bg-maya-orange-light"
        : "border-2 border-gray-200 bg-white"
    }
    if (esCorrecta) return "border-2 border-light-green bg-green-50"
    return "border-2 border-red-400 bg-red-50"
  }

  const nombreObjetivo = glifoCorrecto?.significado_es ?? glifoCorrecto?.nombre_maya ?? "el glifo"

  return (
    <div className="flex-1 flex flex-col bg-amber-50 min-h-0">

      {/* Header */}
      <div className="flex items-center justify-between p-5 pb-4 gap-3">
        <button
          onClick={() => navigate("/map")}
          className="w-10 h-10 shrink-0 rounded-full bg-white flex items-center justify-center border-2 border-gray-300 shadow-sm"
        >
          <X size={22} className="text-gray-500" />
        </button>

        <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-500 ${
            answered && esCorrecta ? 'bg-gold w-full' : 'bg-gold w-0'
          }`} />
        </div>

        <span className="shrink-0 bg-gold font-bold text-white text-sm px-3 py-1 rounded-full">
          NIVEL {numeroNivel}
        </span>
      </div>

      {/* Contenido */}
      <div className="flex-1 flex flex-col items-center px-screen pt-2 overflow-y-auto min-h-0">

        {/* Pregunta */}
        <p className="font-bold text-brown mb-5 px-2 text-center text-xl">
          ¿Cuál de estos glifos representa{' '}
          <span className="text-maya-dark">
            {glifoCorrecto?.significado_es
              ? `"${nombreObjetivo}"`
              : glifoCorrecto?.nombre_maya ?? "el glifo"}
          </span>?
        </p>

        {/* Grid de opciones */}
        {opciones.length === 4 && (
          <div className="grid grid-cols-2 gap-3 w-full">
            {opciones.map((glifo) => (
              <button
                key={glifo.id}
                onClick={() => handleSelect(glifo)}
                disabled={answered}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all active:scale-95 ${getCardStyle(glifo)}`}
              >
                <img
                  src={getMediaUrl(glifo.imagen_url)}
                  alt={glifo.nombre_maya ?? "Glifo"}
                  className="size-glifo-card object-contain mb-1"
                />
                <span className="text-sm font-bold text-maya-dark text-center leading-tight">
                  {glifo.nombre_maya ?? "—"}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Audio del glifo correcto al acertar */}
        {answered && esCorrecta && glifoCorrecto?.audio_url && (
          <div className="mt-4 flex flex-col items-center gap-1">
            <button
              onClick={() => new Audio(getMediaUrl(glifoCorrecto.audio_url)).play()}
              className="size-audio-btn bg-maya-gold rounded-full flex items-center justify-center shadow-sm text-white"
            >
              <Volume2 size={20} />
            </button>
            <p className="text-xs text-gray-400 font-medium">Toca para escuchar</p>
          </div>
        )}

        {/* Feedback */}
        {answered && esCorrecta && (
          <p className="mt-3 font-bold text-2xl text-light-green">¡Correcto!</p>
        )}
        {answered && !esCorrecta && (
          <p className="mt-3 font-bold text-2xl text-red">Inténtalo de nuevo</p>
        )}
      </div>

      {/* Botón inferior */}
      <div className="px-screen pb-8 pt-4">
        {answered && esCorrecta ? (
          <button
            onClick={handleContinue}
            className="w-full bg-light-green py-4 rounded-2xl font-bold text-white text-xl tracking-widest shadow-[0_8px_0_#065f46]"
          >
            ¡TERMINAR!
          </button>
        ) : (
          <button disabled
            className="w-full bg-light-gray py-4 rounded-2xl font-bold text-white text-xl tracking-widest shadow-[0_8px_0_#6B7280]"
          >
            ¡TERMINAR!
          </button>
        )}
      </div>

      <CompletedLevelModal
        isOpen={showModal}
        numeroNivel={numeroNivel}
        estrellas={estrellasFinales}
        hayNivelSiguiente={!!nivelSiguiente}
        onContinuar={handleContinuarModal}
        onIrAlMapa={() => {
          sonidoWin.pause()
          sonidoWin.currentTime = 0
          navigate("/map")
        }}
      />
    </div>
  )
}