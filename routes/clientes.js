// --- [RUTAS] routes/clientes.js ¡CARGADO Y CORREGIDO! ---
console.log('--- [RUTAS] routes/clientes.js ¡CARGADO Y CORREGIDO! ---');

const express = require('express');
const router = express.Router();
// --- ¡CORREGIDO! --- (Nombre de controlador singular)
const clienteController = require('../controllers/clienteController'); 
const { authenticateToken } = require('../middleware/auth');

// --- ¡CORREGIDO! ---
// Importa 'validateCliente' (singular) desde el middleware de validación
const { 
  validateCliente, 
  validateParams, 
  validateQuery, 
  handleValidationErrors 
} = require('../middleware/validation');

// --- ¡CORREGIDO! ---
// Crear cliente
router.post('/', 
  authenticateToken, 
  validateCliente.crear, // <-- Corregido a singular
  handleValidationErrors, 
  clienteController.crearCliente // <-- Corregido a singular
);

// --- ¡CORREGIDO! ---
// Obtener todos los clientes
router.get('/', 
  authenticateToken, 
  validateQuery.paginacion, 
  handleValidationErrors, 
  clienteController.obtenerClientes // <-- Corregido a singular
);

// --- ¡CORREGIDO! ---
// Buscar clientes
router.get('/buscar', 
  authenticateToken, 
  validateQuery.paginacion, 
  handleValidationErrors, 
  clienteController.buscarClientes // <-- Corregido a singular
);

// --- ¡CORREGIDO! ---
// Obtener cliente por ID
router.get('/:id', 
  authenticateToken, 
  validateParams.id, 
  handleValidationErrors, 
  clienteController.obtenerClientePorId // <-- Corregido a singular
);

// --- ¡CORREGIDO! ---
// Obtener cliente por ID de Usuario
router.get('/usuario/:userId', // <-- Ruta corregida (de 'usuarioss' a 'usuario')
  authenticateToken, 
  validateParams.userId, 
  handleValidationErrors, 
  clienteController.obtenerClientePorUsuario // <-- Corregido a singular
);

// --- ¡CORREGIDO! ---
// Actualizar cliente
router.put('/:id', 
  authenticateToken, 
  validateParams.id, 
  validateCliente.crear, // Reutiliza la validación de 'crear'
  handleValidationErrors, 
  clienteController.actualizarCliente // <-- Corregido a singular
);

// Obtener historial de sesiones del cliente
router.get('/:id/sesiones', 
  authenticateToken, 
  validateParams.id, 
  validateQuery.paginacion, 
  handleValidationErrors, 
  clienteController.obtenerHistorialSesiones
);

// --- ¡CORREGIDO! ---
// Obtener historial de citas del cliente
router.get('/:id/citas', // <-- Ruta corregida (de 'citass' a 'citas')
  authenticateToken, 
  validateParams.id, 
  validateQuery.paginacion, 
  handleValidationErrors, 
  clienteController.obtenerHistorialCitas // <-- Corregido a singular
);

// --- ¡CORREGIDO! ---
// Eliminar cliente
router.delete('/:id', 
  authenticateToken, 
  validateParams.id, 
  handleValidationErrors, 
  clienteController.eliminarCliente // <-- Corregido a singular
);

module.exports = router;

