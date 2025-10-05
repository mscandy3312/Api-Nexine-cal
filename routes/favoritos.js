const express = require('express');
const router = express.Router();
const favoritoController = require('../controllers/favoritoController');
const { authenticateToken, requireClienteOrAdmin } = require('../middleware/auth');
const { 
  validateFavorito,
  validateParams, 
  validateQuery, 
  handleValidationErrors 
} = require('../middleware/validation');

// Rutas para Favoritos
router.post('/', 
  authenticateToken, 
  requireClienteOrAdmin,
  validateFavorito.crear,
  handleValidationErrors,
  favoritoController.agregarFavorito
);

router.get('/', 
  authenticateToken, 
  requireClienteOrAdmin,
  validateQuery.paginacion, 
  handleValidationErrors, 
  favoritoController.obtenerFavoritos
);

router.get('/verificar/:id_profesional', 
  authenticateToken, 
  requireClienteOrAdmin,
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

router.get('/:id', 
  authenticateToken, 
  validateParams.id, 
  handleValidationErrors, 
  favoritoController.obtenerFavoritoPorId
);

router.delete('/profesional/:id_profesional', 
  authenticateToken, 
  requireClienteOrAdmin,
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
