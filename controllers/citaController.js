const Cita = require('../models/Cita');
const { validationResult } = require('express-validator');

// Crear cita
const crearCita = async (req, res) => {
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
      id_cliente,
      id_profesional,
      id_precio,
      fecha,
      motivo,
      notas
    } = req.body;

    const nuevaCita = await Cita.create({
      id_cliente,
      id_profesional,
      id_precio,
      fecha,
      motivo,
      notas
    });

    res.status(201).json({
      success: true,
      message: 'Cita creada exitosamente',
      data: {
        cita: nuevaCita
      }
    });
  } catch (error) {
    console.error('Error al crear cita:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener todas las citas
const obtenerCitas = async (req, res) => {
  try {
    const { limit = 50, offset = 0, estado, fecha, fecha_desde, fecha_hasta } = req.query;
    
    let citas;
    if (estado) {
      citas = await Cita.findByEstado(estado, parseInt(limit), parseInt(offset));
    } else if (fecha) {
      citas = await Cita.findByFecha(fecha, parseInt(limit), parseInt(offset));
    } else if (fecha_desde && fecha_hasta) {
      citas = await Cita.findByRangoFechas(fecha_desde, fecha_hasta, parseInt(limit), parseInt(offset));
    } else {
      citas = await Cita.findAll(parseInt(limit), parseInt(offset));
    }

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
    console.error('Error al obtener citas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener cita por ID
const obtenerCitaPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const cita = await Cita.findById(id);
    
    if (!cita) {
      return res.status(404).json({
        success: false,
        message: 'Cita no encontrada'
      });
    }

    res.json({
      success: true,
      data: {
        cita
      }
    });
  } catch (error) {
    console.error('Error al obtener cita:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener citas por cliente
const obtenerCitasPorCliente = async (req, res) => {
  try {
    const { id_cliente } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    
    const citas = await Cita.findByCliente(id_cliente, parseInt(limit), parseInt(offset));

    res.json({
      success: true,
      data: {
        citas,
        id_cliente,
        paginacion: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: citas.length
        }
      }
    });
  } catch (error) {
    console.error('Error al obtener citas por cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener citas por profesional
const obtenerCitasPorProfesional = async (req, res) => {
  try {
    const { id_profesional } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    
    const citas = await Cita.findByProfesional(id_profesional, parseInt(limit), parseInt(offset));

    res.json({
      success: true,
      data: {
        citas,
        id_profesional,
        paginacion: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: citas.length
        }
      }
    });
  } catch (error) {
    console.error('Error al obtener citas por profesional:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Actualizar cita
const actualizarCita = async (req, res) => {
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
    const cita = await Cita.findById(id);
    
    if (!cita) {
      return res.status(404).json({
        success: false,
        message: 'Cita no encontrada'
      });
    }

    const {
      id_cliente,
      id_profesional,
      id_precio,
      fecha,
      estado,
      motivo,
      notas
    } = req.body;

    const datosActualizacion = {};
    if (id_cliente) datosActualizacion.id_cliente = id_cliente;
    if (id_profesional) datosActualizacion.id_profesional = id_profesional;
    if (id_precio !== undefined) datosActualizacion.id_precio = id_precio;
    if (fecha) datosActualizacion.fecha = fecha;
    if (estado) datosActualizacion.estado = estado;
    if (motivo !== undefined) datosActualizacion.motivo = motivo;
    if (notas !== undefined) datosActualizacion.notas = notas;

    const citaActualizada = await cita.update(datosActualizacion);

    res.json({
      success: true,
      message: 'Cita actualizada exitosamente',
      data: {
        cita: citaActualizada
      }
    });
  } catch (error) {
    console.error('Error al actualizar cita:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Cambiar estado de la cita
const cambiarEstadoCita = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    
    const cita = await Cita.findById(id);
    if (!cita) {
      return res.status(404).json({
        success: false,
        message: 'Cita no encontrada'
      });
    }

    const citaActualizada = await cita.cambiarEstado(estado);

    res.json({
      success: true,
      message: 'Estado de la cita actualizado exitosamente',
      data: {
        cita: citaActualizada
      }
    });
  } catch (error) {
    console.error('Error al cambiar estado de la cita:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Buscar citas
const buscarCitas = async (req, res) => {
  try {
    const { 
      limit = 50, 
      offset = 0, 
      id_cliente, 
      id_profesional, 
      estado, 
      fecha_desde, 
      fecha_hasta, 
      motivo 
    } = req.query;

    const criterios = {};
    if (id_cliente) criterios.id_cliente = id_cliente;
    if (id_profesional) criterios.id_profesional = id_profesional;
    if (estado) criterios.estado = estado;
    if (fecha_desde) criterios.fecha_desde = fecha_desde;
    if (fecha_hasta) criterios.fecha_hasta = fecha_hasta;
    if (motivo) criterios.motivo = motivo;

    const citas = await Cita.search(criterios, parseInt(limit), parseInt(offset));

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
    console.error('Error al buscar citas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener estadísticas de citas
const obtenerEstadisticasCitas = async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;
    
    const stats = await Cita.getStats(fecha_inicio, fecha_fin);

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
    console.error('Error al obtener estadísticas de citas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Eliminar cita
const eliminarCita = async (req, res) => {
  try {
    const { id } = req.params;
    const cita = await Cita.findById(id);
    
    if (!cita) {
      return res.status(404).json({
        success: false,
        message: 'Cita no encontrada'
      });
    }

    await cita.delete();

    res.json({
      success: true,
      message: 'Cita eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar cita:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

module.exports = {
  crearCita,
  obtenerCitas,
  obtenerCitaPorId,
  obtenerCitasPorCliente,
  obtenerCitasPorProfesional,
  actualizarCita,
  cambiarEstadoCita,
  buscarCitas,
  obtenerEstadisticasCitas,
  eliminarCita
};
