const express = require('express');
const router = express.Router();
const sesionController = require('../controllers/sesionController');
const { authenticateToken } = require('../middleware/auth');
const { 
  validateSesion, 
  validateParams, 
  validateQuery, 
  handleValidationErrors 
} = require('../middleware/validation');

// Crear sesión
router.post('/', 
  authenticateToken, 
  validateSesion.crear, 
  handleValidationErrors, 
  sesionController.crearSesion
);

// Obtener todas las sesiones
router.get('/', 
  authenticateToken, 
  validateQuery.paginacion, 
  validateQuery.fechas, 
  handleValidationErrors, 
  sesionController.obtenerSesiones
);

// Buscar sesiones
router.get('/buscar', 
  authenticateToken, 
  validateQuery.paginacion, 
  validateQuery.fechas, 
  handleValidationErrors, 
  sesionController.buscarSesiones
);

// Obtener estadísticas de sesiones
router.get('/estadisticas', 
  authenticateToken, 
  validateQuery.fechas, 
  handleValidationErrors, 
  sesionController.obtenerEstadisticasSesiones
);

// Obtener sesión por ID
router.get('/:id', 
  authenticateToken, 
  validateParams.id, 
  handleValidationErrors, 
  sesionController.obtenerSesionPorId
);

// Obtener sesión por número de pedido
router.get('/pedido/:numero_pedido', 
  authenticateToken, 
  handleValidationErrors, 
  sesionController.obtenerSesionPorPedido
);

// Obtener sesiones por clientes
router.get('/clientes/:id_clientes', 
  authenticateToken, 
  validateParams.id, 
  validateQuery.paginacion, 
  handleValidationErrors, 
  sesionController.obtenerSesionesPorclientes
);

// Obtener sesiones por profesional
router.get('/profesional/:id_profesional', 
  authenticateToken, 
  validateParams.id, 
  validateQuery.paginacion, 
  handleValidationErrors, 
  sesionController.obtenerSesionesPorProfesional
);

// Actualizar sesión
router.put('/:id', 
  authenticateToken, 
  validateParams.id, 
  validateSesion.crear, 
  handleValidationErrors, 
  sesionController.actualizarSesion
);

// Cambiar estado de la sesión
router.put('/:id/estado', 
  authenticateToken, 
  validateParams.id, 
  handleValidationErrors, 
  sesionController.cambiarEstadoSesion
);

// Eliminar sesión
router.delete('/:id', 
  authenticateToken, 
  validateParams.id, 
  handleValidationErrors, 
  sesionController.eliminarSesion
);

module.exports = router;
