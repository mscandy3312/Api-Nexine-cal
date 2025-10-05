const express = require('express');
const router = express.Router();
const citaController = require('../controllers/citaController');
const { authenticateToken } = require('../middleware/auth');
const { 
  validateCita, 
  validateParams, 
  validateQuery, 
  handleValidationErrors 
} = require('../middleware/validation');

// Crear cita
router.post('/', 
  authenticateToken, 
  validateCita.crear, 
  handleValidationErrors, 
  citaController.crearCita
);

// Obtener todas las citas
router.get('/', 
  authenticateToken, 
  validateQuery.paginacion, 
  validateQuery.fechas, 
  handleValidationErrors, 
  citaController.obtenerCitas
);

// Buscar citas
router.get('/buscar', 
  authenticateToken, 
  validateQuery.paginacion, 
  validateQuery.fechas, 
  handleValidationErrors, 
  citaController.buscarCitas
);

// Obtener estadísticas de citas
router.get('/estadisticas', 
  authenticateToken, 
  validateQuery.fechas, 
  handleValidationErrors, 
  citaController.obtenerEstadisticasCitas
);

// Obtener cita por ID
router.get('/:id', 
  authenticateToken, 
  validateParams.id, 
  handleValidationErrors, 
  citaController.obtenerCitaPorId
);

// Obtener citas por cliente
router.get('/cliente/:id_cliente', 
  authenticateToken, 
  validateParams.id, 
  validateQuery.paginacion, 
  handleValidationErrors, 
  citaController.obtenerCitasPorCliente
);

// Obtener citas por profesional
router.get('/profesional/:id_profesional', 
  authenticateToken, 
  validateParams.id, 
  validateQuery.paginacion, 
  handleValidationErrors, 
  citaController.obtenerCitasPorProfesional
);

// Actualizar cita
router.put('/:id', 
  authenticateToken, 
  validateParams.id, 
  validateCita.crear, 
  handleValidationErrors, 
  citaController.actualizarCita
);

// Cambiar estado de la cita
router.put('/:id/estado', 
  authenticateToken, 
  validateParams.id, 
  handleValidationErrors, 
  citaController.cambiarEstadoCita
);

// Eliminar cita
router.delete('/:id', 
  authenticateToken, 
  validateParams.id, 
  handleValidationErrors, 
  citaController.eliminarCita
);

module.exports = router;
