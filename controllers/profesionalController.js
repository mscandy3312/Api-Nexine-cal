// --- [CONTROLADOR] controllers/profesionalController.js ¡CARGADO CORRECTAMENTE! ---
console.log('--- [CONTROLADOR] controllers/profesionalController.js ¡CARGADO CORRECTAMENTE! ---');

// --- ¡CORREGIDO! ---
// Ajustado para coincidir con la estructura de tus otros modelos (ej. models/usuarios.js)
const Profesional = require('../models/profesionales.js'); 
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

    // --- CORREGIDO ---
    // Ajustado a los campos de tu tabla `profesionales`
    const {
      id_usuario, // <--- CAMBIO: de id_usuarioss a id_usuario
      id_especialidad,
      nombre_completo,
      telefono,
      email,
      especialidad, // Tu tabla tiene id_especialidad y también especialidad (string)
      direccion,
      domicilio_consultorio,
      descripcion, // <--- CAMBIO: de biografia a descripcion
      experiencia_años,
      tarifa_por_hora,
      disponibilidad,
      enlace_publico,
      video_presentacion,
      modalidad_cita,
      modo_atencion
      // Campos eliminados que NO estaban en tu DB: id_stripe, numero_colegiado, foto_perfil, certificaciones
    } = req.body;

    // Verificar si el usuario ya tiene un perfil profesional
    // Asumiendo que el modelo `findByUserId` busca por `id_usuario`
    const profesionalExistente = await Profesional.findByUserId(id_usuario);
    if (profesionalExistente) {
      return res.status(400).json({
        success: false,
        message: 'El usuario ya tiene un perfil profesional'
      });
    }

    // --- CORREGIDO ---
    // Objeto de creación ajustado al nuevo schema
    const nuevoProfesional = await Profesional.create({
      id_usuario,
      id_especialidad,
      nombre_completo,
      telefono,
      email,
      especialidad,
      direccion,
      domicilio_consultorio,
      descripcion,
      experiencia_años,
      tarifa_por_hora,
      disponibilidad,
      enlace_publico,
      video_presentacion,
      modalidad_cita,
      modo_atencion
      // estado_aprobacion se define por DEFAULT 'pendiente' en tu SQL
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
    // Asumiendo que el modelo `findByEspecialidad` y `search` funcionan
    if (especialidad) {
      profesionales = await Profesional.findByEspecialidad(especialidad, parseInt(limit), parseInt(offset));
    } else if (search) {
      // Tu tabla no tiene `nombre_completo` indexado, pero `search` podría buscar por él
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

// Obtener profesional por ID (de profesional, no de usuario)
const obtenerProfesionalPorId = async (req, res) => {
  try {
    const { id } = req.params; // Este es id_profesional
    const profesional = await Profesional.findById(id);
    
    if (!profesional) {
      return res.status(404).json({
        success: false,
        message: 'Profesional no encontrado'
      });
    }

    // `getStats` podría necesitar ser revisado si se basa en campos que no existen
    // const stats = await profesional.getStats(); // Comentado temporalmente si no existe

    res.json({
      success: true,
      data: {
        profesional,
        // estadisticas: stats
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

// --- CORREGIDO ---
// Cambiado nombre de función y parámetro
// Obtener profesional por id_usuario
const obtenerProfesionalPorUsuario = async (req, res) => {
  try {
    const { id_usuario } = req.params; // <--- CAMBIO
    const profesional = await Profesional.findByUserId(id_usuario); // <--- CAMBIO
    
    if (!profesional) {
      return res.status(404).json({
        success: false,
        message: 'Profesional no encontrado para ese usuario'
      });
    }

    // const stats = await profesional.getStats(); // Comentado temporalmente si no existe

    res.json({
      success: true,
      data: {
        profesional,
        // estadisticas: stats
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

    const { id } = req.params; // Este es id_profesional
    const profesional = await Profesional.findById(id);
    
    if (!profesional) {
      return res.status(404).json({
        success: false,
        message: 'Profesional no encontrado'
      });
    }

    // --- CORREGIDO ---
    // Campos de actualización ajustados al schema de la DB
    const {
      id_especialidad,
      nombre_completo,
      telefono,
      email,
      especialidad,
      direccion,
      domicilio_consultorio,
      descripcion, // <--- CAMBIO: de biografia a descripcion
      experiencia_años,
      tarifa_por_hora,
      disponibilidad,
      enlace_publico,
      estado_aprobacion,
      video_presentacion,
      modalidad_cita,
      modo_atencion
    } = req.body;

    const datosActualizacion = {};
    if (id_especialidad !== undefined) datosActualizacion.id_especialidad = id_especialidad;
    if (nombre_completo) datosActualizacion.nombre_completo = nombre_completo;
    if (telefono !== undefined) datosActualizacion.telefono = telefono;
    if (email !== undefined) datosActualizacion.email = email;
    if (especialidad) datosActualizacion.especialidad = especialidad;
    if (direccion !== undefined) datosActualizacion.direccion = direccion;
    if (domicilio_consultorio !== undefined) datosActualizacion.domicilio_consultorio = domicilio_consultorio;
    if (descripcion !== undefined) datosActualizacion.descripcion = descripcion;
    if (experiencia_años !== undefined) datosActualizacion.experiencia_años = experiencia_años;
    if (tarifa_por_hora !== undefined) datosActualizacion.tarifa_por_hora = tarifa_por_hora;
    if (disponibilidad !== undefined) datosActualizacion.disponibilidad = disponibilidad;
    if (enlace_publico !== undefined) datosActualizacion.enlace_publico = enlace_publico;
    if (estado_aprobacion !== undefined) datosActualizacion.estado_aprobacion = estado_aprobacion;
    if (video_presentacion !== undefined) datosActualizacion.video_presentacion = video_presentacion;
    if (modalidad_cita !== undefined) datosActualizacion.modalidad_cita = modalidad_cita;
    if (modo_atencion !== undefined) datosActualizacion.modo_atencion = modo_atencion;

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
// TU TABLA `profesionales` NO TIENE UN CAMPO `rating`.
// TIENES UNA TABLA `valoraciones` SEPARADA.
// Esta función necesita ser rediseñada para calcular el promedio de `valoraciones`.
const actualizarRatingProfesional = async (req, res) => {
  try {
    const { id } = req.params; // id_profesional
    const profesional = await Profesional.findById(id);
    
    if (!profesional) {
      return res.status(404).json({
        success: false,
        message: 'Profesional no encontrado'
      });
    }

    // Asumiendo que `updateRating` ahora calcula el promedio de la tabla `valoraciones`
    // y lo guarda en algún lugar (o no, si solo se calcula al vuelo).
    // Por ahora, solo simulamos que existe.
    // const profesionalActualizado = await profesional.updateRating(); 

    res.json({
      success: true,
      message: 'Rating actualizado (lógica pendiente de implementar según `valoraciones`)',
      data: {
        // profesional: profesionalActualizado
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
      rating_min, // No hay rating en la tabla
      numero_colegiado // No hay numero_colegiado en la tabla
    } = req.query;

    const criterios = {};
    if (especialidad) criterios.especialidad = especialidad;
    if (nombre_completo) criterios.nombre_completo = nombre_completo;
    // if (rating_min) criterios.rating_min = parseFloat(rating_min); // Campo no existe
    // if (numero_colegiado) criterios.numero_colegiado = numero_colegiado; // Campo no existe

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
    const { id } = req.params; // id_profesional
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
  obtenerProfesionalPorUsuario, // <--- CAMBIO
  actualizarProfesional,
  actualizarRatingProfesional,
  buscarProfesionales,
  obtenerEstadisticasProfesionales,
  eliminarProfesional
};
