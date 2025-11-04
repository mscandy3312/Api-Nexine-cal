// --- [CONTROLADOR] controllers/clienteController.js ¡CARGADO Y CORREGIDO! ---
console.log('--- [CONTROLADOR] controllers/clienteController.js ¡CARGADO Y CORREGIDO! ---');

// --- ¡CORREGIDO! --- (Importa el modelo en singular)
const Cliente = require('../models/Clientes');
const { validationResult } = require('express-validator');

// --- ¡CORREGIDO! --- (Nombre de función en singular)
// Crear cliente
const crearCliente = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Datos de entrada inválidos',
        errors: errors.array()
      });
    }

    // --- ¡CORREGIDO! --- (Campos ajustados al modelo real)
    const {
      id_usuario,
      nombre_completo,
      telefono,
      email,
      fecha_nacimiento,
      historial_medico
    } = req.body;

    // --- ¡CORREGIDO! --- (Usa el modelo singular)
    // Verificar si el usuario ya tiene un perfil de cliente
    const clienteExistente = await Cliente.findByUserId(id_usuario);
    if (clienteExistente) {
      return res.status(400).json({
        success: false,
        message: 'El usuario ya tiene un perfil de cliente'
      });
    }

    // (Se elimina la verificación de 'nombre_usuarioss' porque ya no existe)

    // --- ¡CORREGIDO! --- (Usa el modelo singular y campos correctos)
    const nuevoCliente = await Cliente.create({
      id_usuario,
      nombre_completo,
      telefono,
      email,
      fecha_nacimiento,
      historial_medico
    });

    res.status(201).json({
      success: true,
      message: 'Cliente creado exitosamente',
      data: {
        cliente: nuevoCliente
      }
    });
  } catch (error) {
    console.error('Error al crear cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// --- ¡CORREGIDO! --- (Nombre de función en singular)
// Obtener todos los clientes
const obtenerClientes = async (req, res) => {
  try {
    const { limit = 50, offset = 0, search } = req.query;
    
    let clientes;
    if (search) {
      // --- ¡CORREGIDO! --- (Usa el modelo singular)
      clientes = await Cliente.search({ nombre_completo: search }, parseInt(limit), parseInt(offset));
    } else {
      clientes = await Cliente.findAll(parseInt(limit), parseInt(offset));
    }

    res.json({
      success: true,
      data: {
        clientes,
        paginacion: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: clientes.length
        }
      }
    });
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// --- ¡CORREGIDO! --- (Nombre de función en singular)
// Obtener cliente por ID
const obtenerClientePorId = async (req, res) => {
  try {
    const { id } = req.params;
    // --- ¡CORREGIDO! --- (Usa el modelo singular)
    const cliente = await Cliente.findById(id);
    
    if (!cliente) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }

    // Obtener estadísticas del cliente
    const stats = await cliente.getStats();

    res.json({
      success: true,
      data: {
        cliente,
        estadisticas: stats
      }
    });
  } catch (error) {
    console.error('Error al obtener cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// --- ¡CORREGIDO! --- (Nombre de función en singular)
// Obtener cliente por ID de Usuario
const obtenerClientePorUsuario = async (req, res) => {
  try {
    const { userId } = req.params;
    // --- ¡CORREGIDO! --- (Usa el modelo singular)
    const cliente = await Cliente.findByUserId(userId);
    
    if (!cliente) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }

    // Obtener estadísticas del cliente
    const stats = await cliente.getStats();

    res.json({
      success: true,
      data: {
        cliente,
        estadisticas: stats
      }
    });
  } catch (error) {
    console.error('Error al obtener cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// --- ¡CORREGIDO! --- (Nombre de función en singular)
// Actualizar cliente
const actualizarCliente = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Datos de entrada inválidos',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    // --- ¡CORREGIDO! --- (Usa el modelo singular)
    const cliente = await Cliente.findById(id);
    
    if (!cliente) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }

    // --- ¡CORREGIDO! --- (Campos ajustados al modelo real)
    const {
      nombre_completo,
      telefono,
      email,
      fecha_nacimiento,
      historial_medico
    } = req.body;

    const datosActualizacion = {};
    if (nombre_completo) datosActualizacion.nombre_completo = nombre_completo;
    if (telefono !== undefined) datosActualizacion.telefono = telefono;
    if (email !== undefined) datosActualizacion.email = email;
    if (fecha_nacimiento !== undefined) datosActualizacion.fecha_nacimiento = fecha_nacimiento;
    if (historial_medico !== undefined) datosActualizacion.historial_medico = historial_medico;

    // (Se elimina la verificación de 'nombre_usuarioss' porque ya no existe)

    const clienteActualizado = await cliente.update(datosActualizacion);

    res.json({
      success: true,
      message: 'Cliente actualizado exitosamente',
      data: {
        cliente: clienteActualizado
      }
    });
  } catch (error) {
    console.error('Error al actualizar cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// --- ¡CORREGIDO! --- (Nombre de función en singular)
// Buscar clientes
const buscarClientes = async (req, res) => {
  try {
    const { 
      limit = 50, 
      offset = 0, 
      nombre_completo, 
      email,
      telefono
    } = req.query;

    // --- ¡CORREGIDO! --- (Criterios ajustados al modelo real)
    const criterios = {};
    if (nombre_completo) criterios.nombre_completo = nombre_completo;
    if (email) criterios.email = email;
    if (telefono) criterios.telefono = telefono;
    
    // (Se eliminan criterios de 'ciudad', 'estado', 'ingreso' porque no existen)

    const clientes = await Cliente.search(criterios, parseInt(limit), parseInt(offset));

    res.json({
      success: true,
      data: {
        clientes,
        paginacion: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: clientes.length
        }
      }
    });
  } catch (error) {
    console.error('Error al buscar clientes:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener historial de sesiones del cliente
const obtenerHistorialSesiones = async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 20, offset = 0 } = req.query;
    
    // --- ¡CORREGIDO! --- (Usa el modelo singular)
    const cliente = await Cliente.findById(id);
    if (!cliente) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }

    const sesiones = await cliente.getSesiones(parseInt(limit), parseInt(offset));

    res.json({
      success: true,
      data: {
        sesiones,
        paginacion: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: sesiones.length
        }
      }
    });
  } catch (error) {
    console.error('Error al obtener historial de sesiones:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// --- ¡CORREGIDO! --- (Nombre de función en singular)
// Obtener historial de citas del cliente
const obtenerHistorialCitas = async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 20, offset = 0 } = req.query;
    
    // --- ¡CORREGIDO! --- (Usa el modelo singular)
    const cliente = await Cliente.findById(id);
    if (!cliente) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }

    // --- ¡CORREGIDO! --- (Usa el método singular)
    const citas = await cliente.getCitas(parseInt(limit), parseInt(offset));

    res.json({
      success: true,
      data: {
        citas,
        paginacion: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: citas.length
        }
      }
    });
  } catch (error) {
    console.error('Error al obtener historial de citas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// --- ¡CORREGIDO! --- (Nombre de función en singular)
// Eliminar cliente
const eliminarCliente = async (req, res) => {
  try {
    const { id } = req.params;
    // --- ¡CORREGIDO! --- (Usa el modelo singular)
    const cliente = await Cliente.findById(id);
    
    if (!cliente) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }

    await cliente.delete();

    res.json({
      success: true,
      message: 'Cliente eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// --- ¡CORREGIDO! --- (Exporta nombres singulares)
module.exports = {
  crearCliente,
  obtenerClientes,
  obtenerClientePorId,
  obtenerClientePorUsuario,
  actualizarCliente,
  buscarClientes,
  obtenerHistorialSesiones,
  obtenerHistorialCitas,
  eliminarCliente
};
