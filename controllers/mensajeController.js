const Mensaje = require('../models/Mensaje');
const { validationResult } = require('express-validator');

// Enviar mensaje
const enviarMensaje = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Datos de entrada inválidos',
        errors: errors.array()
      });
    }

    const { id_destinatario, asunto, contenido, tipo_mensaje, prioridad } = req.body;
    const id_remitente = req.user.id_usuario;

    const mensaje = await Mensaje.create({
      id_remitente,
      id_destinatario,
      asunto,
      contenido,
      tipo_mensaje,
      prioridad
    });

    res.status(201).json({
      success: true,
      message: 'Mensaje enviado exitosamente',
      data: {
        mensaje
      }
    });
  } catch (error) {
    console.error('Error al enviar mensaje:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener mensajes recibidos
const obtenerMensajesRecibidos = async (req, res) => {
  try {
    const { limit = 50, offset = 0, solo_no_leidos = false } = req.query;
    const id_usuario = req.user.id_usuario;

    const mensajes = await Mensaje.findByDestinatario(
      id_usuario, 
      parseInt(limit), 
      parseInt(offset), 
      solo_no_leidos === 'true'
    );

    res.json({
      success: true,
      data: {
        mensajes,
        paginacion: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: mensajes.length
        }
      }
    });
  } catch (error) {
    console.error('Error al obtener mensajes recibidos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener mensajes enviados
const obtenerMensajesEnviados = async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    const id_usuario = req.user.id_usuario;

    const mensajes = await Mensaje.findByRemitente(id_usuario, parseInt(limit), parseInt(offset));

    res.json({
      success: true,
      data: {
        mensajes,
        paginacion: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: mensajes.length
        }
      }
    });
  } catch (error) {
    console.error('Error al obtener mensajes enviados:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener conversación entre dos usuarios
const obtenerConversacion = async (req, res) => {
  try {
    const { id_usuario2 } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    const id_usuario1 = req.user.id_usuario;

    const mensajes = await Mensaje.getConversacion(
      id_usuario1, 
      id_usuario2, 
      parseInt(limit), 
      parseInt(offset)
    );

    res.json({
      success: true,
      data: {
        mensajes,
        id_usuario1,
        id_usuario2,
        paginacion: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: mensajes.length
        }
      }
    });
  } catch (error) {
    console.error('Error al obtener conversación:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Marcar mensaje como leído
const marcarComoLeido = async (req, res) => {
  try {
    const { id } = req.params;

    const mensaje = await Mensaje.findById(id);
    if (!mensaje) {
      return res.status(404).json({
        success: false,
        message: 'Mensaje no encontrado'
      });
    }

    // Verificar que el usuario es el destinatario
    if (mensaje.id_destinatario !== req.user.id_usuario) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para marcar este mensaje como leído'
      });
    }

    const mensajeActualizado = await mensaje.marcarComoLeido();

    res.json({
      success: true,
      message: 'Mensaje marcado como leído',
      data: {
        mensaje: mensajeActualizado
      }
    });
  } catch (error) {
    console.error('Error al marcar mensaje como leído:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Marcar múltiples mensajes como leídos
const marcarComoLeidos = async (req, res) => {
  try {
    const { ids_mensajes } = req.body;

    if (!Array.isArray(ids_mensajes) || ids_mensajes.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere un array de IDs de mensajes'
      });
    }

    await Mensaje.marcarComoLeidos(ids_mensajes);

    res.json({
      success: true,
      message: 'Mensajes marcados como leídos exitosamente'
    });
  } catch (error) {
    console.error('Error al marcar mensajes como leídos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Marcar todos los mensajes como leídos
const marcarTodosComoLeidos = async (req, res) => {
  try {
    const id_usuario = req.user.id_usuario;

    const mensajesLeidos = await Mensaje.marcarTodasComoLeidas(id_usuario);

    res.json({
      success: true,
      message: 'Todos los mensajes marcados como leídos',
      data: {
        mensajesLeidos
      }
    });
  } catch (error) {
    console.error('Error al marcar todos los mensajes como leídos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener estadísticas de mensajes
const obtenerEstadisticasMensajes = async (req, res) => {
  try {
    const id_usuario = req.user.id_usuario;

    const stats = await Mensaje.getStats(id_usuario);

    res.json({
      success: true,
      data: {
        estadisticas: stats
      }
    });
  } catch (error) {
    console.error('Error al obtener estadísticas de mensajes:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener contactos recientes
const obtenerContactosRecientes = async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    const id_usuario = req.user.id_usuario;

    const contactos = await Mensaje.getContactosRecientes(id_usuario, parseInt(limit));

    res.json({
      success: true,
      data: {
        contactos,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error al obtener contactos recientes:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Buscar mensajes por contenido
const buscarMensajes = async (req, res) => {
  try {
    const { searchTerm } = req.query;
    const { limit = 50, offset = 0 } = req.query;
    const id_usuario = req.user.id_usuario;

    if (!searchTerm) {
      return res.status(400).json({
        success: false,
        message: 'Término de búsqueda requerido'
      });
    }

    const mensajes = await Mensaje.searchByContent(
      id_usuario, 
      searchTerm, 
      parseInt(limit), 
      parseInt(offset)
    );

    res.json({
      success: true,
      data: {
        mensajes,
        searchTerm,
        paginacion: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: mensajes.length
        }
      }
    });
  } catch (error) {
    console.error('Error al buscar mensajes:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener mensaje por ID
const obtenerMensajePorId = async (req, res) => {
  try {
    const { id } = req.params;

    const mensaje = await Mensaje.findById(id);
    if (!mensaje) {
      return res.status(404).json({
        success: false,
        message: 'Mensaje no encontrado'
      });
    }

    // Verificar que el usuario tiene acceso al mensaje
    if (mensaje.id_remitente !== req.user.id_usuario && mensaje.id_destinatario !== req.user.id_usuario) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para ver este mensaje'
      });
    }

    res.json({
      success: true,
      data: {
        mensaje
      }
    });
  } catch (error) {
    console.error('Error al obtener mensaje por ID:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Eliminar mensaje
const eliminarMensaje = async (req, res) => {
  try {
    const { id } = req.params;

    const mensaje = await Mensaje.findById(id);
    if (!mensaje) {
      return res.status(404).json({
        success: false,
        message: 'Mensaje no encontrado'
      });
    }

    // Verificar que el usuario puede eliminar el mensaje
    if (mensaje.id_remitente !== req.user.id_usuario && mensaje.id_destinatario !== req.user.id_usuario) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para eliminar este mensaje'
      });
    }

    await mensaje.delete();

    res.json({
      success: true,
      message: 'Mensaje eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar mensaje:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

module.exports = {
  enviarMensaje,
  obtenerMensajesRecibidos,
  obtenerMensajesEnviados,
  obtenerConversacion,
  marcarComoLeido,
  marcarComoLeidos,
  marcarTodosComoLeidos,
  obtenerEstadisticasMensajes,
  obtenerContactosRecientes,
  buscarMensajes,
  obtenerMensajePorId,
  eliminarMensaje
};

