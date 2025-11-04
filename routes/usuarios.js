// --- [RUTAS] routes/usuarios.js ¡CARGADO CORRECTAMENTE! ---
console.log('--- [RUTAS] routes/usuarios.js ¡CARGADO CORRECTAMENTE! ---');

const express = require('express');
const router = express.Router();

// 1. Importa el controlador singular (el que sí existe)
const usuarioController = require('../controllers/usuarioController'); 
const { authenticateToken } = require('../middleware/auth');

// --- ¡CORREGIDO! ---
// 2. Importa el objeto 'validateUsuario' (singular) de tu middleware
const { 
  validateUsuario, 
  validateParams, 
  validateQuery, 
  handleValidationErrors 
} = require('../middleware/validation');

// --- Rutas Públicas ---

router.post('/registro', 
  validateUsuario.registro, // <-- Corregido a singular
  handleValidationErrors, 
  usuarioController.registrarUsuario // <-- Usa el controlador singular
);

router.post('/login', 
  validateUsuario.login, // <-- Corregido a singular
  handleValidationErrors, 
  usuarioController.loginUsuario
);

router.post('/verificar-codigo',
  validateUsuario.verificarCodigo, // <-- Corregido a singular
  handleValidationErrors,
  usuarioController.verificarCodigo
);

// --- Rutas Protegidas (requieren token) ---

router.get('/perfil', 
  authenticateToken, 
  usuarioController.obtenerPerfil
);

router.put('/perfil', 
  authenticateToken, 
  validateUsuario.actualizarPerfil, // <-- Corregido a singular
  handleValidationErrors, 
  usuarioController.actualizarPerfil
);

router.put('/cambiar-password', 
  authenticateToken, 
  validateUsuario.cambiarPassword, // <-- Corregido a singular
  handleValidationErrors, 
  usuarioController.cambiarPassword
);

// --- ¡AÑADIDO! ---
// Ruta de Cierre de Sesión (soluciona el 404 del frontend)
router.post('/cerrar-sesion',
  authenticateToken,
  usuarioController.cerrarSesion 
);


// --- Rutas de Administración ---

router.get('/', 
  authenticateToken, 
  validateQuery.paginacion, 
  handleValidationErrors, 
  usuarioController.obtenerUsuarios
);

router.get('/:id', 
  authenticateToken, 
  validateParams.id, 
  handleValidationErrors, 
  usuarioController.obtenerUsuarioPorId
);

router.put('/:id', 
  authenticateToken, 
  validateParams.id, 
  validateUsuario.actualizarPerfil, // <-- Corregido a singular
  handleValidationErrors, 
  usuarioController.actualizarUsuario
);

router.delete('/:id', 
  authenticateToken, 
  validateParams.id, 
  handleValidationErrors, 
  usuarioController.eliminarUsuario
);

module.exports = router;
