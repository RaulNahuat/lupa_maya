export async function getGruposNivelesPull(db, Op, lastSyncDate) {
  const grupos = await db.GrupoNivel.findAll({
    where: {
      updated_at: {
        [Op.gt]: lastSyncDate
      }
    },
    raw: true
  });
  return grupos;
}