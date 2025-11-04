// --- [MODELO] models/disponibilidadHorarioModel.js ---
// Lógica de base de datos para la tabla 'disponibilidad_horarios'

const pool = require('../config/database');

class DisponibilidadHorario {

  /**
   * Crea un nuevo bloque de disponibilidad.
   * @param {object} campos - Campos (id_profesional, dia_semana, hora_inicio, hora_fin, activo)
   * @returns {object} El nuevo bloque creado.
   */
  static async create({ id_profesional, dia_semana, hora_inicio, hora_fin, activo = true }) {
    const query = `
      INSERT INTO disponibilidad_horarios 
      (id_profesional, dia_semana, hora_inicio, hora_fin, activo, created_at) 
      VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `;
    const [result] = await pool.query(query, [
      id_profesional, 
      dia_semana, 
      hora_inicio, 
      hora_fin, 
      activo
    ]);
    
    return { 
      id_disponibilidad: result.insertId, 
      id_profesional, 
      dia_semana, 
      hora_inicio, 
      hora_fin, 
      activo 
    };
  }

  /**
   * Encuentra todos los bloques de disponibilidad de un profesional.
   * @param {number} id_profesional - ID del profesional.
   * @returns {Array<object>} Lista de bloques de disponibilidad.
   */
  static async findByProfesionalId(id_profesional) {
    const query = `
      SELECT * FROM disponibilidad_horarios 
      WHERE id_profesional = ? 
      ORDER BY FIELD(dia_semana, 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'), hora_inicio ASC
    `;
    const [rows] = await pool.query(query, [id_profesional]);
    return rows;
  }

  /**
   * Encuentra todos los bloques de disponibilidad (para el admin dashboard).
   * @returns {Array<object>} Lista de todos los bloques.
   */
  static async findAll() {
    const query = 'SELECT * FROM disponibilidad_horarios ORDER BY id_profesional, FIELD(dia_semana, \'lunes\', \'martes\', \'miércoles\', \'jueves\', \'viernes\', \'sábado\', \'domingo\'), hora_inicio ASC';
    const [rows] = await pool.query(query);
    return rows;
  }

  /**
   * Encuentra un bloque por su ID.
   * @param {number} id_disponibilidad - ID del bloque.
   * @returns {object} El bloque encontrado.
   */
  static async findById(id_disponibilidad) {
    const query = 'SELECT * FROM disponibilidad_horarios WHERE id_disponibilidad = ?';
    const [rows] = await pool.query(query, [id_disponibilidad]);
    return rows[0];
  }

  /**
   * Actualiza un bloque de disponibilidad.
   * @param {number} id_disponibilidad - ID del bloque.
   * @param {object} campos - Campos a actualizar.
   * @returns {object} El bloque actualizado.
   */
  static async update(id_disponibilidad, campos) {
    const camposPermitidos = ['dia_semana', 'hora_inicio', 'hora_fin', 'activo'];
    const camposAActualizar = {};

    Object.keys(campos).forEach(key => {
      if (camposPermitidos.includes(key)) {
        camposAActualizar[key] = campos[key];
      }
    });

    if (Object.keys(camposAActualizar).length === 0) {
      throw new Error("No se proporcionaron campos válidos para actualizar.");
    }

    const query = 'UPDATE disponibilidad_horarios SET ? WHERE id_disponibilidad = ?';
    await pool.query(query, [camposAActualizar, id_disponibilidad]);
    
    return this.findById(id_disponibilidad);
  }

  /**
   * Elimina un bloque de disponibilidad.
   * @param {number} id_disponibilidad - ID del bloque.
   * @returns {boolean} True si se eliminó.
   */
  static async delete(id_disponibilidad) {
    const query = 'DELETE FROM disponibilidad_horarios WHERE id_disponibilidad = ?';
    const [result] = await pool.query(query, [id_disponibilidad]);
    return result.affectedRows > 0;
  }
}

console.log('--- [MODELO] models/disponibilidadHorarioModel.js ¡CARGADO CORRECTAMENTE! ---');
module.exports = DisponibilidadHorario;
