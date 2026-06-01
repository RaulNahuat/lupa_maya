export async function getUsuarioInsigniasPull(db, Op, lastSyncDate, usuarioLocalId = null) {
  const where = {};
  
  if (lastSyncDate) {
    where.last_synced_at = { [Op.gt]: lastSyncDate };
  }

  if (usuarioLocalId) {
    where.usuario_local_id = usuarioLocalId;
  }

  const insigniasObtenidas = await db.UsuarioInsignia.findAll({ where });
  return insigniasObtenidas.map(ui => {
    const data = ui.toJSON();
    if (!data.local_id) {
      data.local_id = `legacy-${data.usuario_id}-${data.insignia_id}`;
    }
    return data;
  });
}
