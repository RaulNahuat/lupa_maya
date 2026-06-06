import fs from "fs/promises";
import path from "path";

// Función auxiliar para eliminar un archivo de la carpeta física del servidor de forma segura
async function safeUnlink(url) {
  if (!url) return;
  try {
    let relativePath = url;
    if (url.includes('/assets/')) {
      relativePath = url.substring(url.indexOf('/assets/'));
    }
    const cleanPath = relativePath.replace(/^\//, '');
    const absolutePath = path.join(process.cwd(), 'public', cleanPath);
    
    await fs.unlink(absolutePath);
    console.log(`[FILE DELETION] Icono de insignia eliminado físicamente del servidor: ${absolutePath}`);
  } catch (err) {
    console.error(`[FILE DELETION] No se pudo eliminar el archivo de icono ${url}:`, err.message);
  }
}

export async function handleSyncInsignias(req, res, db, io) {
  const { accion, datos } = req.body;
  console.log(`[SYNC INSIGNIAS] Acción: ${accion}`, JSON.stringify(datos));

  try {
    if (accion === 'CREAR') {
      const existente = await db.Insignia.findOne({
        where: {
          nombre: datos.nombre
        }
      });
      if (existente) {
        console.log(`[SYNC INSIGNIAS] Ya existe:`, existente.id);
        return res.status(200).json({
          success: true,
          message: "Insignia ya existe",
          data: existente.toJSON()
        });
      }

      console.log(`[SYNC INSIGNIAS] Creando nueva Insignia en DB sin id...`);
      const nuevo = await db.Insignia.create({
        nombre: datos.nombre,
        descripcion: datos.descripcion || null,
        icono_url: datos.icono_url || null,
        tipo_condicion: datos.tipo_condicion,
        valor_condicion: datos.valor_condicion,
        version: datos.version ?? 1
      });

      console.log(`[SYNC INSIGNIAS] Creado con ID autoincremental de DB:`, nuevo.id);

      if (io) io.emit("hay_cambios");
      return res.status(201).json({ success: true, message: "Creado", data: nuevo });
    }

    if (accion === 'EDITAR') {
      const existente = await db.Insignia.findByPk(datos.id);
      if (!existente) {
        return res.status(404).json({ success: false, message: "Insignia no encontrada" });
      }

      // Si se está actualizando la imagen, borrar la física antigua del servidor
      if (datos.icono_url && existente.icono_url && datos.icono_url !== existente.icono_url) {
        await safeUnlink(existente.icono_url);
      }

      await existente.update({
        nombre: datos.nombre ?? existente.nombre,
        descripcion: datos.descripcion !== undefined ? datos.descripcion : existente.descripcion,
        icono_url: datos.icono_url ?? existente.icono_url,
        tipo_condicion: datos.tipo_condicion ?? existente.tipo_condicion,
        valor_condicion: datos.valor_condicion ?? existente.valor_condicion,
        version: (existente.version || 1) + 1
      });

      if (io) io.emit("hay_cambios");
      return res.status(200).json({ success: true, message: "Actualizado", data: existente });
    }

    if (accion === 'ELIMINAR') {
      const existente = await db.Insignia.findByPk(datos.id);
      if (!existente) {
        return res.status(200).json({ success: true, message: "Insignia ya eliminada o no encontrada" });
      }

      // Eliminar archivo físico de icono del servidor antes de destruir el registro
      if (existente.icono_url) {
        await safeUnlink(existente.icono_url);
      }

      // Eliminar relaciones de usuario antes de borrar la insignia
      await db.UsuarioInsignia.destroy({ where: { insignia_id: datos.id } });
      await existente.destroy();

      if (io) io.emit("hay_cambios");
      return res.status(200).json({ success: true, message: "Insignia eliminada de la base de datos y relaciones limpiadas" });
    }

    return res.status(400).json({ success: false, message: "Acción no soportada para insignias" });
  } catch (error) {
    console.error("Error al sincronizar Insignia:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
