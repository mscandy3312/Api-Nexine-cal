// --- [CONTROLADOR] controllers/citaController.js ¡CARGADO Y CORREGIDO! ---
console.log('--- [CONTROLADOR] controllers/citaController.js ¡CARGADO Y CORREGIDO! ---');

// --- ¡CORREGIDO! --- (Importa el modelo en singular)
const Cita = require('../models/citas');
const { validationResult } = require('express-validator');

// --- ¡CORREGIDO! --- (Nombre de función en singular)
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

    // --- ¡CORREGIDO! --- (Campos ajustados al schema real)
    const {
      id_cliente,
      id_profesional,
      id_evento,
      fecha_inicio,
      fecha_fin,
      tipo_cita,
      estado
    } = req.body;

    // --- ¡CORREGIDO! --- (Usa el modelo singular)
    const nuevaCita = await Cita.create({
      id_cliente,
      id_profesional,
      id_evento,
      fecha_inicio,
      fecha_fin,
      tipo_cita,
      estado
    });

    res.status(201).json({
      success: true,
      message: 'Cita creada exitosamente', // Singular
      data: {
        cita: nuevaCita // Singular
      }
    });
  } catch (error) {
    console.error('Error al crear cita:', error); // Singular
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// --- ¡CORREGIDO! --- (Nombre de función en singular)
// Obtener todas las citas
const obtenerCitas = async (req, res) => {
  try {
    const { limit = 50, offset = 0, estado, fecha_desde, fecha_hasta } = req.query;
    
    let citas; // Singular
    if (estado) {
      citas = await Cita.findByEstado(estado, parseInt(limit), parseInt(offset));
    } else if (fecha_desde && fecha_hasta) {
      citas = await Cita.findByRangoFechas(fecha_desde, fecha_hasta, parseInt(limit), parseInt(offset));
    } else {
      citas = await Cita.findAll(parseInt(limit), parseInt(offset));
    }

    res.json({
      success: true,
      data: {
        citas, // Singular
        paginacion: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: citas.length // Singular
        }
      }
    });
  } catch (error) {
    console.error('Error al obtener citas:', error); // Singular
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// --- ¡CORREGIDO! --- (Nombre de función en singular)
// Obtener cita por ID
const obtenerCitaPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const cita = await Cita.findById(id); // Singular
    
    if (!cita) { // Singular
      return res.status(404).json({
        success: false,
        message: 'Cita no encontrada' // Singular
      });
    }

    res.json({
      success: true,
      data: {
        cita // Singular
      }
    });
  } catch (error) {
    console.error('Error al obtener cita:', error); // Singular
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// --- ¡CORREGIDO! --- (Nombre de función en singular)
// Obtener citas por cliente
const obtenerCitasPorCliente = async (req, res) => {
  try {
    // La ruta (routes/citas.js) define esto como /cliente/:id
    const { id } = req.params; 
    const { limit = 50, offset = 0 } = req.query;
    
    // Asumiendo que el modelo tiene 'findByCliente'
    const citas = await Cita.findByCliente(id, parseInt(limit), parseInt(offset)); // Singular

    res.json({
      success: true,
      data: {
        citas, // Singular
        id_cliente: id,
        paginacion: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: citas.length // Singular
        }
      }
    });
  } catch (error) {
    console.error('Error al obtener citas por cliente:', error); // Singular
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// --- ¡CORREGIDO! --- (Nombre de función en singular)
// Obtener citas por profesional
const obtenerCitasPorProfesional = async (req, res) => {
  try {
    // La ruta (routes/citas.js) define esto como /profesional/:id_profesional
    const { id_profesional } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    
    const citas = await Cita.findByProfesional(id_profesional, parseInt(limit), parseInt(offset)); // Singular

    res.json({
      success: true,
      data: {
        citas, // Singular
        id_profesional,
        paginacion: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: citas.length // Singular
        }
      }
    });
  } catch (error) {
    console.error('Error al obtener citas por profesional:', error); // Singular
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// --- ¡CORREGIDO! --- (Nombre de función en singular)
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
    const cita = await Cita.findById(id); // Singular
    
    if (!cita) { // Singular
      return res.status(404).json({
        success: false,
        message: 'Cita no encontrada' // Singular
      });
    }

    // --- ¡CORREGIDO! --- (Campos ajustados al schema real)
    const {
      id_cliente,
      id_profesional,
      id_evento,
      fecha_inicio,
      fecha_fin,
      tipo_cita,
      estado
    } = req.body;

    const datosActualizacion = {};
    if (id_cliente) datosActualizacion.id_cliente = id_cliente;
    if (id_profesional) datosActualizacion.id_profesional = id_profesional;
    if (id_evento !== undefined) datosActualizacion.id_evento = id_evento;
    if (fecha_inicio) datosActualizacion.fecha_inicio = fecha_inicio;
    if (fecha_fin) datosActualizacion.fecha_fin = fecha_fin;
    if (tipo_cita) datosActualizacion.tipo_cita = tipo_cita;
    if (estado) datosActualizacion.estado = estado;

    const citaActualizada = await cita.update(datosActualizacion); // Singular

    res.json({
      success: true,
      message: 'Cita actualizada exitosamente', // Singular
      data: {
        cita: citaActualizada // Singular
      }
    });
  } catch (error) {
    console.error('Error al actualizar cita:', error); // Singular
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// --- ¡CORREGIDO! --- (Nombre de función en singular)
// Cambiar estado de la cita
const cambiarEstadoCita = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    
    const cita = await Cita.findById(id); // Singular
    if (!cita) { // Singular
      return res.status(404).json({
        success: false,
        message: 'Cita no encontrada' // Singular
      });
    }

    // Asumiendo que el modelo puede hacer update solo del estado
    const citaActualizada = await cita.update({ estado: estado });

    res.json({
      success: true,
      message: 'Estado de la cita actualizado exitosamente', // Singular
      data: {
        cita: citaActualizada // Singular
      }
    });
  } catch (error) {
    console.error('Error al cambiar estado de la cita:', error); // Singular
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// --- ¡CORREGIDO! --- (Nombre de función en singular)
// Buscar citas
const buscarCitas = async (req, res) => {
  try {
    const { 
      limit = 50, 
      offset = 0, 
      id_cliente, // Corregido
      id_profesional, 
      estado, 
      fecha_desde, 
      fecha_hasta
    } = req.query;

    // --- ¡CORREGIDO! --- (Criterios ajustados al schema real)
    const criterios = {};
    if (id_cliente) criterios.id_cliente = id_cliente;
    if (id_profesional) criterios.id_profesional = id_profesional;
    if (estado) criterios.estado = estado;
    if (fecha_desde) criterios.fecha_desde = fecha_desde;
    if (fecha_hasta) criterios.fecha_hasta = fecha_hasta;
    // (motivo eliminado)

    const citas = await Cita.search(criterios, parseInt(limit), parseInt(offset)); // Singular

    res.json({
      success: true,
      data: {
        citas, // Singular
        paginacion: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: citas.length // Singular
        }
      }
    });
  } catch (error) {
    console.error('Error al buscar citas:', error); // Singular
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// --- ¡CORREGIDO! --- (Nombre de función en singular)
// Obtener estadísticas de citas
const obtenerEstadisticasCitas = async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;
    
    const stats = await Cita.getStats(fecha_inicio, fecha_fin); // Singular

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
    console.error('Error al obtener estadísticas de citas:', error); // Singular
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// --- ¡CORREGIDO! --- (Nombre de función en singular)
// Eliminar cita
const eliminarCita = async (req, res) => {
  try {
    const { id } = req.params;
    const cita = await Cita.findById(id); // Singular
    
    if (!cita) { // Singular
      return res.status(404).json({
        success: false,
        message: 'Cita no encontrada' // Singular
      });
    }

    await cita.delete();

    res.json({
      success: true,
      message: 'Cita eliminada exitosamente' // Singular
    });
  } catch (error) {
    console.error('Error al eliminar cita:', error); // Singular
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// --- ¡CORREGIDO! --- (Exporta nombres singulares)
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
