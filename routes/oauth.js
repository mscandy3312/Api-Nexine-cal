const express = require('express');
const router = express.Router();
const { body, param, validationResult } = require('express-validator');
const oauthController = require('../controllers/oauthController');
const auth = require('../middleware/auth');

/**
 * Rutas para autenticación OAuth
 * Maneja login/registro con Google y WhatsApp
 */

// ========================================
// VALIDACIONES DE ENTRADA
// ========================================

// Validaciones para login con Google
// Verifica que el token de Google sea válido
const validacionesGoogle = [
  body('token')
    .notEmpty()
    .withMessage('El token de Google es requerido')
    .isString()
    .withMessage('El token debe ser una cadena de texto')
];

// Validaciones para login con WhatsApp
// Verifica token y número de teléfono
const validacionesWhatsApp = [
  body('token')
    .notEmpty()
    .withMessage('El token de WhatsApp es requerido')
    .isString()
    .withMessage('El token debe ser una cadena de texto'),
  body('numeroTelefono')
    .notEmpty()
    .withMessage('El número de teléfono es requerido')
    .isMobilePhone()
    .withMessage('El número de teléfono debe ser válido')
];

// Validaciones para vincular OAuth
// Verifica proveedor y token para vincular cuenta
const validacionesVincular = [
  body('proveedor')
    .isIn(['google', 'whatsapp'])
    .withMessage('El proveedor debe ser google o whatsapp'),
  body('token')
    .notEmpty()
    .withMessage('El token es requerido')
    .isString()
    .withMessage('El token debe ser una cadena de texto')
];

// Validaciones para parámetros de proveedor
// Verifica que el proveedor en la URL sea válido
const validacionesProveedor = [
  param('proveedor')
    .isIn(['google', 'whatsapp'])
    .withMessage('El proveedor debe ser google o whatsapp')
];

// ========================================
// MIDDLEWARE DE VALIDACIÓN
// ========================================

/**
 * Middleware para manejar errores de validación
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Datos de entrada inválidos',
      errors: errors.array()
    });
  }
  next();
};

// ========================================
// RUTAS DE AUTENTICACIÓN OAUTH
// ========================================

/**
 * @route POST /api/oauth/google
 * @desc Login/Registro con Google OAuth
 * @access Public
 * @body {string} token - Token de Google OAuth
 */
router.post('/google', validacionesGoogle, handleValidationErrors, oauthController.loginConGoogle);

/**
 * @route POST /api/oauth/whatsapp
 * @desc Login/Registro con WhatsApp OAuth
 * @access Public
 * @body {string} token - Token de WhatsApp
 * @body {string} numeroTelefono - Número de teléfono del usuarioss
 */
router.post('/whatsapp', validacionesWhatsApp, handleValidationErrors, oauthController.loginConWhatsApp);

/**
 * @route POST /api/oauth/vincular
 * @desc Vincular cuenta OAuth adicional al usuarioss autenticado
 * @access Private
 * @body {string} proveedor - Proveedor OAuth (google/whatsapp)
 * @body {string} token - Token del proveedor OAuth
 */
router.post('/vincular', auth.authenticateToken, validacionesVincular, handleValidationErrors, oauthController.vincularOAuth);

/**
 * @route DELETE /api/oauth/desvincular/:proveedor
 * @desc Desvincular cuenta OAuth del usuarioss autenticado
 * @access Private
 * @param {string} proveedor - Proveedor OAuth a desvincular
 */
router.delete('/desvincular/:proveedor', auth.authenticateToken, validacionesProveedor, handleValidationErrors, oauthController.desvincularOAuth);

/**
 * @route GET /api/oauth/info
 * @desc Obtener información OAuth del usuarioss autenticado
 * @access Private
 */
router.get('/info', auth.authenticateToken, oauthController.obtenerInfoOAuth);

/**
 * @route GET /api/oauth/estado/:proveedor
 * @desc Verificar estado de configuración de un proveedor OAuth
 * @access Public
 * @param {string} proveedor - Proveedor OAuth a verificar
 */
router.get('/estado/:proveedor', validacionesProveedor, handleValidationErrors, oauthController.verificarEstadoOAuth);

/**
 * @route GET /api/oauth/proveedores
 * @desc Obtener lista de proveedores OAuth disponibles
 * @access Public
 * @returns {Object} Lista de proveedores OAuth configurados
 */
router.get('/proveedores', (req, res) => {
  // Endpoint para obtener información de proveedores OAuth disponibles
  // Útil para que el frontend sepa qué opciones de login mostrar
  res.json({
    success: true,
    data: {
      proveedores: [
        {
          nombre: 'google',
          habilitado: !!process.env.GOOGLE_CLIENT_ID, // Verifica si Google está configurado
          descripcion: 'Autenticación con Google',
          icono: 'https://developers.google.com/identity/images/g-logo.png'
        },
        {
          nombre: 'whatsapp',
          habilitado: !!process.env.WHATSAPP_ACCESS_TOKEN, // Verifica si WhatsApp está configurado
          descripcion: 'Autenticación con WhatsApp',
          icono: 'https://web.whatsapp.com/favicon.ico'
        }
      ]
    }
  });
});

// ========================================
// EXPORTACIÓN DEL ROUTER
// ========================================

// Exportar el router para ser usado en server.js
module.exports = router;
