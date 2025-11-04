const express = require('express');
const router = express.Router();
const favoritoController = require('../controllers/favoritoController');
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
  requireclientesOrAdmin,
  validateFavorito.crear,
  handleValidationErrors,
  favoritoController.agregarFavorito
);

router.get('/', 
  authenticateToken, 
  requireclientesOrAdmin,
  validateQuery.paginacion, 
  handleValidationErrors, 
  favoritoController.obtenerFavoritos
);

router.get('/verificar/:id_profesional', 
  authenticateToken, 
  requireclientesOrAdmin,
  validateParams.idProfesional, 
  handleValidationErrors, 
  favoritoController.verificarFavorito
);

router.get('/profesional/:id_profesional', 
  authenticateToken, 
  validateParams.idProfesional, 
  validateQuery.paginacion, 
  handleValidationErrors, 
  favoritoController.obtenerclientessFavoritos
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
  requireclientesOrAdmin,
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
