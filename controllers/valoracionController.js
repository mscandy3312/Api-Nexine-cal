const Valoracion = require('../models/Valoracion');
const { validationResult } = require('express-validator');

// Crear valoración
const crearValoracion = async (req, res) => {
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
      id_sesion,
      rating,
      mensaje,
      estado = 'activa'
    } = req.body;

    const nuevaValoracion = await Valoracion.create({
      id_sesion,
      rating,
      mensaje,
      estado
    });

    res.status(201).json({
      success: true,
      message: 'Valoración creada exitosamente',
      data: {
        valoracion: nuevaValoracion
      }
    });
  } catch (error) {
    console.error('Error al crear valoración:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener todas las valoraciones
const obtenerValoraciones = async (req, res) => {
  try {
    const { limit = 50, offset = 0, rating, estado } = req.query;
    
    let valoraciones;
    if (rating) {
      valoraciones = await Valoracion.findByRating(rating, parseInt(limit), parseInt(offset));
    } else if (estado) {
      valoraciones = await Valoracion.findByEstado(estado, parseInt(limit), parseInt(offset));
    } else {
      valoraciones = await Valoracion.findAll(parseInt(limit), parseInt(offset));
    }

    res.json({
      success: true,
      data: {
        valoraciones,
        paginacion: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: valoraciones.length
        }
      }
    });
  } catch (error) {
    console.error('Error al obtener valoraciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener valoración por ID
const obtenerValoracionPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const valoracion = await Valoracion.findById(id);
    
    if (!valoracion) {
      return res.status(404).json({
        success: false,
        message: 'Valoración no encontrada'
      });
    }

    res.json({
      success: true,
      data: {
        valoracion
      }
    });
  } catch (error) {
    console.error('Error al obtener valoración:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener valoraciones por sesión
const obtenerValoracionesPorSesion = async (req, res) => {
  try {
    const { id_sesion } = req.params;
    
    const valoraciones = await Valoracion.findBySesion(id_sesion);

    res.json({
      success: true,
      data: {
        valoraciones,
        id_sesion
      }
    });
  } catch (error) {
    console.error('Error al obtener valoraciones por sesión:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener valoraciones por profesional
const obtenerValoracionesPorProfesional = async (req, res) => {
  try {
    const { id_profesional } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    
    const valoraciones = await Valoracion.findByProfesional(id_profesional, parseInt(limit), parseInt(offset));

    res.json({
      success: true,
      data: {
        valoraciones,
        id_profesional,
        paginacion: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: valoraciones.length
        }
      }
    });
  } catch (error) {
    console.error('Error al obtener valoraciones por profesional:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener valoraciones por cliente
const obtenerValoracionesPorCliente = async (req, res) => {
  try {
    const { id_cliente } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    
    const valoraciones = await Valoracion.findByCliente(id_cliente, parseInt(limit), parseInt(offset));

    res.json({
      success: true,
      data: {
        valoraciones,
        id_cliente,
        paginacion: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: valoraciones.length
        }
      }
    });
  } catch (error) {
    console.error('Error al obtener valoraciones por cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Actualizar valoración
const actualizarValoracion = async (req, res) => {
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
    const valoracion = await Valoracion.findById(id);
    
    if (!valoracion) {
      return res.status(404).json({
        success: false,
        message: 'Valoración no encontrada'
      });
    }

    const { rating, mensaje, estado } = req.body;

    const datosActualizacion = {};
    if (rating !== undefined) datosActualizacion.rating = rating;
    if (mensaje !== undefined) datosActualizacion.mensaje = mensaje;
    if (estado !== undefined) datosActualizacion.estado = estado;

    const valoracionActualizada = await valoracion.update(datosActualizacion);

    res.json({
      success: true,
      message: 'Valoración actualizada exitosamente',
      data: {
        valoracion: valoracionActualizada
      }
    });
  } catch (error) {
    console.error('Error al actualizar valoración:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Cambiar estado de la valoración
const cambiarEstadoValoracion = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    
    const valoracion = await Valoracion.findById(id);
    if (!valoracion) {
      return res.status(404).json({
        success: false,
        message: 'Valoración no encontrada'
      });
    }

    const valoracionActualizada = await valoracion.cambiarEstado(estado);

    res.json({
      success: true,
      message: 'Estado de la valoración actualizado exitosamente',
      data: {
        valoracion: valoracionActualizada
      }
    });
  } catch (error) {
    console.error('Error al cambiar estado de la valoración:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Buscar valoraciones
const buscarValoraciones = async (req, res) => {
  try {
    const { 
      limit = 50, 
      offset = 0, 
      id_profesional, 
      id_cliente, 
      rating, 
      rating_min, 
      rating_max, 
      estado, 
      fecha_desde, 
      fecha_hasta, 
      mensaje 
    } = req.query;

    const criterios = {};
    if (id_profesional) criterios.id_profesional = id_profesional;
    if (id_cliente) criterios.id_cliente = id_cliente;
    if (rating) criterios.rating = rating;
    if (rating_min) criterios.rating_min = parseInt(rating_min);
    if (rating_max) criterios.rating_max = parseInt(rating_max);
    if (estado) criterios.estado = estado;
    if (fecha_desde) criterios.fecha_desde = fecha_desde;
    if (fecha_hasta) criterios.fecha_hasta = fecha_hasta;
    if (mensaje) criterios.mensaje = mensaje;

    const valoraciones = await Valoracion.search(criterios, parseInt(limit), parseInt(offset));

    res.json({
      success: true,
      data: {
        valoraciones,
        paginacion: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: valoraciones.length
        }
      }
    });
  } catch (error) {
    console.error('Error al buscar valoraciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener estadísticas de valoraciones
const obtenerEstadisticasValoraciones = async (req, res) => {
  try {
    const { id_profesional, fecha_inicio, fecha_fin } = req.query;
    
    const stats = await Valoracion.getStats(id_profesional, fecha_inicio, fecha_fin);

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
    console.error('Error al obtener estadísticas de valoraciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Eliminar valoración
const eliminarValoracion = async (req, res) => {
  try {
    const { id } = req.params;
    const valoracion = await Valoracion.findById(id);
    
    if (!valoracion) {
      return res.status(404).json({
        success: false,
        message: 'Valoración no encontrada'
      });
    }

    await valoracion.delete();

    res.json({
      success: true,
      message: 'Valoración eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar valoración:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

module.exports = {
  crearValoracion,
  obtenerValoraciones,
  obtenerValoracionPorId,
  obtenerValoracionesPorSesion,
  obtenerValoracionesPorProfesional,
  obtenerValoracionesPorCliente,
  actualizarValoracion,
  cambiarEstadoValoracion,
  buscarValoraciones,
  obtenerEstadisticasValoraciones,
  eliminarValoracion
};
