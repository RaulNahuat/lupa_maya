export async function handleSyncOpciones(req, res, db, io) {
  const { accion, datos } = req.body;
  console.log(`[SYNC OPCIONES] Acción: ${accion}`, JSON.stringify(datos));

  try {
    if (accion === 'CREAR') {
      const existentes = await db.OpcionRespuesta.findAll({
        where: { preguntas_id: datos.preguntas_id }
      });
      const existente = existentes.find(opt => opt.texto_opcion === datos.texto_opcion);
      if (existente) {
        return res.status(200).json({ success: true, message: "Opción ya existe", data: existente });
      }

      const nuevo = await db.OpcionRespuesta.create({
        preguntas_id: datos.preguntas_id,
        texto_opcion: datos.texto_opcion,
        es_correcta: datos.es_correcta,
        version: datos.version ?? 1
      });

      if (io) io.emit("hay_cambios");
      return res.status(201).json({ success: true, message: "Opción creada", data: nuevo });
    }

    if (accion === 'EDITAR') {
      const existente = await db.OpcionRespuesta.findByPk(datos.id);
      if (!existente) {
        return res.status(404).json({ success: false, message: "Opción no encontrada" });
      }

      await existente.update({
        preguntas_id: datos.preguntas_id ?? existente.preguntas_id,
        texto_opcion: datos.texto_opcion ?? existente.texto_opcion,
        es_correcta: datos.es_correcta !== undefined ? datos.es_correcta : existente.es_correcta,
        version: (existente.version || 1) + 1
      });

      if (io) io.emit("hay_cambios");
      return res.status(200).json({ success: true, message: "Opción actualizada", data: existente });
    }

    if (accion === 'ELIMINAR') {
      const existente = await db.OpcionRespuesta.findByPk(datos.id);
      if (!existente) {
        return res.status(200).json({ success: true, message: "Opción ya eliminada o no encontrada" });
      }

      await existente.destroy();

      if (io) io.emit("hay_cambios");
      return res.status(200).json({ success: true, message: "Opción eliminada" });
    }

    return res.status(400).json({ success: false, message: "Acción no soportada para opciones" });
  } catch (error) {
    console.error("Error al sincronizar Opción:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
