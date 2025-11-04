const { executeQuery } = require('../config/database');

class Favorito {
  constructor(data) {
    this.id_favorito = data.id_favorito;
    this.id_clientes = data.id_clientes;
    this.id_profesional = data.id_profesional;
    this.fecha_agregado = data.fecha_agregado;
  }

  // Agregar profesional a favoritos
  static async create(favoritoData) {
    try {
      const { id_clientes, id_profesional } = favoritoData;

      // Verificar si ya está en favoritos
      const favoritoExistente = await this.findByclientesAndProfesional(id_clientes, id_profesional);
      if (favoritoExistente) {
        throw new Error('El profesional ya está en tus favoritos');
      }

      const query = `
        INSERT INTO FAVORITOS (id_clientes, id_profesional)
        VALUES (?, ?)
      `;

      const result = await executeQuery(query, [id_clientes, id_profesional]);
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
               c.nombre_completo as clientes_nombre,
               p.nombre_completo as profesional_nombre,
               p.especialidad,
               p.rating,
               p.foto_perfil
        FROM FAVORITOS f
        JOIN clientesS c ON f.id_clientes = c.id_clientes
        JOIN PROFESIONALES p ON f.id_profesional = p.id_profesional
        WHERE f.id_favorito = ?
      `;
      const result = await executeQuery(query, [id]);
      return result.length > 0 ? new Favorito(result[0]) : null;
    } catch (error) {
      throw error;
    }
  }

  // Buscar favorito por clientes y profesional
  static async findByclientesAndProfesional(id_clientes, id_profesional) {
    try {
      const query = `
        SELECT f.*, 
               c.nombre_completo as clientes_nombre,
               p.nombre_completo as profesional_nombre
        FROM FAVORITOS f
        JOIN clientesS c ON f.id_clientes = c.id_clientes
        JOIN PROFESIONALES p ON f.id_profesional = p.id_profesional
        WHERE f.id_clientes = ? AND f.id_profesional = ?
      `;
      const result = await executeQuery(query, [id_clientes, id_profesional]);
      return result.length > 0 ? new Favorito(result[0]) : null;
    } catch (error) {
      throw error;
    }
  }

  // Obtener favoritos de un clientes
  static async findByclientes(id_clientes, limit = 50, offset = 0) {
    try {
      const query = `
        SELECT f.*, 
               p.id_profesional,
               p.nombre_completo as profesional_nombre,
               p.especialidad,
               p.rating,
               p.foto_perfil,
               p.biografia,
               p.direccion,
               p.telefono
        FROM FAVORITOS f
        JOIN PROFESIONALES p ON f.id_profesional = p.id_profesional
        WHERE f.id_clientes = ?
        ORDER BY f.fecha_agregado DESC
        LIMIT ? OFFSET ?
      `;
      const result = await executeQuery(query, [id_clientes, limit, offset]);
      return result.map(favorito => new Favorito(favorito));
    } catch (error) {
      throw error;
    }
  }

  // Obtener clientess que tienen como favorito a un profesional
  static async findByProfesional(id_profesional, limit = 50, offset = 0) {
    try {
      const query = `
        SELECT f.*, 
               c.id_clientes,
               c.nombre_completo as clientes_nombre,
               c.telefono,
               c.ciudad
        FROM FAVORITOS f
        JOIN clientesS c ON f.id_clientes = c.id_clientes
        WHERE f.id_profesional = ?
        ORDER BY f.fecha_agregado DESC
        LIMIT ? OFFSET ?
      `;
      const result = await executeQuery(query, [id_profesional, limit, offset]);
      return result.map(favorito => new Favorito(favorito));
    } catch (error) {
      throw error;
    }
  }

  // Verificar si un profesional está en favoritos de un clientes
  static async isFavorito(id_clientes, id_profesional) {
    try {
      const favorito = await this.findByclientesAndProfesional(id_clientes, id_profesional);
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
          COUNT(DISTINCT id_clientes) as clientess_unicos,
          COUNT(DISTINCT id_profesional) as profesionales_unicos
        FROM FAVORITOS
      `;
      const values = [];

      if (id_profesional) {
        query += ' WHERE id_profesional = ?';
        values.push(id_profesional);
      }

      const result = await executeQuery(query, values);
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
          p.rating,
          p.foto_perfil,
          COUNT(f.id_favorito) as total_favoritos
        FROM PROFESIONALES p
        LEFT JOIN FAVORITOS f ON p.id_profesional = f.id_profesional
        GROUP BY p.id_profesional
        ORDER BY total_favoritos DESC
        LIMIT ?
      `;
      const result = await executeQuery(query, [limit]);
      return result;
    } catch (error) {
      throw error;
    }
  }

  // Eliminar favorito
  async delete() {
    try {
      const query = 'DELETE FROM FAVORITOS WHERE id_favorito = ?';
      await executeQuery(query, [this.id_favorito]);
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Eliminar favorito por clientes y profesional
  static async deleteByclientesAndProfesional(id_clientes, id_profesional) {
    try {
      const query = 'DELETE FROM FAVORITOS WHERE id_clientes = ? AND id_profesional = ?';
      const result = await executeQuery(query, [id_clientes, id_profesional]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Favorito;

