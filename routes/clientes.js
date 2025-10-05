const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/clienteController');
const { authenticateToken } = require('../middleware/auth');
const { 
  validateCliente, 
  validateParams, 
  validateQuery, 
  handleValidationErrors 
} = require('../middleware/validation');

// Crear cliente
router.post('/', 
  authenticateToken, 
  validateCliente.crear, 
  handleValidationErrors, 
  clienteController.crearCliente
);

// Obtener todos los clientes
router.get('/', 
  authenticateToken, 
  validateQuery.paginacion, 
  handleValidationErrors, 
  clienteController.obtenerClientes
);

// Buscar clientes
router.get('/buscar', 
  authenticateToken, 
  validateQuery.paginacion, 
  handleValidationErrors, 
  clienteController.buscarClientes
);

// Obtener cliente por ID
router.get('/:id', 
  authenticateToken, 
  validateParams.id, 
  handleValidationErrors, 
  clienteController.obtenerClientePorId
);

// Obtener cliente por usuario
router.get('/usuario/:userId', 
  authenticateToken, 
  validateParams.userId, 
  handleValidationErrors, 
  clienteController.obtenerClientePorUsuario
);

// Actualizar cliente
router.put('/:id', 
  authenticateToken, 
  validateParams.id, 
  validateCliente.crear, 
  handleValidationErrors, 
  clienteController.actualizarCliente
);

// Obtener historial de sesiones del cliente
router.get('/:id/sesiones', 
  authenticateToken, 
  validateParams.id, 
  validateQuery.paginacion, 
  handleValidationErrors, 
  clienteController.obtenerHistorialSesiones
);

// Obtener historial de citas del cliente
router.get('/:id/citas', 
  authenticateToken, 
  validateParams.id, 
  validateQuery.paginacion, 
  handleValidationErrors, 
  clienteController.obtenerHistorialCitas
);

// Eliminar cliente
router.delete('/:id', 
  authenticateToken, 
  validateParams.id, 
  handleValidationErrors, 
  clienteController.eliminarCliente
);

module.exports = router;
