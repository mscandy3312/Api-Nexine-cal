// --- [MODELO] models/calendarioExternoModel.js ---
// Lógica de base de datos para la tabla 'calendarios_externos'

const pool = require('../config/database');

class CalendarioExterno {

  /**
   * Vincula un nuevo calendario externo a un usuario.
   * @param {object} campos - Campos del calendario.
   * @returns {object} El nuevo calendario vinculado.
   */
  static async create({ 
    id_usuario, 
    proveedor, 
    access_token, 
    refresh_token, 
    expiracion_token, 
    token_type,
    external_calendar_id,
    nombre_calendario,
    sincronizacion_activa = true,
    modo_sincronizacion = 'bidireccional',
    connected = true
  }) {
    const query = `
      INSERT INTO calendarios_externos 
      (id_usuario, proveedor, access_token, refresh_token, expiracion_token, token_type, external_calendar_id, nombre_calendario, sincronizacion_activa, modo_sincronizacion, connected, created_at, updated_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `;
    const [result] = await pool.query(query, [
      id_usuario, proveedor, access_token, refresh_token, expiracion_token, token_type,
      external_calendar_id, nombre_calendario, sincronizacion_activa, modo_sincronizacion, connected
    ]);
    
    return { id_calendario: result.insertId, ...arguments[0], connected };
  }

  /**
   * Encuentra todos los calendarios (para el admin dashboard).
   * @returns {Array<object>} Lista de todos los calendarios.
   */
  static async findAll() {
    const query = 'SELECT * FROM calendarios_externos ORDER BY id_usuario, proveedor';
    const [rows] = await pool.query(query);
    return rows;
  }

  /**
   * Encuentra un calendario por su ID.
   * @param {number} id_calendario - ID del calendario.
   * @returns {object} El calendario encontrado.
   */
  static async findById(id_calendario) {
    const query = 'SELECT * FROM calendarios_externos WHERE id_calendario = ?';
    const [rows] = await pool.query(query, [id_calendario]);
    return rows[0];
  }

  /**
   * Encuentra todos los calendarios de un usuario.
   * @param {number} id_usuario - ID del usuario.
   * @returns {Array<object>} Lista de calendarios del usuario.
   */
  static async findByUsuarioId(id_usuario) {
    const query = 'SELECT * FROM calendarios_externos WHERE id_usuario = ? ORDER BY proveedor';
    const [rows] = await pool.query(query, [id_usuario]);
    return rows;
  }

  /**
   * Actualiza un calendario externo.
   * @param {number} id_calendario - ID del calendario.
   * @param {object} campos - Campos a actualizar.
   * @returns {object} El calendario actualizado.
   */
  static async update(id_calendario, campos) {
    const camposPermitidos = [
      'access_token', 'refresh_token', 'expiracion_token', 'token_type',
      'external_calendar_id', 'nombre_calendario', 'color_calendario', 'timezone',
      'sincronizacion_activa', 'ultima_sincronizacion', 'modo_sincronizacion',
      'notificar_eventos', 'eliminar_eventos_remotos', 'connected', 'error_conexion'
    ];
    const camposAActualizar = {};

    Object.keys(campos).forEach(key => {
      if (camposPermitidos.includes(key)) {
        camposAActualizar[key] = campos[key];
      }
    });

    if (Object.keys(camposAActualizar).length === 0) {
      throw new Error("No se proporcionaron campos válidos para actualizar.");
    }

    camposAActualizar.updated_at = new Date();

    const query = 'UPDATE calendarios_externos SET ? WHERE id_calendario = ?';
    await pool.query(query, [camposAActualizar, id_calendario]);
    
    return this.findById(id_calendario);
  }

  /**
   * Elimina un calendario vinculado.
   * @param {number} id_calendario - ID del calendario.
   * @returns {boolean} True si se eliminó.
   */
  static async delete(id_calendario) {
    // La FK en 'sincronizaciones_calendario' está ON DELETE CASCADE,
    // así que las sincronizaciones se borrarán automáticamente.
    const query = 'DELETE FROM calendarios_externos WHERE id_calendario = ?';
    const [result] = await pool.query(query, [id_calendario]);
    return result.affectedRows > 0;
  }
}

console.log('--- [MODELO] models/calendarioExternoModel.js ¡CARGADO CORRECTAMENTE! ---');
module.exports = CalendarioExterno;
