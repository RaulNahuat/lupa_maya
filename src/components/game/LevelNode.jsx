import { Lock, Star, Brain, Search } from "lucide-react"

export default function LevelNode({ level, onClick, isActive }) {
  const Icon = level.tipo === "BUSQUEDA" ? Search : Brain

  // Bloqueado
  if (!level.desbloqueado) {
    return (
      <button disabled className="flex flex-col items-center cursor-not-allowed">
        <div
          className="w-20 h-20 rounded-full bg-gray-300 flex items-center justify-center"
          style={{ boxShadow: "0 6px 0 #9ca3af" }}
        >
          <Lock size={28} className="text-white" />
        </div>
      </button>
    )
  }

  // Desbloqueado y completado
  if (level.completado) {
    const stars = level.estrellas ?? 3
    return (
      <button
        onClick={onClick}
        className="flex flex-col items-center gap-1.5 hover:scale-105 transition-transform duration-200"
      >
        <div
          className="w-20 h-20 rounded-full bg-green-700 flex items-center justify-center"
          style={{ boxShadow: "0 6px 0 #14532d" }}
        >
          <Icon size={30} className="text-white" strokeWidth={2} />
        </div>
        <div className="bg-white rounded-full px-2 py-0.5 flex gap-1 shadow-sm border border-gray-100">
          {[1, 2, 3].map((s) => (
            <Star
              key={s}
              size={13}
              className={
                s <= stars
                  ? "text-amber-400 fill-amber-400"
                  : "text-gray-300 fill-gray-200"
              }
            />
          ))}
        </div>
      </button>
    )
  }

  // Desbloqueado pero no completado
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center"
      style={{ animation: "levelPulse 1.8s ease-in-out infinite" }}
    >
      <div
        className="w-20 h-20 rounded-full bg-amber-500 flex items-center justify-center"
        style={{ boxShadow: "0 6px 0 #92400e" }}
      >
        <Icon size={30} className="text-white" strokeWidth={2} />
      </div>
    </button>
  )
}