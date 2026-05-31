export async function handleSyncGlifosObjetivo(req, res, db, io) {
  const { accion, datos } = req.body;
  console.log(`[SYNC GLIFOS OBJETIVO] Acción: ${accion}`, JSON.stringify(datos));

  try {
    if (accion === 'CREAR') {
      const existente = await db.NivelGlifoObjetivo.findByPk(datos.id);
      if (existente) {
        return res.status(200).json({ success: true, message: "Glifo objetivo ya existe", data: existente });
      }

      const nuevo = await db.NivelGlifoObjetivo.create({
        id: datos.id,
        nivel_id: datos.nivel_id,
        glifo_id: datos.glifo_id,
        orden_aparicion: datos.orden_aparicion ?? 1
      });

      if (io) io.emit("hay_cambios");
      return res.status(201).json({ success: true, message: "Glifo objetivo creado", data: nuevo });
    }

    if (accion === 'ELIMINAR') {
      const existente = await db.NivelGlifoObjetivo.findByPk(datos.id);
      if (!existente) {
        // En caso de que se intente borrar y se envíe el ID temporal o local, buscar por nivel_id y glifo_id
        const alt = await db.NivelGlifoObjetivo.findOne({
          where: {
            nivel_id: datos.nivel_id,
            glifo_id: datos.glifo_id
          }
        });
        if (alt) {
          await alt.destroy();
          if (io) io.emit("hay_cambios");
          return res.status(200).json({ success: true, message: "Glifo objetivo eliminado por coincidencia de claves" });
        }
        return res.status(200).json({ success: true, message: "Glifo objetivo ya eliminado o no encontrado" });
      }

      await existente.destroy();

      if (io) io.emit("hay_cambios");
      return res.status(200).json({ success: true, message: "Glifo objetivo eliminado" });
    }

    return res.status(400).json({ success: false, message: "Acción no soportada para glifos objetivos" });
  } catch (error) {
    console.error("Error al sincronizar Glifo Objetivo:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
