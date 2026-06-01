import { useRef, useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { X, Zap, Search, Camera, Volume2 } from "lucide-react"
import { calculateStars } from "../../utils/calculateStars"
import { useGameStore } from "../../store/game/useGameStore"

import * as tmImage from "@teachablemachine/image"
import { API_BASE_URL } from "../../config/api"
import { getCachedActiveAiModel } from "../../services/recognition/aiModelCacheService"

const sonidoCorrecto = new Audio('/assets/sounds/correcto.mp3')
const sonidoError = new Audio('/assets/sounds/incorrecto.mp3')
const sonidoWin = new Audio('/assets/sounds/win.mp3')

export default function ScanLevel({ level, onComplete }) {
  const videoRef = useRef(null)
  const videoClearRef = useRef(null) // segundo video para el área clara del visor
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const modelRef = useRef(null)
  const rafRef = useRef(null)

  const navigate = useNavigate()

  const { contenido } = level

  const levels = useGameStore((s) => s.levels)

  const [scanned, setScanned] = useState(false)
  const [detectado, setDetectado] = useState(null)
  const [intentos, setIntentos] = useState(0)
  const [camaraError, setCamaraError] = useState(null)
  const [scanning, setScanning] = useState(false)
  const [modelLoading, setModelLoading] = useState(true)

  useEffect(() => {
    startCamera()
    loadModel()
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop())
      cancelAnimationFrame(rafRef.current)
    }
  }, [])

  const loadModel = async () => {
    console.log("Cargando modelo...")
    setModelLoading(true)
    try {
      // Intenta cargar el modelo desde la caché local (offline)
      const cachedModelData = await getCachedActiveAiModel()
      if (
        cachedModelData &&
        cachedModelData.assets?.model &&
        cachedModelData.assets?.weights &&
        cachedModelData.assets?.metadata
      ) {
        console.log("Cargando modelo de IA desde la caché local offline...")
        try {
          const modelBlob = await cachedModelData.assets.model.blob()
          const weightsBlob = await cachedModelData.assets.weights.blob()
          const metadataBlob = await cachedModelData.assets.metadata.blob()

          const modelFile = new File([modelBlob], "model.json", { type: "application/json" })
          const weightsFile = new File([weightsBlob], "weights.bin", { type: "application/octet-stream" })
          const metadataFile = new File([metadataBlob], "metadata.json", { type: "application/json" })

          const model = await tmImage.loadFromFiles(modelFile, weightsFile, metadataFile)
          modelRef.current = model
          console.log("Modelo cargado exitosamente desde la caché offline:", model)
          console.log("Clases:", model.getClassLabels())
          return
        } catch (cacheErr) {
          console.warn("Fallo al procesar los archivos de la caché, reintentando por red...", cacheErr)
        }
      }

      // Fallback a la red si no está en la caché o falló
      console.log("Cargando modelo de IA desde el servidor remoto...")
      const model = await tmImage.load(
        `${API_BASE_URL}/models/model.json`,
        `${API_BASE_URL}/models/metadata.json`
      )
      modelRef.current = model
      console.log("Modelo cargado remotamente:", model)
      console.log("Clases:", model.getClassLabels())
    } catch (err) {
      console.error("Error al cargar modelo:", err)
    } finally {
      setModelLoading(false)
    }
  }

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      })
      if (videoRef.current) videoRef.current.srcObject = mediaStream
      if (videoClearRef.current) videoClearRef.current.srcObject = mediaStream
      streamRef.current = mediaStream
    } catch (err) {
      if (err.name === "NotAllowedError") {
        setCamaraError("Permiso de cámara denegado. Actívalo en la configuración de tu navegador para continuar.")
      } else {
        setCamaraError("No se pudo acceder a la cámara. Verifica que tu dispositivo tenga una disponible.")
      }
    }
  }

  const handleScan = () => {
    if (scanning || !modelRef.current) return
    setScanning(true)

    const video = videoRef.current
    const canvas = canvasRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext("2d")
    ctx.drawImage(video, 0, 0)

    streamRef.current?.getTracks().forEach((track) => track.stop())
    setIntentos((prev) => prev + 1)
    runPrediction(canvas)
  }

  const runPrediction = async (canvas) => {
    console.log("Modelo disponible:", modelRef.current)
    const predictions = await modelRef.current.predict(canvas)
    console.log("Predicciones:", predictions) 
    
    // Ordenar por probabilidad más alta
    const top = predictions.sort((a, b) => b.probability - a.probability)[0]

    console.log("Top predicción:", top.className, top.probability)
    console.log("clase_modelo en BD:", contenido.glifo?.clase_modelo)

    const UMBRAL = 0.20 
    const esNinguno = top.className.toLowerCase() === "fondo"
    const coincide = !esNinguno && top.probability >= UMBRAL
      && top.className === contenido.glifo?.clase_modelo

    setDetectado({ coincide, glifo: contenido.glifo, confianza: top.probability })
    setScanned(true)
    setScanning(false)

    if (coincide) {
      sonidoWin.play()
    } else {
      sonidoError.play()
    }
  }

  const handleReintentar = async () => {
    setScanned(false)
    setDetectado(null)
    setScanning(false)
    await startCamera()
  }

  const handleComplete = async () => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    const estrellas = calculateStars(1, intentos > 1 ? 1 : 0)
    const aprobado = intentos === 1
    await onComplete(level.id, estrellas, intentos, aprobado)

    // Buscar el siguiente nivel desbloqueado y no completado
    const indexActual = levels.findIndex((l) => l.id === level.id)
    const siguiente = levels[indexActual + 1]

    if (siguiente) {
      navigate(`/level/${siguiente.id}`)
    } else {
      navigate("/map")  // era el último nivel
    }
  }

  const nombreObjetivo = contenido.glifo?.significado_es ?? contenido.glifo?.nombre_maya ?? "el glifo"
  const numeroNivel = level.orden ?? level.numero ?? level.id ?? ""

  // — Error de cámara —
  if (camaraError) {
    return (
      <div className="bg-black min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <p className="text-white font-semibold mb-6">{camaraError}</p>
        <button onClick={() => navigate("/map")}
          className="px-6 py-3 rounded-2xl font-bold text-white bg-gold">
          Volver al mapa
        </button>
      </div>
    )
  }

  // — Resultado correcto —
  if (scanned && detectado?.coincide) {
    return (
      <div className="md:min-h-screen md:bg-gray-600 md:flex md:items-center md:justify-center">
        <div className="w-full md:w-[390px] md:max-h-[844px] min-h-screen flex flex-col bg-amber-50 md:overflow-hidden md:rounded-3xl md:shadow-2xl">

          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-6 pb-4 gap-3">
            <button
              onClick={() => navigate("/map")}
              className="w-10 h-10 shrink-0 rounded-full bg-white flex items-center justify-center border-2 border-gray-200 shadow-sm"
            >
              <X size={18} className="text-gray-500" />
            </button>
            <div className="flex-1 flex justify-center">
              <span className="bg-light-green text-white font-bold text-lg px-10 py-2 rounded-3xl text-center leading-tight shadow-[0_4px_0_#065f46]">
                ¡Felicidades!<br />Glifo encontrado
              </span>
            </div>
            <div className="w-10 shrink-0" />
          </div>

          {/* Contenido */}
          <div className="flex-1 flex flex-col items-center px-12 pt-4 gap-5 overflow-y-auto">

            {/* Tarjeta del glifo */}
            <div className="w-full bg-white rounded-2xl flex flex-col items-center py-6 px-6 gap-1.5 border-3 border-light-gray shadow-[0_7px_0_#E5E7EB]">
              {detectado.glifo?.imagen_url && (
                <img
                  src={detectado.glifo.imagen_url}
                  alt={detectado.glifo.nombre_maya ?? "Glifo"}
                  className="w-45 h-45 object-contain"
                />
              )}
              {detectado.glifo?.nombre_maya && (
                <p className="text-3xl font-extrabold text-gray-900">
                  {detectado.glifo.nombre_maya}
                </p>
              )}
              {detectado.glifo?.significado_es && (
                <p className="text-lg font-semibold text-gray-900">
                  {detectado.glifo.significado_es}
                </p>
              )}
            </div>

            {/* Botón de audio */}
            {detectado.glifo?.audio_url && (
              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={() => new Audio(detectado.glifo.audio_url).play()}
                  className="w-16 h-16 bg-gold rounded-full flex items-center justify-center shadow-[0_4px_0_#C88F12] active:shadow-none active:translate-y-1 transition-all"
                >
                  <Volume2 size={28} className="text-white" />
                </button>
                <p className="text-sm text-gray-400 font-medium">Toca para escuchar en maya</p>
              </div>
            )}

            {/* Dato cultural / descripción */}
            {detectado.glifo?.descripcion && (
              <div className="w-full bg-amber-100 rounded-2xl px-5 py-4">
                <p className="text-gray-700 font-medium leading-relaxed">
                  {detectado.glifo.descripcion}
                </p>
              </div>
            )}
          </div>

          {/* Botón continuar */}
          <div className="px-5 pb-8 pt-4">
            <button
              onClick={handleComplete}
              className="w-full py-4 bg-light-green rounded-2xl font-extrabold text-white tracking-widest uppercase shadow-[0_8px_0_#065f46] active:shadow-[0_2px_0_#065f46] active:translate-y-1 transition-all"
            >
              Siguiente nivel
            </button>
          </div>
        </div>
      </div>
    )
  }

  // — Resultado incorrecto —
  if (scanned && !detectado?.coincide) {
    return (
      <div className="md:min-h-screen md:bg-gray-600 md:flex md:items-center md:justify-center">
        <div className="w-full md:w-[390px] md:max-h-[844px] min-h-screen flex flex-col bg-amber-50 md:overflow-hidden md:rounded-3xl md:shadow-2xl">

          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-6 pb-4 gap-3">
            <button
              onClick={() => navigate("/map")}
              className="w-10 h-10 shrink-0 rounded-full bg-white flex items-center justify-center border-2 border-gray-200 shadow-sm"
            >
              <X size={18} className="text-gray-500" />
            </button>
            <div className="flex-1 flex justify-center">
              <span className="bg-red text-white font-bold text-lg px-10 py-2 rounded-3xl text-center">
                ¡Ups!
              </span>
            </div>
            <div className="w-10 shrink-0" />
          </div>

          {/* Contenido */}
          <div className="flex-1 flex flex-col items-center justify-center px-10 gap-6">

            {/* Ícono de error */}
            <div className="w-30 h-30 rounded-full bg-red-50 border-4 border-red flex items-center justify-center">
              <X size={55} className="text-red" strokeWidth={2.5} />
            </div>

            <div className="flex flex-col items-center gap-2 text-center">
              <p className="text-2xl font-extrabold text-brown leading-tight">
                Ese no es el glifo correcto
              </p>
              <p className="text-md text-gray-400 font-medium">
                Busca otra tarjeta e inténtalo de nuevo
              </p>
            </div>
          </div>

          {/* Botón reintentar */}
          <div className="px-5 pb-8 pt-4">
            <button
              onClick={handleReintentar}
              className="w-full py-4 bg-gold rounded-2xl font-extrabold text-white text-base tracking-widest uppercase shadow-[0_8px_0_#C88F12] active:shadow-[0_2px_0_#C88F12] active:translate-y-1 transition-all"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    )
  }

  // — Pantalla principal de escaneo —
  return (
    //<div className="min-h-screen flex flex-col relative overflow-hidden">
    <div className="md:min-h-screen md:bg-gray-600 md:flex md:items-center md:justify-center">
      <div className="w-full md:w-[390px] md:max-h-[844px] min-h-screen flex flex-col bg-amber-50 md:overflow-hidden md:rounded-3xl md:shadow-2xl">

      {/* ── Capa 1: video completo oscurecido (fondo) ── */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
      />
      {/* Overlay oscuro sobre todo */}
      <div className="absolute inset-0" style={{ backgroundColor: "rgba(0,0,0,0.55)" }} />

      {/* ── Contenido sobre el overlay ── */}
      <div className="relative z-10 flex flex-col min-h-screen">

        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-5 pb-2">
          <button
            onClick={() => navigate("/map")}
            className="w-10 h-10 rounded-full flex items-center justify-center border border-gray-200"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          >
            <X size={18} className="text-white" />
          </button>
          <span className="font-extrabold text-white text-sm px-5 py-2 rounded-full tracking-widest border border-gray-200"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
            NIVEL {numeroNivel}
          </span>
          <button 
            className="w-10 h-10 rounded-full flex items-center justify-center border border-gray-200"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          >
            <Zap size={18} className="text-white" />
          </button>
        </div>

        {/* Área del visor */}
        <div className="flex-1 flex items-center justify-center px-8 py-4">
          <div className="relative w-full max-w-xs aspect-square">

            {/* ── Capa 2: video sin oscurecer dentro del visor ── */}
            <video
              ref={videoClearRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover rounded-3xl"
            />

            {/* Esquinas doradas */}
            {[
              "top-0 left-0 border-t-4 border-l-4 rounded-tl-3xl",
              "top-0 right-0 border-t-4 border-r-4 rounded-tr-3xl",
              "bottom-0 left-0 border-b-4 border-l-4 rounded-bl-3xl",
              "bottom-0 right-0 border-b-4 border-r-4 rounded-br-3xl",
            ].map((cls, i) => (
              <div key={i} className={`border-gold absolute w-10 h-10 ${cls}`}/>
            ))}

            {/* Línea de escaneo animada */}
            {!scanning && (
              <div
                className="absolute left-3 right-3 h-0.5 rounded-full scan-line"
                style={{ backgroundColor: "#c8953a", boxShadow: "0 0 10px 3px rgba(200,149,58,0.7)" }}
              />
            )}

            {/* Spinner mientras procesa */}
            {scanning && (
              <div className="absolute inset-0 flex items-center justify-center rounded-3xl"
                style={{ backgroundColor: "rgba(0,0,0,0.3)" }}>
                <div className="w-12 h-12 rounded-full border-4 border-white border-t-transparent animate-spin" />
              </div>
            )}
          </div>
        </div>

        {/* Panel inferior */}
        <div className="bg-cream-background rounded-t-4xl px-6 pt-2 pb-8">

          {/* Ícono lupa flotante */}
          <div className="flex justify-center -mt-10 mb-5">
            <div className="w-20 h-20 bg-white rounded-full border-4 border-gold flex items-center justify-center shadow-md">
              <Search size={32} className="text-gold" />
            </div>
          </div>

          <h2 className="text-2xl font-extrabold text-center text-black mb-2">
            Busca {contenido.glifo?.significado_es
              ? `el ${nombreObjetivo}`
              : contenido.glifo?.nombre_maya ?? "el glifo"}
          </h2>

          <p className="text-center text-brown text-md mb-10 font-bold leading-relaxed">
            Apunta tu cámara hacia el glifo<br />
            que creas que hace referencia a{" "}
            {contenido.glifo?.significado_es ? `un ${nombreObjetivo}` : "[significado]"}.
          </p>

          <button
            onClick={handleScan}
            disabled={scanning || modelLoading}
            className="w-full py-4 bg-gold rounded-2xl font-bold tracking-widest text-white text-base flex items-center justify-center gap-4 disabled:opacity-50 shadow-[0_8px_0_#C88F12]"
          >
            {modelLoading ? (
              <div className="w-6 h-6 rounded-full border-3 border-white border-t-transparent animate-spin" />
            ) : (
              <Camera size={26} />
            )}
            {modelLoading ? "CARGANDO MODELO..." : "ESCANEAR GLIFO"}
          </button>
        </div>
      </div>

      {/* Canvas oculto */}
      <canvas ref={canvasRef} className="hidden" />

      <style>{`
        @keyframes scanMove {
          0%   { top: 15%; }
          50%  { top: 78%; }
          100% { top: 15%; }
        }
        .scan-line {
          animation: scanMove 2s ease-in-out infinite;
          position: absolute;
        }
      `}</style>
      </div>
    </div>
  )
}