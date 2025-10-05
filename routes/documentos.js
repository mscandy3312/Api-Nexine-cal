const express = require('express');
const router = express.Router();
const documentoController = require('../controllers/documentoController');
const { authenticateToken, requireProfesionalOrAdmin } = require('../middleware/auth');
const { 
  validateDocumento,
  validateParams, 
  validateQuery, 
  handleValidationErrors 
} = require('../middleware/validation');

// Rutas para Documentos
router.post('/subir', 
  authenticateToken, 
  requireProfesionalOrAdmin,
  validateDocumento.crear,
  handleValidationErrors,
  documentoController.subirDocumento
);

router.get('/profesional', 
  authenticateToken, 
  requireProfesionalOrAdmin,
  validateQuery.paginacion, 
  handleValidationErrors, 
  documentoController.obtenerDocumentosProfesional
);

router.get('/publicos', 
  authenticateToken, 
  validateQuery.paginacion, 
  handleValidationErrors, 
  documentoController.obtenerDocumentosPublicos
);

router.get('/tipo/:tipo_documento', 
  authenticateToken, 
  validateParams.tipoDocumento, 
  validateQuery.paginacion, 
  handleValidationErrors, 
  documentoController.obtenerDocumentosPorTipo
);

router.get('/buscar', 
  authenticateToken, 
  validateQuery.paginacion, 
  handleValidationErrors, 
  documentoController.buscarDocumentos
);

router.get('/estadisticas', 
  authenticateToken, 
  documentoController.obtenerEstadisticasDocumentos
);

router.get('/estadisticas/tipo', 
  authenticateToken, 
  documentoController.obtenerEstadisticasPorTipo
);

router.get('/recientes', 
  authenticateToken, 
  validateQuery.paginacion, 
  handleValidationErrors, 
  documentoController.obtenerDocumentosRecientes
);

router.get('/tipos', 
  authenticateToken, 
  documentoController.obtenerTiposDocumentos
);

router.get('/:id', 
  authenticateToken, 
  validateParams.id, 
  handleValidationErrors, 
  documentoController.obtenerDocumentoPorId
);

router.get('/:id/descargar', 
  authenticateToken, 
  validateParams.id, 
  handleValidationErrors, 
  documentoController.descargarDocumento
);

router.put('/:id', 
  authenticateToken, 
  requireProfesionalOrAdmin,
  validateParams.id, 
  handleValidationErrors, 
  documentoController.actualizarDocumento
);

router.put('/:id/visibilidad', 
  authenticateToken, 
  requireProfesionalOrAdmin,
  validateParams.id, 
  handleValidationErrors, 
  documentoController.cambiarVisibilidad
);

router.delete('/:id', 
  authenticateToken, 
  requireProfesionalOrAdmin,
  validateParams.id, 
  handleValidationErrors, 
  documentoController.eliminarDocumento
);

module.exports = router;
