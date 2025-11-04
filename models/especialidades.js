// --- [MODELO] models/especialidadModel.js ---
// Este archivo maneja la lógica de la base de datos para la tabla 'especialidades'.

// Importa el pool de conexiones
const pool = require('../config/database'); 

class Especialidad {
  
  // Crear una nueva especialidad
  static async create({ nombre, descripcion }) {
    const query = `
      INSERT INTO especialidades (nombre, descripcion) 
      VALUES (?, ?)
    `;
    const [result] = await pool.query(query, [nombre, descripcion]);
    return { id_especialidad: result.insertId, nombre, descripcion };
  }

  // Encontrar todas las especialidades
  static async findAll() {
    const query = 'SELECT * FROM especialidades ORDER BY nombre ASC';
    const [rows] = await pool.query(query);
    return rows;
  }

  // Encontrar una especialidad por su ID
  static async findById(id) {
    const query = 'SELECT * FROM especialidades WHERE id_especialidad = ?';
    const [rows] = await pool.query(query, [id]);
    return rows[0];
  }

  // Actualizar una especialidad
  static async update(id, { nombre, descripcion }) {
    const query = `
      UPDATE especialidades 
      SET nombre = ?, descripcion = ? 
      WHERE id_especialidad = ?
    `;
    await pool.query(query, [nombre, descripcion, id]);
    return { id_especialidad: id, nombre, descripcion };
  }

  // Eliminar una especialidad
  static async delete(id) {
    const query = 'DELETE FROM especialidades WHERE id_especialidad = ?';
    const [result] = await pool.query(query, [id]);
    return result.affectedRows > 0;
  }
}

console.log('--- [MODELO] models/especialidadModel.js ¡CARGADO CORRECTAMENTE! ---');
module.exports = Especialidad;
