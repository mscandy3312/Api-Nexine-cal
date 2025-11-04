// --- [CONTROLADOR] controllers/favoritoController.js ¡CARGADO Y CORREGIDO! ---
console.log('--- [CONTROLADOR] controllers/favoritoController.js ¡CARGADO Y CORREGIDO! ---');

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
    // --- CORREGIDO --- (Asumiendo que el ID de cliente viene del token)
    const id_cliente = req.user.id_cliente; 
    
    if (!id_cliente) {
      return res.status(403).json({ success: false, message: 'No se encontró un perfil de cliente para este usuario.' });
    }

    const favorito = await Favorito.create({
      id_cliente,
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

// Obtener favoritos del cliente (el que está logueado)
const obtenerFavoritos = async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    // --- CORREGIDO ---
    const id_cliente = req.user.id_cliente;
    
    if (!id_cliente) {
      return res.status(403).json({ success: false, message: 'No se encontró un perfil de cliente para este usuario.' });
    }

    // --- CORREGIDO --- (Llama a la función correcta del modelo)
    const favoritos = await Favorito.findByCliente(id_cliente, parseInt(limit), parseInt(offset));

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

// --- ¡FUNCIÓN AÑADIDA! ---
// Esta es la función que faltaba y causaba el error 404/500
// Obtiene favoritos para CUALQUIER cliente (usado por el frontend App.js)
const obtenerFavoritosPorCliente = async (req, res) => {
  try {
    const { id } = req.params; // Este es el id_cliente de la URL
    const { limit = 50, offset = 0 } = req.query;

    // Llama a la función del modelo que busca por ID de cliente
    const favoritos = await Favorito.findByCliente(id, parseInt(limit), parseInt(offset)); 

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
    console.error('Error al obtener favoritos por cliente:', error);
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
    // --- CORREGIDO ---
    const id_cliente = req.user.id_cliente;
    
    if (!id_cliente) {
      return res.status(403).json({ success: false, message: 'No se encontró un perfil de cliente para este usuario.' });
    }

    const esFavorito = await Favorito.isFavorito(id_cliente, id_profesional);

    res.json({
      success: true,
      data: {
        esFavorito,
        id_cliente,
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

// Obtener clientes que tienen como favorito a un profesional
// --- CORREGIDO --- (Nombre de función)
const obtenerClientesFavoritos = async (req, res) => {
  try {
    const { id_profesional } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    // --- CORREGIDO --- (Nombre de variable)
    const clientes = await Favorito.findByProfesional(id_profesional, parseInt(limit), parseInt(offset));

    res.json({
      success: true,
      data: {
        clientes, // <-- CORREGIDO
        id_profesional,
        paginacion: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: clientes.length // <-- CORREGIDO
        }
      }
    });
  } catch (error) {
    console.error('Error al obtener clientes favoritos:', error);
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
    // --- CORREGIDO ---
    const id_cliente = req.user.id_cliente;

    if (!id_cliente) {
      return res.status(403).json({ success: false, message: 'No se encontró un perfil de cliente para este usuario.' });
    }

    const eliminado = await Favorito.deleteByClienteAndProfesional(id_cliente, id_profesional);

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

// --- CORREGIDO --- (Exportaciones)
module.exports = {
  agregarFavorito,
  obtenerFavoritos,
  obtenerFavoritosPorCliente, // <-- AÑADIDO
  verificarFavorito,
  obtenerClientesFavoritos, // <-- CORREGIDO
  obtenerEstadisticasFavoritos,
  obtenerTopFavoritos,
  eliminarFavorito,
  eliminarFavoritoPorId,
  obtenerFavoritoPorId
};
