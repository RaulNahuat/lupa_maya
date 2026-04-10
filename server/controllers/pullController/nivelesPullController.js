export async function getNivelesPull(db, Op, lastSyncDate) {
  const nivelesRaw = await db.Nivel.findAll({
    where: { updated_at: { [Op.gt]: lastSyncDate } }
  });

  return nivelesRaw.map(n => n.toJSON());
}
