export async function handleSyncAdmins(req, res, db, io) {
  const { datos } = req.body;

  try {
    // Buscar por local_id preferentemente
    const where = {};
    if (datos.local_id) where.local_id = datos.local_id;
    else if (datos.id) where.id = datos.id;

    const existente = await db.Admin.findOne({ where });

    if (!existente) {
      return res.status(404).json({ success: false, message: 'Admin no encontrado' });
    }

    const updates = {};
    if (datos.email) updates.email = datos.email;
    if (datos.password_hash) updates.password_hash = datos.password_hash;
    updates.updated_at = new Date();

    await existente.update(updates);

    io.emit('hay_cambios');

    return res.status(200).json({ success: true, message: 'Actualizado', data: existente });
  } catch (error) {
    console.error('Error al sincronizar admin:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

