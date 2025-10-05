const express = require('express');
const router = express.Router();
const transaccionStripeController = require('../controllers/transaccionStripeController');
const { authenticateToken } = require('../middleware/auth');
const { 
  validateTransaccionStripe, 
  validateParams, 
  validateQuery, 
  handleValidationErrors 
} = require('../middleware/validation');

// Crear transacción Stripe
router.post('/', 
  authenticateToken, 
  validateTransaccionStripe.crear, 
  handleValidationErrors, 
  transaccionStripeController.crearTransaccionStripe
);

// Obtener todas las transacciones Stripe
router.get('/', 
  authenticateToken, 
  validateQuery.paginacion, 
  validateQuery.fechas, 
  handleValidationErrors, 
  transaccionStripeController.obtenerTransaccionesStripe
);

// Buscar transacciones Stripe
router.get('/buscar', 
  authenticateToken, 
  validateQuery.paginacion, 
  validateQuery.fechas, 
  handleValidationErrors, 
  transaccionStripeController.buscarTransaccionesStripe
);

// Obtener estadísticas de transacciones
router.get('/estadisticas', 
  authenticateToken, 
  validateQuery.fechas, 
  handleValidationErrors, 
  transaccionStripeController.obtenerEstadisticasTransacciones
);

// Obtener estadísticas por moneda
router.get('/estadisticas/moneda', 
  authenticateToken, 
  validateQuery.fechas, 
  handleValidationErrors, 
  transaccionStripeController.obtenerEstadisticasPorMoneda
);

// Obtener transacción Stripe por ID
router.get('/:id', 
  authenticateToken, 
  validateParams.id, 
  handleValidationErrors, 
  transaccionStripeController.obtenerTransaccionStripePorId
);

// Obtener transacción por ID de Stripe
router.get('/stripe/:stripe_payment_id', 
  authenticateToken, 
  handleValidationErrors, 
  transaccionStripeController.obtenerTransaccionPorStripeId
);

// Obtener transacciones por pago
router.get('/pago/:id_pago', 
  authenticateToken, 
  validateParams.id, 
  validateQuery.paginacion, 
  handleValidationErrors, 
  transaccionStripeController.obtenerTransaccionesPorPago
);

// Obtener transacciones por sesión
router.get('/sesion/:id_sesion', 
  authenticateToken, 
  validateParams.id, 
  validateQuery.paginacion, 
  handleValidationErrors, 
  transaccionStripeController.obtenerTransaccionesPorSesion
);

// Obtener transacciones por profesional
router.get('/profesional/:id_profesional', 
  authenticateToken, 
  validateParams.id, 
  validateQuery.paginacion, 
  handleValidationErrors, 
  transaccionStripeController.obtenerTransaccionesPorProfesional
);

// Actualizar transacción Stripe
router.put('/:id', 
  authenticateToken, 
  validateParams.id, 
  validateTransaccionStripe.crear, 
  handleValidationErrors, 
  transaccionStripeController.actualizarTransaccionStripe
);

// Cambiar estado de la transacción
router.put('/:id/estado', 
  authenticateToken, 
  validateParams.id, 
  handleValidationErrors, 
  transaccionStripeController.cambiarEstadoTransaccion
);

// Eliminar transacción Stripe
router.delete('/:id', 
  authenticateToken, 
  validateParams.id, 
  handleValidationErrors, 
  transaccionStripeController.eliminarTransaccionStripe
);

module.exports = router;
