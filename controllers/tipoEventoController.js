// --- [CONTROLADOR] controllers/tipoEventoController.js ---
// Maneja la lógica de negocio (request/response) para tipos_evento

const TipoEvento = require('../models/tipoEventoModel');

// Crear nuevo tipo de evento
exports.crearTipoEvento = async (req, res) => {
  try {
    // (Añadir validación de express-validator aquí si es necesario)
    const { 
      id_profesional, 
      nombre_evento, 
      descripcion, 
      duracion_minutos, 
      enlace_unico, 
      activo 
    } = req.body;

    // TODO: Deberías verificar que el req.user.id_profesional coincida con el id_profesional del body
    // o que el usuario sea admin, para seguridad.

    const nuevoEvento = await TipoEvento.create({
      id_profesional, 
      nombre_evento, 
      descripcion, 
      duracion_minutos, 
      enlace_unico, 
      activo
    });
    
    res.status(201).json({
      success: true,
      message: 'Tipo de evento creado con éxito',
      data: nuevoEvento
    });
  } catch (error) {
    console.error('Error al crear tipo de evento:', error);
    res.status(500).json({ success: false, message: 'Error al crear tipo de evento', error: error.message });
  }
};

// Obtener todos los tipos de evento de un profesional
exports.obtenerTiposEventoPorProfesional = async (req, res) => {
  try {
    const { id_profesional } = req.params;
    const eventos = await TipoEvento.findByProfesionalId(id_profesional);
    
    res.status(200).json({
      success: true,
      // El dashboard busca los datos dentro de un objeto con el nombre de la tabla (en plural)
      data: {
        tipos_evento: eventos 
      }
    });
  } catch (error) {
    console.error('Error al obtener tipos de evento:', error);
    res.status(500).json({ success: false, message: 'Error al obtener tipos de evento', error: error.message });
  }
};

// Obtener un tipo de evento por su ID
exports.obtenerTipoEventoPorId = async (req, res) => {
  try {
    const evento = await TipoEvento.findById(req.params.id);
    if (!evento) {
      return res.status(404).json({ success: false, message: 'Tipo de evento no encontrado' });
    }
    res.status(200).json({ success: true, data: evento });
  } catch (error) {
    console.error('Error al obtener tipo de evento:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor', error: error.message });
  }
};

// Actualizar un tipo de evento
exports.actualizarTipoEvento = async (req, res) => {
  try {
    // TODO: Verificar que el usuario (req.user) es dueño de este evento antes de actualizar.
    const eventoActualizado = await TipoEvento.update(req.params.id, req.body);
    if (!eventoActualizado) {
      return res.status(404).json({ success: false, message: 'Tipo de evento no encontrado' });
    }
    res.status(200).json({
      success: true,
      message: 'Tipo de evento actualizado con éxito',
      data: eventoActualizado
    });
  } catch (error) {
    console.error('Error al actualizar tipo de evento:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar tipo de evento', error: error.message });
  }
};

// Eliminar un tipo de evento
exports.eliminarTipoEvento = async (req, res) => {
  try {
    // TODO: Verificar que el usuario (req.user) es dueño de este evento antes de eliminar.
    const exito = await TipoEvento.delete(req.params.id);
    if (!exito) {
      return res.status(404).json({ success: false, message: 'Tipo de evento no encontrado' });
    }
    res.status(200).json({ success: true, message: 'Tipo de evento eliminado con éxito' });
  } catch (error) {
    console.error('Error al eliminar tipo de evento:', error);
    res.status(500).json({ success: false, message: 'Error al eliminar tipo de evento', error: error.message });
  }
};

console.log('--- [CONTROLADOR] controllers/tipoEventoController.js ¡CARGADO CORRECTAMENTE! ---');
