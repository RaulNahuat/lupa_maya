import { create } from "zustand"
import { db } from "../../data/db"
import { guardarProgreso } from "../../services/player/progresoService"
import { procesarColaSincronizacion } from "../../services/syncService"
import { obtenerRacha, actualizarRacha, obtenerRachaEscaneos } from "../../services/player/rachaService"

//Mezclador pseudo-aleatorio determinista
function shuffleWithSeed(array, seedString) {
  let seed = 0;
  if (seedString) {
    for (let i = 0; i < seedString.length; i++) {
      seed = (seed << 5) - seed + seedString.charCodeAt(i);
      seed |= 0; //Convertir a entero de 32 bits
    }
  }

  //Generador congruencial lineal Mulberry32 simple
  function random() {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export const useGameStore = create((set, get) => ({
  levels: [],
  racha: 0,
  racha_escaneos: 0,
  syncReady: false, // true cuando el primer pull sync termina

  /**
   * Carga el catálogo de niveles desde IndexedDB, cruza cada nivel con
   * su contenido (pregunta + opciones + glifo, o glifo objetivo según tipo),
   * y calcula el progreso del usuario (completado, estrellas, desbloqueado).
   */
  initLevels: async (currentUser) => {
    // Traer catálogo completo desde IndexedDB
    const nivelesRaw = await db.niveles.toArray()

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
    
    let gruposArr = await db.grupos_niveles.toArray()
    const esDocente = currentUser && Number(currentUser.rol_id) === 3;
    if (!esDocente) {
      gruposArr = gruposArr.filter(g => g.activo !== false);
    }
    const gruposMap = Object.fromEntries(gruposArr.map((g) => [g.id, g]))

    // Agrupar niveles por grupo_id
    const nivelesPorGrupo = {}
    for (const n of nivelesRaw) {
      if (!nivelesPorGrupo[n.grupo_id]) {
        nivelesPorGrupo[n.grupo_id] = []
      }
      nivelesPorGrupo[n.grupo_id].push(n)
    }

    //Ordenar internamente cada grupo por posicion_bloque
    for (const grupoId in nivelesPorGrupo) {
      nivelesPorGrupo[grupoId].sort((a, b) => (a.posicion_bloque || 0) - (b.posicion_bloque || 0))
    }

    //Aplicar mezcla pseudo-aleatoria sembrada usando el ID del usuario
    const seed = currentUser ? currentUser.local_id : 'default-seed'
    for (const grupoId in nivelesPorGrupo) {
      nivelesPorGrupo[grupoId] = shuffleWithSeed(nivelesPorGrupo[grupoId], seed)
    }

    //Aplanar arreglos respetando el orden jerárquico de los grupos
    const gruposOrdenados = [...gruposArr].sort((a, b) => (a.numero_grupo || 0) - (b.numero_grupo || 0))
    const niveles = []
    for (const g of gruposOrdenados) {
      const grupoNiveles = nivelesPorGrupo[g.id] || []
      niveles.push(...grupoNiveles)
    }

    // Armar cada nivel con su contenido segun el tipo
    const levelsConContenido = await Promise.all(
      niveles.map(async (nivel, index) => {

        let contenido = null

        if (nivel.tipo === 'APRENDIZAJE') {
          const preguntasRaw = await db.preguntas
            .where('nivel_id')
            .equals(nivel.id)
            .toArray()

          // Filtrar solo activas y mezclar aleatoriamente
          const preguntasMezcladas = preguntasRaw
            .filter(p => p.activa !== false)
            .sort(() => Math.random() - 0.5)

          const preguntasConOpciones = await Promise.all(
            preguntasMezcladas.map(async (pregunta) => {
              const opciones = await db.opciones_respuestas
                .where('preguntas_id')
                .equals(pregunta.id)
                .toArray()

              // Glifo embebido en la pregunta
              const glifo = pregunta.glifo ?? null

              return {
                pregunta_id: pregunta.id,
                question: pregunta.texto_pregunta,
                options: opciones.map((o) => o.texto_opcion).sort(() => Math.random() - 0.5),
                correctAnswer: opciones.find((o) => o.es_correcta)?.texto_opcion ?? null,
                imagen_url: glifo?.imagen_url ?? null,
                nombre_maya: glifo?.nombre_maya ?? null,
                significado_es: glifo?.significado_es ?? null,
                audio_url: glifo?.audio_url ?? null,
              }
            })
          )

          contenido = { preguntas: preguntasConOpciones }
        }

        if (nivel.tipo === 'BUSQUEDA') {
          // Buscar el glifo objetivo del nivel (primer orden de aparicion)
          const objetivo = await db.nivel_glifos_objetivos
            .where('nivel_id')
            .equals(nivel.id)
            .first()

          contenido = {
            glifo_id: objetivo?.glifo_id ?? null,
            glifo: objetivo?.glifo ?? null,   // ya viene embebido
            orden_aparicion: objetivo?.orden_aparicion
          }
        }

        const progreso = progresoMap[nivel.id]
        const completado = progreso?.completado ?? false
        const estrellas = progreso?.estrellas ?? 0

        const anterior = index > 0 ? niveles[index - 1] : null
        const anteriorCompletado = anterior
          ? !!(progresoMap[anterior.id]?.completado)
          : true

        const desbloqueado = index === 0 || anteriorCompletado
        const grupo = gruposMap[nivel.grupo_id] ?? null

        return {
          ...nivel,
          contenido,
          completado,
          estrellas,
          desbloqueado,
          grupo,
        }
      })
    )

    // Cargar racha persistida del usuario
    const racha = currentUser ? await obtenerRacha(currentUser.local_id) : 0
    const racha_escaneos = currentUser ? await obtenerRachaEscaneos(currentUser.local_id) : 0
    
    set({ levels: levelsConContenido, racha, racha_escaneos })
  },

  syncAndReload: async (currentUser) => {
    set({ syncReady: false })
    await procesarColaSincronizacion(currentUser.local_id)
    set({ syncReady: true })
    // Recargar niveles con el contenido ya disponible en Dexie
    await get().initLevels(currentUser)
  },

  /**
   * Marca un nivel como completado, actualiza estrellas y recalcula la racha.
   */
  completeLevel: async (currentUser, nivelId, estrellas, intentos, aprobado) => {
    const { levels } = get()

    if (!currentUser) return

    const nivel = levels.find((l) => l.id === nivelId)
    if (!nivel) {
      console.error("completeLevel: nivel no encontrado", nivelId)
      return
    }

    await guardarProgreso({ usuario: currentUser, nivel, estrellas, intentos })

    const esPrimeraVez = !nivel.completado

    // Si aprobado no se pasa explícitamente (niveles BUSQUEDA),
    // usar el criterio simple de intentos === 1
    const criterioRacha = aprobado !== undefined ? aprobado : intentos === 1

    // Recalcular racha, sube si completó a primera vez, se rompe si no
    const { racha: nuevaRacha, racha_escaneos: nuevaRachaEscaneos } = await actualizarRacha(currentUser.local_id, criterioRacha, esPrimeraVez, nivel)

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

    set({ levels: updatedLevels, racha: nuevaRacha, racha_escaneos: nuevaRachaEscaneos })

    procesarColaSincronizacion(currentUser.local_id)
  },
}))