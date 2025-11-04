const express = require('express');
const router = express.Router();
const notificacionController = require('../controllers/notificacionController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { 
  validateNotificacion,
  validateParams, 
  validateQuery, 
  handleValidationErrors 
} = require('../middleware/validation');

// Rutas para Notificaciones
router.post('/', 
  authenticateToken, 
  requireAdmin,
  validateNotificacion.crear,
  handleValidationErrors,
  notificacionController.crearNotificacion
);

router.post('/masiva', 
  authenticateToken, 
  requireAdmin,
  validateNotificacion.masiva,
  handleValidationErrors,
  notificacionController.crearNotificacionMasiva
);

router.post('/evento', 
  authenticateToken, 
  requireAdmin,
  notificacionController.crearNotificacionEvento
);

router.get('/', 
  authenticateToken, 
  validateQuery.paginacion, 
  handleValidationErrors, 
  notificacionController.obtenerNotificacionesusuarioss
);

router.get('/tipo/:tipo_notificacion', 
  authenticateToken, 
  validateParams.tipoNotificacion, 
  validateQuery.paginacion, 
  handleValidationErrors, 
  notificacionController.obtenerNotificacionesPorTipo
);

router.get('/prioridad/:prioridad', 
  authenticateToken, 
  validateParams.prioridad, 
  validateQuery.paginacion, 
  handleValidationErrors, 
  notificacionController.obtenerNotificacionesPorPrioridad
);

router.get('/estadisticas', 
  authenticateToken, 
  notificacionController.obtenerEstadisticasNotificaciones
);

router.get('/estadisticas/tipo', 
  authenticateToken, 
  notificacionController.obtenerEstadisticasPorTipo
);

router.get('/recientes', 
  authenticateToken, 
  validateQuery.paginacion, 
  handleValidationErrors, 
  notificacionController.obtenerNotificacionesRecientes
);

router.get('/buscar', 
  authenticateToken, 
  validateQuery.paginacion, 
  handleValidationErrors, 
  notificacionController.buscarNotificaciones
);

router.get('/tipos', 
  authenticateToken, 
  notificacionController.obtenerTiposNotificacion
);

router.get('/:id', 
  authenticateToken, 
  validateParams.id, 
  handleValidationErrors, 
  notificacionController.obtenerNotificacionPorId
);

router.put('/:id', 
  authenticateToken, 
  validateParams.id, 
  handleValidationErrors, 
  notificacionController.actualizarNotificacion
);

router.put('/:id/leer', 
  authenticateToken, 
  validateParams.id, 
  handleValidationErrors, 
  notificacionController.marcarComoLeida
);

router.put('/leer-multiples', 
  authenticateToken, 
  notificacionController.marcarComoLeidas
);

router.put('/leer-todos', 
  authenticateToken, 
  notificacionController.marcarTodasComoLeidas
);

router.put('/:id/archivar', 
  authenticateToken, 
  validateParams.id, 
  handleValidationErrors, 
  notificacionController.archivarNotificacion
);

router.delete('/:id', 
  authenticateToken, 
  validateParams.id, 
  handleValidationErrors, 
  notificacionController.eliminarNotificacion
);

module.exports = router;
