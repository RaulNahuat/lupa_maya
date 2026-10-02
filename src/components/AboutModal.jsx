import { X, Info, Code, Palette, BookOpen } from "lucide-react"

const CREDITOS = [
  {
    icon: Code,
    titulo: "Desarrolladores",
    texto: "Br. Manuel Enrique Cupul May\nBr. Raúl Ismael Batun Nahuat",
  },
  {
    icon: BookOpen,
    titulo: "Asesores",
    texto: "Dr. Michel García García\nDra. Cinhtia Maribel Gonzales Segura",
  },
  {
    icon: Palette,
    titulo: "Agradecimientos",
    texto: "Proyecto desarrollado para facilitar el aprendizaje y la difusión de la lectoescritura de los glifos mayas.",
  }
]

const AboutModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="about-modal-title"
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
          <Info className="size-10 text-dark-gold" />
        </div>

        {/* Título */}
        <p id="about-modal-title" className="mb-1 text-2xl font-extrabold text-dark-brown shrink-0">
          Acerca de
        </p>
        
        <p className="text-sm text-gray-500 mb-2">
          Glifo Aventura v1.0
        </p>

        {/* Pasos */}
        <ul className="flex flex-col gap-4 w-full overflow-y-auto text-left pr-1">
          {CREDITOS.map(({ icon: Icon, titulo, texto }) => (
            <li key={titulo} className="flex items-start gap-3">
              <div className="bg-maya-cream rounded-full p-2 shrink-0">
                <Icon className="size-5 text-dark-gold" />
              </div>
              <div>
                <p className="font-bold text-dark-brown leading-tight">{titulo}</p>
                <p className="text-gray-500 text-sm mt-0.5 whitespace-pre-line">{texto}</p>
              </div>
            </li>
          ))}
        </ul>

        {/* Botón */}
        <button
          type="button"
          onClick={onClose}
          className="w-full mt-4 shrink-0 bg-dark-gold text-white font-bold text-md rounded-2xl py-3 shadow-[0_4px_0_#7A5000] active:shadow-[0_2px_0_#7A5000] active:translate-y-1 transition-all cursor-pointer"
        >
          CERRAR
        </button>
      </div>
    </div>
  )
}

export default AboutModal
