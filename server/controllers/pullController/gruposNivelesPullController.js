export async function getGruposNivelesPull(db, Op, lastSyncDate) {
  const grupos = await db.GrupoNivel.findAll({
    where: {
      activo: true
    },
    raw: true
  });
  return grupos;
}