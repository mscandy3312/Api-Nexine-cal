// --- [RUTAS] routes/mensajes.js ¡CARGADO Y CORREGIDO! ---
console.log('--- [RUTAS] routes/mensajes.js ¡CARGADO Y CORREGIDO! ---');

const express = require('express');
const router = express.Router();
const mensajeController = require('../controllers/mensajeController');
const { authenticateToken } = require('../middleware/auth');

// --- ¡CORREGIDO! ---
// Se importa 'validateMensaje' (singular) y los 'validateParams' correctos
const { 
  validateMensaje,
  validateParams, 
  validateQuery, 
  handleValidationErrors 
} = require('../middleware/validation');

// Rutas para Mensajes
router.post('/', 
  authenticateToken, 
  validateMensaje.crear,
  handleValidationErrors,
  mensajeController.enviarMensaje
);

router.get('/recibidos', 
  authenticateToken, 
  validateQuery.paginacion, 
  handleValidationErrors, 
  mensajeController.obtenerMensajesRecibidos
);

router.get('/enviados', 
  authenticateToken, 
  validateQuery.paginacion, 
  handleValidationErrors, 
  mensajeController.obtenerMensajesEnviados
);

// --- ¡CORREGIDO! ---
// La ruta ahora es '/conversacion/:id_usuario'
// La validación ahora es 'validateParams.idUsuario'
router.get('/conversacion/:id_usuario', 
  authenticateToken, 
  validateParams.idUsuario, // <-- Corregido
  validateQuery.paginacion, 
  handleValidationErrors, 
  mensajeController.obtenerConversacion
);

router.get('/estadisticas', 
  authenticateToken, 
  mensajeController.obtenerEstadisticasMensajes
);

router.get('/contactos', 
  authenticateToken, 
  validateQuery.paginacion, 
  handleValidationErrors, 
  mensajeController.obtenerContactosRecientes
);

router.get('/buscar', 
  authenticateToken, 
  validateQuery.paginacion, 
  handleValidationErrors, 
  mensajeController.buscarMensajes
);

router.get('/:id', 
  authenticateToken, 
  validateParams.id, 
  handleValidationErrors, 
  mensajeController.obtenerMensajePorId
);

router.put('/:id/leer', 
  authenticateToken, 
  validateParams.id, 
  handleValidationErrors, 
  mensajeController.marcarComoLeido
);

router.put('/leer-multiples', 
  authenticateToken, 
  mensajeController.marcarComoLeidos
);

router.put('/leer-todos', 
  authenticateToken, 
  mensajeController.marcarTodosComoLeidos
);

router.delete('/:id', 
  authenticateToken, 
  validateParams.id, 
  handleValidationErrors, 
  mensajeController.eliminarMensaje
);

module.exports = router;
