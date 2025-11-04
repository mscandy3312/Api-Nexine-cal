// --- [RUTAS] routes/citas.js ¡CARGADO Y CORREGIDO! ---
console.log('--- [RUTAS] routes/citas.js ¡CARGADO Y CORREGIDO! ---');

const express = require('express');
const router = express.Router();
const citasController = require('../controllers/citaController'); // Asumiendo que el controlador es singular
const { authenticateToken } = require('../middleware/auth');

// --- ¡CORREGIDO! ---
// Importa 'validateCita' (singular) y los 'validateParams' correctos
const { 
  validateCita, 
  validateParams, // Contiene 'id', 'idProfesional', etc.
  validateQuery, 
  handleValidationErrors 
} = require('../middleware/validation');

// --- ¡CORREGIDO! ---
// Crear cita
router.post('/', 
  authenticateToken, 
  validateCita.crear, // <-- Singular
  handleValidationErrors, 
  citasController.crearCita // <-- Singular
);

// --- ¡CORREGIDO! ---
// Obtener todas las citas
router.get('/', 
  authenticateToken, 
  validateQuery.paginacion, 
  validateQuery.fechas, 
  handleValidationErrors, 
  citasController.obtenerCitas // <-- Singular
);

// --- ¡CORREGIDO! ---
// Buscar citas
router.get('/buscar', 
  authenticateToken, 
  validateQuery.paginacion, 
  validateQuery.fechas, 
  handleValidationErrors, 
  citasController.buscarCitas // <-- Singular
);

// --- ¡CORREGIDO! ---
// Obtener estadísticas de citas
router.get('/estadisticas', 
  authenticateToken, 
  validateQuery.fechas, 
  handleValidationErrors, 
  citasController.obtenerEstadisticasCitas // <-- Singular
);

// --- ¡CORREGIDO! ---
// Obtener cita por ID
router.get('/:id', 
  authenticateToken, 
  validateParams.id, // <-- Esto valida el ':id'
  handleValidationErrors, 
  citasController.obtenerCitaPorId // <-- Singular
);

// --- ¡CORREGIDO! ---
// Obtener citas por cliente
router.get('/cliente/:id', // <-- Ruta corregida a /:id
  authenticateToken, 
  validateParams.id, // <-- Esto valida el ':id'
  validateQuery.paginacion, 
  handleValidationErrors, 
  citasController.obtenerCitasPorCliente // <-- Singular
);

// --- ¡CORREGIDO! ---
// Obtener citas por profesional
router.get('/profesional/:id_profesional', // <-- Ruta correcta
  authenticateToken, 
  validateParams.idProfesional, // <-- Validación corregida
  validateQuery.paginacion, 
  handleValidationErrors, 
  citasController.obtenerCitasPorProfesional // <-- Singular
);

// --- ¡CORREGIDO! ---
// Actualizar cita
router.put('/:id', 
  authenticateToken, 
  validateParams.id, 
  validateCita.crear, // <-- Singular (reutiliza la validación de crear)
  handleValidationErrors, 
  citasController.actualizarCita // <-- Singular
);

// --- ¡CORREGIDO! ---
// Cambiar estado de la cita
router.put('/:id/estado', 
  authenticateToken, 
  validateParams.id, 
  handleValidationErrors, 
  citasController.cambiarEstadoCita // <-- Singular
);

// --- ¡CORREGIDO! ---
// Eliminar cita
router.delete('/:id', 
  authenticateToken, 
  validateParams.id, 
  handleValidationErrors, 
  citasController.eliminarCita // <-- Singular
);

module.exports = router;
