import { create } from "zustand"
import { db } from "../../data/db"
import { guardarProgreso } from "../../services/player/progresoService"

export const useGameStore = create((set, get) => ({
  levels: [],
  currentUser: null,

  // Guarda el usuario en el store (se llama después del login)
  setCurrentUser: (user) => set({ currentUser: user }),

  /**
   * Carga el catálogo de niveles desde IndexedDB y los cruza con el
   * progreso del usuario para determinar cuáles están completados y
   * desbloqueados
   */
  initLevels: async () => {
    const { currentUser } = get()

    // Traer catalogo completo ordenado por secuencia
    const niveles = await db.niveles.orderBy('orden_secuencia').toArray()

    // Traer progreso del usuario si esta logueado
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

    // Armar cada nivel con su contenido segun el tipo
    const levelsConContenido = await Promise.all(
      niveles.map(async (nivel, index) => {

        let contenido = null

        if (nivel.tipo === 'APRENDIZAJE') {
          // Buscar la pregunta activa del nivel
          const pregunta = await db.preguntas
            .where('nivel_id')
            .equals(nivel.id)
            .first()

          if (pregunta) {
            const opciones = await db.opciones_respuestas
              .where('preguntas_id')
              .equals(pregunta.id)
              .toArray()

            contenido = {
              pregunta_id: pregunta.id,
              question: pregunta.texto_pregunta,
              options: opciones.map((o) => o.texto_opcion),
              // La opcion correcta se identifica por el flag es_correcta
              correctAnswer: opciones.find((o) => o.es_correcta)?.texto_opcion ?? null
            }
          }
        }

        if (nivel.tipo === 'BUSQUEDA') {
          // Buscar el glifo objetivo del nivel (primer orden de aparicion)
          const objetivo = await db.nivel_glifos_objetivos
            .where('nivel_id')
            .equals(nivel.id)
            .first()

          if (objetivo) {
            contenido = {
              glifo_id: objetivo.glifo_id,
              glifo: objetivo.glifo ?? null,  // viene anidado del servidor
              orden_aparicion: objetivo.orden_aparicion
            }
          }
        }

        // Calcular estado del jugador para este nivel
        const progreso = progresoMap[nivel.id]
        const completado = progreso?.completado ?? false
        const estrellas = progreso?.estrellas ?? 0

        const anterior = index > 0 ? niveles[index - 1] : null
        const anteriorCompletado = anterior
          ? !!(progresoMap[anterior.id]?.completado)
          : true

        const desbloqueado = index === 0 || anteriorCompletado

        return {
          ...nivel,
          contenido,
          completado,
          estrellas,
          desbloqueado,
        }
      })
    )

    set({ levels: levelsConContenido })
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