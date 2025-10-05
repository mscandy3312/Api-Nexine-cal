const express = require('express');
const router = express.Router();
const valoracionController = require('../controllers/valoracionController');
const { authenticateToken } = require('../middleware/auth');
const { 
  validateValoracion, 
  validateParams, 
  validateQuery, 
  handleValidationErrors 
} = require('../middleware/validation');

// Crear valoración
router.post('/', 
  authenticateToken, 
  validateValoracion.crear, 
  handleValidationErrors, 
  valoracionController.crearValoracion
);

// Obtener todas las valoraciones
router.get('/', 
  validateQuery.paginacion, 
  handleValidationErrors, 
  valoracionController.obtenerValoraciones
);

// Buscar valoraciones
router.get('/buscar', 
  validateQuery.paginacion, 
  validateQuery.fechas, 
  handleValidationErrors, 
  valoracionController.buscarValoraciones
);

// Obtener estadísticas de valoraciones
router.get('/estadisticas', 
  validateQuery.fechas, 
  handleValidationErrors, 
  valoracionController.obtenerEstadisticasValoraciones
);

// Obtener valoración por ID
router.get('/:id', 
  validateParams.id, 
  handleValidationErrors, 
  valoracionController.obtenerValoracionPorId
);

// Obtener valoraciones por sesión
router.get('/sesion/:id_sesion', 
  validateParams.id, 
  handleValidationErrors, 
  valoracionController.obtenerValoracionesPorSesion
);

// Obtener valoraciones por profesional
router.get('/profesional/:id_profesional', 
  validateParams.id, 
  validateQuery.paginacion, 
  handleValidationErrors, 
  valoracionController.obtenerValoracionesPorProfesional
);

// Obtener valoraciones por cliente
router.get('/cliente/:id_cliente', 
  authenticateToken, 
  validateParams.id, 
  validateQuery.paginacion, 
  handleValidationErrors, 
  valoracionController.obtenerValoracionesPorCliente
);

// Actualizar valoración
router.put('/:id', 
  authenticateToken, 
  validateParams.id, 
  validateValoracion.crear, 
  handleValidationErrors, 
  valoracionController.actualizarValoracion
);

// Cambiar estado de la valoración
router.put('/:id/estado', 
  authenticateToken, 
  validateParams.id, 
  handleValidationErrors, 
  valoracionController.cambiarEstadoValoracion
);

// Eliminar valoración
router.delete('/:id', 
  authenticateToken, 
  validateParams.id, 
  handleValidationErrors, 
  valoracionController.eliminarValoracion
);

module.exports = router;
