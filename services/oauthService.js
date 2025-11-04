// ========================================
// SERVICIO DE AUTENTICACIÓN OAUTH
// ========================================

// Importar clientes de Google OAuth2 para verificar tokens
const { OAuth2Client } = require('google-auth-library');

// --- CORREGIDO ---
// Importar modelo de 'usuarios' y asignarlo a una variable en Mayúscula (Usuario)
// para distinguirla de las variables locales.
const Usuario = require('../models/usuarios');

// Importar JWT para generar tokens de autenticación
const jwt = require('jsonwebtoken');

// Cargar variables de entorno
require('dotenv').config();

/**
 * Clase que maneja toda la lógica de autenticación OAuth
 * Incluye integración con Google y WhatsApp
 */
class OAuthService {
  constructor() {
    // Inicializar clientes de Google OAuth con el ID de clientes
    this.googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  }

  /**
   * Generar token JWT para autenticación
   * @param {Object} usuario - Objeto usuario con datos para el token (corregido de 'usuarioss')
   * @returns {string} Token JWT firmado
   */
  generarJWT(usuario) {
    return jwt.sign(
      {
        // --- CORREGIDO --- (de id_usuarioss a id_usuario)
        id: usuario.id_usuario,       // ID único del usuario
        email: usuario.email,         // Email del usuario
        nombre: usuario.nombre,       // Nombre del usuario
        rol: usuario.rol             // Rol del usuario (admin, profesional, clientes)
      },
      process.env.JWT_SECRET,        // Clave secreta para firmar el token
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' } // Tiempo de expiración
    );
  }

  /**
   * Verificar token de Google OAuth
   * Valida que el token sea válido y extrae información del usuario
   * @param {string} token - Token de Google OAuth
   * @returns {Object} Datos del usuario de Google
   */
  async verificarTokenGoogle(token) {
    try {
      // Verificar el token con Google
      const ticket = await this.googleClient.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID
      });
      
