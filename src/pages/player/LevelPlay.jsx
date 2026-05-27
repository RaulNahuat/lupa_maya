import { useParams, useNavigate } from "react-router-dom"
import { useGameStore } from "../../store/game/useGameStore"
import { useAuth } from "../../context/AuthContext"
import QuizLevel from "../../components/game/QuizLevel"
import ScanLevel from "../../components/game/ScanLevel"
import { useState } from "react"
import BadgeUnlockModal from "../../components/game/BadgeUnlockModal"
import { checkBadgeUnlock } from "../../services/player/badgeUnlockService"

export default function LevelPlay() {
  const { id } = useParams()
  const navigate = useNavigate()

  const levels = useGameStore((s) => s.levels)
  const completeLevel = useGameStore((s) => s.completeLevel)
  const racha = useGameStore((s) => s.racha)
  const { currentUser } = useAuth()

  const [unlockedBadge, setUnlockedBadge] = useState(null)

  const handleCompleteLevel = async (nivelId, estrellas, intentos) => {
    try {
      //Obtiene el estado de los niveles antes de completar
      const freshLevelsBefore = useGameStore.getState().levels
      const rachaBefore = racha

      //Completa el nivel
      await completeLevel(currentUser, nivelId, estrellas, intentos)

      //Obtiene el estado de los niveles después de completar
      const freshLevelsAfter = useGameStore.getState().levels
      const updatedRacha = useGameStore.getState().racha

      //Delegar la verificación del desbloqueo al servicio aislado
      const newlyUnlockedBadge = await checkBadgeUnlock({
        rachaBefore,
        levelsBefore: freshLevelsBefore,
        freshLevelsAfter,
        updatedRacha,
      })

      if (newlyUnlockedBadge) {
        setUnlockedBadge(newlyUnlockedBadge)
      } else {
        navigate("/map")
      }
    } catch (error) {
      console.error("Error al verificar insignias desbloqueadas:", error)
      navigate("/map")
    }
  }

  const level = levels.find((l) => l.id === Number(id))

  if (!level) return <p className="text-center mt-10">Cargando...</p>

  if (!level.contenido) {
    return (
      <p className="text-center mt-10 text-red-500">
        Este nivel aun no tiene contenido configurado.
      </p>
    )
  }

  return (
    <div className="relative">
      {level.tipo === "APRENDIZAJE" && (
        <QuizLevel level={level} onComplete={handleCompleteLevel} />
      )}

      {level.tipo === "BUSQUEDA" && (
        <ScanLevel level={level} onComplete={handleCompleteLevel} />
      )}

      {level.tipo !== "APRENDIZAJE" && level.tipo !== "BUSQUEDA" && (
        <p className="text-center mt-10">
          Tipo de nivel no reconocido: {level.tipo}
        </p>
      )}

      {/*Modal de la insgnia desbloqueada*/}
      <BadgeUnlockModal
        badge={unlockedBadge}
        onClose={() => {
          setUnlockedBadge(null)
          navigate("/map")
        }}
      />
    </div>
  )
}