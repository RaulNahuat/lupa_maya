import { useParams, useNavigate } from "react-router-dom"
import { useGameStore } from "../../store/game/useGameStore"
import { useEffect, useRef, useState } from "react"

// Estrellas según intentos
const calcularEstrellas = (intentos) => {
  if (intentos === 1) return 3
  if (intentos === 2) return 2
  return 1
}

export default function LevelPlay() {
  const { id } = useParams()

  const levels = useGameStore((s) => s.levels)
  const completeLevel = useGameStore((s) => s.completeLevel)

  const level = levels.find((l) => l.id === Number(id))

  if (!level) return <p className="text-center mt-10">Cargando...</p>

  if (level.tipo === "APRENDIZAJE") {
    return <QuizLevel level={level} onComplete={completeLevel} />
  }

  if (level.tipo === "BÚSQUEDA") {
    return <ScanLevel level={level} onComplete={completeLevel} />
  }

  return (
    <p className="text-center mt-10">
      Tipo de nivel no implementado aún: {level.tipo}
    </p>
  )
}


// NIVEL DE APRENDIZAJE (Quiz)
function QuizLevel({ level, onComplete }) {
  const navigate = useNavigate()

  const [selected, setSelected] = useState(null)
  const [answered, setAnswered] = useState(false)
  const [esCorrecta, setEsCorrecta] = useState(false)
  const [intentos, setIntentos] = useState(0)

  const handleAnswer = (option) => {
    if (answered) return

    const correcto = option === level.content.correctAnswer
    setSelected(option)
    setAnswered(true)
    setEsCorrecta(correcto)
    setIntentos((prev) => prev + 1)
  }

  const handleReintentar = () => {
    setSelected(null)
    setAnswered(false)
    setEsCorrecta(false)
    // No resetear intentos: se acumulan para el cálculo de estrellas
  }

  const handleContinue = async () => {
    const estrellas = calcularEstrellas(intentos)
    await onComplete(level.id, estrellas, intentos)
    navigate("/")
  }

  return (
    <div className="max-w-md mx-auto mt-10 text-center px-4">
      <h2 className="text-xl font-bold mb-4">
        {level.content.question}
      </h2>

      {level.glyph?.image && (
        <img
          src={level.glyph.image}
          alt={level.glyph.name}
          className="w-40 mx-auto mb-6"
        />
      )}

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
        <div className="mt-4">
          <p className="font-bold text-lg">
            {esCorrecta ? "¡Correcto! 🎉" : "Incorrecto, intenta de nuevo"}
          </p>

          {esCorrecta ? (
            // Solo se puede continuar si la respuesta fue correcta
            <button
              onClick={handleContinue}
              className="mt-4 px-6 py-2 bg-green-500 text-white font-bold rounded-full"
            >
              Continuar
            </button>
          ) : (
            // Si fue incorrecta, permitir reintentar sin salir del nivel
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


// NIVEL DE BÚSQUEDA (Scaneo)
function ScanLevel({ level, onComplete }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const navigate = useNavigate()

  const [scanned, setScanned] = useState(false)
  const [detectado, setDetectado] = useState(null) // resultado de la detección
  const [intentos, setIntentos] = useState(0)
  const [camaraError, setCamaraError] = useState(null)

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
        
        if (err.name === "NotAllowedError") {
          setCamaraError("Permiso de cámara denegado. Actívalo en la configuración de tu navegador para continuar.")
        } else {
          setCamaraError("No se pudo acceder a la cámara. Verifica que tu dispositivo tenga una disponible.")
        }
      }
    }

    startCamera()

    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop())
    }
  }, [])

  // Capturar imagen y ejecutar detección
  const handleScan = () => {
    const video = videoRef.current
    const canvas = canvasRef.current

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const ctx = canvas.getContext("2d")
    ctx.drawImage(video, 0, 0)

    streamRef.current?.getTracks().forEach((track) => track.stop())

    setIntentos((prev) => prev + 1)

    // TODO: reemplazar con detección real por imagen
    simulateDetection()
  }

  // Simulación de detección — Hay que reemplazar
  const simulateDetection = () => {
    setTimeout(() => {
      // Simula que el glifo detectado coincide con el objetivo
      setDetectado({ coincide: true, glifo: level.glyph })
      setScanned(true)
    }, 1000)
  }

  const handleReintentar = async () => {
    setScanned(false)
    setDetectado(null)

    // Reabrir cámara para el nuevo intento
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      })
      videoRef.current.srcObject = mediaStream
      streamRef.current = mediaStream
    } catch (err) {
      setCamaraError("No se pudo reabrir la cámara.")
    }
  }

  const handleComplete = async () => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    const estrellas = calcularEstrellas(intentos)
    await onComplete(level.id, estrellas, intentos)
    navigate("/")
  }

  // Error de cámara: bloquear funcionalidad y avisar al usuario
  if (camaraError) {
    return (
      <div className="max-w-md mx-auto mt-10 text-center px-4">
        <p className="text-red-500 font-semibold">{camaraError}</p>
        <button
          onClick={() => navigate("/")}
          className="mt-6 px-4 py-2 bg-gray-500 text-white rounded"
        >
          Volver al mapa
        </button>
      </div>
    )
  }

  return (
    <div className="text-center mt-6 px-4">
      <h2 className="text-xl font-bold mb-4">
        {level.content?.instruction ?? "Encuentra el glifo indicado"}
      </h2>

      {/* Vista de cámara */}
      {!scanned && (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full max-w-md mx-auto rounded"
          />
          <button
            onClick={handleScan}
            className="mt-4 px-6 py-2 bg-blue-500 text-white font-bold rounded-full"
          >
            Escanear
          </button>
        </>
      )}

      <canvas ref={canvasRef} className="hidden" />

      {/* Resultado del escaneo */}
      {scanned && detectado && (
        <div className="mt-6">
          {detectado.coincide ? (
            <>
              <p className="text-green-600 font-bold text-lg">¡Glifo correcto!</p>
              <h3 className="text-lg font-bold mt-2">{detectado.glifo?.name}</h3>
              <p className="text-gray-600">{detectado.glifo?.meaning}</p>
              <button
                onClick={handleComplete}
                className="mt-4 px-6 py-2 bg-green-500 text-white font-bold rounded-full"
              >
                Completar nivel
              </button>
            </>
          ) : (
            <>
              <p className="text-red-500 font-bold text-lg">Ese no es el glifo correcto</p>
              <p className="text-gray-500 mt-1 text-sm">Intenta buscar otro</p>
              <button
                onClick={handleReintentar}
                className="mt-4 px-6 py-2 bg-amber-500 text-white font-bold rounded-full"
              >
                Reintentar
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}