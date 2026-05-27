export async function handleSyncUsuarios(req, res, db, io) {
  const { datos } = req.body;

  const existente = await db.Usuario.findOne({
    where: { local_id: datos.local_id }
  });

  if (existente) {
    // Actualizar racha si el cliente manda un valor más reciente
    if (datos.racha !== undefined && datos.racha !== null) {
      await existente.update({ racha: datos.racha });
    }

    return res.status(200).json({
      success: true,
      message: "Ya existe",
      data: existente.toJSON()
    });
  }

  try {
    const nuevo = await db.Usuario.create({
      nombre: datos.nombre,
      apellido: datos.apellido || "Pendiente",
      username: datos.username,
      escuela: datos.escuela || "Sin asignar",
      lugar_procedencia: datos.lugar_procedencia || "Sin asignar",
      genero: datos.genero || "Femenino",
      grado: datos.grado || "1er Grado",
      pin_hash: datos.pin_hash || datos.pin || null,
      local_id: datos.local_id,
      racha: datos.racha ?? 0
    });

    io.emit("hay_cambios");

    return res.status(201).json({ success: true, message: "Creado", data: nuevo });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      const reintento = await db.Usuario.findOne({ where: { local_id: datos.local_id } });
      return res.status(200).json({ success: true, message: "Ya existe (colisión)", data: reintento });
    }
    throw error;
  }
}
