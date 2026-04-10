export async function getProgresoPull(db, Op, lastSyncDate, usuario_local_id) {
  if (!usuario_local_id) return [];

  const progresosRaw = await db.ProgresoUsuario.findAll({
    where: {
      usuario_local_id,
      updated_at: { [Op.gt]: lastSyncDate }
    }
  });

  return progresosRaw.map(p => p.toJSON());
}
