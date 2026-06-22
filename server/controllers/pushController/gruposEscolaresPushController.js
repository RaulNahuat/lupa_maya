export async function handleSyncGruposEscolares(req, res, db, io) {
  const { accion, datos } = req.body;
  console.log(`[SYNC GRUPOS_ESCOLARES] Acción: ${accion}`, JSON.stringify(datos));

  try {
    if (accion === 'CREAR') {
      const existente = await db.GrupoEscolar.findOne({
        where: { local_id: datos.local_id }
      });
      if (existente) {
        return res.status(200).json({ success: true, message: "Ya existe", data: existente });
      }

      const nuevo = await db.GrupoEscolar.create({
        nombre: datos.nombre,
        descripcion: datos.descripcion,
        docente_id: datos.docente_id || null,
        local_id: datos.local_id
      });

      if (io) io.emit("hay_cambios");
      return res.status(201).json({ success: true, message: "Creado", data: nuevo });
    }

    if (accion === 'EDITAR') {
      const existente = await db.GrupoEscolar.findOne({
        where: { local_id: datos.local_id }
      });
      if (!existente) {
        return res.status(404).json({ success: false, message: "GrupoEscolar no encontrado" });
      }

      await existente.update({
        nombre: datos.nombre ?? existente.nombre,
        descripcion: datos.descripcion ?? existente.descripcion,
        docente_id: datos.docente_id !== undefined ? datos.docente_id : existente.docente_id
      });

      if (io) io.emit("hay_cambios");
      return res.status(200).json({ success: true, message: "Actualizado", data: existente });
    }

    if (accion === 'ELIMINAR') {
      const existente = await db.GrupoEscolar.findOne({
        where: { local_id: datos.local_id }
      });
      if (!existente) {
        return res.status(200).json({ success: true, message: "GrupoEscolar ya eliminado o no encontrado" });
      }

      // Desvincular alumnos asociados a este grupo escolar
      await db.Usuario.update({ grupo_escolar_id: null }, { where: { grupo_escolar_id: existente.id } });
      
      // Eliminar registros de control de bloques asociados
      await db.GrupoEscolarGrupoNivel.destroy({ where: { grupo_escolar_id: existente.id } });

      await existente.destroy();

      if (io) io.emit("hay_cambios");
      return res.status(200).json({ success: true, message: "GrupoEscolar eliminado" });
    }

    return res.status(400).json({ success: false, message: "Acción no soportada" });
  } catch (error) {
    console.error("Error al sincronizar GrupoEscolar:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function handleSyncGrupoEscolarGrupoNivel(req, res, db, io) {
  const { accion, datos } = req.body;
  console.log(`[SYNC GRUPO_ESCOLAR_GRUPO_NIVEL] Acción: ${accion}`, JSON.stringify(datos));

  try {
    if (accion === 'CREAR' || accion === 'EDITAR' || accion === 'UPSERT') {
      const [registro, creado] = await db.GrupoEscolarGrupoNivel.findOrCreate({
        where: {
          grupo_escolar_id: datos.grupo_escolar_id,
          grupo_nivel_id: datos.grupo_nivel_id
        },
        defaults: {
          activo: datos.activo ?? true
        }
      });

      if (!creado) {
        await registro.update({ activo: datos.activo });
      }

      if (io) io.emit("hay_cambios");
      return res.status(200).json({ success: true, data: registro });
    }

    if (accion === 'ELIMINAR') {
      await db.GrupoEscolarGrupoNivel.destroy({
        where: {
          grupo_escolar_id: datos.grupo_escolar_id,
          grupo_nivel_id: datos.grupo_nivel_id
        }
      });
      if (io) io.emit("hay_cambios");
      return res.status(200).json({ success: true, message: "Eliminado" });
    }

    return res.status(400).json({ success: false, message: "Acción no soportada" });
  } catch (error) {
    console.error("Error al sincronizar GrupoEscolarGrupoNivel:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function handleSyncUsuarioGrupoNivel(req, res, db, io) {
  const { accion, datos } = req.body;
  console.log(`[SYNC USUARIO_GRUPO_NIVEL] Acción: ${accion}`, JSON.stringify(datos));

  try {
    if (accion === 'CREAR' || accion === 'EDITAR' || accion === 'UPSERT') {
      const [registro, creado] = await db.UsuarioGrupoNivel.findOrCreate({
        where: {
          usuario_id: datos.usuario_id,
          grupo_nivel_id: datos.grupo_nivel_id
        },
        defaults: {
          activo: datos.activo
        }
      });

      if (!creado) {
        await registro.update({ activo: datos.activo });
      }

      if (io) io.emit("hay_cambios");
      return res.status(200).json({ success: true, data: registro });
    }

    if (accion === 'ELIMINAR') {
      await db.UsuarioGrupoNivel.destroy({
        where: {
          usuario_id: datos.usuario_id,
          grupo_nivel_id: datos.grupo_nivel_id
        }
      });
      if (io) io.emit("hay_cambios");
      return res.status(200).json({ success: true, message: "Eliminado" });
    }

    return res.status(400).json({ success: false, message: "Acción no soportada" });
  } catch (error) {
    console.error("Error al sincronizar UsuarioGrupoNivel:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
