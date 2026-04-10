import { useEffect, useState, useRef } from "react"
import { useGameStore } from "../../store/game/useGameStore"
import { useNavigate } from "react-router-dom"
import LevelNode from "../../components/game/LevelNode"
import { Map, Play, Award, Flame, Star, User } from "lucide-react"

export default function LevelMap() {
  const levels = useGameStore((s) => s.levels)
  const initLevels = useGameStore((s) => s.initLevels)
  const currentUser = useGameStore((s) => s.currentUser)
  const navigate = useNavigate()

  const [activeLevel, setActiveLevel] = useState(null)

  const scrollRef = useRef(null)

  useEffect(() => {
    if (currentUser) {
      initLevels()
    }
  }, [currentUser, initLevels])

  // Scroll automático al nivel actual
  useEffect(() => {
    if (levels.length > 0 && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [levels])

  if (!currentUser) {
    return <p className="text-center mt-10 text-gray-400">Cargando usuario...</p>
  }

  if (levels.length === 0) {
    return <p className="text-center mt-10 text-gray-400">Cargando niveles...</p>
  }

  // Primer nivel desbloqueado que no ha sido completado (nivel actual)
  // Si todos están completados, mostrar el último
  const nivelActual =
    levels.find((l) => l.desbloqueado && !l.completado) ??
    levels[levels.length - 1]

  const totalEstrellas = levels.reduce((sum, l) => sum + (l.estrellas ?? 0), 0)

  const handleNodeClick = (level) => {
    if (!level.desbloqueado) return
    setActiveLevel(activeLevel?.id === level.id ? null : level)
  }

  return (
    <div className="min-h-screen flex flex-col bg-amber-50">

      {/* HEADER */}
      <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-100 border-2 border-amber-400 flex items-center justify-center">
            <User size={20} className="text-amber-600" />
          </div>

          <div>
            <p className="font-bold text-gray-800 leading-tight">
              {currentUser.nombre}
            </p>

            <p className="text-xs text-amber-600 font-medium">
              Nivel {nivelActual.numero ?? nivelActual.id}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* TODO: implementar lógica de racha cuando esté disponible */}
          <div className="flex items-center gap-1 bg-orange-50 border border-orange-200 rounded-full px-3 py-1">
            <Flame size={16} className="text-orange-500" />
            <span className="text-sm font-bold text-gray-700">—</span>
          </div>

          <div className="flex items-center gap-1 bg-green-50 border border-green-200 rounded-full px-3 py-1">
            <Star size={16} className="text-green-500" />
            <span className="text-sm font-bold text-gray-700">{totalEstrellas}</span>
          </div>
        </div>
      </header>

      {/* MAPA */}
      <div className="flex-1 overflow-y-auto py-8" ref={scrollRef}>
        <div className="flex flex-col gap-8">
          {[...levels].reverse().map((level) => {
            const isCurrentActive = activeLevel?.id === level.id
            const isLeft = level.orden_secuencia % 2 !== 0

            return (
              <div
                key={level.id}
                className={`w-full flex flex-col ${
                  isLeft ? "items-start pl-10" : "items-end pr-10"
                }`}
              >
                {/* Popup al seleccionar un nodo */}
                {isCurrentActive && (
                  <div className="mb-2 bg-white rounded-2xl shadow-lg p-4 w-48 flex flex-col items-center gap-3">
                    <p className="text-xs font-bold text-gray-400 uppercase">
                      Nivel {level.numero ?? level.id}
                    </p>

                    <p className="text-xl font-extrabold text-gray-800 text-center">
                      {level.nombre ?? level.name}
                    </p>

                    <button
                      onClick={() => navigate(`/level/${level.id}`)}
                      className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-full py-2 px-4 flex items-center justify-center gap-2 shadow-md"
                    >
                      <Play size={14} className="fill-white" />
                      {level.completado ? "REPETIR" : "INICIAR"}
                    </button>
                  </div>
                )}

                <LevelNode
                  level={level}
                  onClick={() => handleNodeClick(level)}
                  isActive={isCurrentActive}
                />
              </div>
            )
          })}
        </div>
      </div>

      {/* BOTTOM NAV */}
      <nav className="bg-white border-t border-gray-100 px-6 py-2 flex items-center justify-between">
        <button className="flex flex-col items-center gap-1 text-amber-500">
          <Map size={22} />
          <span className="text-xs font-bold">Camino</span>
        </button>

        <button
          onClick={() => navigate("/scan")}
          className="w-14 h-14 -mt-6 rounded-full bg-amber-500 border-4 border-amber-50 flex items-center justify-center shadow-lg"
        >
          <Play size={22} className="text-white fill-white ml-0.5" />
        </button>

        <button
          onClick={() => navigate("/rewards")}
          className="flex flex-col items-center gap-1 text-gray-400"
        >
          <Award size={22} />
          <span className="text-xs font-medium">Logros</span>
        </button>
      </nav>
    </div>
  )
}