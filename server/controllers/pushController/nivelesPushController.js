export async function handleSyncNiveles(req, res, db, io) {
  const { accion, datos } = req.body;
  console.log(`[SYNC NIVELES] Acción: ${accion}`, JSON.stringify(datos));

  try {
    if (accion === 'CREAR') {
      const existente = await db.Nivel.findOne({
        where: {
          grupo_id: datos.grupo_id,
          numero: datos.numero
        }
      });
      if (existente) {
        console.log(`[SYNC NIVELES] Ya existe el nivel con número ${existente.numero} en el grupo ${existente.grupo_id}`);
        return res.status(200).json({
          success: true,
          message: "Nivel ya existe",
          data: existente.toJSON()
        });
      }

      console.log(`[SYNC NIVELES] Calculando posición sin conflictos en el grupo...`);
      let finalPos = datos.posicion_bloque ?? datos.orden_secuencia ?? 1;
      const posConflict = await db.Nivel.findOne({
        where: {
          grupo_id: datos.grupo_id,
          posicion_bloque: finalPos
        }
      });
      if (posConflict) {
        const maxPos = await db.Nivel.max('posicion_bloque', { where: { grupo_id: datos.grupo_id } });
        finalPos = (maxPos || 0) + 1;
        console.log(`[SYNC NIVELES] Conflicto de posición detectado. Reasignado a: ${finalPos}`);
      }

      console.log(`[SYNC NIVELES] Creando nuevo Nivel en DB...`);
      const nuevo = await db.Nivel.create({
        grupo_id: datos.grupo_id,
        numero: datos.numero,
        tipo: datos.tipo,
        posicion_bloque: finalPos,
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
        posicion_bloque: datos.posicion_bloque ?? datos.orden_secuencia ?? existente.posicion_bloque,
        version: (existente.version || 1) + 1
      });

      if (io) io.emit("hay_cambios");
      return res.status(200).json({ success: true, message: "Actualizado", data: existente });
    }

    if (accion === 'ELIMINAR') {
      let existente = await db.Nivel.findByPk(datos.id);
      if (!existente && datos.numero && datos.grupo_id) {
        existente = await db.Nivel.findOne({ where: { numero: datos.numero, grupo_id: datos.grupo_id } });
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
    const msg = error.errors ? error.errors.map(e => e.message).join(", ") : error.message;
    return res.status(500).json({ success: false, error: msg });
  }
}
