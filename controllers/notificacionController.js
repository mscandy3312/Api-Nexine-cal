const Notificacion = require('../models/notificaciones');
const { validationResult } = require('express-validator');

// Crear notificación
const crearNotificacion = async (req, res) => {
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
      tipo_notificacion, 
      titulo, 
      mensaje, 
      datos_adicionales,
      prioridad,
      canal 
    } = req.body;

    const notificacion = await Notificacion.create({
      id_usuarioss,
      tipo_notificacion,
      titulo,
      mensaje,
      datos_adicionales,
      prioridad,
      canal
    });

    res.status(201).json({
      success: true,
      message: 'Notificación creada exitosamente',
      data: {
        notificacion
      }
    });
  } catch (error) {
    console.error('Error al crear notificación:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Crear notificación masiva
const crearNotificacionMasiva = async (req, res) => {
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
      usuariosss, 
      tipo_notificacion, 
      titulo, 
      mensaje, 
      datos_adicionales,
      prioridad,
      canal 
    } = req.body;

    if (!Array.isArray(usuariosss) || usuariosss.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere un array de usuariosss'
      });
    }

    const notificacionesCreadas = await Notificacion.createMasiva(usuariosss, {
      tipo_notificacion,
      titulo,
      mensaje,
      datos_adicionales,
      prioridad,
      canal
    });

    res.status(201).json({
      success: true,
      message: 'Notificaciones masivas creadas exitosamente',
      data: {
        notificacionesCreadas,
        totalusuariosss: usuariosss.length
      }
    });
  } catch (error) {
    console.error('Error al crear notificaciones masivas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener notificaciones del usuarioss
const obtenerNotificacionesusuarioss = async (req, res) => {
  try {
    const { limit = 50, offset = 0, solo_no_leidas = false } = req.query;
    const id_usuarioss = req.user.id_usuarioss;

    const notificaciones = await Notificacion.findByusuarioss(
      id_usuarioss, 
      parseInt(limit), 
      parseInt(offset), 
      solo_no_leidas === 'true'
    );

    res.json({
      success: true,
      data: {
        notificaciones,
        paginacion: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: notificaciones.length
        }
      }
    });
  } catch (error) {
    console.error('Error al obtener notificaciones del usuarioss:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener notificaciones por tipo
const obtenerNotificacionesPorTipo = async (req, res) => {
  try {
    const { tipo_notificacion } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const notificaciones = await Notificacion.findByTipo(
      tipo_notificacion, 
      parseInt(limit), 
      parseInt(offset)
    );

    res.json({
      success: true,
      data: {
        notificaciones,
        tipo_notificacion,
        paginacion: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: notificaciones.length
        }
      }
    });
  } catch (error) {
    console.error('Error al obtener notificaciones por tipo:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener notificaciones por prioridad
const obtenerNotificacionesPorPrioridad = async (req, res) => {
  try {
    const { prioridad } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const notificaciones = await Notificacion.findByPrioridad(
      prioridad, 
      parseInt(limit), 
      parseInt(offset)
    );

    res.json({
      success: true,
      data: {
        notificaciones,
        prioridad,
        paginacion: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: notificaciones.length
        }
      }
    });
  } catch (error) {
    console.error('Error al obtener notificaciones por prioridad:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Marcar notificación como leída
const marcarComoLeida = async (req, res) => {
  try {
    const { id } = req.params;

    const notificacion = await Notificacion.findById(id);
    if (!notificacion) {
      return res.status(404).json({
        success: false,
        message: 'Notificación no encontrada'
      });
    }

    // Verificar que el usuarioss es el destinatario
    if (notificacion.id_usuarioss !== req.user.id_usuarioss) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para marcar esta notificación como leída'
      });
    }

    const notificacionActualizada = await notificacion.marcarComoLeida();

    res.json({
      success: true,
      message: 'Notificación marcada como leída',
      data: {
        notificacion: notificacionActualizada
      }
    });
  } catch (error) {
    console.error('Error al marcar notificación como leída:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Marcar múltiples notificaciones como leídas
const marcarComoLeidas = async (req, res) => {
  try {
    const { ids_notificaciones } = req.body;

    if (!Array.isArray(ids_notificaciones) || ids_notificaciones.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere un array de IDs de notificaciones'
      });
    }

    await Notificacion.marcarComoLeidas(ids_notificaciones);

    res.json({
      success: true,
      message: 'Notificaciones marcadas como leídas exitosamente'
    });
  } catch (error) {
    console.error('Error al marcar notificaciones como leídas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Marcar todas las notificaciones como leídas
const marcarTodasComoLeidas = async (req, res) => {
  try {
    const id_usuarioss = req.user.id_usuarioss;

    const notificacionesLeidas = await Notificacion.marcarTodasComoLeidas(id_usuarioss);

    res.json({
      success: true,
      message: 'Todas las notificaciones marcadas como leídas',
      data: {
        notificacionesLeidas
      }
    });
  } catch (error) {
    console.error('Error al marcar todas las notificaciones como leídas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener estadísticas de notificaciones
const obtenerEstadisticasNotificaciones = async (req, res) => {
  try {
    const { id_usuarioss } = req.query;
    
    const stats = await Notificacion.getStats(id_usuarioss);

    res.json({
      success: true,
      data: {
        estadisticas: stats,
        id_usuarioss
      }
    });
  } catch (error) {
    console.error('Error al obtener estadísticas de notificaciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener estadísticas por tipo de notificación
const obtenerEstadisticasPorTipo = async (req, res) => {
  try {
    const stats = await Notificacion.getStatsByType();

    res.json({
      success: true,
      data: {
        estadisticas: stats
      }
    });
  } catch (error) {
    console.error('Error al obtener estadísticas por tipo:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener notificaciones recientes
const obtenerNotificacionesRecientes = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const notificaciones = await Notificacion.getRecent(parseInt(limit));

    res.json({
      success: true,
      data: {
        notificaciones,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error al obtener notificaciones recientes:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Buscar notificaciones por contenido
const buscarNotificaciones = async (req, res) => {
  try {
    const { searchTerm } = req.query;
    const { limit = 50, offset = 0 } = req.query;

    if (!searchTerm) {
      return res.status(400).json({
        success: false,
        message: 'Término de búsqueda requerido'
      });
    }

    const notificaciones = await Notificacion.searchByContent(
      searchTerm, 
      parseInt(limit), 
      parseInt(offset)
    );

    res.json({
      success: true,
      data: {
        notificaciones,
        searchTerm,
        paginacion: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: notificaciones.length
        }
      }
    });
  } catch (error) {
    console.error('Error al buscar notificaciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener notificación por ID
const obtenerNotificacionPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const notificacion = await Notificacion.findById(id);
    if (!notificacion) {
      return res.status(404).json({
        success: false,
        message: 'Notificación no encontrada'
      });
    }

    // Verificar que el usuarioss tiene acceso a la notificación
    if (notificacion.id_usuarioss !== req.user.id_usuarioss) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para ver esta notificación'
      });
    }

    res.json({
      success: true,
      data: {
        notificacion
      }
    });
  } catch (error) {
    console.error('Error al obtener notificación por ID:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Actualizar notificación
const actualizarNotificacion = async (req, res) => {
  try {
    const { id } = req.params;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Datos de entrada inválidos',
        errors: errors.array()
      });
    }

    const notificacion = await Notificacion.findById(id);
    if (!notificacion) {
      return res.status(404).json({
        success: false,
        message: 'Notificación no encontrada'
      });
    }

    // Verificar permisos (solo admin puede actualizar notificaciones de otros usuariosss)
    if (notificacion.id_usuarioss !== req.user.id_usuarioss && req.user.rol !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para actualizar esta notificación'
      });
    }

    const { titulo, mensaje, datos_adicionales, prioridad, canal, estado } = req.body;
    const updateData = {};
    if (titulo) updateData.titulo = titulo;
    if (mensaje) updateData.mensaje = mensaje;
    if (datos_adicionales) updateData.datos_adicionales = datos_adicionales;
    if (prioridad) updateData.prioridad = prioridad;
    if (canal) updateData.canal = canal;
    if (estado) updateData.estado = estado;

    const notificacionActualizada = await notificacion.update(updateData);

    res.json({
      success: true,
      message: 'Notificación actualizada exitosamente',
      data: {
        notificacion: notificacionActualizada
      }
    });
  } catch (error) {
    console.error('Error al actualizar notificación:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Archivar notificación
const archivarNotificacion = async (req, res) => {
  try {
    const { id } = req.params;

    const notificacion = await Notificacion.findById(id);
    if (!notificacion) {
      return res.status(404).json({
        success: false,
        message: 'Notificación no encontrada'
      });
    }

    // Verificar permisos
    if (notificacion.id_usuarioss !== req.user.id_usuarioss && req.user.rol !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para archivar esta notificación'
      });
    }

    const notificacionArchivada = await notificacion.archivar();

    res.json({
      success: true,
      message: 'Notificación archivada exitosamente',
      data: {
        notificacion: notificacionArchivada
      }
    });
  } catch (error) {
    console.error('Error al archivar notificación:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener tipos de notificación disponibles
const obtenerTiposNotificacion = async (req, res) => {
  try {
    const tipos = await Notificacion.getNotificationTypes();

    res.json({
      success: true,
      data: {
        tipos
      }
    });
  } catch (error) {
    console.error('Error al obtener tipos de notificación:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Eliminar notificación
const eliminarNotificacion = async (req, res) => {
  try {
    const { id } = req.params;

    const notificacion = await Notificacion.findById(id);
    if (!notificacion) {
      return res.status(404).json({
        success: false,
        message: 'Notificación no encontrada'
      });
    }

    // Verificar permisos
    if (notificacion.id_usuarioss !== req.user.id_usuarioss && req.user.rol !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para eliminar esta notificación'
      });
    }

    await notificacion.delete();

    res.json({
      success: true,
      message: 'Notificación eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar notificación:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Crear notificación automática para eventos del sistema
const crearNotificacionEvento = async (req, res) => {
  try {
    const { evento, datos } = req.body;

    if (!evento || !datos) {
      return res.status(400).json({
        success: false,
        message: 'Evento y datos son requeridos'
      });
    }

    const notificacion = await Notificacion.crearNotificacionEvento(evento, datos);

    res.status(201).json({
      success: true,
      message: 'Notificación de evento creada exitosamente',
      data: {
        notificacion
      }
    });
  } catch (error) {
    console.error('Error al crear notificación de evento:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

module.exports = {
  crearNotificacion,
  crearNotificacionMasiva,
  obtenerNotificacionesusuarioss,
  obtenerNotificacionesPorTipo,
  obtenerNotificacionesPorPrioridad,
  marcarComoLeida,
  marcarComoLeidas,
  marcarTodasComoLeidas,
  obtenerEstadisticasNotificaciones,
  obtenerEstadisticasPorTipo,
  obtenerNotificacionesRecientes,
  buscarNotificaciones,
  obtenerNotificacionPorId,
  actualizarNotificacion,
  archivarNotificacion,
  obtenerTiposNotificacion,
  eliminarNotificacion,
  crearNotificacionEvento
};

