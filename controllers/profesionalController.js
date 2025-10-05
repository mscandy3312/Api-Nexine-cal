const Profesional = require('../models/Profesional');
const { validationResult } = require('express-validator');

// Crear profesional
const crearProfesional = async (req, res) => {
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
      id_stripe,
      nombre_completo,
      telefono,
      numero_colegiado,
      especialidad,
      direccion,
      biografia,
      foto_perfil,
      certificaciones
    } = req.body;

    // Verificar si el usuario ya tiene un perfil profesional
    const profesionalExistente = await Profesional.findByUserId(id_usuario);
    if (profesionalExistente) {
      return res.status(400).json({
        success: false,
        message: 'El usuario ya tiene un perfil profesional'
      });
    }

    const nuevoProfesional = await Profesional.create({
      id_usuario,
      id_stripe,
      nombre_completo,
      telefono,
      numero_colegiado,
      especialidad,
      direccion,
      biografia,
      foto_perfil,
      certificaciones
    });

    res.status(201).json({
      success: true,
      message: 'Profesional creado exitosamente',
      data: {
        profesional: nuevoProfesional
      }
    });
  } catch (error) {
    console.error('Error al crear profesional:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener todos los profesionales
const obtenerProfesionales = async (req, res) => {
  try {
    const { limit = 50, offset = 0, especialidad, search } = req.query;
    
    let profesionales;
    if (especialidad) {
      profesionales = await Profesional.findByEspecialidad(especialidad, parseInt(limit), parseInt(offset));
    } else if (search) {
      profesionales = await Profesional.search({ nombre_completo: search }, parseInt(limit), parseInt(offset));
    } else {
      profesionales = await Profesional.findAll(parseInt(limit), parseInt(offset));
    }

    res.json({
      success: true,
      data: {
        profesionales,
        paginacion: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: profesionales.length
        }
      }
    });
  } catch (error) {
    console.error('Error al obtener profesionales:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener profesional por ID
const obtenerProfesionalPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const profesional = await Profesional.findById(id);
    
    if (!profesional) {
      return res.status(404).json({
        success: false,
        message: 'Profesional no encontrado'
      });
    }

    // Obtener estadísticas del profesional
    const stats = await profesional.getStats();

    res.json({
      success: true,
      data: {
        profesional,
        estadisticas: stats
      }
    });
  } catch (error) {
    console.error('Error al obtener profesional:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener profesional por usuario
const obtenerProfesionalPorUsuario = async (req, res) => {
  try {
    const { userId } = req.params;
    const profesional = await Profesional.findByUserId(userId);
    
    if (!profesional) {
      return res.status(404).json({
        success: false,
        message: 'Profesional no encontrado'
      });
    }

    // Obtener estadísticas del profesional
    const stats = await profesional.getStats();

    res.json({
      success: true,
      data: {
        profesional,
        estadisticas: stats
      }
    });
  } catch (error) {
    console.error('Error al obtener profesional:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Actualizar profesional
const actualizarProfesional = async (req, res) => {
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
    const profesional = await Profesional.findById(id);
    
    if (!profesional) {
      return res.status(404).json({
        success: false,
        message: 'Profesional no encontrado'
      });
    }

    const {
      id_stripe,
      nombre_completo,
      telefono,
      numero_colegiado,
      especialidad,
      direccion,
      biografia,
      foto_perfil,
      certificaciones
    } = req.body;

    const datosActualizacion = {};
    if (id_stripe !== undefined) datosActualizacion.id_stripe = id_stripe;
    if (nombre_completo) datosActualizacion.nombre_completo = nombre_completo;
    if (telefono !== undefined) datosActualizacion.telefono = telefono;
    if (numero_colegiado !== undefined) datosActualizacion.numero_colegiado = numero_colegiado;
    if (especialidad) datosActualizacion.especialidad = especialidad;
    if (direccion !== undefined) datosActualizacion.direccion = direccion;
    if (biografia !== undefined) datosActualizacion.biografia = biografia;
    if (foto_perfil !== undefined) datosActualizacion.foto_perfil = foto_perfil;
    if (certificaciones !== undefined) datosActualizacion.certificaciones = certificaciones;

    const profesionalActualizado = await profesional.update(datosActualizacion);

    res.json({
      success: true,
      message: 'Profesional actualizado exitosamente',
      data: {
        profesional: profesionalActualizado
      }
    });
  } catch (error) {
    console.error('Error al actualizar profesional:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Actualizar rating del profesional
const actualizarRatingProfesional = async (req, res) => {
  try {
    const { id } = req.params;
    const profesional = await Profesional.findById(id);
    
    if (!profesional) {
      return res.status(404).json({
        success: false,
        message: 'Profesional no encontrado'
      });
    }

    const profesionalActualizado = await profesional.updateRating();

    res.json({
      success: true,
      message: 'Rating actualizado exitosamente',
      data: {
        profesional: profesionalActualizado
      }
    });
  } catch (error) {
    console.error('Error al actualizar rating:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Buscar profesionales
const buscarProfesionales = async (req, res) => {
  try {
    const { 
      limit = 50, 
      offset = 0, 
      especialidad, 
      nombre_completo, 
      rating_min, 
      numero_colegiado 
    } = req.query;

    const criterios = {};
    if (especialidad) criterios.especialidad = especialidad;
    if (nombre_completo) criterios.nombre_completo = nombre_completo;
    if (rating_min) criterios.rating_min = parseFloat(rating_min);
    if (numero_colegiado) criterios.numero_colegiado = numero_colegiado;

    const profesionales = await Profesional.search(criterios, parseInt(limit), parseInt(offset));

    res.json({
      success: true,
      data: {
        profesionales,
        paginacion: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: profesionales.length
        }
      }
    });
  } catch (error) {
    console.error('Error al buscar profesionales:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener estadísticas de profesionales
const obtenerEstadisticasProfesionales = async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;
    
    // Aquí podrías implementar estadísticas generales de todos los profesionales
    // Por ahora, devolvemos un mensaje indicando que se puede implementar
    res.json({
      success: true,
      message: 'Estadísticas de profesionales - funcionalidad pendiente de implementar',
      data: {
        fecha_inicio,
        fecha_fin
      }
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Eliminar profesional
const eliminarProfesional = async (req, res) => {
  try {
    const { id } = req.params;
    const profesional = await Profesional.findById(id);
    
    if (!profesional) {
      return res.status(404).json({
        success: false,
        message: 'Profesional no encontrado'
      });
    }

    await profesional.delete();

    res.json({
      success: true,
      message: 'Profesional eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar profesional:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

module.exports = {
  crearProfesional,
  obtenerProfesionales,
  obtenerProfesionalPorId,
  obtenerProfesionalPorUsuario,
  actualizarProfesional,
  actualizarRatingProfesional,
  buscarProfesionales,
  obtenerEstadisticasProfesionales,
  eliminarProfesional
};
