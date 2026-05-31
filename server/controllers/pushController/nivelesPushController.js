export async function handleSyncNiveles(req, res, db, io) {
  const { accion, datos } = req.body;
  console.log(`[SYNC NIVELES] Acción: ${accion}`, JSON.stringify(datos));

  try {
    if (accion === 'CREAR') {
      const existente = await db.Nivel.findOne({
        where: {
          numero: datos.numero
        }
      });
      if (existente) {
        console.log(`[SYNC NIVELES] Ya existe el nivel con número:`, existente.numero);
        return res.status(200).json({
          success: true,
          message: "Nivel ya existe",
          data: existente.toJSON()
        });
      }

      console.log(`[SYNC NIVELES] Creando nuevo Nivel en DB...`);
      const nuevo = await db.Nivel.create({
        grupo_id: datos.grupo_id,
        numero: datos.numero,
        tipo: datos.tipo,
        orden_secuencia: datos.orden_secuencia,
        version: datos.version ?? 1
      });

      console.log(`[SYNC NIVELES] Nivel creado con ID:`, nuevo.id);

      if (io) io.emit("hay_cambios");
      return res.status(201).json({ success: true, message: "Creado", data: nuevo });
    }

    if (accion === 'EDITAR') {
      const existente = await db.Nivel.findByPk(datos.id);
      if (!existente) {
        return res.status(404).json({ success: false, message: "Nivel no encontrado" });
      }

      await existente.update({
        grupo_id: datos.grupo_id ?? existente.grupo_id,
        numero: datos.numero ?? existente.numero,
        tipo: datos.tipo ?? existente.tipo,
        orden_secuencia: datos.orden_secuencia ?? existente.orden_secuencia,
        version: (existente.version || 1) + 1
      });

      if (io) io.emit("hay_cambios");
      return res.status(200).json({ success: true, message: "Actualizado", data: existente });
    }

    if (accion === 'ELIMINAR') {
      let existente = await db.Nivel.findByPk(datos.id);
      if (!existente && datos.numero) {
        existente = await db.Nivel.findOne({ where: { numero: datos.numero } });
      }

      if (!existente) {
        return res.status(200).json({ success: true, message: "Nivel ya eliminado o no encontrado" });
      }

      await existente.destroy();

      if (io) io.emit("hay_cambios");
      return res.status(200).json({ success: true, message: "Nivel eliminado de la base de datos" });
    }

    return res.status(400).json({ success: false, message: "Acción no soportada para niveles" });
  } catch (error) {
    console.error("Error al sincronizar Nivel:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
