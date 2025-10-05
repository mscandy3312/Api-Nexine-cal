const Cliente = require('../models/Cliente');
const { validationResult } = require('express-validator');

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

    const {
      id_usuario,
      nombre_completo,
      telefono,
      nombre_usuario,
      ciudad,
      codigo_postal,
      ingreso,
      estado
    } = req.body;

    // Verificar si el usuario ya tiene un perfil de cliente
    const clienteExistente = await Cliente.findByUserId(id_usuario);
    if (clienteExistente) {
      return res.status(400).json({
        success: false,
        message: 'El usuario ya tiene un perfil de cliente'
      });
    }

    // Verificar si el nombre de usuario ya existe
    if (nombre_usuario) {
      const clienteConUsername = await Cliente.findByUsername(nombre_usuario);
      if (clienteConUsername) {
        return res.status(400).json({
          success: false,
          message: 'El nombre de usuario ya está en uso'
        });
      }
    }

    const nuevoCliente = await Cliente.create({
      id_usuario,
      nombre_completo,
      telefono,
      nombre_usuario,
      ciudad,
      codigo_postal,
      ingreso,
      estado
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

// Obtener todos los clientes
const obtenerClientes = async (req, res) => {
  try {
    const { limit = 50, offset = 0, search } = req.query;
    
    let clientes;
    if (search) {
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

// Obtener cliente por ID
const obtenerClientePorId = async (req, res) => {
  try {
    const { id } = req.params;
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

// Obtener cliente por usuario
const obtenerClientePorUsuario = async (req, res) => {
  try {
    const { userId } = req.params;
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
    const cliente = await Cliente.findById(id);
    
    if (!cliente) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }

    const {
      nombre_completo,
      telefono,
      nombre_usuario,
      ciudad,
      codigo_postal,
      ingreso,
      estado
    } = req.body;

    const datosActualizacion = {};
    if (nombre_completo) datosActualizacion.nombre_completo = nombre_completo;
    if (telefono !== undefined) datosActualizacion.telefono = telefono;
    if (nombre_usuario !== undefined) {
      // Verificar si el nombre de usuario ya existe en otro cliente
      const clienteConUsername = await Cliente.findByUsername(nombre_usuario);
      if (clienteConUsername && clienteConUsername.id_cliente !== cliente.id_cliente) {
        return res.status(400).json({
          success: false,
          message: 'El nombre de usuario ya está en uso'
        });
      }
      datosActualizacion.nombre_usuario = nombre_usuario;
    }
    if (ciudad !== undefined) datosActualizacion.ciudad = ciudad;
    if (codigo_postal !== undefined) datosActualizacion.codigo_postal = codigo_postal;
    if (ingreso !== undefined) datosActualizacion.ingreso = ingreso;
    if (estado !== undefined) datosActualizacion.estado = estado;

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

// Buscar clientes
const buscarClientes = async (req, res) => {
  try {
    const { 
      limit = 50, 
      offset = 0, 
      nombre_completo, 
      nombre_usuario, 
      ciudad, 
      estado, 
      ingreso_min, 
      ingreso_max 
    } = req.query;

    const criterios = {};
    if (nombre_completo) criterios.nombre_completo = nombre_completo;
    if (nombre_usuario) criterios.nombre_usuario = nombre_usuario;
    if (ciudad) criterios.ciudad = ciudad;
    if (estado) criterios.estado = estado;
    if (ingreso_min) criterios.ingreso_min = parseFloat(ingreso_min);
    if (ingreso_max) criterios.ingreso_max = parseFloat(ingreso_max);

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

// Obtener historial de citas del cliente
const obtenerHistorialCitas = async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 20, offset = 0 } = req.query;
    
    const cliente = await Cliente.findById(id);
    if (!cliente) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }

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

// Eliminar cliente
const eliminarCliente = async (req, res) => {
  try {
    const { id } = req.params;
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
