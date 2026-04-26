import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { calculateStars } from "../../utils/calculateStars"

export default function QuizLevel({ level, onComplete }) {
  const navigate = useNavigate()
  const { contenido } = level

  const [selected, setSelected] = useState(null)
  const [answered, setAnswered] = useState(false)
  const [esCorrecta, setEsCorrecta] = useState(false)
  const [intentos, setIntentos] = useState(0)

  const handleAnswer = (option) => {
    if (answered) return
    const correcto = option === contenido.correctAnswer
    setSelected(option)
    setAnswered(true)
    setEsCorrecta(correcto)
    setIntentos((prev) => prev + 1)
  }

  const handleReintentar = () => {
    setSelected(null)
    setAnswered(false)
    setEsCorrecta(false)
  }

  const handleContinue = async () => {
    const estrellas = calculateStars(intentos)
    await onComplete(level.id, estrellas, intentos)
    navigate("/map")
  }

  return (
    <div className="max-w-md mx-auto mt-10 text-center px-4">

      {/* Imagen del glifo para que el jugador la estudie antes de responder */}
      {contenido.imagen_url && (
        <img
          src={contenido.imagen_url}
          alt={contenido.nombre_maya ?? "Glifo maya"}
          className="w-40 h-40 object-contain mx-auto mb-4 rounded-xl shadow"
        />
      )}

      <h2 className="text-xl font-bold mb-4">
        {contenido.question}
      </h2>

      <div className="flex flex-col gap-3">
        {contenido.options.map((option) => {
          const isCorrect = option === contenido.correctAnswer
          const isSelected = option === selected

          let style = "bg-blue-500"
          if (answered) {
            if (isCorrect) style = "bg-green-500"
            else if (isSelected) style = "bg-red-500"
            else style = "bg-gray-300"
          }

          return (
            <button
              key={option}
              onClick={() => handleAnswer(option)}
              className={`p-3 rounded text-white font-semibold ${style}`}
            >
              {option}
            </button>
          )
        })}
      </div>

      {answered && (
        <div className="mt-4">
          <p className="font-bold text-lg">
            {esCorrecta ? "¡Correcto!" : "Incorrecto, intenta de nuevo"}
          </p>

          {esCorrecta ? (
            <button
              onClick={handleContinue}
              className="mt-4 px-6 py-2 bg-green-500 text-white font-bold rounded-full"
            >
              Continuar
            </button>
          ) : (
            <button
              onClick={handleReintentar}
              className="mt-4 px-6 py-2 bg-amber-500 text-white font-bold rounded-full"
            >
              Reintentar
            </button>
          )}
        </div>
      )}
    </div>
  )
}