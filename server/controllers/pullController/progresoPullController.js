export async function getProgresoPull(db, Op, lastSyncDate, usuario_local_id) {
  const whereClause = {
    updated_at: { [Op.gt]: lastSyncDate }
  };

  if (usuario_local_id) {
    whereClause.usuario_local_id = usuario_local_id;
  }

  const progresosRaw = await db.ProgresoUsuario.findAll({
    where: whereClause
  });

  return progresosRaw.map(p => p.toJSON());
}
