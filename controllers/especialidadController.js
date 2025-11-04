// --- [CONTROLADOR] controllers/especialidadController.js ---
// Maneja la lógica de negocio (request/response) para especialidades.

const Especialidad = require('../models/especialidades');
const { validationResult } = require('express-validator'); // (Si usas validación)

// Crear nueva especialidad
exports.crearEspecialidad = async (req, res) => {
  try {
    // (Aquí iría tu validación de express-validator)
    const { nombre, descripcion } = req.body;
    const nuevaEspecialidad = await Especialidad.create({ nombre, descripcion });
    res.status(201).json({
      success: true,
      message: 'Especialidad creada con éxito',
      data: nuevaEspecialidad
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al crear especialidad', error: error.message });
  }
};

// Obtener todas las especialidades
exports.obtenerEspecialidades = async (req, res) => {
  try {
    const especialidades = await Especialidad.findAll();
    res.status(200).json({
      success: true,
      // Importante: El dashboard busca los datos dentro de un objeto con el nombre de la tabla
      data: {
        especialidades: especialidades 
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener especialidades', error: error.message });
  }
};

// Obtener especialidad por ID
exports.obtenerEspecialidadPorId = async (req, res) => {
  try {
    const especialidad = await Especialidad.findById(req.params.id);
    if (!especialidad) {
      return res.status(404).json({ success: false, message: 'Especialidad no encontrada' });
    }
    res.status(200).json({ success: true, data: especialidad });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error interno del servidor', error: error.message });
  }
};

// Actualizar especialidad
exports.actualizarEspecialidad = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;
    const especialidadActualizada = await Especialidad.update(req.params.id, { nombre, descripcion });
    if (!especialidadActualizada) {
      return res.status(404).json({ success: false, message: 'Especialidad no encontrada' });
    }
    res.status(200).json({
      success: true,
      message: 'Especialidad actualizada con éxito',
      data: especialidadActualizada
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al actualizar especialidad', error: error.message });
  }
};

// Eliminar especialidad
exports.eliminarEspecialidad = async (req, res) => {
  try {
    const exito = await Especialidad.delete(req.params.id);
    if (!exito) {
      return res.status(404).json({ success: false, message: 'Especialidad no encontrada' });
    }
    res.status(200).json({ success: true, message: 'Especialidad eliminada con éxito' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al eliminar especialidad', error: error.message });
  }
};

console.log('--- [CONTROLADOR] controllers/especialidadController.js ¡CARGADO CORRECTAMENTE! ---');
