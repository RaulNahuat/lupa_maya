export async function handleSyncUsuarios(req, res, db, io) {
  const { datos } = req.body;

  const existente = await db.Usuario.findOne({
    where: { local_id: datos.local_id }
  });

  let resolvedGrupoEscolarId = datos.grupo_escolar_id;
  if (datos.grupo_escolar_id && typeof datos.grupo_escolar_id === 'string' && datos.grupo_escolar_id.includes('-')) {
    const grupo = await db.GrupoEscolar.findOne({ where: { local_id: datos.grupo_escolar_id } });
    resolvedGrupoEscolarId = grupo ? grupo.id : null;
  }

  if (existente) {
    //Actualiza racha y rol_id si el cliente manda valores más recientes
    const updates = {};
    if (datos.racha !== undefined && datos.racha !== null) updates.racha = datos.racha;
    if (datos.rol_id !== undefined && datos.rol_id !== null) updates.rol_id = datos.rol_id;
    if (resolvedGrupoEscolarId !== undefined) updates.grupo_escolar_id = resolvedGrupoEscolarId;
    if (Object.keys(updates).length > 0) {
      await existente.update(updates);
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
      racha: datos.racha ?? 0,
      rol_id: datos.rol_id ?? 2,
      grupo_escolar_id: resolvedGrupoEscolarId || null
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
