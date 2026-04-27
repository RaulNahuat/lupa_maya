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
    <nav className="flex-shrink-0 bg-white border-t border-gray-100 px-6 py-4 flex items-center justify-between">
      <button
        onClick={() => navigate("/map")}
        className="flex flex-col items-center gap-1 text-dark-gold"
      >
        <Map size={24} />
        <span className="text-md font-bold">Camino</span>
      </button>

      <button
        onClick={() => nivelActual && navigate(`/level/${nivelActual.id}`)}
        className="w-20 h-20 -mt-8 rounded-full bg-dark-gold border-4 border-amber-50 flex items-center justify-center"
        style={{ boxShadow: "0 4px 0 #92400e" }}
      >
        <Play size={32} className="text-white fill-white ml-0.5" />
      </button>

      <button
        onClick={() => navigate("/rewards")}
        className="flex flex-col items-center gap-1 text-gray-400"
      >
        <Award size={24} />
        <span className="text-md font-bold">Logros</span>
      </button>
    </nav>
  )
}