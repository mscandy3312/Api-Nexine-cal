const express = require('express');
const router = express.Router();
const clientesController = require('../controllers/clienteController');
const { authenticateToken } = require('../middleware/auth');
const { 
  validateclientes, 
  validateParams, 
  validateQuery, 
  handleValidationErrors 
} = require('../middleware/validation');

// Crear clientes
router.post('/', 
  authenticateToken, 
  validateclientes.crear, 
  handleValidationErrors, 
  clientesController.crearclientes
);

// Obtener todos los clientess
router.get('/', 
  authenticateToken, 
  validateQuery.paginacion, 
  handleValidationErrors, 
  clientesController.obtenerclientess
);

// Buscar clientess
router.get('/buscar', 
  authenticateToken, 
  validateQuery.paginacion, 
  handleValidationErrors, 
  clientesController.buscarclientess
);

// Obtener clientes por ID
router.get('/:id', 
  authenticateToken, 
  validateParams.id, 
  handleValidationErrors, 
  clientesController.obtenerclientesPorId
);

// Obtener clientes por usuarioss
router.get('/usuarioss/:userId', 
  authenticateToken, 
  validateParams.userId, 
  handleValidationErrors, 
  clientesController.obtenerclientesPorusuarioss
);

// Actualizar clientes
router.put('/:id', 
  authenticateToken, 
  validateParams.id, 
  validateclientes.crear, 
  handleValidationErrors, 
  clientesController.actualizarclientes
);

// Obtener historial de sesiones del clientes
router.get('/:id/sesiones', 
  authenticateToken, 
  validateParams.id, 
  validateQuery.paginacion, 
  handleValidationErrors, 
  clientesController.obtenerHistorialSesiones
);

// Obtener historial de citass del clientes
router.get('/:id/citass', 
  authenticateToken, 
  validateParams.id, 
  validateQuery.paginacion, 
  handleValidationErrors, 
  clientesController.obtenerHistorialcitass
);

// Eliminar clientes
router.delete('/:id', 
  authenticateToken, 
  validateParams.id, 
  handleValidationErrors, 
  clientesController.eliminarclientes
);

module.exports = router;
