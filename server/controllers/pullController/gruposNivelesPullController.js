export async function getGruposNivelesPull(db, Op, lastSyncDate) {
  const grupos = await db.GrupoNivel.findAll({
    raw: true
  });
  return grupos;
}