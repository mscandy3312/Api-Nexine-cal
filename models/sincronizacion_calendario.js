// --- [MODELO] models/sincronizacionCalendarioModel.js ---
// Lógica de base de datos para la tabla 'sincronizaciones_calendario'

const pool = require('../config/database');

class SincronizacionCalendario {

  /**
   * Crea un nuevo registro de sincronización.
   * @param {object} campos - Campos de la sincronización.
   * @returns {object} El nuevo registro de sincronización.
   */
  static async create({ 
    id_calendario, 
    tipo = 'import', 
    estado = 'pendiente', 
    mensaje 
  }) {
    const query = `
      INSERT INTO sincronizaciones_calendario 
      (id_calendario, tipo, estado, mensaje, fecha_inicio) 
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
    `;
    const [result] = await pool.query(query, [id_calendario, tipo, estado, mensaje]);
    return { id_sinc: result.insertId, ...arguments[0] };
  }

  /**
   * Encuentra todos los registros de sincronización (para admin dashboard).
   * @returns {Array<object>} Lista de todas las sincronizaciones.
   */
  static async findAll() {
    const query = 'SELECT * FROM sincronizaciones_calendario ORDER BY fecha_inicio DESC';
    const [rows] = await pool.query(query);
    return rows;
  }

  /**
   * Encuentra un registro de sincronización por su ID.
   * @param {number} id_sinc - ID del registro.
   * @returns {object} El registro encontrado.
   */
  static async findById(id_sinc) {
    const query = 'SELECT * FROM sincronizaciones_calendario WHERE id_sinc = ?';
    const [rows] = await pool.query(query, [id_sinc]);
    return rows[0];
  }

  /**
   * Encuentra todos los registros de sincronización para un calendario específico.
   * @param {number} id_calendario - ID del calendario.
   * @returns {Array<object>} Lista de sincronizaciones.
   */
  static async findByCalendarioId(id_calendario) {
    const query = 'SELECT * FROM sincronizaciones_calendario WHERE id_calendario = ? ORDER BY fecha_inicio DESC';
    const [rows] = await pool.query(query, [id_calendario]);
    return rows;
  }

  /**
   * Actualiza un registro de sincronización (ej. al completarse o fallar).
   * @param {number} id_sinc - ID del registro.
   * @param {object} campos - Campos a actualizar.
   * @returns {object} El registro actualizado.
   */
  static async update(id_sinc, campos) {
    const camposPermitidos = [
      'estado', 'total_eventos', 'eventos_exitosos', 
      'eventos_fallidos', 'mensaje', 'fecha_fin'
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
    
    // Si el estado es 'completada' o 'error', actualizamos la fecha_fin
    if (camposAActualizar.estado === 'completada' || camposAActualizar.estado === 'error') {
      camposAActualizar.fecha_fin = new Date();
    }

    const query = 'UPDATE sincronizaciones_calendario SET ? WHERE id_sinc = ?';
    await pool.query(query, [camposAActualizar, id_sinc]);
    
    return this.findById(id_sinc);
  }

  /**
   * Elimina un registro de sincronización.
   * @param {number} id_sinc - ID del registro.
   * @returns {boolean} True si se eliminó.
   */
  static async delete(id_sinc) {
    const query = 'DELETE FROM sincronizaciones_calendario WHERE id_sinc = ?';
    const [result] = await pool.query(query, [id_sinc]);
    return result.affectedRows > 0;
  }
}

console.log('--- [MODELO] models/sincronizacionCalendarioModel.js ¡CARGADO CORRECTAMENTE! ---');
module.exports = SincronizacionCalendario;
