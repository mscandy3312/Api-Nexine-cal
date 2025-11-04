console.log('--- [RUTAS] routes/favoritos.js ¡CARGADO Y CORREGIDO! ---');

const express = require('express');
const router = express.Router();
const favoritoController = require('../controllers/favoritoController');
// --- CORREGIDO --- (Volviendo al nombre plural que tu auth.js debe tener)
const { authenticateToken, requireclientesOrAdmin } = require('../middleware/auth');
const { 
  validateFavorito,
  validateParams, 
  validateQuery, 
  handleValidationErrors 
} = require('../middleware/validation');

// Rutas para Favoritos
router.post('/', 
  authenticateToken, 
  requireclientesOrAdmin, // <-- CORREGIDO (vuelta a plural)
  validateFavorito.crear,
  handleValidationErrors,
  favoritoController.agregarFavorito
);

router.get('/', 
  authenticateToken, 
  requireclientesOrAdmin, // <-- CORREGIDO (vuelta a plural)
  validateQuery.paginacion, 
  handleValidationErrors, 
  favoritoController.obtenerFavoritos
);

// --- ¡RUTA AÑADIDA! ---
// Esta es la ruta que faltaba y causaba el error 404.
// Obtiene todos los favoritos de un ID de CLIENTE específico.
router.get('/cliente/:id', // El frontend llama a /cliente/[id_cliente]
  authenticateToken, 
  validateParams.id, // Reutiliza el validador de ID (valida el param :id)
  handleValidationErrors, 
  favoritoController.obtenerFavoritosPorCliente // Asume que esta función existe en el controlador
);

router.get('/verificar/:id_profesional', 
  authenticateToken, 
  requireclientesOrAdmin, // <-- CORREGIDO (vuelta a plural)
  validateParams.idProfesional, 
  handleValidationErrors, 
  favoritoController.verificarFavorito
);

router.get('/profesional/:id_profesional', 
  authenticateToken, 
  validateParams.idProfesional, 
  validateQuery.paginacion, 
  handleValidationErrors, 
  favoritoController.obtenerClientesFavoritos
);

router.get('/estadisticas', 
  authenticateToken, 
  validateQuery.paginacion, 
  handleValidationErrors, 
  favoritoController.obtenerEstadisticasFavoritos
);

router.get('/top', 
  authenticateToken, 
  validateQuery.paginacion, 
  handleValidationErrors, 
  favoritoController.obtenerTopFavoritos
);

router.get('/:id', // <-- Esta ruta obtiene por id_favorito (PK)
  authenticateToken, 
  validateParams.id, 
  handleValidationErrors, 
  favoritoController.obtenerFavoritoPorId
);

router.delete('/profesional/:id_profesional', 
  authenticateToken, 
  requireclientesOrAdmin, // <-- CORREGIDO (vuelta a plural)
  validateParams.idProfesional, 
  handleValidationErrors, 
  favoritoController.eliminarFavorito
);

router.delete('/:id', 
  authenticateToken, 
  validateParams.id, 
  handleValidationErrors, 
  favoritoController.eliminarFavoritoPorId
);

module.exports = router;

