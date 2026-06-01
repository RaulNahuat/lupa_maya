export async function handleSyncUsuarioInsignia(req, res, db, io) {
  const { datos } = req.body;

  let usuarioIdReal = datos.usuario_id;
  if (!usuarioIdReal && datos.usuario_local_id) {
    const user = await db.Usuario.findOne({ where: { local_id: datos.usuario_local_id } });
    if (user) {
      usuarioIdReal = user.id;
    }
  }

  // Si no tenemos ID de usuario ni local ni real, no podemos sincronizar
  if (!usuarioIdReal) {
    return res.status(400).json({ success: false, message: "Usuario no encontrado para asociar la insignia" });
  }

  // Buscar si ya existe la relación de insignia
  let existente = await db.UsuarioInsignia.findOne({
    where: { local_id: datos.local_id }
  });

  if (!existente) {
    existente = await db.UsuarioInsignia.findOne({
      where: { usuario_id: usuarioIdReal, insignia_id: datos.insignia_id }
    });
  }

  if (existente) {
    // Si ya existe, actualizar referencias
    await existente.update({
      local_id: existente.local_id || datos.local_id,
      usuario_id: usuarioIdReal,
      usuario_local_id: datos.usuario_local_id || existente.usuario_local_id,
      sync_status: 'SINCRONIZADO',
      last_synced_at: new Date()
    });

    if (io) io.emit("hay_cambios");
    return res.json({ success: true, message: 'Actualizado', data: existente.toJSON() });
  }

  try {
    const nuevo = await db.UsuarioInsignia.create({
      local_id: datos.local_id,
      usuario_id: usuarioIdReal,
      usuario_local_id: datos.usuario_local_id,
      insignia_id: datos.insignia_id,
      obtenida_en: datos.obtenida_en || new Date(),
      sync_status: 'SINCRONIZADO',
      last_synced_at: new Date()
    });

    if (io) io.emit("hay_cambios");
    return res.status(201).json({ success: true, message: 'Creado', data: nuevo.toJSON() });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      const reintento = await db.UsuarioInsignia.findOne({
        where: { usuario_id: usuarioIdReal, insignia_id: datos.insignia_id }
      });
      if (reintento) {
        if (io) io.emit("hay_cambios");
        return res.json({ success: true, message: 'Ya existe (colisión)', data: reintento.toJSON() });
      }
    }
    throw error;
  }
}
