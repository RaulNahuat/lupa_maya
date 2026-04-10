export async function handleSyncProgreso(req, res, db) {
  const { datos } = req.body;

  // Buscar por local_id primero para manejar casos donde el cliente aún no tiene un usuario_id asignado por el servidor.
  let existente = null;

  if (datos.local_id) {
    existente = await db.ProgresoUsuario.findOne({
      where: { local_id: datos.local_id }
    });
  }

  if (!existente && datos.usuario_id) {
    existente = await db.ProgresoUsuario.findOne({
      where: {
        usuario_id: datos.usuario_id,
        nivel_id: datos.nivel_id
      }
    });
  }

  if (existente) {
    await existente.update({
      completado: datos.completado,
      estrellas: datos.estrellas,
      intentos: datos.intentos,
      ultimo_intento: datos.ultimo_intento,
      updated_at: new Date()
    });

    return res.json({ success: true, data: existente.toJSON() });
  }

  const nuevo = await db.ProgresoUsuario.create({
    local_id: datos.local_id,
    usuario_id: datos.usuario_id || null,
    usuario_local_id: datos.usuario_local_id || null,
    nivel_id: datos.nivel_id,
    completado: datos.completado,
    estrellas: datos.estrellas,
    intentos: datos.intentos,
    ultimo_intento: datos.ultimo_intento
  });

  return res.json({ success: true, data: nuevo.toJSON() });
}
