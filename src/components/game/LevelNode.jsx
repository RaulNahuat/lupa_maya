import { Lock, Star, Brain, Search, ScanLine } from "lucide-react"

export default function LevelNode({ level, onClick, isActive, isCurrent }) {
  const Icon = level.tipo === "BUSQUEDA" ? ScanLine : Brain

  const colorPrincipal = level.grupo?.color ?? '#16A34A'
  const shadowColor = darkenHex(colorPrincipal, 0.4)

  // Bloqueado
  if (!level.desbloqueado) {
    return (
      <button disabled className="flex flex-col items-center cursor-not-allowed">
        <div
          className="w-21 h-21 rounded-full bg-light-gray flex items-center justify-center border-3 border-white"
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
          className="w-21 h-21 rounded-full flex items-center justify-center border-3 border-white"
          style={{
            backgroundColor: colorPrincipal,
            boxShadow: `0 7px 0 ${shadowColor}`,
          }}
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
      className="flex flex-col items-center gap-1.5"
      style={{ animation: "levelPulse 1.8s ease-in-out infinite" }}
    >
      <div className="relative flex items-center justify-center">

        {/* Aro parpadeante*/}
        {isCurrent && (
          <span
            className="absolute inset-0 rounded-full animate-ping-slow opacity-60"
            style={{ backgroundColor: colorPrincipal }}
          />
        )}

        <div
          className="relative w-21 h-21 rounded-full flex items-center justify-center border-3 border-white"
          style={{
            backgroundColor: colorPrincipal,
            boxShadow: `0 7px 0 ${shadowColor}`,
          }}
        >
          <Icon size={38} className="text-white" strokeWidth={2} />
        </div>
      </div>
    </button>
  )
}

function darkenHex(hex, amount) {
  const clean = hex.replace('#', '')
  const r = Math.round(parseInt(clean.substring(0, 2), 16) * (1 - amount))
  const g = Math.round(parseInt(clean.substring(2, 4), 16) * (1 - amount))
  const b = Math.round(parseInt(clean.substring(4, 6), 16) * (1 - amount))
  return `rgb(${r}, ${g}, ${b})`
}