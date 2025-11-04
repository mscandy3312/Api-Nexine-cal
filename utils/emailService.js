const nodemailer = require('nodemailer');

// 1. Configurar el "transporter" (el cartero)
// Lee las credenciales de tu archivo .env
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_PORT == 465, // true para 465, false para otros (como 587)
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // La contraseña de aplicación de 16 letras
  },
  tls: {
    rejectUnauthorized: false // A veces necesario para localhost
  }
});

/**
 * Envía un código de verificación de 6 dígitos.
 * @param {string} email - El email del destinatario.
 * @param {string} code - El código de 6 dígitos.
 */
const sendVerificationCode = async (email, code) => {
  console.log(`[Email Service] Intentando enviar código ${code} a ${email}...`);

  const mailOptions = {
    from: `"Naxine" <${process.env.EMAIL_USER}>`, // Remitente
    to: email, // Destinatario
    subject: `Tu código de verificación de Naxine: ${code}`, // Asunto
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #FF6600;">¡Bienvenido a Naxine!</h2>
        <p>Tu código de verificación de 6 dígitos es:</p>
        <p style="font-size: 28px; font-weight: bold; letter-spacing: 3px; color: #FF6600; margin: 20px 0;">
          ${code}
        </p>
        <p>Este código expirará en 10 minutos.</p>
        <p style="font-size: 0.9em; color: #777;">Si no solicitaste este registro, por favor ignora este mensaje.</p>
      </div>
    `
  };

  try {
    // 3. Enviar el correo
    let info = await transporter.sendMail(mailOptions);

    console.log(`[Email Service] Email enviado con éxito a: ${email}`);
    console.log(`[Email Service] Respuesta de Nodemailer (info): ${info.response}`);
    
    // ¡ALERTA DE GMAIL! A veces Gmail acepta el correo pero luego lo rechaza.
    if (info.rejected && info.rejected.length > 0) {
      console.warn(`[Email Service] ¡ALERTA! El servidor aceptó el correo pero fue RECHAZADO para: ${info.rejected}`);
    }

  } catch (error) {
    console.error(`[Email Service] ¡ERROR FATAL al enviar email a ${email}!`, error);
    
    // Si el error es de autenticación, informarlo claramente
    if (error.code === 'EAUTH') {
      console.error('[Email Service] Error de autenticación. Revisa tu EMAIL_USER y EMAIL_PASS en el .env');
    }
    
    // Relanzar el error para que el controlador lo atrape
    throw new Error('Error al enviar el email de verificación.');
  }
};

module.exports = {
  sendVerificationCode
};

