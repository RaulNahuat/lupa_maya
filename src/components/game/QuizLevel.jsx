import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { X, Volume2 } from "lucide-react"
import { calculateStars } from "../../utils/calculateStars"

export default function QuizLevel({ level, onComplete }) {
  const navigate = useNavigate()
  const { contenido } = level
  const preguntas = contenido.preguntas ?? []
  const totalPreguntas = preguntas.length

  const numeroNivel = level.orden ?? level.numero ?? level.id ?? ""

  // Índice de la pregunta actual
  const [indice, setIndice] = useState(0)

  // Cuántas preguntas requirieron más de un intento
  const [fallosTotal, setFallosTotal] = useState(0)

  // Si la pregunta actual ya tuvo un fallo (para contar máximo 1 fallo por pregunta)
  const [falloActual, setFalloActual] = useState(false)

  const [selected, setSelected] = useState(null)
  const [answered, setAnswered] = useState(false)
  const [esCorrecta, setEsCorrecta] = useState(false)
  //const [intentos, setIntentos] = useState(0)

  const preguntaActual = preguntas[indice]
  const progreso = (indice + 1 / totalPreguntas) * 100

  const handleSelect = (option) => {
    if (answered) return
    setSelected(option)
  }

  const handleComprobar = () => {
    if (!selected || answered) return
    const correcto = selected === preguntaActual.correctAnswer
    setAnswered(true)
    setEsCorrecta(correcto)

    if (!correcto) {
      // Contar el fallo solo la primera vez que falla esta pregunta
      if (!falloActual) {
        setFallosTotal((prev) => prev + 1)
        setFalloActual(true)
      }

      // Resetear para reintentar la misma pregunta
      setTimeout(() => {
        setSelected(null)
        setAnswered(false)
        setEsCorrecta(false)
      }, 1500)
    }
  }

  const handleContinue = async () => {
    const siguienteIndice = indice + 1

    if (siguienteIndice < totalPreguntas) {
      // Avanzar a la siguiente pregunta
      setIndice(siguienteIndice)
      setSelected(null)
      setAnswered(false)
      setEsCorrecta(false)
      setFalloActual(false)
    } else {
      // Nivel completado — calcular resultado final
      const estrellas = calculateStars(totalPreguntas, fallosTotal)

      // aprobado = 80% o más correctas a primera vez
      const aprobado = (totalPreguntas - fallosTotal) / totalPreguntas >= 0.8

      const intentos = fallosTotal === 0 ? 1 : fallosTotal + 1

      await onComplete(level.id, estrellas, intentos, aprobado)
    }
  }

  const handleAudio = () => {
    if (!preguntaActual.audio_url) return
    new Audio(preguntaActual.audio_url).play()
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

  if (!preguntaActual) {
    return (
      <p className="text-center mt-10 text-red-500">
        Este nivel no tiene preguntas configuradas.
      </p>
    )
  }

  return (
    <div className="md:min-h-screen md:bg-gray-600 md:flex md:items-center md:justify-center">
      <div className="w-full md:w-[390px] md:max-h-[844px] min-h-screen flex flex-col bg-amber-50 md:overflow-hidden md:rounded-3xl md:shadow-2xl">
      
      {/* Header */}
      <div className="flex items-center justify-between p-5 pt-5 pb-5 gap-3">
        <button
          onClick={() => navigate("/map")}
          title="Cerrar"
          className="w-10 h-10 shrink-0 rounded-full bg-white flex items-center justify-center border-2 border-gray-300 shadow-sm"
        >
          <X size={22} className="text-gray-500" />
        </button>

        {/* Barra de progreso */}
        <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gold rounded-full transition-all duration-500"
            style={{ width: `${progreso}%` }}
          />
        </div>

        <span className="shrink-0 bg-gold font-bold text-white text-sm px-3 py-1 rounded-full">
          NIVEL {numeroNivel}
        </span>
      </div>

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col items-center px-5 pt-2">
        {/* Glifo */}
        {preguntaActual.imagen_url && (
          <div className="bg-white w-45 h-45 rounded-3xl border-2 border-black flex items-center justify-center mb-3">
            <img
              src={preguntaActual.imagen_url}
              alt={preguntaActual.nombre_maya ?? "Glifo maya"}
              className="w-40 h-40 object-contain"
            />
          </div>
        )}

        {/* Nombre maya + botón audio */}
        {preguntaActual.nombre_maya && (
          <div className="flex items-center gap-2 mb-1">
            <span className="text-4xl font-extrabold text-black">
              {preguntaActual.nombre_maya}
            </span>
            {preguntaActual.audio_url && (
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
        <p className="font-bold text-brown mt-3 mb-7 px-4 text-center text-xl">
          {preguntaActual.question}
        </p>

        {/* Opciones */}
        <div className="flex flex-col gap-3 w-full max-w-sm">
          {preguntaActual.options.map((option) => (
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
          <div className="mt-7 text-center">
            <p className="font-bold text-2xl text-light-green">
              ¡Correcto!
            </p>
          </div>
        )}

        {/* Feedback — incorrecto (desaparece solo con el reset) */}
        {answered && !esCorrecta && (
          <div className="mt-7 text-center">
            <p className="font-bold text-2xl text-red">
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
            className="w-full bg-light-green py-4 rounded-2xl font-bold text-white text-xl tracking-widest transition-opacity disabled:opacity-40 shadow-[0_8px_0_#065f46]"
            style={{ letterSpacing: "0.1em" }}
          >
            COMPROBAR
          </button>
        ) : esCorrecta ? (
          <button
            onClick={handleContinue}
            className="w-full bg-light-green py-4 rounded-2xl font-bold text-white text-xl tracking-widest shadow-[0_8px_0_#065f46]"
          >
            {indice + 1 < totalPreguntas ? "CONTINUAR" : "¡TERMINAR!"}
          </button>
        ) : (
          // Mientras espera el reset automático, el botón queda deshabilitado
          <button
            disabled
            className="w-full bg-light-gree py-4 rounded-2xl font-bold text-white text-xl tracking-widest opacity-40"
          >
            COMPROBAR
          </button>
        )}
      </div>
      </div>
    </div>
  )
}