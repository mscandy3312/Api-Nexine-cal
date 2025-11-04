// --- [MODELO] models/tipoEventoModel.js ---
// Lógica de base de datos para la tabla 'tipos_evento'

const pool = require('../config/database');

class TipoEvento {

  /**
   * Crea un nuevo tipo de evento para un profesional.
   * @param {object} campos - Campos del evento (id_profesional, nombre_evento, etc.)
   * @returns {object} El nuevo tipo de evento creado.
   */
  static async create({ id_profesional, nombre_evento, descripcion, duracion_minutos, enlace_unico, activo = true }) {
    const query = `
      INSERT INTO tipos_evento 
      (id_profesional, nombre_evento, descripcion, duracion_minutos, enlace_unico, activo, created_at, updated_at) 
      VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `;
    const [result] = await pool.query(query, [
      id_profesional, 
      nombre_evento, 
      descripcion, 
      duracion_minutos, 
      enlace_unico, 
      activo
    ]);
    
    return { 
      id_evento: result.insertId, 
      id_profesional, 
      nombre_evento, 
      descripcion, 
      duracion_minutos, 
      enlace_unico, 
      activo 
    };
  }

  /**
   * Encuentra todos los tipos de evento de un profesional específico.
   * @param {number} id_profesional - El ID del profesional.
   * @returns {Array<object>} Lista de tipos de evento.
   */
  static async findByProfesionalId(id_profesional) {
    const query = 'SELECT * FROM tipos_evento WHERE id_profesional = ? ORDER BY nombre_evento ASC';
    const [rows] = await pool.query(query, [id_profesional]);
    return rows;
  }

  /**
   * Encuentra un tipo de evento por su ID (id_evento).
   * @param {number} id_evento - El ID del evento.
   * @returns {object} El tipo de evento encontrado.
   */
  static async findById(id_evento) {
    const query = 'SELECT * FROM tipos_evento WHERE id_evento = ?';
    const [rows] = await pool.query(query, [id_evento]);
    return rows[0];
  }

  /**
   * Actualiza un tipo de evento.
   * @param {number} id_evento - El ID del evento a actualizar.
   * @param {object} campos - Campos a actualizar.
   * @returns {object} El tipo de evento actualizado.
   */
  static async update(id_evento, campos) {
    const camposPermitidos = ['nombre_evento', 'descripcion', 'duracion_minutos', 'enlace_unico', 'activo'];
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

    const query = 'UPDATE tipos_evento SET ? WHERE id_evento = ?';
    await pool.query(query, [camposAActualizar, id_evento]);
    
    return this.findById(id_evento);
  }

  /**
   * Elimina un tipo de evento.
   * @param {number} id_evento - El ID del evento a eliminar.
   * @returns {boolean} True si se eliminó, false si no.
   */
  static async delete(id_evento) {
    const query = 'DELETE FROM tipos_evento WHERE id_evento = ?';
    const [result] = await pool.query(query, [id_evento]);
    return result.affectedRows > 0;
  }
}

console.log('--- [MODELO] models/tipoEventoModel.js ¡CARGADO CORRECTAMENTE! ---');
module.exports = TipoEvento;
