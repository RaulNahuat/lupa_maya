import fs from "fs/promises";
import path from "path";

// Función auxiliar para eliminar un archivo de la carpeta física del servidor de forma segura
async function safeUnlink(url) {
  if (!url) return;
  try {
    // Si contiene la URL completa (ej. http://localhost:5000/assets/...), extraemos la ruta relativa
    let relativePath = url;
    if (url.includes('/assets/')) {
      relativePath = url.substring(url.indexOf('/assets/'));
    }
    // Asegurar que comience sin barra inicial para path.join
    const cleanPath = relativePath.replace(/^\//, '');
    const absolutePath = path.join(process.cwd(), 'public', cleanPath);
    
    await fs.unlink(absolutePath);
    console.log(`[FILE DELETION] Archivo eliminado físicamente del servidor: ${absolutePath}`);
  } catch (err) {
    console.error(`[FILE DELETION] No se pudo eliminar el archivo ${url}:`, err.message);
  }
}

export async function handleSyncGlifos(req, res, db, io) {
  const { accion, datos } = req.body;
  console.log(`[SYNC GLIFOS] Acción: ${accion}`, JSON.stringify(datos));

  try {
    if (accion === 'CREAR') {
      const existente = await db.Glifo.findOne({
        where: {
          nombre_maya: datos.nombre_maya,
          grupo_id: datos.grupo_id,
          activo: true
        }
      });
      if (existente) {
        console.log(`[SYNC GLIFOS] Ya existe:`, existente.id);
        return res.status(200).json({
          success: true,
          message: "Glifo ya existe",
          data: existente.toJSON()
        });
      }

      console.log(`[SYNC GLIFOS] Creando nuevo Glifo en DB sin id...`);
      const nuevo = await db.Glifo.create({
        grupo_id: datos.grupo_id,
        nombre_maya: datos.nombre_maya,
        significado_es: datos.significado_es,
        pronunciacion: datos.pronunciacion || '',
        descripcion: datos.descripcion || null,
        imagen_url: datos.imagen_url,
        audio_url: datos.audio_url || null,
        video_url: datos.video_url || null,
        clase_modelo: datos.clase_modelo || null,
        activo: datos.activo ?? true,
        version: datos.version ?? 1
      });

      console.log(`[SYNC GLIFOS] Creado con ID autoincremental de DB:`, nuevo.id);

      if (io) io.emit("hay_cambios");
      return res.status(201).json({ success: true, message: "Creado", data: nuevo });
    }

    if (accion === 'EDITAR') {
      const existente = await db.Glifo.findByPk(datos.id);
      if (!existente) {
        return res.status(404).json({ success: false, message: "Glifo no encontrado" });
      }

      // Si se está actualizando la imagen, borrar la física antigua del servidor
      if (datos.imagen_url && existente.imagen_url && datos.imagen_url !== existente.imagen_url) {
        await safeUnlink(existente.imagen_url);
      }
      // Si se está actualizando el audio (o se eliminó), borrar el físico antiguo
      if (datos.audio_url !== undefined && existente.audio_url && datos.audio_url !== existente.audio_url) {
        await safeUnlink(existente.audio_url);
      }
      // Si se está actualizando el video (o se eliminó), borrar el físico antiguo
      if (datos.video_url !== undefined && existente.video_url && datos.video_url !== existente.video_url) {
        await safeUnlink(existente.video_url);
      }

      await existente.update({
        grupo_id: datos.grupo_id ?? existente.grupo_id,
        nombre_maya: datos.nombre_maya ?? existente.nombre_maya,
        significado_es: datos.significado_es ?? existente.significado_es,
        pronunciacion: datos.pronunciacion ?? existente.pronunciacion,
        descripcion: datos.descripcion !== undefined ? datos.descripcion : existente.descripcion,
        imagen_url: datos.imagen_url ?? existente.imagen_url,
        audio_url: datos.audio_url !== undefined ? datos.audio_url : existente.audio_url,
        video_url: datos.video_url !== undefined ? datos.video_url : existente.video_url,
        clase_modelo: datos.clase_modelo !== undefined ? datos.clase_modelo : existente.clase_modelo,
        activo: datos.activo ?? existente.activo,
        version: (existente.version || 1) + 1
      });

      if (io) io.emit("hay_cambios");
      return res.status(200).json({ success: true, message: "Actualizado", data: existente });
    }

    if (accion === 'ELIMINAR') {
      const existente = await db.Glifo.findByPk(datos.id);
      if (!existente) {
        return res.status(200).json({ success: true, message: "Glifo ya eliminado o no encontrado" });
      }

      // Eliminar archivos físicos del servidor antes de destruir el registro en la DB
      await safeUnlink(existente.imagen_url);
      await safeUnlink(existente.audio_url);
      await safeUnlink(existente.video_url);

      await existente.destroy();

      if (io) io.emit("hay_cambios");
      return res.status(200).json({ success: true, message: "Glifo eliminado de la base de datos y archivos físicos removidos" });
    }

    return res.status(400).json({ success: false, message: "Acción no soportada para glifos" });
  } catch (error) {
    console.error("Error al sincronizar Glifo:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
