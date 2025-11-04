// --- [CONTROLADOR] controllers/disponibilidadHorarioController.js ---
// Maneja la lógica de negocio (request/response) para disponibilidad_horarios

const DisponibilidadHorario = require('../models/disponibilidad_horario');

// Crear nuevo bloque de disponibilidad
exports.crearDisponibilidad = async (req, res) => {
  try {
    // (Añadir validación aquí)
    const { 
      id_profesional, 
      dia_semana, 
      hora_inicio, 
      hora_fin, 
      activo 
    } = req.body;

    // TODO: Verificar que el usuario (req.user) es el profesional o un admin.
    
    const nuevoBloque = await DisponibilidadHorario.create({
      id_profesional, 
      dia_semana, 
      hora_inicio, 
      hora_fin, 
      activo
    });
    
    res.status(201).json({
      success: true,
      message: 'Bloque de disponibilidad creado con éxito',
      data: nuevoBloque
    });
  } catch (error) {
    console.error('Error al crear disponibilidad:', error);
    res.status(500).json({ success: false, message: 'Error al crear disponibilidad', error: error.message });
  }
};

// Obtener toda la disponibilidad (para el dashboard de admin)
exports.obtenerTodaDisponibilidad = async (req, res) => {
  try {
    const horarios = await DisponibilidadHorario.findAll();
    res.status(200).json({
      success: true,
      // El dashboard espera los datos en un objeto con el nombre de la tabla
      data: {
        disponibilidad_horarios: horarios 
      }
    });
  } catch (error) {
    console.error('Error al obtener toda la disponibilidad:', error);
    res.status(500).json({ success: false, message: 'Error al obtener disponibilidad', error: error.message });
  }
};

// Obtener disponibilidad de un profesional específico
exports.obtenerDisponibilidadPorProfesional = async (req, res) => {
  try {
    const { id_profesional } = req.params;
    const horarios = await DisponibilidadHorario.findByProfesionalId(id_profesional);
    
    res.status(200).json({
      success: true,
      data: {
        disponibilidad_horarios: horarios 
      }
    });
  } catch (error) {
    console.error('Error al obtener disponibilidad del profesional:', error);
    res.status(500).json({ success: false, message: 'Error al obtener disponibilidad', error: error.message });
  }
};

// Obtener un bloque de disponibilidad por su ID
exports.obtenerDisponibilidadPorId = async (req, res) => {
  try {
    const horario = await DisponibilidadHorario.findById(req.params.id);
    if (!horario) {
      return res.status(404).json({ success: false, message: 'Bloque de horario no encontrado' });
    }
    res.status(200).json({ success: true, data: horario });
  } catch (error) {
    console.error('Error al obtener bloque de horario:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor', error: error.message });
  }
};

// Actualizar un bloque de disponibilidad
exports.actualizarDisponibilidad = async (req, res) => {
  try {
    // TODO: Verificar que el usuario (req.user) es dueño de este bloque.
    const horarioActualizado = await DisponibilidadHorario.update(req.params.id, req.body);
    if (!horarioActualizado) {
      return res.status(404).json({ success: false, message: 'Bloque de horario no encontrado' });
    }
    res.status(200).json({
      success: true,
      message: 'Bloque de horario actualizado con éxito',
      data: horarioActualizado
    });
  } catch (error) {
    console.error('Error al actualizar disponibilidad:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar disponibilidad', error: error.message });
  }
};

// Eliminar un bloque de disponibilidad
exports.eliminarDisponibilidad = async (req, res) => {
  try {
    // TODO: Verificar que el usuario (req.user) es dueño de este bloque.
    const exito = await DisponibilidadHorario.delete(req.params.id);
    if (!exito) {
      return res.status(404).json({ success: false, message: 'Bloque de horario no encontrado' });
    }
    res.status(200).json({ success: true, message: 'Bloque de horario eliminado con éxito' });
  } catch (error) {
    console.error('Error al eliminar disponibilidad:', error);
    res.status(500).json({ success: false, message: 'Error al eliminar disponibilidad', error: error.message });
  }
};

console.log('--- [CONTROLADOR] controllers/disponibilidadHorarioController.js ¡CARGADO CORRECTAMENTE! ---');
