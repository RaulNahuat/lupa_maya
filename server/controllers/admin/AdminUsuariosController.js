
export async function getAllUsuarios(req, res, db) {
  try {
    const usuarios = await db.Usuario.findAll({
      where: { deleted_at: null },
      attributes: [
        'id', 'nombre', 'apellido', 'username', 'escuela', 'lugar_procedencia', 'genero', 'grado', 'local_id', 'created_at'
      ],
      include: [
        {
          model: db.ProgresoUsuario,
          as: 'progresos',
          attributes: ['estrellas', 'completado']
        },
        {
          model: db.Insignia,
          as: 'insignias',
          attributes: ['id'],
          through: { attributes: [] }
        }
      ]
    });

    const processedUsuarios = usuarios.map(u => {
      const data = u.toJSON();
      const stars = data.progresos?.reduce((acc, p) => acc + (p.estrellas || 0), 0) || 0;
      const completedLevels = data.progresos?.filter(p => p.completado).length || 0;
      const badges = data.insignias?.length || 0;

      return {
        ...data,
        name: `${data.nombre} ${data.apellido}`,
        email: data.username,
        level: completedLevels,
        stars,
        badges,
        status: "ACTIVO"
      };
    });

    res.json({ success: true, data: processedUsuarios });
  } catch (error) {
    console.error("Error al obtener usuarios de admin:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function updateUsuario(req, res, db, io) {
  const { id } = req.params;
  const { nombre, apellido, username, escuela, lugar_procedencia, genero, grado, pin_hash } = req.body;

  try {
    const usuario = await db.Usuario.findByPk(id);
    if (!usuario) {
      return res.status(404).json({ success: false, message: "Usuario no encontrado" });
    }

    await usuario.update({
      nombre,
      apellido,
      username,
      escuela,
      lugar_procedencia,
      genero,
      grado,
      pin_hash: pin_hash || usuario.pin_hash
    });

    if (io) io.emit("hay_cambios");

    res.json({ success: true, message: "Usuario actualizado", data: usuario });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function deleteUsuario(req, res, db, io) {
  const { id } = req.params;

  try {
    const usuario = await db.Usuario.findByPk(id);
    if (!usuario) {
      return res.status(404).json({ success: false, message: "Usuario no encontrado" });
    }

    // Soft delete
    await usuario.update({ deleted_at: new Date() });

    if (io) io.emit("hay_cambios");

    res.json({ success: true, message: "Usuario eliminado" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}
