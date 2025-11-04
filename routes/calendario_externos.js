// --- [RUTAS] routes/calendarioExternoRoutes.js ---
// Define las URLs para el API de calendarios_externos

const express = require('express');
const router = express.Router();
const {
  crearCalendario,
  obtenerCalendarios,
  obtenerCalendarioPorId,
  obtenerCalendariosPorUsuario,
  actualizarCalendario,
  eliminarCalendario
} = require('../controllers/calendario_externosController');

// Importa tu middleware de autenticación
const { authenticateToken } = require('../middleware/auth'); // (Asegúrate que la ruta a tu auth es correcta)

// --- Definición de Rutas ---

// POST /api/calendarios-externos
router.post('/', authenticateToken, crearCalendario);

// GET /api/calendarios-externos (Para el Admin Dashboard)
router.get('/', authenticateToken, obtenerCalendarios);

// GET /api/calendarios-externos/usuario/:id_usuario
router.get('/usuario/:id_usuario', authenticateToken, obtenerCalendariosPorUsuario);

// GET /api/calendarios-externos/:id
router.get('/:id', authenticateToken, obtenerCalendarioPorId);

// PUT /api/calendarios-externos/:id
router.put('/:id', authenticateToken, actualizarCalendario);

// DELETE /api/calendarios-externos/:id
router.delete('/:id', authenticateToken, eliminarCalendario);

console.log('--- [RUTAS] routes/calendarioExternoRoutes.js ¡CARGADO CORRECTAMENTE! ---');
module.exports = router;
