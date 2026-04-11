export async function handleSyncProgreso(req, res, db, io) {
  const { datos } = req.body;

  let usuarioIdReal = datos.usuario_id;
  if (!usuarioIdReal && datos.usuario_local_id) {
    const user = await db.Usuario.findOne({ where: { local_id: datos.usuario_local_id } });
    if (user) {
      usuarioIdReal = user.id;
      console.log(`ID resuelto para ${datos.usuario_local_id} -> ${usuarioIdReal}`);
    }
  }

  let existente = await db.ProgresoUsuario.findOne({
    where: { local_id: datos.local_id }
  });

  if (existente) {
    await existente.update({
      usuario_id: usuarioIdReal || existente.usuario_id,
      usuario_local_id: datos.usuario_local_id || existente.usuario_local_id,
      completado: datos.completado,
      estrellas: Math.max(existente.estrellas, datos.estrellas),
      intentos: datos.intentos,
      ultimo_intento: datos.ultimo_intento,
      updated_at: new Date()
    });

    if (io) io.emit("hay_cambios");

    return res.json({ success: true, message: 'Actualizado', data: existente.toJSON() });
  }

  try {
    const nuevo = await db.ProgresoUsuario.create({
      local_id: datos.local_id,
      usuario_id: usuarioIdReal || null,
      usuario_local_id: datos.usuario_local_id || null,
      nivel_id: datos.nivel_id,
      completado: datos.completado,
      estrellas: datos.estrellas,
      intentos: datos.intentos,
      ultimo_intento: datos.ultimo_intento
    });

    if (io) io.emit("hay_cambios");

    return res.json({ success: true, message: 'Creado', data: nuevo.toJSON() });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      const reintento = await db.ProgresoUsuario.findOne({ where: { local_id: datos.local_id } });
      if (reintento) {
        await reintento.update({ estrellas: Math.max(reintento.estrellas, datos.estrellas) });
        if (io) io.emit("hay_cambios");
        return res.json({ success: true, message: 'Actualizado tras colisión', data: reintento.toJSON() });
      }
    }
    throw error;
  }
}
