import { db } from "../../data/db"

/**
 * Compara el estado del jugador antes y después de completar un nivel para identificar si se ha desbloqueado alguna insignia nueva.
 */
export const checkBadgeUnlock = async ({ rachaBefore, levelsBefore, freshLevelsAfter, updatedRacha, rachaEscaneosBefore, updatedRachaEscaneos }) => {
  const dbBadges = await db.insignias.toArray()

  const completedCountBefore = levelsBefore.filter((l) => l.completado).length
  const completedScansCountBefore = levelsBefore.filter((l) => l.completado && l.tipo === "BUSQUEDA").length

  const wasUnlocked = (badge) => {
    if (badge.tipo_condicion === "NIVELES") {
      return completedCountBefore >= badge.valor_condicion
    } else if (badge.tipo_condicion === "ESCANEOS") {
      return completedScansCountBefore >= badge.valor_condicion
    } else if (badge.tipo_condicion === "RACHA") {
      return rachaBefore >= badge.valor_condicion
    } else if (badge.tipo_condicion === "RACHA_ESCANEOS") {
      return (rachaEscaneosBefore ?? 0) >= badge.valor_condicion
    }
    return false
  }

  const completedCountAfter = freshLevelsAfter.filter((l) => l.completado).length
  const completedScansCountAfter = freshLevelsAfter.filter((l) => l.completado && l.tipo === "BUSQUEDA").length

  const isUnlockedNow = (badge) => {
    if (badge.tipo_condicion === "NIVELES") {
      return completedCountAfter >= badge.valor_condicion
    } else if (badge.tipo_condicion === "ESCANEOS") {
      return completedScansCountAfter >= badge.valor_condicion
    } else if (badge.tipo_condicion === "RACHA") {
      return updatedRacha >= badge.valor_condicion
    } else if (badge.tipo_condicion === "RACHA_ESCANEOS") {
      return (updatedRachaEscaneos ?? 0) >= badge.valor_condicion
    }
    return false
  }

  return dbBadges.find((badge) => !wasUnlocked(badge) && isUnlockedNow(badge)) ?? null
}
