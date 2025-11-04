const Favorito = require('../models/favoritos');
const { validationResult } = require('express-validator');

// Agregar profesional a favoritos
const agregarFavorito = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Datos de entrada inválidos',
        errors: errors.array()
      });
    }

    const { id_profesional } = req.body;
    const id_clientes = req.user.id_clientes || req.user.id; // Asumiendo que el usuarioss tiene id_clientes

    const favorito = await Favorito.create({
      id_clientes,
      id_profesional
    });

    res.status(201).json({
      success: true,
      message: 'Profesional agregado a favoritos exitosamente',
      data: {
        favorito
      }
    });
  } catch (error) {
    console.error('Error al agregar favorito:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener favoritos de un clientes
const obtenerFavoritos = async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    const id_clientes = req.user.id_clientes || req.user.id;

    const favoritos = await Favorito.findByclientes(id_clientes, parseInt(limit), parseInt(offset));

    res.json({
      success: true,
      data: {
        favoritos,
        paginacion: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: favoritos.length
        }
      }
    });
  } catch (error) {
    console.error('Error al obtener favoritos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Verificar si un profesional está en favoritos
const verificarFavorito = async (req, res) => {
  try {
    const { id_profesional } = req.params;
    const id_clientes = req.user.id_clientes || req.user.id;

    const esFavorito = await Favorito.isFavorito(id_clientes, id_profesional);

    res.json({
      success: true,
      data: {
        esFavorito,
        id_clientes,
        id_profesional
      }
    });
  } catch (error) {
    console.error('Error al verificar favorito:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener clientess que tienen como favorito a un profesional
const obtenerclientessFavoritos = async (req, res) => {
  try {
    const { id_profesional } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const clientess = await Favorito.findByProfesional(id_profesional, parseInt(limit), parseInt(offset));

    res.json({
      success: true,
      data: {
        clientess,
        id_profesional,
        paginacion: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: clientess.length
        }
      }
    });
  } catch (error) {
    console.error('Error al obtener clientess favoritos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener estadísticas de favoritos
const obtenerEstadisticasFavoritos = async (req, res) => {
  try {
    const { id_profesional } = req.query;
    
    const stats = await Favorito.getStats(id_profesional);

    res.json({
      success: true,
      data: {
        estadisticas: stats,
        id_profesional
      }
    });
  } catch (error) {
    console.error('Error al obtener estadísticas de favoritos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener profesionales más favoritos
const obtenerTopFavoritos = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const topFavoritos = await Favorito.getTopFavoritos(parseInt(limit));

    res.json({
      success: true,
      data: {
        profesionales: topFavoritos,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error al obtener top favoritos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Eliminar favorito
const eliminarFavorito = async (req, res) => {
  try {
    const { id_profesional } = req.params;
    const id_clientes = req.user.id_clientes || req.user.id;

    const eliminado = await Favorito.deleteByclientesAndProfesional(id_clientes, id_profesional);

    if (!eliminado) {
      return res.status(404).json({
        success: false,
        message: 'Favorito no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Profesional eliminado de favoritos exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar favorito:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Eliminar favorito por ID
const eliminarFavoritoPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const favorito = await Favorito.findById(id);
    if (!favorito) {
      return res.status(404).json({
        success: false,
        message: 'Favorito no encontrado'
      });
    }

    await favorito.delete();

    res.json({
      success: true,
      message: 'Favorito eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar favorito por ID:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener favorito por ID
const obtenerFavoritoPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const favorito = await Favorito.findById(id);
    if (!favorito) {
      return res.status(404).json({
        success: false,
        message: 'Favorito no encontrado'
      });
    }

    res.json({
      success: true,
      data: {
        favorito
      }
    });
  } catch (error) {
    console.error('Error al obtener favorito por ID:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

module.exports = {
  agregarFavorito,
  obtenerFavoritos,
  verificarFavorito,
  obtenerclientessFavoritos,
  obtenerEstadisticasFavoritos,
  obtenerTopFavoritos,
  eliminarFavorito,
  eliminarFavoritoPorId,
  obtenerFavoritoPorId
};

