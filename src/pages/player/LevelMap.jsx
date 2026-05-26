import { useEffect, useState, useRef } from "react"
import { useAuth } from "../../context/AuthContext"
import { useGameStore } from "../../store/game/useGameStore"
import { useNavigate } from "react-router-dom"
import LevelNode from "../../components/game/LevelNode"
import ModalConfirmation from "../../components/ModalConfirmation"
import BottomNav from "../../components/game/BottomNav"
import { ensureActiveAiModelCached } from "../../services/recognition/aiModelCacheService"
import { CircleUserRound, Play, Flame, Star, LogOut } from "lucide-react"

export default function LevelMap() {
  const levels = useGameStore((s) => s.levels)
  const initLevels = useGameStore((s) => s.initLevels)
  const syncAndReload = useGameStore((s) => s.syncAndReload)
  const syncReady = useGameStore((s) => s.syncReady)

  const { currentUser, logoutUser } = useAuth()
  const navigate = useNavigate()

  const [activeLevel, setActiveLevel] = useState(null)
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  const scrollRef = useRef(null)

  useEffect(() => {
    if (!currentUser) return

    // Cargar desde Dexie inmediatamente con lo que haya disponible
    // para que el mapa no quede en blanco mientras espera el sync.
    initLevels(currentUser)

    // Sync en paralelo — cuando termine recarga los niveles automáticamente
    // con el contenido actualizado del servidor.
    syncAndReload(currentUser)

    // Precarga el modelo activo en el navegador para poder usarlo sin internet.
    ensureActiveAiModelCached().catch((error) => {
      console.warn('No se pudo preparar el modelo de IA en caché:', error)
    })

  }, [currentUser])

  // Scroll automático al nivel actual
  useEffect(() => {
    if (levels.length > 0 && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [levels])

  if (!currentUser) {
    return <p className="text-center mt-10 text-gray-400">Cargando usuario...</p>
  }

  // Spinner solo si no hay niveles en Dexie Y el sync aún no terminó
  if (levels.length === 0 && !syncReady) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-amber-50">
        <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400 text-sm">Cargando niveles...</p>
      </div>
    )
  }

  // Sync terminó pero Dexie sigue vacío — no hay niveles configurados
  if (levels.length === 0 && syncReady) {
    return (
      <p className="text-center mt-10 text-black">
        No hay niveles disponibles aún.
      </p>
    )
  }

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
        <header className="shrink-0 bg-white border-b-2 border-gray-200 px-5 py-5 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowLogoutModal(true)}
              className="w-12 h-12 rounded-full flex items-center justify-center transition-colors hover:bg-amber-200 active:scale-95"
              title="Cerrar sesión"
            >
              <CircleUserRound strokeWidth={1} size={60} className="text-dark-gold" />
            </button>

            <div>
              <p className="font-bold text-black leading-tight text-lg">
                {currentUser.nombre}
              </p>
              <p className="text-dark-gold font-medium text-sm">
                Nivel {nivelActual.numero ?? nivelActual.id}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* TODO: implementar lógica de racha */}
            <div className="flex items-center gap-1 bg-orange-50 border border-orange rounded-full px-3 py-1.5">
              <Flame size={16} className="text-orange" />
              <span className="text-sm font-bold text-gray-700">—</span>
            </div>

            <div className="flex items-center gap-1 bg-green-50 border border-green-200 rounded-full px-3 py-1.5">
              <Star size={16} className="text-light-green" />
              <span className="text-sm font-bold text-light-green">{totalEstrellas}</span>
            </div>
          </div>
        </header>

        {/* Indicador sutil de sync en curso — desaparece cuando termina */}
        {!syncReady && (
          <div className="flex-shrink-0 bg-amber-100 text-amber-700 text-xs text-center py-1">
            Sincronizando contenido...
          </div>
        )}

        {/* MAPA */}
        <div className="flex-1 overflow-y-auto py-6" ref={scrollRef}>
          <div className="flex flex-col gap-8">
            {[...levels].reverse().map((level) => {
              const isCurrentActive = activeLevel?.id === level.id
              const pos = level.orden_secuencia % 3

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
                      <p className="text-xl font-extrabold text-brown uppercase">
                        Nivel {level.numero ?? level.id}
                      </p>
                      <div className="w-full rounded-xl p-[2px]">
                        <button
                          onClick={() => navigate(`/level/${level.id}`)}
                          className="w-full bg-dark-gold text-white text-md font-bold rounded-xl py-2 px-6 flex items-center justify-center gap-2 shadow-[0_4px_0_#7A5000]"
                        >
                          <Play size={18} className="fill-white" />
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