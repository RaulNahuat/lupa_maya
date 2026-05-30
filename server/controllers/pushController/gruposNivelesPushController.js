export async function handleSyncGruposNiveles(req, res, db, io) {
  const { accion, datos } = req.body;
  console.log(`[SYNC GRUPOS_NIVELES] Acción: ${accion}`, JSON.stringify(datos));

  try {
    if (accion === 'CREAR') {
      const existente = await db.GrupoNivel.findOne({
        where: {
          nombre: datos.nombre,
          numero_grupo: datos.numero_grupo,
          activo: true
        }
      });
      if (existente) {
        console.log(`[SYNC GRUPOS_NIVELES] Ya existe:`, existente.id);
        return res.status(200).json({
          success: true,
          message: "GrupoNivel ya existe",
          data: existente.toJSON()
        });
      }

      console.log(`[SYNC GRUPOS_NIVELES] Creando nuevo GrupoNivel en DB sin id...`);
      const nuevo = await db.GrupoNivel.create({
        numero_grupo: datos.numero_grupo,
        nombre: datos.nombre,
        descripcion: datos.descripcion,
        dificultad: datos.dificultad,
        color: datos.color,
        activo: datos.activo ?? true,
        version: datos.version ?? 1
      });

      console.log(`[SYNC GRUPOS_NIVELES] Creado con ID autoincremental de DB:`, nuevo.id);

      if (io) io.emit("hay_cambios");
      return res.status(201).json({ success: true, message: "Creado", data: nuevo });
    }

    if (accion === 'EDITAR') {
      const existente = await db.GrupoNivel.findByPk(datos.id);
      if (!existente) {
        return res.status(404).json({ success: false, message: "GrupoNivel no encontrado" });
      }

      await existente.update({
        numero_grupo: datos.numero_grupo ?? existente.numero_grupo,
        nombre: datos.nombre ?? existente.nombre,
        descripcion: datos.descripcion ?? existente.descripcion,
        dificultad: datos.dificultad ?? existente.dificultad,
        color: datos.color ?? existente.color,
        activo: datos.activo ?? existente.activo,
        version: (existente.version || 1) + 1
      });

      if (io) io.emit("hay_cambios");
      return res.status(200).json({ success: true, message: "Actualizado", data: existente });
    }

    if (accion === 'ELIMINAR') {
      const existente = await db.GrupoNivel.findByPk(datos.id);
      if (!existente) {
        return res.status(200).json({ success: true, message: "GrupoNivel ya eliminado o no encontrado" });
      }

      //Hard delete: Borra la asociación de glifos y niveles
      await db.Glifo.destroy({ where: { grupo_id: datos.id } });
      await db.Nivel.destroy({ where: { grupo_id: datos.id } });
      await existente.destroy();

      if (io) io.emit("hay_cambios");
      return res.status(200).json({ success: true, message: "GrupoNivel eliminado por completo de la base de datos" });
    }

    return res.status(400).json({ success: false, message: "Acción no soportada para grupos_niveles" });
  } catch (error) {
    console.error("Error al sincronizar GrupoNivel:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
