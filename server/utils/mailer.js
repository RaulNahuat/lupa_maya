import nodemailer from 'nodemailer';

/**
 * Envía un correo con el enlace para restablecer la contraseña.
 * @param {string} email - Correo del administrador
 * @param {string} token - Token de recuperación
 */
export const sendResetEmail = async (email, token) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_PORT === '465', // true para 465, false para otros
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const resetLink = `${frontendUrl}/reset-password?token=${token}`;

  const mailOptions = {
    from: `"GlifoAventura" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Restablecer contraseña - GlifoAventura',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #0d9488; text-align: center;">GlifoAventura</h2>
        <p>Hola,</p>
        <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta de Administrador en GlifoAventura.</p>
        <p>Para proceder, haz clic en el siguiente enlace. Este enlace es válido por 1 hora:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="background-color: #0d9488; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
            Restablecer Contraseña
          </a>
        </div>
        <p>Si el botón no funciona, copia y pega la siguiente URL en tu navegador:</p>
        <p style="word-break: break-all; color: #666;">${resetLink}</p>
        <p style="margin-top: 30px; font-size: 0.8em; color: #888;">
          Si tú no solicitaste este cambio, puedes ignorar este correo de forma segura.
        </p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};
