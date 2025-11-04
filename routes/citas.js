const express = require('express');
const router = express.Router();
const citasController = require('../controllers/citaController');
const { authenticateToken } = require('../middleware/auth');
const { 
  validatecitas, 
  validateParams, 
  validateQuery, 
  handleValidationErrors 
} = require('../middleware/validation');

// Crear citas
router.post('/', 
  authenticateToken, 
  validatecitas.crear, 
  handleValidationErrors, 
  citasController.crearcitas
);

// Obtener todas las citass
router.get('/', 
  authenticateToken, 
  validateQuery.paginacion, 
  validateQuery.fechas, 
  handleValidationErrors, 
  citasController.obtenercitass
);

// Buscar citass
router.get('/buscar', 
  authenticateToken, 
  validateQuery.paginacion, 
  validateQuery.fechas, 
  handleValidationErrors, 
  citasController.buscarcitass
);

// Obtener estadísticas de citass
router.get('/estadisticas', 
  authenticateToken, 
  validateQuery.fechas, 
  handleValidationErrors, 
  citasController.obtenerEstadisticascitass
);

// Obtener citas por ID
router.get('/:id', 
  authenticateToken, 
  validateParams.id, 
  handleValidationErrors, 
  citasController.obtenercitasPorId
);

// Obtener citass por clientes
router.get('/clientes/:id_clientes', 
  authenticateToken, 
  validateParams.id, 
  validateQuery.paginacion, 
  handleValidationErrors, 
  citasController.obtenercitassPorclientes
);

// Obtener citass por profesional
router.get('/profesional/:id_profesional', 
  authenticateToken, 
  validateParams.id, 
  validateQuery.paginacion, 
  handleValidationErrors, 
  citasController.obtenercitassPorProfesional
);

// Actualizar citas
router.put('/:id', 
  authenticateToken, 
  validateParams.id, 
  validatecitas.crear, 
  handleValidationErrors, 
  citasController.actualizarcitas
);

// Cambiar estado de la citas
router.put('/:id/estado', 
  authenticateToken, 
  validateParams.id, 
  handleValidationErrors, 
  citasController.cambiarEstadocitas
);

// Eliminar citas
router.delete('/:id', 
  authenticateToken, 
  validateParams.id, 
  handleValidationErrors, 
  citasController.eliminarcitas
);

module.exports = router;
