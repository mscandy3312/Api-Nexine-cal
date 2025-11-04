const clientes = require('../models/Clientes');
const { validationResult } = require('express-validator');

// Crear clientes
const crearclientes = async (req, res) => {
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
      id_usuarioss,
      nombre_completo,
      telefono,
      nombre_usuarioss,
      ciudad,
      codigo_postal,
      ingreso,
      estado
    } = req.body;

    // Verificar si el usuarioss ya tiene un perfil de clientes
    const clientesExistente = await clientes.findByUserId(id_usuarioss);
    if (clientesExistente) {
      return res.status(400).json({
        success: false,
        message: 'El usuarioss ya tiene un perfil de clientes'
      });
    }

    // Verificar si el nombre de usuarioss ya existe
    if (nombre_usuarioss) {
      const clientesConUsername = await clientes.findByUsername(nombre_usuarioss);
      if (clientesConUsername) {
        return res.status(400).json({
          success: false,
          message: 'El nombre de usuarioss ya está en uso'
        });
      }
    }

    const nuevoclientes = await clientes.create({
      id_usuarioss,
      nombre_completo,
      telefono,
      nombre_usuarioss,
      ciudad,
      codigo_postal,
      ingreso,
      estado
    });

    res.status(201).json({
      success: true,
      message: 'clientes creado exitosamente',
      data: {
        clientes: nuevoclientes
      }
    });
  } catch (error) {
    console.error('Error al crear clientes:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener todos los clientess
const obtenerclientess = async (req, res) => {
  try {
    const { limit = 50, offset = 0, search } = req.query;
    
    let clientess;
    if (search) {
      clientess = await clientes.search({ nombre_completo: search }, parseInt(limit), parseInt(offset));
    } else {
      clientess = await clientes.findAll(parseInt(limit), parseInt(offset));
    }

    res.json({
      success: true,
      data: {
        clientess,
        paginacion: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: clientess.length
        }
      }
    });
  } catch (error) {
    console.error('Error al obtener clientess:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener clientes por ID
const obtenerclientesPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const clientes = await clientes.findById(id);
    
    if (!clientes) {
      return res.status(404).json({
        success: false,
        message: 'clientes no encontrado'
      });
    }

    // Obtener estadísticas del clientes
    const stats = await clientes.getStats();

    res.json({
      success: true,
      data: {
        clientes,
        estadisticas: stats
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

// Obtener clientes por usuarioss
const obtenerclientesPorusuarioss = async (req, res) => {
  try {
    const { userId } = req.params;
    const clientes = await clientes.findByUserId(userId);
    
    if (!clientes) {
      return res.status(404).json({
        success: false,
        message: 'clientes no encontrado'
      });
    }

    // Obtener estadísticas del clientes
    const stats = await clientes.getStats();

    res.json({
      success: true,
      data: {
        clientes,
        estadisticas: stats
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

// Actualizar clientes
const actualizarclientes = async (req, res) => {
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
    const clientes = await clientes.findById(id);
    
    if (!clientes) {
      return res.status(404).json({
        success: false,
        message: 'clientes no encontrado'
      });
    }

    const {
      nombre_completo,
      telefono,
      nombre_usuarioss,
      ciudad,
      codigo_postal,
      ingreso,
      estado
    } = req.body;

    const datosActualizacion = {};
    if (nombre_completo) datosActualizacion.nombre_completo = nombre_completo;
    if (telefono !== undefined) datosActualizacion.telefono = telefono;
    if (nombre_usuarioss !== undefined) {
      // Verificar si el nombre de usuarioss ya existe en otro clientes
      const clientesConUsername = await clientes.findByUsername(nombre_usuarioss);
      if (clientesConUsername && clientesConUsername.id_clientes !== clientes.id_clientes) {
        return res.status(400).json({
          success: false,
          message: 'El nombre de usuarioss ya está en uso'
        });
      }
      datosActualizacion.nombre_usuarioss = nombre_usuarioss;
    }
    if (ciudad !== undefined) datosActualizacion.ciudad = ciudad;
    if (codigo_postal !== undefined) datosActualizacion.codigo_postal = codigo_postal;
    if (ingreso !== undefined) datosActualizacion.ingreso = ingreso;
    if (estado !== undefined) datosActualizacion.estado = estado;

    const clientesActualizado = await clientes.update(datosActualizacion);

    res.json({
      success: true,
      message: 'clientes actualizado exitosamente',
      data: {
        clientes: clientesActualizado
      }
    });
  } catch (error) {
    console.error('Error al actualizar clientes:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Buscar clientess
const buscarclientess = async (req, res) => {
  try {
    const { 
      limit = 50, 
      offset = 0, 
      nombre_completo, 
      nombre_usuarioss, 
      ciudad, 
      estado, 
      ingreso_min, 
      ingreso_max 
    } = req.query;

    const criterios = {};
    if (nombre_completo) criterios.nombre_completo = nombre_completo;
    if (nombre_usuarioss) criterios.nombre_usuarioss = nombre_usuarioss;
    if (ciudad) criterios.ciudad = ciudad;
    if (estado) criterios.estado = estado;
    if (ingreso_min) criterios.ingreso_min = parseFloat(ingreso_min);
    if (ingreso_max) criterios.ingreso_max = parseFloat(ingreso_max);

    const clientess = await clientes.search(criterios, parseInt(limit), parseInt(offset));

    res.json({
      success: true,
      data: {
        clientess,
        paginacion: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: clientess.length
        }
      }
    });
  } catch (error) {
    console.error('Error al buscar clientess:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener historial de sesiones del clientes
const obtenerHistorialSesiones = async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 20, offset = 0 } = req.query;
    
    const clientes = await clientes.findById(id);
    if (!clientes) {
      return res.status(404).json({
        success: false,
        message: 'clientes no encontrado'
      });
    }

    const sesiones = await clientes.getSesiones(parseInt(limit), parseInt(offset));

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

// Obtener historial de citass del clientes
const obtenerHistorialcitass = async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 20, offset = 0 } = req.query;
    
    const clientes = await clientes.findById(id);
    if (!clientes) {
      return res.status(404).json({
        success: false,
        message: 'clientes no encontrado'
      });
    }

    const citass = await clientes.getcitass(parseInt(limit), parseInt(offset));

    res.json({
      success: true,
      data: {
        citass,
        paginacion: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: citass.length
        }
      }
    });
  } catch (error) {
    console.error('Error al obtener historial de citass:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Eliminar clientes
const eliminarclientes = async (req, res) => {
  try {
    const { id } = req.params;
    const clientes = await clientes.findById(id);
    
    if (!clientes) {
      return res.status(404).json({
        success: false,
        message: 'clientes no encontrado'
      });
    }

    await clientes.delete();

    res.json({
      success: true,
      message: 'clientes eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar clientes:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

module.exports = {
  crearclientes,
  obtenerclientess,
  obtenerclientesPorId,
  obtenerclientesPorusuarioss,
  actualizarclientes,
  buscarclientess,
  obtenerHistorialSesiones,
  obtenerHistorialcitass,
  eliminarclientes
};
