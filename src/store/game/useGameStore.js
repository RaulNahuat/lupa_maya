import { create } from "zustand"
import { db } from "../../data/db"
import { guardarProgreso } from "../../services/player/progresoService"

export const useGameStore = create((set, get) => ({
  levels: [],
  currentUser: null,

  setCurrentUser: (user) => set({ currentUser: user }),

  /**
   * Carga el catálogo de niveles desde IndexedDB y los cruza con el
   * progreso del usuario para determinar cuáles están completados y
   * desbloqueados
   */
  initLevels: async () => {
    const { currentUser } = get()

    // Traer catálogo completo de niveles
    const niveles = await db.niveles.orderBy('orden_secuencia').toArray()

    // Si hay usuario, traer su progreso
    let progresoMap = {}
    if (currentUser) {
      const progresos = await db.progreso_usuarios
        .where('usuario_local_id')
        .equals(currentUser.local_id)
        .toArray()

      progresoMap = Object.fromEntries(
        progresos.map((p) => [p.nivel_id, p])
      )
    }

    // Relacionar los niveles con el progreso para determinar el estado de cada nivel
    const levelsConProgreso = niveles.map((nivel, index) => {
      const progreso = progresoMap[nivel.id]

      const completado = progreso?.completado ?? false
      const estrellas = progreso?.estrellas ?? 0

      // Primer nivel siempre está desbloqueado
      // Desbloquean el siguiente si el anterior fue completado
      const anterior = index > 0 ? niveles[index - 1] : null
      const anteriorCompletado = anterior
        ? !!(progresoMap[anterior.id]?.completado)
        : true

      const desbloqueado = index === 0 || anteriorCompletado

      return {
        ...nivel,
        completado,
        estrellas,
        desbloqueado,
      }
    })

    set({ levels: levelsConProgreso })
  },

  /**
   * Marca un nivel como completado para el usuario actual
   * Guarda el progreso en IndexedDB y lo encola para sincronización
   */
  completeLevel: async (nivelId, estrellas, intentos) => {
    const { currentUser, levels } = get()

    if (!currentUser) {
      console.error("completeLevel: no hay usuario en el store")
      return
    }

    const nivel = levels.find((l) => l.id === nivelId)
    if (!nivel) {
      console.error("completeLevel: nivel no encontrado", nivelId)
      return
    }

    await guardarProgreso({ usuario: currentUser, nivel, estrellas, intentos })

    // Actualizar estado en memoria sin tocar el catálogo
    const updatedLevels = levels.map((lvl, index) => {
      if (lvl.id === nivelId) {
        return {
          ...lvl,
          completado: true,
          estrellas: Math.max(lvl.estrellas ?? 0, estrellas),
        }
      }

      // Desbloquear el siguiente nivel en la secuencia
      const anterior = index > 0 ? levels[index - 1] : null
      if (anterior?.id === nivelId) {
        return { ...lvl, desbloqueado: true }
      }

      return lvl
    })

    set({ levels: updatedLevels })
  },
}))