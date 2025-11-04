// --- [RUTAS] routes/especialidadRoutes.js ---
// Define las URLs para el API de especialidades.

const express = require('express');
const router = express.Router();
const {
  crearEspecialidad,
  obtenerEspecialidades,
  obtenerEspecialidadPorId,
  actualizarEspecialidad,
  eliminarEspecialidad
} = require('../controllers/especialidadController');

// Importa tu middleware de autenticación
const { authenticateToken } = require('../middleware/auth'); // (Asegúrate que la ruta a tu auth es correcta)

// --- Definición de Rutas ---

// POST /api/especialidades
// (El dashboard usa esta ruta para crear)
router.post('/', authenticateToken, crearEspecialidad);

// GET /api/especialidades
// (El dashboard usa esta ruta para obtener todos)
router.get('/', authenticateToken, obtenerEspecialidades);

// GET /api/especialidades/:id
router.get('/:id', authenticateToken, obtenerEspecialidadPorId);

// PUT /api/especialidades/:id
router.put('/:id', authenticateToken, actualizarEspecialidad);

// DELETE /api/especialidades/:id
router.delete('/:id', authenticateToken, eliminarEspecialidad);

console.log('--- [RUTAS] routes/especialidadRoutes.js ¡CARGADO CORRECTAMENTE! ---');
module.exports = router;
