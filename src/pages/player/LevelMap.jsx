import { useEffect, useState, useRef } from "react"
import { useAuth } from "../../context/AuthContext"
import { useGameStore } from "../../store/game/useGameStore"
import { useNavigate } from "react-router-dom"
import LevelNode from "../../components/game/LevelNode"
import ModalConfirmation from "../../components/ModalConfirmation"
import BottomNav from "../../components/game/BottomNav"
import { ensureActiveAiModelCached } from "../../services/recognition/aiModelCacheService"
import { useToast } from '../../context/ToastContext';
import { procesarColaSincronizacion } from "../../services/syncService"
import { CircleUserRound, Play, Flame, Star, LogOut, MoreVertical, Camera, CameraOff, RefreshCw } from "lucide-react"

export default function LevelMap() {
  const levels = useGameStore((s) => s.levels)
  const initLevels = useGameStore((s) => s.initLevels)
  const syncAndReload = useGameStore((s) => s.syncAndReload)
  const syncReady = useGameStore((s) => s.syncReady)
  const racha = useGameStore((s) => s.racha)
  const modoSinCamara = useGameStore((s) => s.modoSinCamara)
  const toggleModoSinCamara = useGameStore((s) => s.toggleModoSinCamara)

  const { currentUser, logoutUser } = useAuth()
  const navigate = useNavigate()

  const [activeLevel, setActiveLevel] = useState(null)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [cameraTapExpanded , setCameraTapExpanded] = useState(false)

  const scrollRef = useRef(null)
  const currentNodeRef = useRef(null) 

  const { showToast } = useToast()

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
    if (levels.length > 0 && currentNodeRef.current) {
      currentNodeRef.current.scrollIntoView({ behavior: 'smooth', block: 'center'})
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

  const numeroNivelJugador = levels.filter((l) => l.completado).length + 1

  const totalEstrellas = levels.reduce((sum, l) => sum + (l.estrellas ?? 0), 0)

  const handleNodeClick = (level) => {
    if (!level.desbloqueado) return
    setActiveLevel(activeLevel?.id === level.id ? null : level)
  }

  const handleToggleCamara = () => {
    const nuevoModo = !modoSinCamara
    toggleModoSinCamara()
    showToast(
      nuevoModo ? 'Modo sin cámara' : 'Modo con cámara',
      nuevoModo 
        ? 'Los niveles de búsqueda serán de selección de imagen.' 
        : 'Los niveles de búsqueda requerirán la cámara para escanear.',
      'info'
    )
  }

  const handleManualSync = async () => {
    setShowMenu(false)
    if (isSyncing) return
    setIsSyncing(true)
    try {
      await procesarColaSincronizacion(currentUser.local_id)
      await initLevels(currentUser)
      showToast('Contenido actualizado', 'Los niveles y datos están al día.', 'success')
    } catch (e) {
      showToast('Error al actualizar', 'No se pudo conectar con el servidor.', 'error')
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <div className="md:min-h-screen md:bg-gray-700 md:flex md:items-center md:justify-center">
      <div className="w-full md:w-[390px] md:max-h-[844px] h-screen flex flex-col bg-amber-50 md:overflow-hidden md:rounded-3xl md:shadow-2xl">

        {/* HEADER */}
        <header className="shrink-0 bg-white border-b-2 border-gray-200 px-5 py-5 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CircleUserRound strokeWidth={1} size={46} className="text-dark-gold" />
            <div>
              <p className="font-bold text-black leading-tight text-lg">
                {currentUser.username}
              </p>
              <p className="text-dark-gold font-medium text-sm">
                Nivel {numeroNivelJugador}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-orange-50 border border-orange rounded-full px-3 py-1.5">
              <Flame size={16} className="text-orange" />
              <span className="text-sm font-bold text-orange">{racha}</span>
            </div>

            <div className="flex items-center gap-1 bg-green-50 border border-green-200 rounded-full px-3 py-1.5">
              <Star size={16} className="text-light-green" />
              <span className="text-sm font-bold text-light-green">{totalEstrellas}</span>
            </div>

            <div className="h-8 w-px bg-gray-200 mx-1"></div>

            {/* Menú de opciones */}
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="w-9 h-9 rounded-full flex items-center justify-center border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 transition-all"
              >
                <MoreVertical size={18} />
              </button>

              {showMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-1 z-20">
                    <button
                      onClick={handleManualSync}
                      disabled={isSyncing}
                      className="w-full flex items-center gap-2.5 px-4 py-3 text-sm font-bold text-maya-dark hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      <RefreshCw
                        size={16}
                        className={`shrink-0 text-gray-400 ${isSyncing ? 'animate-spin' : ''}`}
                      />
                      <span className="whitespace-nowrap">
                        {isSyncing ? 'Actualizando...' : 'Actualizar contenido'}
                      </span>
                    </button>
                    <div className="mx-4 h-px bg-gray-100" />
                    <button
                      onClick={() => {
                        setShowMenu(false)
                        setShowLogoutModal(true)
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-3 text-sm font-bold text-maya-dark hover:bg-gray-50 transition-colors"
                    >
                      <LogOut size={16} className="shrink-0 text-gray-400" />
                      <span className="whitespace-nowrap">Cerrar sesión</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Indicador sutil de sync en curso — desaparece cuando termina */}
        {!syncReady && (
          <div className="shrink-0 bg-amber-100 text-amber-700 text-xs text-center py-1">
            Sincronizando contenido...
          </div>
        )}

        {/* Botón modo cámara */}
        <div className="relative">
          <button
            onClick={handleToggleCamara}
            className={`absolute top-10 right-0 z-20 flex items-center shadow-lg px-3 py-2.5 border transition-all ${
              modoSinCamara
                ? 'bg-maya-dark border-maya-dark text-white'
                : 'bg-white border-gray-300 text-gray-400'
            } rounded-l-2xl overflow-hidden`}
            title={modoSinCamara ? 'Modo sin cámara activo' : 'Activar modo sin cámara'}
          >
            {modoSinCamara ? <CameraOff size={18} /> : <Camera size={18} />}
          </button>
        </div>

        {/* MAPA */}
        <div className="flex-1 overflow-y-auto py-6" ref={scrollRef}>
          <div className="flex flex-col gap-8">
            {levels.map((level, index) => {
              const isCurrentActive = activeLevel?.id === level.id
              const isCurrent = level.id === nivelActual.id
              const pos = index % 4

              const alignment =
                pos === 1 ? "items-center"
                : pos === 2 ? "items-start pl-18"
                : pos === 3 ? "items-center"
                : "items-end pr-18"

              // Mostrar separador de categoría cuando cambia el grupo
              const nivelAnterior = levels[index - 1]
              const cambiaCategoria =
                level.grupo_id &&
                (!nivelAnterior || nivelAnterior.grupo_id !== level.grupo_id)

              return (
                <div key={level.id} className="flex flex-col gap-8">

                  {/* Separador de categoría*/}
                  {cambiaCategoria && level.grupo && (
                    <div className="flex items-center gap-2 px-6 mt-5 mb-2">
                      <div 
                        className="flex-1 h-px rounded-full opacity-60" 
                        style={{ backgroundColor: level.grupo.color ?? '#16A34A' }}
                      />
                      <div
                        className="flex items-center gap-1.5 px-10 py-1 rounded-full text-white text-md font-bold tracking-wider"
                        style={{ backgroundColor: level.grupo.color ?? '#16A34A'}}
                      >
                        {level.grupo.nombre}
                      </div>
                      <div 
                        className="flex-1 h-px rounded-full opacity-60" 
                        style={{ backgroundColor: level.grupo.color ?? '#16A34A' }}
                      />
                    </div>
                  )}

                  {/* Nodo */}
                  <div
                    className={`w-full flex flex-col ${alignment}`}
                    ref={isCurrent ? currentNodeRef : null}
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
                      isCurrent={isCurrent}
                    />
                  </div>
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