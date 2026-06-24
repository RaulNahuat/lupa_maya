import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { sendResetEmail } from "../utils/mailer.js";

export default function(db, io) {
  const router = express.Router();

  // POST /api/auth/forgot-password
  router.post("/forgot-password", async (req, res) => {
    const { email } = req.body;

    try {
      if (!email) {
        return res.status(400).json({ success: false, message: "El correo electrónico es requerido." });
      }

      const admin = await db.Admin.findOne({ where: { email } });

      // Si el correo no existe o es un docente (rol_id === 3), devolvemos el mismo mensaje de éxito por seguridad y privacidad
      if (!admin || Number(admin.rol_id) === 3) {
        return res.status(200).json({ 
          success: true, 
          message: "Si el correo electrónico está registrado, recibirás un enlace de recuperación." 
        });
      }

      const secret = (process.env.JWT_SECRET || 'secret-key-12345') + admin.password_hash;
      const token = jwt.sign(
        { id: admin.id, email: admin.email },
        secret,
        { expiresIn: '1h' }
      );

      await sendResetEmail(admin.email, token);

      return res.status(200).json({ 
        success: true, 
        message: "Si el correo electrónico está registrado, recibirás un enlace de recuperación." 
      });
    } catch (error) {
      console.error("Error en forgot-password:", error);
      return res.status(500).json({ success: false, message: "Hubo un error al procesar tu solicitud." });
    }
  });

  // POST /api/auth/reset-password
  router.post("/reset-password", async (req, res) => {
    const { token, newPassword } = req.body;

    try {
      if (!token || !newPassword) {
        return res.status(400).json({ success: false, message: "Token y nueva contraseña son requeridos." });
      }

      // Decodificar el token sin verificar la firma para extraer el ID
      const payload = jwt.decode(token);
      if (!payload || !payload.id) {
        return res.status(400).json({ success: false, message: "El enlace de recuperación es inválido." });
      }

      // Buscar al administrador en la base de datos
      const admin = await db.Admin.findByPk(payload.id);
      if (!admin) {
        return res.status(404).json({ success: false, message: "Administrador no encontrado." });
      }

      // Verificar el token usando el hash de contraseña actual
      let decoded;
      try {
        const secret = (process.env.JWT_SECRET || 'secret-key-12345') + admin.password_hash;
        decoded = jwt.verify(token, secret);
      } catch (err) {
        return res.status(400).json({ success: false, message: "El enlace de recuperación es inválido o ha expirado." });
      }

      const password_hash = bcrypt.hashSync(newPassword, 10);

      await admin.update({
        password_hash,
        updated_at: new Date()
      });

      io.emit('hay_cambios');

      return res.status(200).json({ 
        success: true, 
        message: "Tu contraseña ha sido restablecida correctamente.",
        email: admin.email,
        local_id: admin.local_id,
        password_hash: password_hash
      });
    } catch (error) {
      console.error("Error en reset-password:", error);
      return res.status(500).json({ success: false, message: "Hubo un error al restablecer la contraseña." });
    }
  });

  return router;
}
