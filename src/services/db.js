import Dexie from "dexie"

export const db = new Dexie("GlyphGameDB")

db.version(1).stores({
  levels: "id, unlocked, completed",
})