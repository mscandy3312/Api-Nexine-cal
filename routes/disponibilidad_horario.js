// --- [RUTAS] routes/disponibilidadHorarioRoutes.js ---
// Define las URLs para el API de disponibilidad_horarios

const express = require('express');
const router = express.Router();
const {
  crearDisponibilidad,
  obtenerTodaDisponibilidad,
  obtenerDisponibilidadPorProfesional,
  obtenerDisponibilidadPorId,
  actualizarDisponibilidad,
  eliminarDisponibilidad
} = require('../controllers/disponibilidad_horarioController');

// Importa tu middleware de autenticación
const { authenticateToken } = require('../middleware/auth'); // (Asegúrate que la ruta a tu auth es correcta)

// --- Definición de Rutas ---

// POST /api/disponibilidad-horarios
router.post('/', authenticateToken, crearDisponibilidad);

// GET /api/disponibilidad-horarios
// (Para que el dashboard de admin pueda cargar todos los horarios)
router.get('/', authenticateToken, obtenerTodaDisponibilidad);

// GET /api/disponibilidad-horarios/profesional/:id_profesional
router.get('/profesional/:id_profesional', authenticateToken, obtenerDisponibilidadPorProfesional);

// GET /api/disponibilidad-horarios/:id (Obtiene por id_disponibilidad)
router.get('/:id', authenticateToken, obtenerDisponibilidadPorId);

// PUT /api/disponibilidad-horarios/:id
router.put('/:id', authenticateToken, actualizarDisponibilidad);

// DELETE /api/disponibilidad-horarios/:id
router.delete('/:id', authenticateToken, eliminarDisponibilidad);

console.log('--- [RUTAS] routes/disponibilidadHorarioRoutes.js ¡CARGADO CORRECTAMENTE! ---');
module.exports = router;
