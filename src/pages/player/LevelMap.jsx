import { useEffect, useState, useRef } from "react"
import { useAuth } from "../../context/AuthContext"
import { useGameStore } from "../../store/game/useGameStore"
import { useNavigate } from "react-router-dom"
import LevelNode from "../../components/game/LevelNode"
import ModalConfirmation from "../../components/ModalConfirmation"
import BottomNav from "../../components/game/BottomNav"
import { Map, Play, Award, Flame, Star, User, LogOut } from "lucide-react"

export default function LevelMap() {
  const levels = useGameStore((s) => s.levels)
  const initLevels = useGameStore((s) => s.initLevels)
  const { currentUser, logoutUser } = useAuth()
  const navigate = useNavigate()

  const [activeLevel, setActiveLevel] = useState(null)
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  const scrollRef = useRef(null)

  useEffect(() => {
    if (currentUser) {
      initLevels(currentUser)
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
    <div className="md:min-h-screen md:bg-gray-600 md:flex md:items-center md:justify-center">
      <div className="w-full md:w-[390px] md:max-h-[844px] min-h-screen flex flex-col bg-amber-50 md:overflow-hidden md:rounded-3xl md:shadow-2xl">

        {/* HEADER */}
        <header className="shrink-0 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowLogoutModal(true)}
              className="w-10 h-10 rounded-full bg-amber-100 border-2 border-amber-400 flex items-center justify-center transition-colors hover:bg-amber-200 active:scale-95"
              title="Cerrar sesión"
            >
              <LogOut size={18} className="text-amber-600 ml-0.5" />
            </button>

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
        <div className="flex-1 overflow-y-auto py-6" ref={scrollRef}>
          <div className="flex flex-col gap-8">
            {[...levels].reverse().map((level) => {
              const isCurrentActive = activeLevel?.id === level.id
              const pos = level.orden_secuencia % 3

              // Posición zigzag centrado: izquierda / centro / derecha
              const alignment =
                pos === 1 ? "items-start pl-20"
                : pos === 2 ? "items-center"
                : "items-end pr-20"

              return (
                <div
                  key={level.id}
                  className={`w-full flex flex-col ${alignment}`}
                >
                  {isCurrentActive && (
                    <div className="mb-2 bg-white rounded-2xl shadow-lg p-4 w-44 flex flex-col items-center gap-3">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                        Nivel {level.numero ?? level.id}
                      </p>
                      <p className="text-xl font-extrabold text-gray-800 text-center">
                        {level.nombre ?? level.name}
                      </p>
                      <div className="w-full bg-amber-800 rounded-full p-[3px]">
                        <button
                          onClick={() => navigate(`/level/${level.id}`)}
                          className="w-full bg-amber-500 text-white font-bold rounded-full py-2 px-4 flex items-center justify-center gap-2"
                        >
                          <Play size={13} className="fill-white" />
                          {level.completado ? "REPETIR" : "INICIAR"}
                        </button>
                      </div>
                    </div>
                  )}

                  {isCurrentActive && (
                    <div
                      className="w-0 h-0 mb-1.5"
                      style={{
                        borderLeft: "10px solid transparent",
                        borderRight: "10px solid transparent",
                        borderTop: "12px solid #e5e7eb",
                      }}
                    />
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

        <BottomNav className="shrink-0" />

        {/* MODAL DE CERRAR SESIÓN */}
        <ModalConfirmation 
          isOpen={showLogoutModal}
          title="¿Ya te vas?"
          message="Se cerrará tu sesión, pero tu progreso está guardado."
          confirmText="Cerrar sesión"
          cancelText="Seguir jugando"
          onConfirm={() => {
            logoutUser()
            navigate('/login')
          }}
          onCancel={() => setShowLogoutModal(false)}
        />
      </div>
    </div>
  )
}