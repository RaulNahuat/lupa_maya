export async function getUsuariosPull(db, Op, lastSyncDate) {
  const cambiosRaw = await db.Usuario.findAll({
    where: {
      [Op.or]: [
        { updated_at: { [Op.gt]: lastSyncDate } },
        { deleted_at: { [Op.gt]: lastSyncDate } }
      ]
    },
    paranoid: false
  });

  return cambiosRaw.map(user => {
    const data = user.toJSON();

    if (!data.local_id) {
      data.local_id = `legacy-${data.id}`;
    }
    return data;
  });
}
