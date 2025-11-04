const citas = require('../models/citas');
const { validationResult } = require('express-validator');

// Crear citas
const crearcitas = async (req, res) => {
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
      fecha,
      motivo,
      notas
    } = req.body;

    const nuevacitas = await citas.create({
      id_clientes,
      id_profesional,
      id_precio,
      fecha,
      motivo,
      notas
    });

    res.status(201).json({
      success: true,
      message: 'citas creada exitosamente',
      data: {
        citas: nuevacitas
      }
    });
  } catch (error) {
    console.error('Error al crear citas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener todas las citass
const obtenercitass = async (req, res) => {
  try {
    const { limit = 50, offset = 0, estado, fecha, fecha_desde, fecha_hasta } = req.query;
    
    let citass;
    if (estado) {
      citass = await citas.findByEstado(estado, parseInt(limit), parseInt(offset));
    } else if (fecha) {
      citass = await citas.findByFecha(fecha, parseInt(limit), parseInt(offset));
    } else if (fecha_desde && fecha_hasta) {
      citass = await citas.findByRangoFechas(fecha_desde, fecha_hasta, parseInt(limit), parseInt(offset));
    } else {
      citass = await citas.findAll(parseInt(limit), parseInt(offset));
    }

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
    console.error('Error al obtener citass:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener citas por ID
const obtenercitasPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const citas = await citas.findById(id);
    
    if (!citas) {
      return res.status(404).json({
        success: false,
        message: 'citas no encontrada'
      });
    }

    res.json({
      success: true,
      data: {
        citas
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

// Obtener citass por clientes
const obtenercitassPorclientes = async (req, res) => {
  try {
    const { id_clientes } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    
    const citass = await citas.findByclientes(id_clientes, parseInt(limit), parseInt(offset));

    res.json({
      success: true,
      data: {
        citass,
        id_clientes,
        paginacion: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: citass.length
        }
      }
    });
  } catch (error) {
    console.error('Error al obtener citass por clientes:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener citass por profesional
const obtenercitassPorProfesional = async (req, res) => {
  try {
    const { id_profesional } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    
    const citass = await citas.findByProfesional(id_profesional, parseInt(limit), parseInt(offset));

    res.json({
      success: true,
      data: {
        citass,
        id_profesional,
        paginacion: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: citass.length
        }
      }
    });
  } catch (error) {
    console.error('Error al obtener citass por profesional:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Actualizar citas
const actualizarcitas = async (req, res) => {
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
    const citas = await citas.findById(id);
    
    if (!citas) {
      return res.status(404).json({
        success: false,
        message: 'citas no encontrada'
      });
    }

    const {
      id_clientes,
      id_profesional,
      id_precio,
      fecha,
      estado,
      motivo,
      notas
    } = req.body;

    const datosActualizacion = {};
    if (id_clientes) datosActualizacion.id_clientes = id_clientes;
    if (id_profesional) datosActualizacion.id_profesional = id_profesional;
    if (id_precio !== undefined) datosActualizacion.id_precio = id_precio;
    if (fecha) datosActualizacion.fecha = fecha;
    if (estado) datosActualizacion.estado = estado;
    if (motivo !== undefined) datosActualizacion.motivo = motivo;
    if (notas !== undefined) datosActualizacion.notas = notas;

    const citasActualizada = await citas.update(datosActualizacion);

    res.json({
      success: true,
      message: 'citas actualizada exitosamente',
      data: {
        citas: citasActualizada
      }
    });
  } catch (error) {
    console.error('Error al actualizar citas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Cambiar estado de la citas
const cambiarEstadocitas = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    
    const citas = await citas.findById(id);
    if (!citas) {
      return res.status(404).json({
        success: false,
        message: 'citas no encontrada'
      });
    }

    const citasActualizada = await citas.cambiarEstado(estado);

    res.json({
      success: true,
      message: 'Estado de la citas actualizado exitosamente',
      data: {
        citas: citasActualizada
      }
    });
  } catch (error) {
    console.error('Error al cambiar estado de la citas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Buscar citass
const buscarcitass = async (req, res) => {
  try {
    const { 
      limit = 50, 
      offset = 0, 
      id_clientes, 
      id_profesional, 
      estado, 
      fecha_desde, 
      fecha_hasta, 
      motivo 
    } = req.query;

    const criterios = {};
    if (id_clientes) criterios.id_clientes = id_clientes;
    if (id_profesional) criterios.id_profesional = id_profesional;
    if (estado) criterios.estado = estado;
    if (fecha_desde) criterios.fecha_desde = fecha_desde;
    if (fecha_hasta) criterios.fecha_hasta = fecha_hasta;
    if (motivo) criterios.motivo = motivo;

    const citass = await citas.search(criterios, parseInt(limit), parseInt(offset));

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
    console.error('Error al buscar citass:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener estadísticas de citass
const obtenerEstadisticascitass = async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;
    
    const stats = await citas.getStats(fecha_inicio, fecha_fin);

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
    console.error('Error al obtener estadísticas de citass:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Eliminar citas
const eliminarcitas = async (req, res) => {
  try {
    const { id } = req.params;
    const citas = await citas.findById(id);
    
    if (!citas) {
      return res.status(404).json({
        success: false,
        message: 'citas no encontrada'
      });
    }

    await citas.delete();

    res.json({
      success: true,
      message: 'citas eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar citas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

module.exports = {
  crearcitas,
  obtenercitass,
  obtenercitasPorId,
  obtenercitassPorclientes,
  obtenercitassPorProfesional,
  actualizarcitas,
  cambiarEstadocitas,
  buscarcitass,
  obtenerEstadisticascitass,
  eliminarcitas
};
