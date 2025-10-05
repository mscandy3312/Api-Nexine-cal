const Pago = require('../models/Pago');
const { validationResult } = require('express-validator');

// Crear pago
const crearPago = async (req, res) => {
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
      id_profesional,
      balance_general,
      ventas,
      comision,
      fecha,
      especialidad,
      estado,
      accion
    } = req.body;

    const nuevoPago = await Pago.create({
      id_profesional,
      balance_general,
      ventas,
      comision,
      fecha,
      especialidad,
      estado,
      accion
    });

    res.status(201).json({
      success: true,
      message: 'Pago creado exitosamente',
      data: {
        pago: nuevoPago
      }
    });
  } catch (error) {
    console.error('Error al crear pago:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener todos los pagos
const obtenerPagos = async (req, res) => {
  try {
    const { limit = 50, offset = 0, estado, especialidad, fecha, fecha_desde, fecha_hasta } = req.query;
    
    let pagos;
    if (estado) {
      pagos = await Pago.findByEstado(estado, parseInt(limit), parseInt(offset));
    } else if (especialidad) {
      pagos = await Pago.findByEspecialidad(especialidad, parseInt(limit), parseInt(offset));
    } else if (fecha) {
      pagos = await Pago.findByFecha(fecha, parseInt(limit), parseInt(offset));
    } else if (fecha_desde && fecha_hasta) {
      pagos = await Pago.findByRangoFechas(fecha_desde, fecha_hasta, parseInt(limit), parseInt(offset));
    } else {
      pagos = await Pago.findAll(parseInt(limit), parseInt(offset));
    }

    res.json({
      success: true,
      data: {
        pagos,
        paginacion: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: pagos.length
        }
      }
    });
  } catch (error) {
    console.error('Error al obtener pagos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener pago por ID
const obtenerPagoPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const pago = await Pago.findById(id);
    
    if (!pago) {
      return res.status(404).json({
        success: false,
        message: 'Pago no encontrado'
      });
    }

    res.json({
      success: true,
      data: {
        pago
      }
    });
  } catch (error) {
    console.error('Error al obtener pago:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener pagos por profesional
const obtenerPagosPorProfesional = async (req, res) => {
  try {
    const { id_profesional } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    
    const pagos = await Pago.findByProfesional(id_profesional, parseInt(limit), parseInt(offset));

    res.json({
      success: true,
      data: {
        pagos,
        id_profesional,
        paginacion: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: pagos.length
        }
      }
    });
  } catch (error) {
    console.error('Error al obtener pagos por profesional:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Actualizar pago
const actualizarPago = async (req, res) => {
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
    const pago = await Pago.findById(id);
    
    if (!pago) {
      return res.status(404).json({
        success: false,
        message: 'Pago no encontrado'
      });
    }

    const {
      balance_general,
      ventas,
      comision,
      fecha,
      especialidad,
      estado,
      accion
    } = req.body;

    const datosActualizacion = {};
    if (balance_general !== undefined) datosActualizacion.balance_general = balance_general;
    if (ventas !== undefined) datosActualizacion.ventas = ventas;
    if (comision !== undefined) datosActualizacion.comision = comision;
    if (fecha !== undefined) datosActualizacion.fecha = fecha;
    if (especialidad !== undefined) datosActualizacion.especialidad = especialidad;
    if (estado !== undefined) datosActualizacion.estado = estado;
    if (accion !== undefined) datosActualizacion.accion = accion;

    const pagoActualizado = await pago.update(datosActualizacion);

    res.json({
      success: true,
      message: 'Pago actualizado exitosamente',
      data: {
        pago: pagoActualizado
      }
    });
  } catch (error) {
    console.error('Error al actualizar pago:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Cambiar estado del pago
const cambiarEstadoPago = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    
    const pago = await Pago.findById(id);
    if (!pago) {
      return res.status(404).json({
        success: false,
        message: 'Pago no encontrado'
      });
    }

    const pagoActualizado = await pago.cambiarEstado(estado);

    res.json({
      success: true,
      message: 'Estado del pago actualizado exitosamente',
      data: {
        pago: pagoActualizado
      }
    });
  } catch (error) {
    console.error('Error al cambiar estado del pago:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Buscar pagos
const buscarPagos = async (req, res) => {
  try {
    const { 
      limit = 50, 
      offset = 0, 
      id_profesional, 
      estado, 
      especialidad, 
      accion, 
      fecha_desde, 
      fecha_hasta, 
      ventas_min, 
      ventas_max 
    } = req.query;

    const criterios = {};
    if (id_profesional) criterios.id_profesional = id_profesional;
    if (estado) criterios.estado = estado;
    if (especialidad) criterios.especialidad = especialidad;
    if (accion) criterios.accion = accion;
    if (fecha_desde) criterios.fecha_desde = fecha_desde;
    if (fecha_hasta) criterios.fecha_hasta = fecha_hasta;
    if (ventas_min) criterios.ventas_min = parseFloat(ventas_min);
    if (ventas_max) criterios.ventas_max = parseFloat(ventas_max);

    const pagos = await Pago.search(criterios, parseInt(limit), parseInt(offset));

    res.json({
      success: true,
      data: {
        pagos,
        paginacion: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: pagos.length
        }
      }
    });
  } catch (error) {
    console.error('Error al buscar pagos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener estadísticas de pagos
const obtenerEstadisticasPagos = async (req, res) => {
  try {
    const { id_profesional, fecha_inicio, fecha_fin } = req.query;
    
    const stats = await Pago.getStats(id_profesional, fecha_inicio, fecha_fin);

    res.json({
      success: true,
      data: {
        estadisticas: stats,
        filtros: {
          id_profesional,
          fecha_inicio,
          fecha_fin
        }
      }
    });
  } catch (error) {
    console.error('Error al obtener estadísticas de pagos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener estadísticas por especialidad
const obtenerEstadisticasPorEspecialidad = async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;
    
    const stats = await Pago.getStatsByEspecialidad(fecha_inicio, fecha_fin);

    res.json({
      success: true,
      data: {
        estadisticas_por_especialidad: stats,
        periodo: {
          fecha_inicio,
          fecha_fin
        }
      }
    });
  } catch (error) {
    console.error('Error al obtener estadísticas por especialidad:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener balance del profesional
const obtenerBalanceProfesional = async (req, res) => {
  try {
    const { id_profesional } = req.params;
    
    const balance = await Pago.getBalanceProfesional(id_profesional);

    res.json({
      success: true,
      data: {
        balance,
        id_profesional
      }
    });
  } catch (error) {
    console.error('Error al obtener balance del profesional:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Eliminar pago
const eliminarPago = async (req, res) => {
  try {
    const { id } = req.params;
    const pago = await Pago.findById(id);
    
    if (!pago) {
      return res.status(404).json({
        success: false,
        message: 'Pago no encontrado'
      });
    }

    await pago.delete();

    res.json({
      success: true,
      message: 'Pago eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar pago:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

module.exports = {
  crearPago,
  obtenerPagos,
  obtenerPagoPorId,
  obtenerPagosPorProfesional,
  actualizarPago,
  cambiarEstadoPago,
  buscarPagos,
  obtenerEstadisticasPagos,
  obtenerEstadisticasPorEspecialidad,
  obtenerBalanceProfesional,
  eliminarPago
};
