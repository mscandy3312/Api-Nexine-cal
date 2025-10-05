const Precio = require('../models/Precio');
const { validationResult } = require('express-validator');

// Crear precio
const crearPrecio = async (req, res) => {
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
      numero_sesion,
      nombre_paquete,
      duracion,
      modalidad,
      horario,
      fecha,
      dias_disponibles,
      hora_desde,
      hora_hasta
    } = req.body;

    const nuevoPrecio = await Precio.create({
      numero_sesion,
      nombre_paquete,
      duracion,
      modalidad,
      horario,
      fecha,
      dias_disponibles,
      hora_desde,
      hora_hasta
    });

    res.status(201).json({
      success: true,
      message: 'Precio creado exitosamente',
      data: {
        precio: nuevoPrecio
      }
    });
  } catch (error) {
    console.error('Error al crear precio:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener todos los precios
const obtenerPrecios = async (req, res) => {
  try {
    const { limit = 50, offset = 0, modalidad, paquete, search } = req.query;
    
    let precios;
    if (modalidad) {
      precios = await Precio.findByModalidad(modalidad, parseInt(limit), parseInt(offset));
    } else if (paquete) {
      precios = await Precio.findByPaquete(paquete, parseInt(limit), parseInt(offset));
    } else if (search) {
      precios = await Precio.search({ nombre_paquete: search }, parseInt(limit), parseInt(offset));
    } else {
      precios = await Precio.findAll(parseInt(limit), parseInt(offset));
    }

    res.json({
      success: true,
      data: {
        precios,
        paginacion: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: precios.length
        }
      }
    });
  } catch (error) {
    console.error('Error al obtener precios:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener precio por ID
const obtenerPrecioPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const precio = await Precio.findById(id);
    
    if (!precio) {
      return res.status(404).json({
        success: false,
        message: 'Precio no encontrado'
      });
    }

    // Obtener estadísticas del precio
    const stats = await precio.getStats();

    res.json({
      success: true,
      data: {
        precio,
        estadisticas: stats
      }
    });
  } catch (error) {
    console.error('Error al obtener precio:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Actualizar precio
const actualizarPrecio = async (req, res) => {
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
    const precio = await Precio.findById(id);
    
    if (!precio) {
      return res.status(404).json({
        success: false,
        message: 'Precio no encontrado'
      });
    }

    const {
      numero_sesion,
      nombre_paquete,
      duracion,
      modalidad,
      horario,
      fecha,
      dias_disponibles,
      hora_desde,
      hora_hasta
    } = req.body;

    const datosActualizacion = {};
    if (numero_sesion !== undefined) datosActualizacion.numero_sesion = numero_sesion;
    if (nombre_paquete) datosActualizacion.nombre_paquete = nombre_paquete;
    if (duracion) datosActualizacion.duracion = duracion;
    if (modalidad) datosActualizacion.modalidad = modalidad;
    if (horario !== undefined) datosActualizacion.horario = horario;
    if (fecha !== undefined) datosActualizacion.fecha = fecha;
    if (dias_disponibles !== undefined) datosActualizacion.dias_disponibles = dias_disponibles;
    if (hora_desde !== undefined) datosActualizacion.hora_desde = hora_desde;
    if (hora_hasta !== undefined) datosActualizacion.hora_hasta = hora_hasta;

    const precioActualizado = await precio.update(datosActualizacion);

    res.json({
      success: true,
      message: 'Precio actualizado exitosamente',
      data: {
        precio: precioActualizado
      }
    });
  } catch (error) {
    console.error('Error al actualizar precio:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Buscar precios
const buscarPrecios = async (req, res) => {
  try {
    const { 
      limit = 50, 
      offset = 0, 
      modalidad, 
      nombre_paquete, 
      duracion, 
      numero_sesion,
      fecha_desde,
      fecha_hasta
    } = req.query;

    const criterios = {};
    if (modalidad) criterios.modalidad = modalidad;
    if (nombre_paquete) criterios.nombre_paquete = nombre_paquete;
    if (duracion) criterios.duracion = duracion;
    if (numero_sesion) criterios.numero_sesion = parseInt(numero_sesion);
    if (fecha_desde) criterios.fecha_desde = fecha_desde;
    if (fecha_hasta) criterios.fecha_hasta = fecha_hasta;

    const precios = await Precio.search(criterios, parseInt(limit), parseInt(offset));

    res.json({
      success: true,
      data: {
        precios,
        paginacion: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: precios.length
        }
      }
    });
  } catch (error) {
    console.error('Error al buscar precios:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener precios por modalidad
const obtenerPreciosPorModalidad = async (req, res) => {
  try {
    const { modalidad } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    
    const precios = await Precio.findByModalidad(modalidad, parseInt(limit), parseInt(offset));

    res.json({
      success: true,
      data: {
        precios,
        modalidad,
        paginacion: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: precios.length
        }
      }
    });
  } catch (error) {
    console.error('Error al obtener precios por modalidad:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener precios por paquete
const obtenerPreciosPorPaquete = async (req, res) => {
  try {
    const { paquete } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    
    const precios = await Precio.findByPaquete(paquete, parseInt(limit), parseInt(offset));

    res.json({
      success: true,
      data: {
        precios,
        paquete,
        paginacion: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: precios.length
        }
      }
    });
  } catch (error) {
    console.error('Error al obtener precios por paquete:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Actualizar estadísticas del precio
const actualizarEstadisticasPrecio = async (req, res) => {
  try {
    const { id } = req.params;
    const precio = await Precio.findById(id);
    
    if (!precio) {
      return res.status(404).json({
        success: false,
        message: 'Precio no encontrado'
      });
    }

    const precioActualizado = await precio.updateStats();

    res.json({
      success: true,
      message: 'Estadísticas actualizadas exitosamente',
      data: {
        precio: precioActualizado
      }
    });
  } catch (error) {
    console.error('Error al actualizar estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener sesiones del precio
const obtenerSesionesPrecio = async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 20, offset = 0 } = req.query;
    
    const precio = await Precio.findById(id);
    if (!precio) {
      return res.status(404).json({
        success: false,
        message: 'Precio no encontrado'
      });
    }

    const sesiones = await precio.getSesiones(parseInt(limit), parseInt(offset));

    res.json({
      success: true,
      data: {
        precio: {
          id_precio: precio.id_precio,
          nombre_paquete: precio.nombre_paquete,
          modalidad: precio.modalidad
        },
        sesiones,
        paginacion: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: sesiones.length
        }
      }
    });
  } catch (error) {
    console.error('Error al obtener sesiones del precio:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Eliminar precio
const eliminarPrecio = async (req, res) => {
  try {
    const { id } = req.params;
    const precio = await Precio.findById(id);
    
    if (!precio) {
      return res.status(404).json({
        success: false,
        message: 'Precio no encontrado'
      });
    }

    await precio.delete();

    res.json({
      success: true,
      message: 'Precio eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar precio:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

module.exports = {
  crearPrecio,
  obtenerPrecios,
  obtenerPrecioPorId,
  actualizarPrecio,
  buscarPrecios,
  obtenerPreciosPorModalidad,
  obtenerPreciosPorPaquete,
  actualizarEstadisticasPrecio,
  obtenerSesionesPrecio,
  eliminarPrecio
};
