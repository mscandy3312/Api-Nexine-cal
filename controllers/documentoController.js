const Documento = require('../models/documentos');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { validationResult } = require('express-validator');

// Configuración de multer para subida de archivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = process.env.UPLOAD_PATH || './uploads/documentos';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 // 5MB por defecto
  },
  fileFilter: function (req, file, cb) {
    // Permitir solo ciertos tipos de archivos
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|ppt|pptx|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido'));
    }
  }
});

// Middleware para subir archivo
const uploadFile = upload.single('archivo');

// Subir documento
const subirDocumento = async (req, res) => {
  try {
    uploadFile(req, res, async (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: 'Error al subir archivo',
          error: err.message
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No se ha seleccionado ningún archivo'
        });
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        // Eliminar archivo si hay errores de validación
        fs.unlinkSync(req.file.path);
        return res.status(400).json({
          success: false,
          message: 'Datos de entrada inválidos',
          errors: errors.array()
        });
      }

      const { tipo_documento, descripcion, es_publico } = req.body;
      const id_profesional = req.user.id_profesional || req.user.id;

      const documento = await Documento.create({
        id_profesional,
        nombre_archivo: req.file.filename,
        nombre_original: req.file.originalname,
        tipo_documento,
        ruta_archivo: req.file.path,
        tamaño_archivo: req.file.size,
        tipo_mime: req.file.mimetype,
        descripcion,
        es_publico: es_publico === 'true'
      });

      res.status(201).json({
        success: true,
        message: 'Documento subido exitosamente',
        data: {
          documento
        }
      });
    });
  } catch (error) {
    console.error('Error al subir documento:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener documentos de un profesional
const obtenerDocumentosProfesional = async (req, res) => {
  try {
    const { limit = 50, offset = 0, solo_publicos = false } = req.query;
    const id_profesional = req.user.id_profesional || req.user.id;

    const documentos = await Documento.findByProfesional(
      id_profesional, 
      parseInt(limit), 
      parseInt(offset), 
      solo_publicos === 'true'
    );

    res.json({
      success: true,
      data: {
        documentos,
        paginacion: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: documentos.length
        }
      }
    });
  } catch (error) {
    console.error('Error al obtener documentos del profesional:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener documentos públicos
const obtenerDocumentosPublicos = async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;

    const documentos = await Documento.findPublicos(parseInt(limit), parseInt(offset));

    res.json({
      success: true,
      data: {
        documentos,
        paginacion: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: documentos.length
        }
      }
    });
  } catch (error) {
    console.error('Error al obtener documentos públicos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener documentos por tipo
const obtenerDocumentosPorTipo = async (req, res) => {
  try {
    const { tipo_documento } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const documentos = await Documento.findByTipo(tipo_documento, parseInt(limit), parseInt(offset));

    res.json({
      success: true,
      data: {
        documentos,
        tipo_documento,
        paginacion: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: documentos.length
        }
      }
    });
  } catch (error) {
    console.error('Error al obtener documentos por tipo:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Buscar documentos
const buscarDocumentos = async (req, res) => {
  try {
    const { searchTerm } = req.query;
    const { limit = 50, offset = 0 } = req.query;

    if (!searchTerm) {
      return res.status(400).json({
        success: false,
        message: 'Término de búsqueda requerido'
      });
    }

    const documentos = await Documento.search(
      searchTerm, 
      parseInt(limit), 
      parseInt(offset)
    );

    res.json({
      success: true,
      data: {
        documentos,
        searchTerm,
        paginacion: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: documentos.length
        }
      }
    });
  } catch (error) {
    console.error('Error al buscar documentos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener documento por ID
const obtenerDocumentoPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const documento = await Documento.findById(id);
    if (!documento) {
      return res.status(404).json({
        success: false,
        message: 'Documento no encontrado'
      });
    }

    // Verificar permisos de acceso
    const id_profesional = req.user.id_profesional || req.user.id;
    if (documento.id_profesional !== id_profesional && !documento.es_publico) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para acceder a este documento'
      });
    }

    res.json({
      success: true,
      data: {
        documento
      }
    });
  } catch (error) {
    console.error('Error al obtener documento por ID:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Descargar documento
const descargarDocumento = async (req, res) => {
  try {
    const { id } = req.params;

    const documento = await Documento.findById(id);
    if (!documento) {
      return res.status(404).json({
        success: false,
        message: 'Documento no encontrado'
      });
    }

    // Verificar permisos de acceso
    const id_profesional = req.user.id_profesional || req.user.id;
    if (documento.id_profesional !== id_profesional && !documento.es_publico) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para descargar este documento'
      });
    }

    // Verificar que el archivo existe
    if (!fs.existsSync(documento.ruta_archivo)) {
      return res.status(404).json({
        success: false,
        message: 'Archivo no encontrado en el servidor'
      });
    }

    res.download(documento.ruta_archivo, documento.nombre_original);
  } catch (error) {
    console.error('Error al descargar documento:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Actualizar documento
const actualizarDocumento = async (req, res) => {
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

    const documento = await Documento.findById(id);
    if (!documento) {
      return res.status(404).json({
        success: false,
        message: 'Documento no encontrado'
      });
    }

    // Verificar permisos
    const id_profesional = req.user.id_profesional || req.user.id;
    if (documento.id_profesional !== id_profesional) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para actualizar este documento'
      });
    }

    const { tipo_documento, descripcion, es_publico } = req.body;
    const updateData = {};
    if (tipo_documento) updateData.tipo_documento = tipo_documento;
    if (descripcion !== undefined) updateData.descripcion = descripcion;
    if (es_publico !== undefined) updateData.es_publico = es_publico === 'true';

    const documentoActualizado = await documento.update(updateData);

    res.json({
      success: true,
      message: 'Documento actualizado exitosamente',
      data: {
        documento: documentoActualizado
      }
    });
  } catch (error) {
    console.error('Error al actualizar documento:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Cambiar visibilidad del documento
const cambiarVisibilidad = async (req, res) => {
  try {
    const { id } = req.params;

    const documento = await Documento.findById(id);
    if (!documento) {
      return res.status(404).json({
        success: false,
        message: 'Documento no encontrado'
      });
    }

    // Verificar permisos
    const id_profesional = req.user.id_profesional || req.user.id;
    if (documento.id_profesional !== id_profesional) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para cambiar la visibilidad de este documento'
      });
    }

    const documentoActualizado = await documento.toggleVisibility();

    res.json({
      success: true,
      message: 'Visibilidad del documento cambiada exitosamente',
      data: {
        documento: documentoActualizado
      }
    });
  } catch (error) {
    console.error('Error al cambiar visibilidad:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener estadísticas de documentos
const obtenerEstadisticasDocumentos = async (req, res) => {
  try {
    const { id_profesional } = req.query;
    
    const stats = await Documento.getStats(id_profesional);

    res.json({
      success: true,
      data: {
        estadisticas: stats,
        id_profesional
      }
    });
  } catch (error) {
    console.error('Error al obtener estadísticas de documentos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener estadísticas por tipo de documento
const obtenerEstadisticasPorTipo = async (req, res) => {
  try {
    const stats = await Documento.getStatsByType();

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

// Obtener documentos recientes
const obtenerDocumentosRecientes = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const documentos = await Documento.getRecent(parseInt(limit));

    res.json({
      success: true,
      data: {
        documentos,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error al obtener documentos recientes:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener tipos de documentos disponibles
const obtenerTiposDocumentos = async (req, res) => {
  try {
    const tipos = await Documento.getDocumentTypes();

    res.json({
      success: true,
      data: {
        tipos
      }
    });
  } catch (error) {
    console.error('Error al obtener tipos de documentos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Eliminar documento
const eliminarDocumento = async (req, res) => {
  try {
    const { id } = req.params;

    const documento = await Documento.findById(id);
    if (!documento) {
      return res.status(404).json({
        success: false,
        message: 'Documento no encontrado'
      });
    }

    // Verificar permisos
    const id_profesional = req.user.id_profesional || req.user.id;
    if (documento.id_profesional !== id_profesional) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para eliminar este documento'
      });
    }

    // Eliminar archivo físico
    if (fs.existsSync(documento.ruta_archivo)) {
      fs.unlinkSync(documento.ruta_archivo);
    }

    await documento.delete();

    res.json({
      success: true,
      message: 'Documento eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar documento:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

module.exports = {
  subirDocumento,
  obtenerDocumentosProfesional,
  obtenerDocumentosPublicos,
  obtenerDocumentosPorTipo,
  buscarDocumentos,
  obtenerDocumentoPorId,
  descargarDocumento,
  actualizarDocumento,
  cambiarVisibilidad,
  obtenerEstadisticasDocumentos,
  obtenerEstadisticasPorTipo,
  obtenerDocumentosRecientes,
  obtenerTiposDocumentos,
  eliminarDocumento
};

