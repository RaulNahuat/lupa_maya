import { useParams, useNavigate } from "react-router-dom"
import { useGameStore } from "../../store/game/useGameStore"
import { useAuth } from "../../context/AuthContext"
import QuizLevel from "../../components/game/QuizLevel"
import ScanLevel from "../../components/game/ScanLevel"
import GlyphPickLevel from "../../components/game/GlyphPickLevel"
import { useState } from "react"
import BadgeUnlockModal from "../../components/game/BadgeUnlockModal"
import { checkBadgeUnlock } from "../../services/player/badgeUnlockService"
import { db } from "../../data/db"
import { procesarColaSincronizacion } from "../../services/syncService"

export default function LevelPlay() {
  const { id } = useParams()
  const navigate = useNavigate()

  const levels = useGameStore((s) => s.levels)
  const completeLevel = useGameStore((s) => s.completeLevel)
  const racha = useGameStore((s) => s.racha)
  const cameralessMode = useGameStore((s) => s.modoSinCamara)
  const { currentUser } = useAuth()

  const [unlockedBadge, setUnlockedBadge] = useState(null)

  const handleCompleteLevel = async (nivelId, estrellas, intentos, aprobado) => {
    try {
      //Obtiene el estado de los niveles antes de completar
      const freshLevelsBefore = useGameStore.getState().levels
      const rachaBefore = useGameStore.getState().racha
      const rachaEscaneosBefore = useGameStore.getState().racha_escaneos

      //Completa el nivel
      await completeLevel(currentUser, nivelId, estrellas, intentos, aprobado)

      //Obtiene el estado de los niveles después de completar
      const freshLevelsAfter = useGameStore.getState().levels
      const updatedRacha = useGameStore.getState().racha
      const updatedRachaEscaneos = useGameStore.getState().racha_escaneos

      //Delegar la verificación del desbloqueo al servicio aislado
      const newlyUnlockedBadges = await checkBadgeUnlock({
        rachaBefore,
        levelsBefore: freshLevelsBefore,
        freshLevelsAfter,
        updatedRacha,
        rachaEscaneosBefore,
        updatedRachaEscaneos,
        usuarioLocalId: currentUser.local_id
      })

      if (newlyUnlockedBadges && newlyUnlockedBadges.length > 0) {
        await db.transaction('rw', db.usuario_insignias, db.cola_sincronizacion, async () => {
          for (const badge of newlyUnlockedBadges) {
            const local_id = crypto.randomUUID();
            const badgeRelation = {
              local_id,
              usuario_id: currentUser.id || null,
              usuario_local_id: currentUser.local_id,
              insignia_id: badge.id,
              obtenida_en: new Date().toISOString(),
              sync_status: 'PENDIENTE'
            };

            await db.usuario_insignias.add(badgeRelation);
            await db.cola_sincronizacion.add({
              entidad: 'usuario_insignias',
              accion: 'UPSERT',
              datos: badgeRelation,
              estado: 'PENDIENTE',
              created_at: new Date().getTime()
            });
          }
        });

        // Mostrar la primera insignia obtenida en el modal emergente
        setUnlockedBadge(newlyUnlockedBadges[0]);
        
        if (navigator.onLine) {
          procesarColaSincronizacion(currentUser.local_id);
        }
      }
    } catch (error) {
      console.error("Error al verificar insignias desbloqueadas:", error)
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
    <div className="md:min-h-screen md:bg-gray-700 md:flex md:items-center md:justify-center">
      <div className="w-full md:w-[390px] md:h-[844px] h-screen flex flex-col md:rounded-3xl md:shadow-2xl md:overflow-hidden relative">
        {level.tipo === "APRENDIZAJE" && (
          <QuizLevel key={level.id} level={level} onComplete={handleCompleteLevel} />
        )}

        {/*{level.tipo === "BUSQUEDA" && (
          <ScanLevel key={level.id} level={level} onComplete={handleCompleteLevel} />
        )}*/}

        {level.tipo === "BUSQUEDA" && !cameralessMode && (
          <ScanLevel key={level.id} level={level} onComplete={handleCompleteLevel} />
        )}

        {level.tipo === "BUSQUEDA" && cameralessMode && (
          <GlyphPickLevel key={level.id} level={level} onComplete={handleCompleteLevel} />
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
          }}
        />
      </div>
    </div>
  )
}