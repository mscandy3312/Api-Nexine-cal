const Sesion = require('../models/Sesion');
const { validationResult } = require('express-validator');

// Crear sesión
const crearSesion = async (req, res) => {
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
      id_clientes,
      id_profesional,
      id_precio,
      id_citas,
      numero_pedido,
      fecha,
      estado,
      acciones,
      producto,
      metodo_pago
    } = req.body;

    const nuevaSesion = await Sesion.create({
      id_clientes,
      id_profesional,
      id_precio,
      id_citas,
      numero_pedido,
      fecha,
      estado,
      acciones,
      producto,
      metodo_pago
    });

    res.status(201).json({
      success: true,
      message: 'Sesión creada exitosamente',
      data: {
        sesion: nuevaSesion
      }
    });
  } catch (error) {
    console.error('Error al crear sesión:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener todas las sesiones
const obtenerSesiones = async (req, res) => {
  try {
    const { limit = 50, offset = 0, estado, fecha, fecha_desde, fecha_hasta } = req.query;
    
    let sesiones;
    if (estado) {
      sesiones = await Sesion.findByEstado(estado, parseInt(limit), parseInt(offset));
    } else if (fecha) {
      sesiones = await Sesion.findByFecha(fecha, parseInt(limit), parseInt(offset));
    } else if (fecha_desde && fecha_hasta) {
      sesiones = await Sesion.findByRangoFechas(fecha_desde, fecha_hasta, parseInt(limit), parseInt(offset));
    } else {
      sesiones = await Sesion.findAll(parseInt(limit), parseInt(offset));
    }

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
    console.error('Error al obtener sesiones:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener sesión por ID
const obtenerSesionPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const sesion = await Sesion.findById(id);
    
    if (!sesion) {
      return res.status(404).json({
        success: false,
        message: 'Sesión no encontrada'
      });
    }

    // Obtener valoraciones de la sesión
    const valoraciones = await sesion.getValoraciones();

    res.json({
      success: true,
      data: {
        sesion,
        valoraciones
      }
    });
  } catch (error) {
    console.error('Error al obtener sesión:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener sesión por número de pedido
const obtenerSesionPorPedido = async (req, res) => {
  try {
    const { numero_pedido } = req.params;
    const sesion = await Sesion.findByNumeroPedido(numero_pedido);
    
    if (!sesion) {
      return res.status(404).json({
        success: false,
        message: 'Sesión no encontrada'
      });
    }

    res.json({
      success: true,
      data: {
        sesion
      }
    });
  } catch (error) {
    console.error('Error al obtener sesión por pedido:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener sesiones por clientes
const obtenerSesionesPorclientes = async (req, res) => {
  try {
    const { id_clientes } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    
    const sesiones = await Sesion.findByclientes(id_clientes, parseInt(limit), parseInt(offset));

    res.json({
      success: true,
      data: {
        sesiones,
        id_clientes,
        paginacion: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: sesiones.length
        }
      }
    });
  } catch (error) {
    console.error('Error al obtener sesiones por clientes:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener sesiones por profesional
const obtenerSesionesPorProfesional = async (req, res) => {
  try {
    const { id_profesional } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    
    const sesiones = await Sesion.findByProfesional(id_profesional, parseInt(limit), parseInt(offset));

    res.json({
      success: true,
      data: {
        sesiones,
        id_profesional,
        paginacion: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: sesiones.length
        }
      }
    });
  } catch (error) {
    console.error('Error al obtener sesiones por profesional:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Actualizar sesión
const actualizarSesion = async (req, res) => {
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
    const sesion = await Sesion.findById(id);
    
    if (!sesion) {
      return res.status(404).json({
        success: false,
        message: 'Sesión no encontrada'
      });
    }

    const {
      id_clientes,
      id_profesional,
      id_precio,
      id_citas,
      numero_pedido,
      fecha,
      estado,
      acciones,
      producto,
      metodo_pago
    } = req.body;

    const datosActualizacion = {};
    if (id_clientes) datosActualizacion.id_clientes = id_clientes;
    if (id_profesional) datosActualizacion.id_profesional = id_profesional;
    if (id_precio !== undefined) datosActualizacion.id_precio = id_precio;
    if (id_citas !== undefined) datosActualizacion.id_citas = id_citas;
    if (numero_pedido !== undefined) datosActualizacion.numero_pedido = numero_pedido;
    if (fecha) datosActualizacion.fecha = fecha;
    if (estado) datosActualizacion.estado = estado;
    if (acciones !== undefined) datosActualizacion.acciones = acciones;
    if (producto !== undefined) datosActualizacion.producto = producto;
    if (metodo_pago !== undefined) datosActualizacion.metodo_pago = metodo_pago;

    const sesionActualizada = await sesion.update(datosActualizacion);

    res.json({
      success: true,
      message: 'Sesión actualizada exitosamente',
      data: {
        sesion: sesionActualizada
      }
    });
  } catch (error) {
    console.error('Error al actualizar sesión:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Cambiar estado de la sesión
const cambiarEstadoSesion = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    
    const sesion = await Sesion.findById(id);
    if (!sesion) {
      return res.status(404).json({
        success: false,
        message: 'Sesión no encontrada'
      });
    }

    const sesionActualizada = await sesion.cambiarEstado(estado);

    res.json({
      success: true,
      message: 'Estado de la sesión actualizado exitosamente',
      data: {
        sesion: sesionActualizada
      }
    });
  } catch (error) {
    console.error('Error al cambiar estado de la sesión:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Buscar sesiones
const buscarSesiones = async (req, res) => {
  try {
    const { 
      limit = 50, 
      offset = 0, 
      id_clientes, 
      id_profesional, 
      estado, 
      fecha_desde, 
      fecha_hasta, 
      producto, 
      metodo_pago 
    } = req.query;

    const criterios = {};
    if (id_clientes) criterios.id_clientes = id_clientes;
    if (id_profesional) criterios.id_profesional = id_profesional;
    if (estado) criterios.estado = estado;
    if (fecha_desde) criterios.fecha_desde = fecha_desde;
    if (fecha_hasta) criterios.fecha_hasta = fecha_hasta;
    if (producto) criterios.producto = producto;
    if (metodo_pago) criterios.metodo_pago = metodo_pago;

    const sesiones = await Sesion.search(criterios, parseInt(limit), parseInt(offset));

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
    console.error('Error al buscar sesiones:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener estadísticas de sesiones
const obtenerEstadisticasSesiones = async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;
    
    const stats = await Sesion.getStats(fecha_inicio, fecha_fin);

    res.json({
      success: true,
      data: {
        estadisticas: stats,
        periodo: {
          fecha_inicio,
          fecha_fin
        }
      }
    });
  } catch (error) {
    console.error('Error al obtener estadísticas de sesiones:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Eliminar sesión
const eliminarSesion = async (req, res) => {
  try {
    const { id } = req.params;
    const sesion = await Sesion.findById(id);
    
    if (!sesion) {
      return res.status(404).json({
      success: false,
      message: 'Sesión no encontrada'
    });
    }

    await sesion.delete();

    res.json({
      success: true,
      message: 'Sesión eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar sesión:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

module.exports = {
  crearSesion,
  obtenerSesiones,
  obtenerSesionPorId,
  obtenerSesionPorPedido,
  obtenerSesionesPorclientes,
  obtenerSesionesPorProfesional,
  actualizarSesion,
  cambiarEstadoSesion,
  buscarSesiones,
  obtenerEstadisticasSesiones,
  eliminarSesion
};
