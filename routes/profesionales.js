const express = require('express');
const router = express.Router();
const profesionalController = require('../controllers/profesionalController');
const { authenticateToken } = require('../middleware/auth');
const { 
  validateProfesional, 
  validateParams, 
  validateQuery, 
  handleValidationErrors 
} = require('../middleware/validation');

// Crear profesional
router.post('/', 
  authenticateToken, 
  validateProfesional.crear, 
  handleValidationErrors, 
  profesionalController.crearProfesional
);

// Obtener todos los profesionales
router.get('/', 
  validateQuery.paginacion, 
  handleValidationErrors, 
  profesionalController.obtenerProfesionales
);

// Buscar profesionales
router.get('/buscar', 
  validateQuery.paginacion, 
  handleValidationErrors, 
  profesionalController.buscarProfesionales
);

// Obtener profesional por ID
router.get('/:id', 
  validateParams.id, 
  handleValidationErrors, 
  profesionalController.obtenerProfesionalPorId
);

// Obtener profesional por usuario
router.get('/usuario/:userId', 
  validateParams.userId, 
  handleValidationErrors, 
  profesionalController.obtenerProfesionalPorUsuario
);

// Actualizar profesional
router.put('/:id', 
  authenticateToken, 
  validateParams.id, 
  validateProfesional.crear, 
  handleValidationErrors, 
  profesionalController.actualizarProfesional
);

// Actualizar rating del profesional
router.put('/:id/rating', 
  authenticateToken, 
  validateParams.id, 
  handleValidationErrors, 
  profesionalController.actualizarRatingProfesional
);

// Obtener estadísticas de profesionales
router.get('/estadisticas/generales', 
  validateQuery.fechas, 
  handleValidationErrors, 
  profesionalController.obtenerEstadisticasProfesionales
);

// Eliminar profesional
router.delete('/:id', 
  authenticateToken, 
  validateParams.id, 
  handleValidationErrors, 
  profesionalController.eliminarProfesional
);

module.exports = router;
