// --- [CONTROLADOR] controllers/calendarioExternoController.js ---
// Maneja la lógica de negocio (request/response) para calendarios_externos

const CalendarioExterno = require('../models/calendario_externos');

// Vincular un nuevo calendario externo
exports.crearCalendario = async (req, res) => {
  try {
    // (Añadir validación aquí)
    const { 
      id_usuario, proveedor, access_token, refresh_token, expiracion_token, 
      token_type, external_calendar_id, nombre_calendario, sincronizacion_activa, 
      modo_sincronizacion, connected 
    } = req.body;

    // TODO: Verificar que el req.user.id coincida con id_usuario o sea admin.
    
    const nuevoCalendario = await CalendarioExterno.create({
      id_usuario, proveedor, access_token, refresh_token, expiracion_token, 
      token_type, external_calendar_id, nombre_calendario, sincronizacion_activa, 
      modo_sincronizacion, connected
    });
    
    res.status(201).json({
      success: true,
      message: 'Calendario externo vinculado con éxito',
      data: nuevoCalendario
    });
  } catch (error) {
    console.error('Error al vincular calendario:', error);
    res.status(500).json({ success: false, message: 'Error al vincular calendario', error: error.message });
  }
};

// Obtener todos los calendarios (para el dashboard de admin)
exports.obtenerCalendarios = async (req, res) => {
  try {
    const calendarios = await CalendarioExterno.findAll();
    res.status(200).json({
      success: true,
      // El dashboard espera los datos en un objeto con el nombre de la tabla
      data: {
        calendarios_externos: calendarios 
      }
    });
  } catch (error) {
    console.error('Error al obtener calendarios:', error);
    res.status(500).json({ success: false, message: 'Error al obtener calendarios', error: error.message });
  }
};

// Obtener un calendario por su ID
exports.obtenerCalendarioPorId = async (req, res) => {
  try {
    const calendario = await CalendarioExterno.findById(req.params.id);
    if (!calendario) {
      return res.status(404).json({ success: false, message: 'Calendario no encontrado' });
    }
    // TODO: Verificar permisos del req.user
    res.status(200).json({ success: true, data: calendario });
  } catch (error) {
    console.error('Error al obtener calendario:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor', error: error.message });
  }
};

// Obtener calendarios de un usuario
exports.obtenerCalendariosPorUsuario = async (req, res) => {
  try {
    const { id_usuario } = req.params;
    // TODO: Verificar que req.user es el usuario o un admin
    const calendarios = await CalendarioExterno.findByUsuarioId(id_usuario);
    res.status(200).json({ success: true, data: { calendarios_externos: calendarios } });
  } catch (error) {
    console.error('Error al obtener calendarios del usuario:', error);
    res.status(500).json({ success: false, message: 'Error al obtener calendarios', error: error.message });
  }
};

// Actualizar un calendario
exports.actualizarCalendario = async (req, res) => {
  try {
    // TODO: Verificar permisos
    const calendarioActualizado = await CalendarioExterno.update(req.params.id, req.body);
    if (!calendarioActualizado) {
      return res.status(404).json({ success: false, message: 'Calendario no encontrado' });
    }
    res.status(200).json({
      success: true,
      message: 'Calendario actualizado con éxito',
      data: calendarioActualizado
    });
  } catch (error) {
    console.error('Error al actualizar calendario:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar calendario', error: error.message });
  }
};

// Eliminar un calendario
exports.eliminarCalendario = async (req, res) => {
  try {
    // TODO: Verificar permisos
    const exito = await CalendarioExterno.delete(req.params.id);
    if (!exito) {
      return res.status(404).json({ success: false, message: 'Calendario no encontrado' });
    }
    res.status(200).json({ success: true, message: 'Calendario desvinculado con éxito' });
  } catch (error) {
    console.error('Error al eliminar calendario:', error);
    res.status(500).json({ success: false, message: 'Error al eliminar calendario', error: error.message });
  }
};

console.log('--- [CONTROLADOR] controllers/calendarioExternoController.js ¡CARGADO CORRECTAMENTE! ---');
