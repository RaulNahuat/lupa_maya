import { Map, Play, Award } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useGameStore } from "../../store/game/useGameStore"

export default function BottomNav() {
  const navigate = useNavigate()
  const levels = useGameStore((s) => s.levels)
  const nivelActual =
    levels.find((l) => l.desbloqueado && !l.completado) ??
    levels[levels.length - 1]

  return (
    <nav className="relative z-20 shrink-0 bg-white border-t border-gray-200 rounded-t-3xl px-7 py-4 flex items-center justify-between shadow-xs">
      <button
        onClick={() => navigate("/map")}
        className="flex flex-col items-center gap-1 text-dark-gold"
      >
        <Map size={24} />
        <span className="text-sm font-bold">Camino</span>
      </button>

      <button
        onClick={() => nivelActual && navigate(`/level/${nivelActual.id}`)}
        className="w-22 h-22 -mt-12 rounded-full bg-dark-gold border-4 border-amber-50 flex items-center justify-center"
        style={{ boxShadow: "0 6px 0 #C88F12" }}
      >
        <Play size={36} className="text-white fill-white ml-0.5" />
      </button>

      <button
        onClick={() => navigate("/rewards")}
        className="flex flex-col items-center gap-1 text-gray-400"
      >
        <Award size={24} />
        <span className="text-sm font-bold">Logros</span>
      </button>
    </nav>
  )
}