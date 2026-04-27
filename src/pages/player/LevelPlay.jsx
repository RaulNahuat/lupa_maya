import { useParams, useNavigate } from "react-router-dom"
import { useGameStore } from "../../store/game/useGameStore"
import { useAuth } from "../../context/AuthContext"
import QuizLevel from "../../components/game/QuizLevel"
import ScanLevel from "../../components/game/ScanLevel"

export default function LevelPlay() {
  const { id } = useParams()

  const levels = useGameStore((s) => s.levels)
  const completeLevel = useGameStore((s) => s.completeLevel)
  const { currentUser } = useAuth()

  const handleCompleteLevel = async (nivelId, estrellas, intentos) => {
    await completeLevel(currentUser, nivelId, estrellas, intentos)
  }

  const level = levels.find((l) => l.id === Number(id))

  if (!level) return <p className="text-center mt-10">Cargando...</p>

  console.log("contenido del nivel:", level.contenido)
  if (!level.contenido) {
    return (
      <p className="text-center mt-10 text-red-500">
        Este nivel aun no tiene contenido configurado.
      </p>
    )
  }

  if (level.tipo === "APRENDIZAJE") {
    return <QuizLevel level={level} onComplete={handleCompleteLevel} />
  }

  if (level.tipo === "BUSQUEDA") {
    return <ScanLevel level={level} onComplete={handleCompleteLevel} />
  }

  return (
    <p className="text-center mt-10">
      Tipo de nivel no reconocido: {level.tipo}
    </p>
  )
}