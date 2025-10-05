const express = require('express');
const router = express.Router();
const precioController = require('../controllers/precioController');
const { authenticateToken } = require('../middleware/auth');
const { 
  validatePrecio, 
  validateParams, 
  validateQuery, 
  handleValidationErrors 
} = require('../middleware/validation');

// Crear precio
router.post('/', 
  authenticateToken, 
  validatePrecio.crear, 
  handleValidationErrors, 
  precioController.crearPrecio
);

// Obtener todos los precios
router.get('/', 
  validateQuery.paginacion, 
  handleValidationErrors, 
  precioController.obtenerPrecios
);

// Buscar precios
router.get('/buscar', 
  validateQuery.paginacion, 
  handleValidationErrors, 
  precioController.buscarPrecios
);

// Obtener precios por modalidad
router.get('/modalidad/:modalidad', 
  validateQuery.paginacion, 
  handleValidationErrors, 
  precioController.obtenerPreciosPorModalidad
);

// Obtener precios por paquete
router.get('/paquete/:paquete', 
  validateQuery.paginacion, 
  handleValidationErrors, 
  precioController.obtenerPreciosPorPaquete
);

// Obtener precio por ID
router.get('/:id', 
  validateParams.id, 
  handleValidationErrors, 
  precioController.obtenerPrecioPorId
);

// Actualizar precio
router.put('/:id', 
  authenticateToken, 
  validateParams.id, 
  validatePrecio.crear, 
  handleValidationErrors, 
  precioController.actualizarPrecio
);

// Actualizar estadísticas del precio
router.put('/:id/estadisticas', 
  authenticateToken, 
  validateParams.id, 
  handleValidationErrors, 
  precioController.actualizarEstadisticasPrecio
);

// Obtener sesiones del precio
router.get('/:id/sesiones', 
  validateParams.id, 
  validateQuery.paginacion, 
  handleValidationErrors, 
  precioController.obtenerSesionesPrecio
);

// Eliminar precio
router.delete('/:id', 
  authenticateToken, 
  validateParams.id, 
  handleValidationErrors, 
  precioController.eliminarPrecio
);

module.exports = router;
