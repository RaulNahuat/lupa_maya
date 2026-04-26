export const getGlifosPull = async (db, Op, lastSyncDate) => {
  const esFirstSync = lastSyncDate.getTime() === 0

  const glifos = await db.Glifo.findAll({
    where: {
      ...(esFirstSync ? {} : { updated_at: { [Op.gt]: lastSyncDate } }),
      activo: true
    },
    raw: true
  });
  return glifos;
};