import { Star } from "lucide-react"
import { useEffect, useState } from "react"

const CompletedLevelModal = ({
  isOpen,
  numeroNivel,
  estrellas,
  hayNivelSiguiente,
  onContinuar,
  onIrAlMapa,
}) => {
  const [estrellasVisibles, setEstrellasVisibles] = useState(0)

  useEffect(() => {
    if (!isOpen) {
      setEstrellasVisibles(0)
      return
    }

    // Delay inicial para que el modal termine de aparecer
    const timers = []
    for (let i = 1; i <= estrellas; i++) {
      timers.push(setTimeout(() => {
        setEstrellasVisibles(i)
      }, 300 + i * 400)) // 700ms, 1100ms, 1500ms
    }

    return () => timers.forEach(clearTimeout)
  }, [isOpen, estrellas])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl flex flex-col items-center text-center gap-4 transform transition-all zoom-in-95 duration-200">

        {/* Título */}
        <p className="text-3xl font-extrabold text-dark-brown">¡Felicidades!</p>
        <p className="text-gray-500 text-md font-medium -mt-2">
          Nivel {numeroNivel} completado
        </p>

        {/* Estrellas */}
        <div className="flex gap-5 py-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`transition-all duration-300 ${
                i <= estrellasVisibles ? "scale-125 opacity-100" : "scale-90 opacity-30"
              }`}
            >
              <Star
                className={`size-star-modal ${
                  i <= estrellas
                    ? "text-amber-400 fill-amber-400 drop-shadow-md"
                    : "text-gray-200 fill-gray-200"
                }`}
              />
            </div>
          ))}
        </div>

        {/* Mensaje según estrellas */}
        <p className="text-gray-500 text-sm px-2">
          {estrellas === 3 && "¡Perfecto! Respondiste todo a la primera."}
          {estrellas === 2 && "¡Muy bien! Respondiste casi perfecto."}
          {estrellas === 1 && "¡Lo lograste! Sigue practicando para mejorar."}
        </p>

        {/* Botones */}
        <div className="flex flex-col gap-5 w-full mt-4">
          {hayNivelSiguiente && (
            <button
              onClick={onContinuar}
              className="w-full bg-dark-gold text-white font-bold text-md rounded-2xl py-3 shadow-[0_4px_0_#7A5000] active:shadow-[0_2px_0_#7A5000] active:translate-y-1 transition-all"
            >
              SIGUIENTE NIVEL
            </button>
          )}
          <button
            onClick={onIrAlMapa}
            className={`w-full font-bold text-md rounded-2xl py-3 transition-all ${
              hayNivelSiguiente
                ? "bg-gray-200 text-gray-500 hover:bg-gray-200 shadow-[0_4px_0_#6B7280]"
                : "bg-dark-gold text-white shadow-[0_5px_0_#7A5000] active:shadow-[0_2px_0_#7A5000] active:translate-y-1"
            }`}
          >
            SALIR AL MAPA
          </button>
        </div>
      </div>
    </div>
  )
}

export default CompletedLevelModal