import { create } from "zustand"
import { levels as initialLevels } from "../data/levels"
import { db } from "../services/db"

export const useGameStore = create((set, get) => ({
  levels: [],

  // Inicializar desde DB o fallback a data
  initLevels: async () => {
    const savedLevels = await db.levels.toArray()

    if (savedLevels.length > 0) {
      // combinar con estructura original
      const merged = initialLevels.map((lvl) => {
        const saved = savedLevels.find((s) => s.id === lvl.id)
        return saved ? { ...lvl, ...saved } : lvl
      })

      set({ levels: merged })
    } else {
      // guardar inicial
      await db.levels.bulkAdd(
        initialLevels.map(({ id, unlocked, completed }) => ({
          id,
          unlocked,
          completed,
        }))
      )

      set({ levels: initialLevels })
    }
  },

  // Completar nivel + guardar
  completeLevel: async (id) => {
    const state = get()

    const updatedLevels = state.levels.map((lvl) => {
      if (lvl.id === id) return { ...lvl, completed: true }
      if (lvl.id === id + 1) return { ...lvl, unlocked: true }
      return lvl
    })

    set({ levels: updatedLevels })

    // guardar en IndexedDB
    await db.levels.bulkPut(
      updatedLevels.map(({ id, unlocked, completed }) => ({
        id,
        unlocked,
        completed,
      }))
    )
  },
}))