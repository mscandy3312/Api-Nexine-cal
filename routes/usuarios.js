const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const { authenticateToken } = require('../middleware/auth');
const { 
  validateUsuario, 
  validateParams, 
  validateQuery, 
  handleValidationErrors 
} = require('../middleware/validation');

// Rutas públicas
router.post('/registro', 
  validateUsuario.registro, 
  handleValidationErrors, 
  usuarioController.registrarUsuario
);

router.post('/login', 
  validateUsuario.login, 
  handleValidationErrors, 
  usuarioController.loginUsuario
);

// Rutas protegidas
router.get('/perfil', 
  authenticateToken, 
  usuarioController.obtenerPerfil
);

router.put('/perfil', 
  authenticateToken, 
  validateUsuario.actualizarPerfil, 
  handleValidationErrors, 
  usuarioController.actualizarPerfil
);

router.put('/cambiar-password', 
  authenticateToken, 
  validateUsuario.cambiarPassword, 
  handleValidationErrors, 
  usuarioController.cambiarPassword
);

// Rutas de administración
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
  validateUsuario.actualizarPerfil, 
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
