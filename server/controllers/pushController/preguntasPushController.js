export async function handleSyncPreguntas(req, res, db, io) {
  const { accion, datos } = req.body;
  console.log(`[SYNC PREGUNTAS] Acción: ${accion}`, JSON.stringify(datos));

  try {
    if (accion === 'CREAR') {
      console.log(`[SYNC PREGUNTAS] Creando nueva pregunta en DB...`);

      const nuevo = await db.Pregunta.create({
        nivel_id: datos.nivel_id,
        texto_pregunta: datos.texto_pregunta,
        glifo_id: datos.glifo_id,
        activa: datos.activa !== false,
        version: datos.version ?? 1
      });

      if (io) io.emit("hay_cambios");
      return res.status(201).json({ success: true, message: "Pregunta creada", data: nuevo });
    }

    if (accion === 'EDITAR') {
      const existente = await db.Pregunta.findByPk(datos.id);
      if (!existente) {
        return res.status(404).json({ success: false, message: "Pregunta no encontrada" });
      }

      await existente.update({
        nivel_id: datos.nivel_id ?? existente.nivel_id,
        texto_pregunta: datos.texto_pregunta ?? existente.texto_pregunta,
        glifo_id: datos.glifo_id !== undefined ? datos.glifo_id : existente.glifo_id,
        activa: datos.activa !== undefined ? datos.activa : existente.activa,
        version: (existente.version || 1) + 1
      });

      if (io) io.emit("hay_cambios");
      return res.status(200).json({ success: true, message: "Pregunta actualizada", data: existente });
    }

    if (accion === 'ELIMINAR') {
      const existente = await db.Pregunta.findByPk(datos.id);
      if (!existente) {
        return res.status(200).json({ success: true, message: "Pregunta ya eliminada o no encontrada" });
      }

      //Elimina las opciones asociadas de esta pregunta primero para evitar fallos de clave foránea
      await db.OpcionRespuesta.destroy({
        where: { preguntas_id: datos.id }
      });

      await existente.destroy();

      if (io) io.emit("hay_cambios");
      return res.status(200).json({ success: true, message: "Pregunta eliminada" });
    }

    return res.status(400).json({ success: false, message: "Acción no soportada para preguntas" });
  } catch (error) {
    console.error("Error al sincronizar Pregunta:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
