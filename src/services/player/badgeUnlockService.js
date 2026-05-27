import { db } from "../../data/db"

/**
 * Compara el estado del jugador antes y después de completar un nivel para identificar si se ha desbloqueado alguna insignia nueva.
 */
export const checkBadgeUnlock = async ({ rachaBefore, levelsBefore, freshLevelsAfter, updatedRacha }) => {
  const dbBadges = await db.insignias.toArray()

  const completedCountBefore = levelsBefore.filter((l) => l.completado).length
  const hasCompletedAnyLevelBefore = completedCountBefore > 0
  const hasCompletedAnySearchBefore = levelsBefore.some((l) => l.completado && l.tipo === "BUSQUEDA")

  const wasUnlocked = (badge) => {
    if (badge.tipo_condicion === "ESCANEOS") {
      return hasCompletedAnySearchBefore || hasCompletedAnyLevelBefore
    } else if (badge.tipo_condicion === "RACHA") {
      return rachaBefore >= badge.valor_condicion
    }
    return false
  }

  const hasCompletedAnyLevelAfter = freshLevelsAfter.some((l) => l.completado)
  const hasCompletedAnySearchAfter = freshLevelsAfter.some((l) => l.completado && l.tipo === "BUSQUEDA")

  const isUnlockedNow = (badge) => {
    if (badge.tipo_condicion === "ESCANEOS") {
      return hasCompletedAnySearchAfter || hasCompletedAnyLevelAfter
    } else if (badge.tipo_condicion === "RACHA") {
      return updatedRacha >= badge.valor_condicion
    }
    return false
  }

  return dbBadges.find((badge) => !wasUnlocked(badge) && isUnlockedNow(badge)) ?? null
}
