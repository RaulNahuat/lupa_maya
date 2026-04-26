import { useRef, useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { calculateStars } from "../../utils/calculateStars"

export default function ScanLevel({ level, onComplete }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const navigate = useNavigate()

  const { contenido } = level

  const [scanned, setScanned] = useState(false)
  const [detectado, setDetectado] = useState(null)
  const [intentos, setIntentos] = useState(0)
  const [camaraError, setCamaraError] = useState(null)

  useEffect(() => {
    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        })
        videoRef.current.srcObject = mediaStream
        streamRef.current = mediaStream
      } catch (err) {
        console.error("Error camara:", err)
        if (err.name === "NotAllowedError") {
          setCamaraError("Permiso de camara denegado. Activalo en la configuracion de tu navegador para continuar.")
        } else {
          setCamaraError("No se pudo acceder a la camara. Verifica que tu dispositivo tenga una disponible.")
        }
      }
    }

    startCamera()

    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop())
    }
  }, [])

  const handleScan = () => {
    const video = videoRef.current
    const canvas = canvasRef.current

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const ctx = canvas.getContext("2d")
    ctx.drawImage(video, 0, 0)

    streamRef.current?.getTracks().forEach((track) => track.stop())
    setIntentos((prev) => prev + 1)

    // TODO: reemplazar con deteccion real por imagen
    simulateDetection()
  }

  const simulateDetection = () => {
    setTimeout(() => {
      setDetectado({ coincide: true, glifo: contenido.glifo })
      setScanned(true)
    }, 1000)
  }

  const handleReintentar = async () => {
    setScanned(false)
    setDetectado(null)

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      })
      videoRef.current.srcObject = mediaStream
      streamRef.current = mediaStream
    } catch (err) {
      setCamaraError("No se pudo reabrir la camara.")
    }
  }

  const handleComplete = async () => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    const estrellas = calculateStars(intentos)
    await onComplete(level.id, estrellas, intentos)
    navigate("/map")
  }

  if (camaraError) {
    return (
      <div className="max-w-md mx-auto mt-10 text-center px-4">
        <p className="text-red-500 font-semibold">{camaraError}</p>
        <button
          onClick={() => navigate("/map")}
          className="mt-6 px-4 py-2 bg-gray-500 text-white rounded"
        >
          Volver al mapa
        </button>
      </div>
    )
  }

  return (
    <div className="text-center mt-6 px-4">

      {/* Imagen del objeto/animal que representa el significado —
          se muestra antes de escanear para indicar qué tarjeta buscar */}
      {!scanned && contenido.glifo?.imagen_url && (
        <img
          src={contenido.glifo.imagen_url}
          alt={contenido.glifo.significado_es ?? "Glifo objetivo"}
          className="w-40 h-40 object-contain mx-auto mb-4 rounded-xl shadow"
        />
      )}

      <h2 className="text-xl font-bold mb-4">
        {contenido.glifo?.nombre_maya
          ? `Encuentra el glifo: ${contenido.glifo.nombre_maya}`
          : "Encuentra el glifo indicado"}
      </h2>

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

      {scanned && detectado && (
        <div className="mt-6">
          {detectado.coincide ? (
            <>
              <p className="text-green-600 font-bold text-lg">¡Glifo correcto!</p>

              {/* Imagen de confirmación del glifo encontrado */}
              {detectado.glifo?.imagen_url && (
                <img
                  src={detectado.glifo.imagen_url}
                  alt={detectado.glifo.nombre_maya ?? "Glifo"}
                  className="w-32 h-32 object-contain mx-auto my-3 rounded-xl shadow"
                />
              )}

              {detectado.glifo?.nombre_maya && (
                <h3 className="text-lg font-bold">{detectado.glifo.nombre_maya}</h3>
              )}

              {/* significado_es — consistente con el modelo Glifo */}
              {detectado.glifo?.significado_es && (
                <p className="text-gray-600 mt-1">{detectado.glifo.significado_es}</p>
              )}

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