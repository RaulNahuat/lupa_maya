export async function handleSyncUsuarios(req, res, db, io) {
  const { datos } = req.body;

  const existente = await db.Usuario.findOne({
    where: { local_id: datos.local_id }
  });

  // Si ya existe, devolver el registro con su ID real para que el cliente
  // pueda propagar el usuario_id a los registros de progreso pendientes.
  if (existente) {
    return res.status(200).json({
      success: true,
      message: "Ya existe",
      data: existente.toJSON()
    });
  }

  const nuevo = await db.Usuario.create({
    nombre: datos.nombre,
    apellido: datos.apellido || "Pendiente",
    email: datos.email || null,
    pin_hash: datos.pin_hash || datos.pin || null,
    password_hash: datos.password_hash || datos.password || null,
    rol: datos.rol || "NINO",
    local_id: datos.local_id
  });

  io.emit("hay_cambios");

  return res.status(201).json({ success: true, data: nuevo });
}
