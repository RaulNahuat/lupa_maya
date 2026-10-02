import { X, HelpCircle, Map, Brain, ScanLine, CameraOff, Star, Flame, Trophy } from "lucide-react"

const INSTRUCCIONES = [
  {
    icon: Map,
    titulo: "Avanza por el mapa",
    texto: "Toca un nivel y pulsa INICIAR. Los niveles se desbloquean en orden: termina uno para abrir el siguiente.",
  },
  {
    icon: Brain,
    titulo: "Niveles de aprendizaje",
    texto: "Observa el glifo, escucha su pronunciación y responde las preguntas. Si fallas, ¡inténtalo de nuevo!",
  },
  {
    icon: ScanLine,
    titulo: "Niveles de búsqueda",
    texto: "Coloca la tarjeta del glifo frente a la cámara, dentro del recuadro, y pulsa ESCANEAR GLIFO.",
  },
  {
    icon: CameraOff,
    titulo: "¿Sin cámara o sin tarjetas?",
    texto: "Activa el botón de cámara a la derecha del mapa y elige el glifo correcto entre 4 imágenes.",
  },
  {
    icon: Star,
    titulo: "Gana estrellas",
    texto: "Al terminar un nivel recibes de 1 a 3 estrellas. Puedes repetir niveles; se conserva tu mejor resultado.",
  },
  {
    icon: Flame,
    titulo: "Mantén tu racha",
    texto: "Completa niveles nuevos con 3 estrellas seguidas. Si fallas una, la racha vuelve a 0.",
  },
  {
    icon: Trophy,
    titulo: "Consigue logros",
    texto: "Desbloquea insignias al cumplir retos y revísalas en “Logros”, en el menú inferior.",
  }
]

const HelpModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="help-modal-title"
    >
      <div
        className="relative bg-white rounded-3xl p-7 w-full max-w-sm max-h-[85vh] shadow-2xl flex flex-col items-center text-center gap-3.5 transform transition-all zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botón cerrar */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
        >
          <X className="size-6" />
        </button>

        {/* Ícono */}
        <div className="bg-maya-cream rounded-full p-4 shrink-0">
          <HelpCircle className="size-10 text-dark-gold" />
        </div>

        {/* Título */}
        <p id="help-modal-title" className="mb-1 text-2xl font-extrabold text-dark-brown shrink-0">
          ¿Cómo jugar?
        </p>

        {/* Pasos */}
        <ul className="flex flex-col gap-4 w-full overflow-y-auto text-left pr-1">
          {INSTRUCCIONES.map(({ icon: Icon, titulo, texto }) => (
            <li key={titulo} className="flex items-start gap-3">
              <div className="bg-maya-cream rounded-full p-2 shrink-0">
                <Icon className="size-5 text-dark-gold" />
              </div>
              <div>
                <p className="font-bold text-dark-brown leading-tight">{titulo}</p>
                <p className="text-gray-500 text-sm mt-0.5">{texto}</p>
              </div>
            </li>
          ))}
        </ul>

        {/* Botón */}
        <button
          type="button"
          onClick={onClose}
          className="w-full mt-2 shrink-0 bg-dark-gold text-white font-bold text-md rounded-2xl py-3 shadow-[0_4px_0_#7A5000] active:shadow-[0_2px_0_#7A5000] active:translate-y-1 transition-all cursor-pointer"
        >
          ENTENDIDO
        </button>
      </div>
    </div>
  )
}

export default HelpModal