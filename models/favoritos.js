// --- [MODELO] models/favoritos.js ¡CARGADO Y CORREGIDO! ---
console.log('--- [MODELO] models/favoritos.js ¡CARGADO Y CORREGIDO! ---');

const pool = require('../config/database'); // <-- CORREGIDO

class Favorito {
  constructor(data) {
    this.id_favorito = data.id_favorito;
    this.id_cliente = data.id_cliente; // <-- CORREGIDO
    this.id_profesional = data.id_profesional;
    this.fecha_agregado = data.fecha_agregado;

    // Campos del JOIN (del profesional)
    this.profesional_nombre = data.profesional_nombre;
    this.profesional_especialidad = data.profesional_especialidad;
    this.profesional_descripcion = data.profesional_descripcion;
  }

  // Agregar profesional a favoritos
  static async create(favoritoData) {
    try {
      const { id_cliente, id_profesional } = favoritoData; // <-- CORREGIDO

      // Verificar si ya está en favoritos
      const favoritoExistente = await this.findByClienteAndProfesional(id_cliente, id_profesional); // <-- CORREGIDO
      if (favoritoExistente) {
        throw new Error('El profesional ya está en tus favoritos');
      }

      const query = `
        INSERT INTO favoritos (id_cliente, id_profesional)
        VALUES (?, ?)
      `; // <-- CORREGIDO

      const [result] = await pool.query(query, [id_cliente, id_profesional]); // <-- CORREGIDO
      return await this.findById(result.insertId);
    } catch (error) {
      throw error;
    }
  }

  // Buscar favorito por ID
  static async findById(id) {
    try {
      const query = `
        SELECT f.*, 
               c.nombre_completo as cliente_nombre,
               p.nombre_completo as profesional_nombre,
               p.especialidad
        FROM favoritos f
        JOIN clientes c ON f.id_cliente = c.id_cliente
        JOIN profesionales p ON f.id_profesional = p.id_profesional
        WHERE f.id_favorito = ?
      `; // <-- CORREGIDO (Nombres de tablas)
      const [result] = await pool.query(query, [id]); // <-- CORREGIDO
      return result.length > 0 ? new Favorito(result[0]) : null;
    } catch (error) {
      throw error;
    }
  }

  // Buscar favorito por cliente y profesional
  static async findByClienteAndProfesional(id_cliente, id_profesional) { // <-- CORREGIDO
    try {
      const query = `
        SELECT f.*, 
               c.nombre_completo as cliente_nombre,
               p.nombre_completo as profesional_nombre
        FROM favoritos f
        JOIN clientes c ON f.id_cliente = c.id_cliente
        JOIN profesionales p ON f.id_profesional = p.id_profesional
        WHERE f.id_cliente = ? AND f.id_profesional = ?
      `; // <-- CORREGIDO
      const [result] = await pool.query(query, [id_cliente, id_profesional]); // <-- CORREGIDO
      return result.length > 0 ? new Favorito(result[0]) : null;
    } catch (error) {
      throw error;
    }
  }

  // Obtener favoritos de un cliente
  // --- CORREGIDO --- (Nombre de función findByclientes -> findByCliente)
  static async findByCliente(id_cliente, limit = 50, offset = 0) { 
    try {
      const query = `
        SELECT f.*, 
               p.id_profesional,
               p.nombre_completo as profesional_nombre,
               p.especialidad,
               p.descripcion as profesional_descripcion
        FROM favoritos f
        JOIN profesionales p ON f.id_profesional = p.id_profesional
        WHERE f.id_cliente = ?
        ORDER BY f.fecha_agregado DESC
        LIMIT ? OFFSET ?
      `; // <-- CORREGIDO (Nombres de tabla/columna y campos seleccionados)
      const [result] = await pool.query(query, [id_cliente, limit, offset]); // <-- CORREGIDO
      return result.map(favorito => new Favorito(favorito));
    } catch (error) {
      throw error;
    }
  }

  // Obtener clientes que tienen como favorito a un profesional
  static async findByProfesional(id_profesional, limit = 50, offset = 0) {
    try {
      const query = `
        SELECT f.*, 
               c.id_cliente,
               c.nombre_completo as cliente_nombre,
               c.telefono,
               c.email
        FROM favoritos f
        JOIN clientes c ON f.id_cliente = c.id_cliente
        WHERE f.id_profesional = ?
        ORDER BY f.fecha_agregado DESC
        LIMIT ? OFFSET ?
      `; // <-- CORREGIDO
      const [result] = await pool.query(query, [id_profesional, limit, offset]); // <-- CORREGIDO
      return result.map(favorito => new Favorito(favorito));
    } catch (error) {
      throw error;
    }
  }

  // Verificar si un profesional está en favoritos de un cliente
  static async isFavorito(id_cliente, id_profesional) { // <-- CORREGIDO
    try {
      const favorito = await this.findByClienteAndProfesional(id_cliente, id_profesional); // <-- CORREGIDO
      return favorito !== null;
    } catch (error) {
      throw error;
    }
  }

  // Obtener estadísticas de favoritos
  static async getStats(id_profesional = null) {
    try {
      let query = `
        SELECT 
          COUNT(*) as total_favoritos,
          COUNT(DISTINCT id_cliente) as clientes_unicos,
          COUNT(DISTINCT id_profesional) as profesionales_unicos
        FROM favoritos
      `; // <-- CORREGIDO
      const values = [];

      if (id_profesional) {
        query += ' WHERE id_profesional = ?';
        values.push(id_profesional);
      }

      const [result] = await pool.query(query, values); // <-- CORREGIDO
      return result[0];
    } catch (error) {
      throw error;
    }
  }

  // Obtener profesionales más favoritos
  static async getTopFavoritos(limit = 10) {
    try {
      const query = `
        SELECT 
          p.id_profesional,
          p.nombre_completo,
          p.especialidad,
          COUNT(f.id_favorito) as total_favoritos
        FROM profesionales p
        LEFT JOIN favoritos f ON p.id_profesional = f.id_profesional
        GROUP BY p.id_profesional
        ORDER BY total_favoritos DESC
        LIMIT ?
      `; // <-- CORREGIDO (Nombres de tabla y campos)
      const [result] = await pool.query(query, [limit]); // <-- CORREGIDO
      return result;
    } catch (error) {
      throw error;
    }
  }

  // Eliminar favorito
  async delete() {
    try {
      const query = 'DELETE FROM favoritos WHERE id_favorito = ?'; // <-- CORREGIDO
      await pool.query(query, [this.id_favorito]); // <-- CORREGIDO
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Eliminar favorito por cliente y profesional
  static async deleteByClienteAndProfesional(id_cliente, id_profesional) { // <-- CORREGIDO
    try {
      const query = 'DELETE FROM favoritos WHERE id_cliente = ? AND id_profesional = ?'; // <-- CORREGIDO
      const [result] = await pool.query(query, [id_cliente, id_profesional]); // <-- CORREGIDO
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Favorito;
