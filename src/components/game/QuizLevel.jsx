import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Volume2 } from "lucide-react"
import { calculateStars } from "../../utils/calculateStars"

export default function QuizLevel({ level, onComplete }) {
  const navigate = useNavigate()
  const { contenido } = level

  const [selected, setSelected] = useState(null)
  const [answered, setAnswered] = useState(false)
  const [esCorrecta, setEsCorrecta] = useState(false)
  const [intentos, setIntentos] = useState(0)

  const handleSelect = (option) => {
    if (answered) return
    setSelected(option)
  }

  const handleComprobar = () => {
    if (!selected || answered) return
    const correcto = selected === contenido.correctAnswer
    setAnswered(true)
    setEsCorrecta(correcto)
    setIntentos((prev) => prev + 1)

    // Si fue incorrecto, resetear automáticamente tras 1.5s
    if (!correcto) {
      setTimeout(() => {
        setSelected(null)
        setAnswered(false)
        setEsCorrecta(false)
      }, 1500)
    }
  }

  const handleContinue = async () => {
    const estrellas = calculateStars(intentos)
    await onComplete(level.id, estrellas, intentos)
    navigate("/map")
  }

  const handleAudio = () => {
    if (!contenido.audio_url) return
    new Audio(contenido.audio_url).play()
  }

  const getOptionStyle = (option) => {
    const isSelected = option === selected

    if (!answered) {
      return isSelected
        ? "border-2 border-[#4a7c59] bg-[#e8f5ee]"
        : "border-2 border-gray-200 bg-white"
    }
    // Solo marcar en rojo la opción incorrecta elegida
    if (isSelected && !esCorrecta) return "border-2 border-red-400 bg-red-50"
    // Todo lo demás queda neutro
    return "border-2 border-gray-200 bg-white opacity-60"
  }

  const getRadioStyle = (option) => {
    const isSelected = option === selected

    if (!answered) {
      return isSelected
        ? "w-5 h-5 rounded-full bg-light-green border-2 border-light-green"
        : "w-5 h-5 rounded-full border-2 border-gray-300 bg-white"
    }
    if (isSelected && !esCorrecta)
      return "w-5 h-5 rounded-full bg-red border-2 border-red"
    return "w-5 h-5 rounded-full border-2 border-gray-300 bg-white"
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-7 mb-5">
        <button
          onClick={() => navigate("/map")}
          className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-gray-500 text-lg font-bold"
        >
          ✕
        </button>
        <span className="bg-gold font-bold text-black text-md px-5 py-2 rounded-full">
          ¡Adivina lo siguiente!
        </span>
        <div className="w-10" />
      </div>

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col items-center px-5 pt-4">
        {/* Glifo */}
        {contenido.imagen_url && (
          <div
            className="bg-white w-40 h-40 rounded-2xl border-4 border-light-green flex items-center justify-center mb-4 shadow-md"
          >
            <img
              src={contenido.imagen_url}
              alt={contenido.nombre_maya ?? "Glifo maya"}
              className="w-28 h-28 object-contain"
            />
          </div>
        )}

        {/* Nombre maya + botón audio */}
        {contenido.nombre_maya && (
          <div className="flex items-center gap-2 mb-1">
            <span className="text-4xl font-extrabold text-black">
              {contenido.nombre_maya}
            </span>
            {contenido.audio_url && (
              <button
                onClick={handleAudio}
                className="w-9 h-9 bg-maya-gold rounded-full flex items-center justify-center shadow-sm text-white"
                aria-label="Reproducir pronunciación"
              >
                <Volume2 size={18} />
              </button>
            )}
          </div>
        )}

        {/* Pregunta */}
        <p className="font-semibold text-brown mt-3 mb-5 px-4 text-center text-lg">
          {contenido.question}
        </p>

        {/* Opciones */}
        <div className="flex flex-col gap-3 w-full max-w-sm">
          {contenido.options.map((option) => (
            <button
              key={option}
              onClick={() => handleSelect(option)}
              disabled={answered}
              className={`flex items-center justify-between px-5 py-4 rounded-2xl transition-all ${getOptionStyle(option)}`}
            >
              <span className="font-semibold text-lg text-black">
                {option}
              </span>
              <span className={getRadioStyle(option)} />
            </button>
          ))}
        </div>

        {/* Feedback — solo al acertar */}
        {answered && esCorrecta && (
          <div className="mt-4 text-center">
            <p className="font-bold text-xl text-light-green">
              ¡Correcto!
            </p>
          </div>
        )}

        {/* Feedback — incorrecto (desaparece solo con el reset) */}
        {answered && !esCorrecta && (
          <div className="mt-4 text-center">
            <p className="font-bold text-lg text-red">
              Inténtalo de nuevo
            </p>
          </div>
        )}
      </div>

      {/* Botón inferior */}
      <div className="px-5 pb-8 pt-4">
        {!answered ? (
          <button
            onClick={handleComprobar}
            disabled={!selected}
            className="w-full bg-light-green py-4 rounded-2xl font-extrabold text-white text-base tracking-widest transition-opacity disabled:opacity-40"
            style={{ letterSpacing: "0.1em" }}
          >
            COMPROBAR
          </button>
        ) : esCorrecta ? (
          <button
            onClick={handleContinue}
            className="w-full bg-light-green py-4 rounded-2xl font-extrabold text-white text-base tracking-widest"
          >
            CONTINUAR
          </button>
        ) : (
          // Mientras espera el reset automático, el botón queda deshabilitado
          <button
            disabled
            className="w-full bg-light-gree py-4 rounded-2xl font-extrabold text-white text-base tracking-widest opacity-40"
          >
            COMPROBAR
          </button>
        )}
      </div>
    </div>
  )
}