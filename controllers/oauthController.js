// ========================================
// CONTROLADOR DE AUTENTICACIÓN OAUTH
// ========================================

// Importar servicio OAuth que maneja la lógica de negocio
const oauthService = require('../services/oauthService');

// Importar función para validar resultados de express-validator
const { validationResult } = require('express-validator');

// ========================================
// FUNCIONES DE AUTENTICACIÓN
// ========================================

/**
 * Login/Registro con Google OAuth
 * Permite a los usuarios autenticarse usando su cuenta de Google
 * @param {Object} req - Request object con token de Google
 * @param {Object} res - Response object
 */
const loginConGoogle = async (req, res) => {
  try {
    // Verificar si hay errores de validación en los datos de entrada
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Datos de entrada inválidos',
        errors: errors.array()
      });
    }

    // Extraer el token de Google del cuerpo de la petición
    const { token } = req.body;

    // Llamar al servicio OAuth para procesar el login con Google
    const resultado = await oauthService.loginConGoogle(token);

    // Responder con éxito y datos del usuario
    res.json({
      success: true,
      message: resultado.esNuevoUsuario ? 'Usuario registrado exitosamente' : 'Login exitoso',
      data: {
        usuario: resultado.usuario,
        token: resultado.token,
        esNuevoUsuario: resultado.esNuevoUsuario
      }
    });
  } catch (error) {
    // Registrar error y responder con mensaje de error
    console.error('Error en login con Google:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

/**
 * Login/Registro con WhatsApp OAuth
 * Permite a los usuarios autenticarse usando WhatsApp
 * @param {Object} req - Request object con token y número de teléfono
 * @param {Object} res - Response object
 */
const loginConWhatsApp = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Datos de entrada inválidos',
        errors: errors.array()
      });
    }

    const { token, numeroTelefono } = req.body;

    const resultado = await oauthService.loginConWhatsApp(token, numeroTelefono);

    res.json({
      success: true,
      message: resultado.esNuevoUsuario ? 'Usuario registrado exitosamente' : 'Login exitoso',
      data: {
        usuario: resultado.usuario,
        token: resultado.token,
        esNuevoUsuario: resultado.esNuevoUsuario
      }
    });
  } catch (error) {
    console.error('Error en login con WhatsApp:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

/**
 * Vincular cuenta OAuth adicional
 * Permite a un usuario autenticado vincular una cuenta OAuth adicional
 * @param {Object} req - Request object con datos del usuario autenticado
 * @param {Object} res - Response object
 */
const vincularOAuth = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Datos de entrada inválidos',
        errors: errors.array()
      });
    }

    const { proveedor, token } = req.body;
    const idUsuario = req.user.id_usuario;

    const resultado = await oauthService.vincularOAuth(idUsuario, proveedor, token);

    res.json({
      success: true,
      message: resultado.message,
      data: {
        usuario: resultado.usuario
      }
    });
  } catch (error) {
    console.error('Error al vincular OAuth:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

/**
 * Desvincular cuenta OAuth
 * Permite a un usuario autenticado desvincular su cuenta OAuth
 * @param {Object} req - Request object con datos del usuario autenticado
 * @param {Object} res - Response object
 */
const desvincularOAuth = async (req, res) => {
  try {
    const { proveedor } = req.params;
    const idUsuario = req.user.id_usuario;

    const resultado = await oauthService.desvincularOAuth(idUsuario, proveedor);

    res.json({
      success: true,
      message: resultado.message,
      data: {
        usuario: resultado.usuario
      }
    });
  } catch (error) {
    console.error('Error al desvincular OAuth:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

/**
 * Obtener información OAuth del usuario
 * Devuelve información sobre las cuentas OAuth vinculadas del usuario
 * @param {Object} req - Request object con datos del usuario autenticado
 * @param {Object} res - Response object
 */
const obtenerInfoOAuth = async (req, res) => {
  try {
    const idUsuario = req.user.id_usuario;

    const infoOAuth = await oauthService.obtenerInfoOAuth(idUsuario);

    res.json({
      success: true,
      data: {
        oauth: infoOAuth
      }
    });
  } catch (error) {
    console.error('Error al obtener info OAuth:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

/**
 * Verificar estado de configuración OAuth
 * Verifica si un proveedor OAuth está configurado y disponible
 * @param {Object} req - Request object con parámetro de proveedor
 * @param {Object} res - Response object
 */
const verificarEstadoOAuth = async (req, res) => {
  try {
    const { proveedor } = req.params;

    if (!['google', 'whatsapp'].includes(proveedor)) {
      return res.status(400).json({
        success: false,
        message: 'Proveedor OAuth no válido'
      });
    }

    // Verificar configuración del proveedor
    const configuracion = {
      google: {
        habilitado: !!process.env.GOOGLE_CLIENT_ID,
        clientId: process.env.GOOGLE_CLIENT_ID
      },
      whatsapp: {
        habilitado: !!process.env.WHATSAPP_ACCESS_TOKEN,
        // En producción, no exponer el token
        configurado: !!process.env.WHATSAPP_ACCESS_TOKEN
      }
    };

    res.json({
      success: true,
      data: {
        proveedor,
        configuracion: configuracion[proveedor]
      }
    });
  } catch (error) {
    console.error('Error al verificar estado OAuth:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// ========================================
// EXPORTACIÓN DE FUNCIONES
// ========================================

// Exportar todas las funciones del controlador para uso en las rutas
module.exports = {
  loginConGoogle,        // Login con Google OAuth
  loginConWhatsApp,      // Login con WhatsApp OAuth
  vincularOAuth,         // Vincular cuenta OAuth adicional
  desvincularOAuth,       // Desvincular cuenta OAuth
  obtenerInfoOAuth,      // Obtener información OAuth del usuario
  verificarEstadoOAuth   // Verificar estado de configuración OAuth
};

