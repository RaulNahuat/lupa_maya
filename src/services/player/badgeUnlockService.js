import { db } from "../../data/db"

/**
 * Compara el estado del jugador antes y después de completar un nivel para identificar si se ha desbloqueado alguna insignia nueva.
 */
export const checkBadgeUnlock = async ({ rachaBefore, levelsBefore, freshLevelsAfter, updatedRacha, rachaEscaneosBefore, updatedRachaEscaneos, usuarioLocalId }) => {
  const dbBadges = await db.insignias.toArray()
  
  // Obtener insignias ya registradas para este usuario
  const userBadges = usuarioLocalId 
    ? await db.usuario_insignias.where('usuario_local_id').equals(usuarioLocalId).toArray()
    : []
  const userBadgeIds = new Set(userBadges.map(ub => Number(ub.insignia_id)))

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

  // Retornar todas las insignias que están cumplidas pero el usuario no tiene registradas
  return dbBadges.filter((badge) => isUnlockedNow(badge) && !userBadgeIds.has(Number(badge.id)))
}
