// --- [RUTAS] routes/sincronizacionCalendarioRoutes.js ---
// Define las URLs para el API de sincronizaciones_calendario

const express = require('express');
const router = express.Router();
const {
  crearSincronizacion,
  obtenerSincronizaciones,
  obtenerSincronizacionPorId,
  obtenerSincronizacionesPorCalendario,
  actualizarSincronizacion,
  eliminarSincronizacion
} = require('../controllers/sincronizacion_calendarioController');

// Importa tu middleware de autenticación
const { authenticateToken } = require('../middleware/auth'); // (Asegúrate que la ruta a tu auth es correcta)

// --- Definición de Rutas ---

// POST /api/sincronizaciones-calendario
router.post('/', authenticateToken, crearSincronizacion);

// GET /api/sincronizaciones-calendario (Para el Admin Dashboard)
router.get('/', authenticateToken, obtenerSincronizaciones);

// GET /api/sincronizaciones-calendario/:id
router.get('/:id', authenticateToken, obtenerSincronizacionPorId);

// GET /api/sincronizaciones-calendario/calendario/:id_calendario
router.get('/calendario/:id_calendario', authenticateToken, obtenerSincronizacionesPorCalendario);

// PUT /api/sincronizaciones-calendario/:id
router.put('/:id', authenticateToken, actualizarSincronizacion);

// DELETE /api/sincronizaciones-calendario/:id
router.delete('/:id', authenticateToken, eliminarSincronizacion);

console.log('--- [RUTAS] routes/sincronizacionCalendarioRoutes.js ¡CARGADO CORRECTAMENTE! ---');
module.exports = router;
