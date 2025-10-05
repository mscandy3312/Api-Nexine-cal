const express = require('express');
const router = express.Router();
const pagoController = require('../controllers/pagoController');
const { authenticateToken } = require('../middleware/auth');
const { 
  validatePago, 
  validateParams, 
  validateQuery, 
  handleValidationErrors 
} = require('../middleware/validation');

// Crear pago
router.post('/', 
  authenticateToken, 
  validatePago.crear, 
  handleValidationErrors, 
  pagoController.crearPago
);

// Obtener todos los pagos
router.get('/', 
  authenticateToken, 
  validateQuery.paginacion, 
  validateQuery.fechas, 
  handleValidationErrors, 
  pagoController.obtenerPagos
);

// Buscar pagos
router.get('/buscar', 
  authenticateToken, 
  validateQuery.paginacion, 
  validateQuery.fechas, 
  handleValidationErrors, 
  pagoController.buscarPagos
);

// Obtener estadísticas de pagos
router.get('/estadisticas', 
  authenticateToken, 
  validateQuery.fechas, 
  handleValidationErrors, 
  pagoController.obtenerEstadisticasPagos
);

// Obtener estadísticas por especialidad
router.get('/estadisticas/especialidad', 
  authenticateToken, 
  validateQuery.fechas, 
  handleValidationErrors, 
  pagoController.obtenerEstadisticasPorEspecialidad
);

// Obtener pago por ID
router.get('/:id', 
  authenticateToken, 
  validateParams.id, 
  handleValidationErrors, 
  pagoController.obtenerPagoPorId
);

// Obtener pagos por profesional
router.get('/profesional/:id_profesional', 
  authenticateToken, 
  validateParams.id, 
  validateQuery.paginacion, 
  handleValidationErrors, 
  pagoController.obtenerPagosPorProfesional
);

// Obtener balance del profesional
router.get('/profesional/:id_profesional/balance', 
  authenticateToken, 
  validateParams.id, 
  handleValidationErrors, 
  pagoController.obtenerBalanceProfesional
);

// Actualizar pago
router.put('/:id', 
  authenticateToken, 
  validateParams.id, 
  validatePago.crear, 
  handleValidationErrors, 
  pagoController.actualizarPago
);

// Cambiar estado del pago
router.put('/:id/estado', 
  authenticateToken, 
  validateParams.id, 
  handleValidationErrors, 
  pagoController.cambiarEstadoPago
);

// Eliminar pago
router.delete('/:id', 
  authenticateToken, 
  validateParams.id, 
  handleValidationErrors, 
  pagoController.eliminarPago
);

module.exports = router;