      // Extraer datos del usuario del token verificado
      const payload = ticket.getPayload();
      return {
        googleId: payload.sub,              // ID único de Google
        email: payload.email,                // Email del usuario
        nombre: payload.name,                // Nombre completo
        foto: payload.picture,               // URL de la foto de perfil
        emailVerificado: payload.email_verified // Si el email está verificado
      };
    } catch (error) {
      throw new Error('Token de Google inválido');
    }
  }

  // Login/Registro con Google
  async loginConGoogle(token) {
    try {
      const googleData = await this.verificarTokenGoogle(token);
      
      // --- CORREGIDO --- (Usa la variable 'Usuario' importada, no 'usuarioss' indefinida)
      let usuario = await Usuario.findByEmail(googleData.email);
      
      if (usuario) {
        // usuario existe, actualizar datos OAuth si es necesario
        if (!usuario.oauth_provider || usuario.oauth_provider !== 'google') {
          await usuario.update({
            oauth_provider: 'google',
            oauth_id: googleData.googleId
          });
        }
      } else {
        // --- CORREGIDO --- (Usa la variable 'Usuario' importada)
        usuario = await Usuario.create({
          email: googleData.email,
          nombre: googleData.nombre,
          oauth_provider: 'google',
          oauth_id: googleData.googleId,
          is_verified: googleData.emailVerificado
        });
      }

      // Generar JWT (corregido a 'usuario')
      const jwtToken = this.generarJWT(usuario);

      return {
        usuario: usuario.toJSON(),
        token: jwtToken,
        esNuevoUsuario: !usuario.oauth_provider // (corregido 'esNuevousuarioss')
      };
    } catch (error) {
      throw error;
    }
  }

  // Verificar token de WhatsApp (simulado)
  async verificarTokenWhatsApp(token, numeroTelefono) {
    try {
      // En una implementación real, aquí se haría la verificación con WhatsApp Business API
      // Por ahora, simulamos la verificación
      
      if (!token || !numeroTelefono) {
        throw new Error('Token y número de teléfono son requeridos');
      }

      // Simular datos de WhatsApp
      return {
        whatsappId: `whatsapp_${numeroTelefono}`,
        numeroTelefono: numeroTelefono,
        nombre: `Usuario WhatsApp ${numeroTelefono}`, // (corregido 'usuarioss')
        email: `${numeroTelefono}@whatsapp.local`
      };
    } catch (error) {
      throw new Error('Token de WhatsApp inválido');
    }
  }

  // Login/Registro con WhatsApp
  async loginConWhatsApp(token, numeroTelefono) {
    try {
      const whatsappData = await this.verificarTokenWhatsApp(token, numeroTelefono);
      
      // --- CORREGIDO --- (Usa la variable 'Usuario' importada)
      let usuario = await Usuario.findByEmail(whatsappData.email);
      
      if (usuario) {
        // usuario existe, actualizar datos OAuth si es necesario
        if (!usuario.oauth_provider || usuario.oauth_provider !== 'whatsapp') {
          await usuario.update({
            oauth_provider: 'whatsapp',
            oauth_id: whatsappData.whatsappId
          });
        }
      } else {
        // --- CORREGIDO --- (Usa la variable 'Usuario' importada)
        usuario = await Usuario.create({
          email: whatsappData.email,
          nombre: whatsappData.nombre,
          oauth_provider: 'whatsapp',
          oauth_id: whatsappData.whatsappId,
          is_verified: true // WhatsApp verifica automáticamente
        });
      }

      // Generar JWT (corregido a 'usuario')
      const jwtToken = this.generarJWT(usuario);

      return {
        usuario: usuario.toJSON(),
        token: jwtToken,
        esNuevoUsuario: !usuario.oauth_provider // (corregido 'esNuevousuarioss')
      };
    } catch (error) {
      throw error;
    }
  }

  // Desvincular cuenta OAuth
  async desvincularOAuth(idUsuario, proveedor) { // (corregido 'idusuarioss')
    try {
      // --- CORREGIDO --- (Usa la variable 'Usuario' importada)
      const usuario = await Usuario.findById(idUsuario);
      
      if (!usuario) {
        throw new Error('Usuario no encontrado'); // (corregido 'usuarioss')
      }

      if (usuario.oauth_provider !== proveedor) {
        throw new Error('El usuario no tiene vinculada una cuenta de este proveedor'); // (corregido 'usuarioss')
      }

      // Actualizar usuario para remover OAuth
      await usuario.update({
        oauth_provider: null,
        oauth_id: null
      });

      return {
        message: `Cuenta ${proveedor} desvinculada exitosamente`,
        usuario: usuario.toJSON()
      };
    } catch (error) {
      throw error;
    }
  }

  // Vincular cuenta OAuth adicional
  async vincularOAuth(idUsuario, proveedor, token) { // (corregido 'idusuarioss')
    try {
      // --- CORREGIDO --- (Usa la variable 'Usuario' importada)
      const usuario = await Usuario.findById(idUsuario);
      
      if (!usuario) {
        throw new Error('Usuario no encontrado'); // (corregido 'usuarioss')
      }

      if (usuario.oauth_provider) {
        throw new Error('El usuario ya tiene una cuenta OAuth vinculada'); // (corregido 'usuarioss')
      }

      let oauthData;
      
      if (proveedor === 'google') {
        oauthData = await this.verificarTokenGoogle(token);
        await usuario.update({
          oauth_provider: 'google',
          oauth_id: oauthData.googleId
        });
      } else if (proveedor === 'whatsapp') {
        // Para WhatsApp necesitaríamos el número de teléfono también
        throw new Error('WhatsApp requiere número de teléfono adicional');
      } else {
        throw new Error('Proveedor OAuth no soportado');
      }

      return {
        message: `Cuenta ${proveedor} vinculada exitosamente`,
        usuario: usuario.toJSON()
      };
    } catch (error) {
      throw error;
    }
  }

  // Obtener información de OAuth del usuario
  async obtenerInfoOAuth(idUsuario) { // (corregido 'idusuarioss')
    try {
      // --- CORREGIDO --- (Usa la variable 'Usuario' importada)
      const usuario = await Usuario.findById(idUsuario);
      
      if (!usuario) {
        throw new Error('Usuario no encontrado'); // (corregido 'usuarioss')
      }

      return {
        tieneOAuth: !!usuario.oauth_provider,
        proveedor: usuario.oauth_provider,
        oauthId: usuario.oauth_id,
        emailVerificado: usuario.is_verified
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new OAuthService();
