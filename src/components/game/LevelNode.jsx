import { Lock, Star, Brain, Search, ScanLine } from "lucide-react"

export default function LevelNode({ level, onClick, isActive }) {
  const Icon = level.tipo === "BUSQUEDA" ? ScanLine : Brain

  // Bloqueado
  if (!level.desbloqueado) {
    return (
      <button disabled className="flex flex-col items-center cursor-not-allowed">
        <div
          className="w-22 h-22 rounded-full bg-light-gray flex items-center justify-center"
          style={{ boxShadow: "0 7px 0 #6B7280" }}
        >
          <Lock size={34} className="text-white" />
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
          className="w-22 h-22 rounded-full bg-light-green flex items-center justify-center"
          style={{ boxShadow: "0 7px 0 #064E3B" }}
        >
          <Icon size={38} className="text-white" strokeWidth={2} />
        </div>
        <div className="bg-white rounded-full -mt-3 px-3 py-1 flex gap-1 shadow-sm border border-light-gray">
          {[1, 2, 3].map((s) => (
            <Star
              key={s}
              size={13}
              className={
                s <= stars
                  ? "text-yellow fill-yellow"
                  : "text-gray fill-gray"
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
        className="w-22 h-22 rounded-full bg-yellow flex items-center justify-center border-4 border-white"
        style={{ boxShadow: "0 7px 0 #C88F12" }}
      >
        <Icon size={38} className="text-white" strokeWidth={2} />
      </div>
    </button>
  )
}