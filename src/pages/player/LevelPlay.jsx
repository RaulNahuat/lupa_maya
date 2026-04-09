import { useParams, useNavigate } from "react-router-dom"
import { useGameStore } from "../../store/useGameStore"
import { useEffect, useRef, useState } from "react"

export default function LevelPlay() {
  const { id } = useParams()

  const levels = useGameStore((s) => s.levels)
  const completeLevel = useGameStore((s) => s.completeLevel)

  const level = levels.find((l) => l.id === Number(id))

  if (!level) return <p className="text-center mt-10">Cargando...</p>

  // Decidir qué tipo de nivel renderizar
  if (level.type === "quiz") {
    return <QuizLevel level={level} onComplete={completeLevel} />
  }

  if (level.type === "scan") {
    return <ScanLevel level={level} onComplete={completeLevel} />
  }

  return (
    <p className="text-center mt-10">
      Tipo de nivel no implementado aún
    </p>
  )
}


function QuizLevel({ level, onComplete }) {
  const navigate = useNavigate()
  const [selected, setSelected] = useState(null)
  const [answered, setAnswered] = useState(false)

  const handleAnswer = (option) => {
    if (answered) return
    setSelected(option)
    setAnswered(true)
  }

  const handleContinue = async () => {
    if (selected === level.content.correctAnswer) {
      await onComplete(level.id)
    }

    navigate("/")
  }

  return (
    <div className="max-w-md mx-auto mt-10 text-center">
      <h2 className="text-xl font-bold mb-4">
        {level.content.question}
      </h2>

      <img
        src={level.glyph.image}
        alt={level.glyph.name}
        className="w-40 mx-auto mb-6"
      />

      <div className="flex flex-col gap-3">
        {level.content.options.map((option) => {
          const isCorrect = option === level.content.correctAnswer
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
        <>
          <p className="mt-4 font-bold">
            {selected === level.content.correctAnswer
              ? "¡Correcto!"
              : "Incorrecto :("}
          </p>

          <button
            onClick={handleContinue}
            className="mt-6 px-4 py-2 bg-black text-white rounded"
          >
            Continuar
          </button>
        </>
      )}
    </div>
  )
}


function ScanLevel({ level, onComplete }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)

  const [scanned, setScanned] = useState(false)

  const navigate = useNavigate()

  // Iniciar cámara
  useEffect(() => {
    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        })

        videoRef.current.srcObject = mediaStream
        streamRef.current = mediaStream
      } catch (err) {
        console.error("Error cámara:", err)
      }
    }

    startCamera()

    return () => {
      // Apagar cámara correctamente
      streamRef.current?.getTracks().forEach((track) => track.stop())
    }
  }, [])

  // Capturar imagen
  const handleScan = () => {
    const video = videoRef.current
    const canvas = canvasRef.current

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const ctx = canvas.getContext("2d")
    ctx.drawImage(video, 0, 0)

    // apagar cámara después de capturar
    streamRef.current?.getTracks().forEach((track) => track.stop())

    // Aquí luego irá IA
    simulateDetection()
  }

  // Simulación
  const simulateDetection = () => {
    setTimeout(() => {
      setScanned(true)
    }, 1000)
  }

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
  }

  const handleComplete = async () => {
    stopCamera()
    await onComplete(level.id)
    navigate("/")
  }

  return (
    <div className="text-center mt-6">
      <h2 className="text-xl font-bold mb-4">
        {level.content.instruction}
      </h2>

      {/* Cámara */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-full max-w-md mx-auto rounded"
      />

      <canvas ref={canvasRef} className="hidden" />

      {/* Botón escanear */}
      {!scanned && (
        <button
          onClick={handleScan}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Escanear
        </button>
      )}

      {/* Resultado */}
      {scanned && (
        <div className="mt-6">
          <h3 className="text-lg font-bold">
            {level.glyph.name}
          </h3>
          <p>{level.glyph.meaning}</p>

          <button
            onClick={handleComplete}
            className="mt-4 px-4 py-2 bg-green-500 text-white rounded"
          >
            Completar nivel
          </button>
        </div>
      )}
    </div>
  )
}