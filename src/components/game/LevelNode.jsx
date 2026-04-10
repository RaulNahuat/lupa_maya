import { Lock, Star } from "lucide-react"

export default function LevelNode({ level, onClick, isActive }) {
  // Nodo bloqueado
  if (!level.desbloqueado) {
    return (
      <button disabled className="flex flex-col items-center cursor-not-allowed">
        <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center shadow-md">
          <Lock size={24} className="text-white" />
        </div>
      </button>
    )
  }

  // Nodo completado
  if (level.completado) {
    const stars = level.estrellas ?? 3
    return (
      <button onClick={onClick} className="flex flex-col items-center gap-1 hover:scale-105 transition-transform duration-200">
        <div className="w-16 h-16 rounded-full bg-green-600 flex items-center justify-center shadow-md relative">
          <Star size={26} className="text-white fill-white" />
          {/* Borde inferior decorativo */}
          <div className="absolute -bottom-1 w-14 h-3 rounded-full bg-green-800 -z-10" />
        </div>
        {/* Estrellas del nivel */}
        <div className="bg-white rounded-full px-2 py-0.5 flex gap-0.5 shadow-sm border border-gray-100 -mt-1">
          {[1, 2, 3].map((s) => (
            <Star
              key={s}
              size={12}
              className={s <= stars ? "text-amber-400 fill-amber-400" : "text-gray-300 fill-gray-200"}
            />
          ))}
        </div>
      </button>
    )
  }

  // Nodo activo (desbloqueado, no completado)
  return (
    <button onClick={onClick} className="flex flex-col items-center hover:scale-105 transition-transform duration-200">
      <div className="w-16 h-16 rounded-full bg-amber-500 flex items-center justify-center shadow-md relative">
        <Star size={26} className="text-white fill-white" />
        {/* Borde inferior decorativo */}
        <div className="absolute -bottom-1 w-14 h-3 rounded-full bg-amber-700 -z-10" />
      </div>
    </button>
  )
}