// --- [CONTROLADOR] controllers/sincronizacionCalendarioController.js ---
// Maneja la lógica de negocio (request/response) para sincronizaciones_calendario

const SincronizacionCalendario = require('../models/sincronizacionCalendarioModel');

// Crear un registro de sincronización (iniciar un log)
exports.crearSincronizacion = async (req, res) => {
  try {
    // (Añadir validación aquí)
    const { id_calendario, tipo, estado, mensaje } = req.body;
    
    // TODO: Verificar que el req.user es dueño del id_calendario o es admin.

    const nuevaSincronizacion = await SincronizacionCalendario.create({
      id_calendario, tipo, estado, mensaje
    });
    
    res.status(201).json({
      success: true,
      message: 'Registro de sincronización creado',
      data: nuevaSincronizacion
    });
  } catch (error) {
    console.error('Error al crear registro de sincronización:', error);
    res.status(500).json({ success: false, message: 'Error al crear registro', error: error.message });
  }
};

// Obtener todos los registros de sincronización (para admin)
exports.obtenerSincronizaciones = async (req, res) => {
  try {
    const sincronizaciones = await SincronizacionCalendario.findAll();
    res.status(200).json({
      success: true,
      data: {
        // El dashboard espera el nombre de la tabla
        sincronizaciones_calendario: sincronizaciones 
      }
    });
  } catch (error) {
    console.error('Error al obtener sincronizaciones:', error);
    res.status(500).json({ success: false, message: 'Error al obtener sincronizaciones', error: error.message });
  }
};

// Obtener un registro de sincronización por ID
exports.obtenerSincronizacionPorId = async (req, res) => {
  try {
    const sincronizacion = await SincronizacionCalendario.findById(req.params.id);
    if (!sincronizacion) {
      return res.status(404).json({ success: false, message: 'Registro de sincronización no encontrado' });
    }
    // TODO: Verificar permisos
    res.status(200).json({ success: true, data: sincronizacion });
  } catch (error) {
    console.error('Error al obtener registro:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor', error: error.message });
  }
};

// Obtener todos los registros de un calendario
exports.obtenerSincronizacionesPorCalendario = async (req, res) => {
  try {
    const { id_calendario } = req.params;
    // TODO: Verificar permisos
    const sincronizaciones = await SincronizacionCalendario.findByCalendarioId(id_calendario);
    res.status(200).json({ success: true, data: { sincronizaciones_calendario: sincronizaciones } });
  } catch (error) {
    console.error('Error al obtener sincronizaciones del calendario:', error);
    res.status(500).json({ success: false, message: 'Error al obtener registros', error: error.message });
  }
};

// Actualizar un registro de sincronización
exports.actualizarSincronizacion = async (req, res) => {
  try {
    // (Añadir validación)
    // TODO: Verificar permisos
    
    const sincronizacionActualizada = await SincronizacionCalendario.update(req.params.id, req.body);
    if (!sincronizacionActualizada) {
      return res.status(404).json({ success: false, message: 'Registro no encontrado' });
    }
    
    res.status(200).json({
      success: true,
      message: 'Registro de sincronización actualizado',
      data: sincronizacionActualizada
    });
  } catch (error) {
    console.error('Error al actualizar sincronización:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar registro', error: error.message });
  }
};

// Eliminar un registro de sincronización
exports.eliminarSincronizacion = async (req, res) => {
  try {
    // TODO: Verificar permisos (solo admin?)
    const exito = await SincronizacionCalendario.delete(req.params.id);
    if (!exito) {
      return res.status(404).json({ success: false, message: 'Registro no encontrado' });
    }
    res.status(200).json({ success: true, message: 'Registro de sincronización eliminado' });
  } catch (error) {
    console.error('Error al eliminar sincronización:', error);
    res.status(500).json({ success: false, message: 'Error al eliminar registro', error: error.message });
  }
};

console.log('--- [CONTROLADOR] controllers/sincronizacionCalendarioController.js ¡CARGADO CORRECTAMENTE! ---');
