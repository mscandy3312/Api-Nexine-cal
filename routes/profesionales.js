// --- [RUTAS] routes/profesionales.js ¡CARGADO! ---
console.log('--- [RUTAS] routes/profesionales.js ¡CARGADO! ---');

const express = require('express');
const router = express.Router();
const {
  crearProfesional,
  obtenerProfesionales,
  obtenerProfesionalPorId,
  obtenerProfesionalPorUsuario,
  actualizarProfesional,
  buscarProfesionales,
  eliminarProfesional
  // Nota: 'actualizarRatingProfesional' se elimina porque el rating
  // se *calcula* desde la tabla 'valoraciones' (ver getStats en el modelo).
  // No es un campo que se actualiza directamente.
} = require('../controllers/profesionalController'); // Asumiendo que el controlador está corregido

// Middlewares de autenticación y autorización (ejemplo)
// const { protect, restrictTo } = require('../middleware/authMiddleware');

// --- Rutas Públicas ---

// Obtener todos los profesionales (aprobados)
// GET /api/profesionales
router.get('/', obtenerProfesionales); // Podrías filtrar por 'aprobado' en el controlador

// Buscar profesionales
// GET /api/profesionales/buscar?especialidad=...
router.get('/buscar', buscarProfesionales);

// Obtener perfil público de un profesional por ID
// GET /api/profesionales/1
router.get('/:id', obtenerProfesionalPorId);

// Obtener perfil de profesional por ID de Usuario
// GET /api/profesionales/usuario/1
router.get('/usuario/:id_usuario', obtenerProfesionalPorUsuario);


// --- Rutas Protegidas (Ej: solo para el propio profesional o admin) ---

// Crear un nuevo perfil de profesional
// POST /api/profesionales
router.post('/', /* protect, restrictTo('admin', 'profesional'), */ crearProfesional);

// Actualizar un perfil de profesional
// PUT /api/profesionales/1
router.put('/:id', /* protect, */ actualizarProfesional);

// Eliminar un perfil de profesional
// DELETE /api/profesionales/1
router.delete('/:id', /* protect, restrictTo('admin'), */ eliminarProfesional);

module.exports = router;
