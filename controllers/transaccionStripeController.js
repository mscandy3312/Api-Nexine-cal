const TransaccionStripe = require('../models/TransaccionStripe');
const { validationResult } = require('express-validator');

// Crear transacción Stripe
const crearTransaccionStripe = async (req, res) => {
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
      id_pago,
      id_sesion,
      stripe_payment_id,
      monto,
      moneda,
      estado,
      metodo_pago
    } = req.body;

    const nuevaTransaccion = await TransaccionStripe.create({
      id_pago,
      id_sesion,
      stripe_payment_id,
      monto,
      moneda,
      estado,
      metodo_pago
    });

    res.status(201).json({
      success: true,
      message: 'Transacción Stripe creada exitosamente',
      data: {
        transaccion: nuevaTransaccion
      }
    });
  } catch (error) {
    console.error('Error al crear transacción Stripe:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener todas las transacciones Stripe
const obtenerTransaccionesStripe = async (req, res) => {
  try {
    const { limit = 50, offset = 0, estado, fecha, fecha_desde, fecha_hasta } = req.query;
    
    let transacciones;
    if (estado) {
      transacciones = await TransaccionStripe.findByEstado(estado, parseInt(limit), parseInt(offset));
    } else if (fecha) {
      transacciones = await TransaccionStripe.findByFecha(fecha, parseInt(limit), parseInt(offset));
    } else if (fecha_desde && fecha_hasta) {
      transacciones = await TransaccionStripe.findByRangoFechas(fecha_desde, fecha_hasta, parseInt(limit), parseInt(offset));
    } else {
      transacciones = await TransaccionStripe.findAll(parseInt(limit), parseInt(offset));
    }

    res.json({
      success: true,
      data: {
        transacciones,
        paginacion: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: transacciones.length
        }
      }
    });
  } catch (error) {
    console.error('Error al obtener transacciones Stripe:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener transacción Stripe por ID
const obtenerTransaccionStripePorId = async (req, res) => {
  try {
    const { id } = req.params;
    const transaccion = await TransaccionStripe.findById(id);
    
    if (!transaccion) {
      return res.status(404).json({
        success: false,
        message: 'Transacción Stripe no encontrada'
      });
    }

    res.json({
      success: true,
      data: {
        transaccion
      }
    });
  } catch (error) {
    console.error('Error al obtener transacción Stripe:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener transacción por ID de Stripe
const obtenerTransaccionPorStripeId = async (req, res) => {
  try {
    const { stripe_payment_id } = req.params;
    const transaccion = await TransaccionStripe.findByStripePaymentId(stripe_payment_id);
    
    if (!transaccion) {
      return res.status(404).json({
        success: false,
        message: 'Transacción Stripe no encontrada'
      });
    }

    res.json({
      success: true,
      data: {
        transaccion
      }
    });
  } catch (error) {
    console.error('Error al obtener transacción por Stripe ID:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener transacciones por pago
const obtenerTransaccionesPorPago = async (req, res) => {
  try {
    const { id_pago } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    
    const transacciones = await TransaccionStripe.findByPago(id_pago, parseInt(limit), parseInt(offset));

    res.json({
      success: true,
      data: {
        transacciones,
        id_pago,
        paginacion: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: transacciones.length
        }
      }
    });
  } catch (error) {
    console.error('Error al obtener transacciones por pago:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener transacciones por sesión
const obtenerTransaccionesPorSesion = async (req, res) => {
  try {
    const { id_sesion } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    
    const transacciones = await TransaccionStripe.findBySesion(id_sesion, parseInt(limit), parseInt(offset));

    res.json({
      success: true,
      data: {
        transacciones,
        id_sesion,
        paginacion: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: transacciones.length
        }
      }
    });
  } catch (error) {
    console.error('Error al obtener transacciones por sesión:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener transacciones por profesional
const obtenerTransaccionesPorProfesional = async (req, res) => {
  try {
    const { id_profesional } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    
    const transacciones = await TransaccionStripe.findByProfesional(id_profesional, parseInt(limit), parseInt(offset));

    res.json({
      success: true,
      data: {
        transacciones,
        id_profesional,
        paginacion: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: transacciones.length
        }
      }
    });
  } catch (error) {
    console.error('Error al obtener transacciones por profesional:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Actualizar transacción Stripe
const actualizarTransaccionStripe = async (req, res) => {
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
    const transaccion = await TransaccionStripe.findById(id);
    
    if (!transaccion) {
      return res.status(404).json({
        success: false,
        message: 'Transacción Stripe no encontrada'
      });
    }

    const {
      id_pago,
      id_sesion,
      stripe_payment_id,
      monto,
      moneda,
      estado,
      metodo_pago
    } = req.body;

    const datosActualizacion = {};
    if (id_pago !== undefined) datosActualizacion.id_pago = id_pago;
    if (id_sesion !== undefined) datosActualizacion.id_sesion = id_sesion;
    if (stripe_payment_id !== undefined) datosActualizacion.stripe_payment_id = stripe_payment_id;
    if (monto !== undefined) datosActualizacion.monto = monto;
    if (moneda !== undefined) datosActualizacion.moneda = moneda;
    if (estado !== undefined) datosActualizacion.estado = estado;
    if (metodo_pago !== undefined) datosActualizacion.metodo_pago = metodo_pago;

    const transaccionActualizada = await transaccion.update(datosActualizacion);

    res.json({
      success: true,
      message: 'Transacción Stripe actualizada exitosamente',
      data: {
        transaccion: transaccionActualizada
      }
    });
  } catch (error) {
    console.error('Error al actualizar transacción Stripe:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Cambiar estado de la transacción
const cambiarEstadoTransaccion = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    
    const transaccion = await TransaccionStripe.findById(id);
    if (!transaccion) {
      return res.status(404).json({
        success: false,
        message: 'Transacción Stripe no encontrada'
      });
    }

    const transaccionActualizada = await transaccion.cambiarEstado(estado);

    res.json({
      success: true,
      message: 'Estado de la transacción actualizado exitosamente',
      data: {
        transaccion: transaccionActualizada
      }
    });
  } catch (error) {
    console.error('Error al cambiar estado de la transacción:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Buscar transacciones Stripe
const buscarTransaccionesStripe = async (req, res) => {
  try {
    const { 
      limit = 50, 
      offset = 0, 
      id_pago, 
      id_sesion, 
      id_profesional, 
      estado, 
      moneda, 
      monto_min, 
      monto_max, 
      fecha_desde, 
      fecha_hasta, 
      metodo_pago 
    } = req.query;

    const criterios = {};
    if (id_pago) criterios.id_pago = id_pago;
    if (id_sesion) criterios.id_sesion = id_sesion;
    if (id_profesional) criterios.id_profesional = id_profesional;
    if (estado) criterios.estado = estado;
    if (moneda) criterios.moneda = moneda;
    if (monto_min) criterios.monto_min = parseFloat(monto_min);
    if (monto_max) criterios.monto_max = parseFloat(monto_max);
    if (fecha_desde) criterios.fecha_desde = fecha_desde;
    if (fecha_hasta) criterios.fecha_hasta = fecha_hasta;
    if (metodo_pago) criterios.metodo_pago = metodo_pago;

    const transacciones = await TransaccionStripe.search(criterios, parseInt(limit), parseInt(offset));

    res.json({
      success: true,
      data: {
        transacciones,
        paginacion: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: transacciones.length
        }
      }
    });
  } catch (error) {
    console.error('Error al buscar transacciones Stripe:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener estadísticas de transacciones Stripe
const obtenerEstadisticasTransacciones = async (req, res) => {
  try {
    const { id_profesional, fecha_inicio, fecha_fin } = req.query;
    
    const stats = await TransaccionStripe.getStats(id_profesional, fecha_inicio, fecha_fin);

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
    console.error('Error al obtener estadísticas de transacciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener estadísticas por moneda
const obtenerEstadisticasPorMoneda = async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;
    
    const stats = await TransaccionStripe.getStatsByMoneda(fecha_inicio, fecha_fin);

    res.json({
      success: true,
      data: {
        estadisticas_por_moneda: stats,
        periodo: {
          fecha_inicio,
          fecha_fin
        }
      }
    });
  } catch (error) {
    console.error('Error al obtener estadísticas por moneda:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Eliminar transacción Stripe
const eliminarTransaccionStripe = async (req, res) => {
  try {
    const { id } = req.params;
    const transaccion = await TransaccionStripe.findById(id);
    
    if (!transaccion) {
      return res.status(404).json({
        success: false,
        message: 'Transacción Stripe no encontrada'
      });
    }

    await transaccion.delete();

    res.json({
      success: true,
      message: 'Transacción Stripe eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar transacción Stripe:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

module.exports = {
  crearTransaccionStripe,
  obtenerTransaccionesStripe,
  obtenerTransaccionStripePorId,
  obtenerTransaccionPorStripeId,
  obtenerTransaccionesPorPago,
  obtenerTransaccionesPorSesion,
  obtenerTransaccionesPorProfesional,
  actualizarTransaccionStripe,
  cambiarEstadoTransaccion,
  buscarTransaccionesStripe,
  obtenerEstadisticasTransacciones,
  obtenerEstadisticasPorMoneda,
  eliminarTransaccionStripe
};
