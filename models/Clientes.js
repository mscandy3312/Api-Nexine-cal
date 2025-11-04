const { executeQuery } = require('../config/database');

class clientes {
  constructor(data) {
    this.id_clientes = data.id_clientes;
    this.id_usuarioss = data.id_usuarioss;
    this.nombre_completo = data.nombre_completo;
    this.telefono = data.telefono;
    this.nombre_usuarioss = data.nombre_usuarioss;
    this.ciudad = data.ciudad;
    this.codigo_postal = data.codigo_postal;
    this.ingreso = data.ingreso;
    this.estado = data.estado;
  }

  // Crear nuevo clientes
  static async create(clientesData) {
    try {
      const {
        id_usuarioss,
        nombre_completo,
        telefono,
        nombre_usuarioss,
        ciudad,
        codigo_postal,
        ingreso,
        estado
      } = clientesData;

      const query = `
        INSERT INTO clientesS (
          id_usuarioss, nombre_completo, telefono, nombre_usuarioss,
          ciudad, codigo_postal, ingreso, estado
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const result = await executeQuery(query, [
        id_usuarioss,
        nombre_completo,
        telefono,
        nombre_usuarioss,
        ciudad,
        codigo_postal,
        ingreso,
        estado
      ]);

      return await this.findById(result.insertId);
    } catch (error) {
      throw error;
    }
  }

  // Buscar clientes por ID
  static async findById(id) {
    try {
      const query = `
        SELECT c.*, u.email, u.nombre, u.is_verified
        FROM clientesS c
        JOIN usuariossS u ON c.id_usuarioss = u.id_usuarioss
        WHERE c.id_clientes = ?
      `;
      const result = await executeQuery(query, [id]);
      return result.length > 0 ? new clientes(result[0]) : null;
    } catch (error) {
      throw error;
    }
  }

  // Buscar clientes por ID de usuarioss
  static async findByUserId(userId) {
    try {
      const query = `
        SELECT c.*, u.email, u.nombre, u.is_verified
        FROM clientesS c
        JOIN usuariossS u ON c.id_usuarioss = u.id_usuarioss
        WHERE c.id_usuarioss = ?
      `;
      const result = await executeQuery(query, [userId]);
      return result.length > 0 ? new clientes(result[0]) : null;
    } catch (error) {
      throw error;
    }
  }

  // Buscar clientes por nombre de usuarioss
  static async findByUsername(username) {
    try {
      const query = `
        SELECT c.*, u.email, u.nombre, u.is_verified
        FROM clientesS c
        JOIN usuariossS u ON c.id_usuarioss = u.id_usuarioss
        WHERE c.nombre_usuarioss = ?
      `;
      const result = await executeQuery(query, [username]);
      return result.length > 0 ? new clientes(result[0]) : null;
    } catch (error) {
      throw error;
    }
  }

  // Obtener todos los clientess
  static async findAll(limit = 50, offset = 0) {
    try {
      const query = `
        SELECT c.*, u.email, u.nombre, u.is_verified
        FROM clientesS c
        JOIN usuariossS u ON c.id_usuarioss = u.id_usuarioss
        ORDER BY c.id_clientes DESC
        LIMIT ? OFFSET ?
      `;
      const result = await executeQuery(query, [limit, offset]);
      return result.map(clientes => new clientes(result[0]));
    } catch (error) {
      throw error;
    }
  }

  // Buscar clientess por criterios
  static async search(criteria, limit = 50, offset = 0) {
    try {
      let query = `
        SELECT c.*, u.email, u.nombre, u.is_verified
        FROM clientesS c
        JOIN usuariossS u ON c.id_usuarioss = u.id_usuarioss
        WHERE 1=1
      `;
      const values = [];

      if (criteria.nombre_completo) {
        query += ' AND c.nombre_completo LIKE ?';
        values.push(`%${criteria.nombre_completo}%`);
      }

      if (criteria.nombre_usuarioss) {
        query += ' AND c.nombre_usuarioss LIKE ?';
        values.push(`%${criteria.nombre_usuarioss}%`);
      }

      if (criteria.ciudad) {
        query += ' AND c.ciudad = ?';
        values.push(criteria.ciudad);
      }

      if (criteria.estado) {
        query += ' AND c.estado = ?';
        values.push(criteria.estado);
      }

      if (criteria.ingreso_min) {
        query += ' AND c.ingreso >= ?';
        values.push(criteria.ingreso_min);
      }

      if (criteria.ingreso_max) {
        query += ' AND c.ingreso <= ?';
        values.push(criteria.ingreso_max);
      }

      query += ' ORDER BY c.id_clientes DESC LIMIT ? OFFSET ?';
      values.push(limit, offset);

      const result = await executeQuery(query, values);
      return result.map(clientes => new clientes(clientes));
    } catch (error) {
      throw error;
    }
  }

  // Actualizar clientes
  async update(updateData) {
    try {
      const allowedFields = [
        'nombre_completo', 'telefono', 'nombre_usuarioss', 'ciudad',
        'codigo_postal', 'ingreso', 'estado'
      ];
      
      const updateFields = [];
      const values = [];

      for (const [key, value] of Object.entries(updateData)) {
        if (allowedFields.includes(key) && value !== undefined) {
          updateFields.push(`${key} = ?`);
          values.push(value);
        }
      }

      if (updateFields.length === 0) {
        throw new Error('No hay campos válidos para actualizar');
      }

      values.push(this.id_clientes);
      const query = `UPDATE clientesS SET ${updateFields.join(', ')} WHERE id_clientes = ?`;
      
      await executeQuery(query, values);
      return await clientes.findById(this.id_clientes);
    } catch (error) {
      throw error;
    }
  }

  // Obtener estadísticas del clientes
  async getStats() {
    try {
      const statsQuery = `
        SELECT 
          COUNT(DISTINCT s.id_sesion) as total_sesiones,
          COUNT(DISTINCT c.id_citas) as total_citass,
          SUM(CASE WHEN s.estado = 'completada' THEN 1 ELSE 0 END) as sesiones_completadas,
          SUM(CASE WHEN c.estado = 'completada' THEN 1 ELSE 0 END) as citass_completadas
        FROM clientesS cl
        LEFT JOIN SESIONES s ON cl.id_clientes = s.id_clientes
        LEFT JOIN citasS c ON cl.id_clientes = c.id_clientes
        WHERE cl.id_clientes = ?
      `;
      
      const result = await executeQuery(statsQuery, [this.id_clientes]);
      return result[0];
    } catch (error) {
      throw error;
    }
  }

  // Obtener historial de sesiones
  async getSesiones(limit = 20, offset = 0) {
    try {
      const query = `
        SELECT s.*, p.nombre_completo as profesional_nombre, pr.nombre_paquete
        FROM SESIONES s
        JOIN PROFESIONALES p ON s.id_profesional = p.id_profesional
        LEFT JOIN PRECIOS pr ON s.id_precio = pr.id_precio
        WHERE s.id_clientes = ?
        ORDER BY s.fecha DESC
        LIMIT ? OFFSET ?
      `;
      
      const result = await executeQuery(query, [this.id_clientes, limit, offset]);
      return result;
    } catch (error) {
      throw error;
    }
  }

  // Obtener historial de citass
  async getcitass(limit = 20, offset = 0) {
    try {
      const query = `
        SELECT c.*, p.nombre_completo as profesional_nombre, pr.nombre_paquete
        FROM citasS c
        JOIN PROFESIONALES p ON c.id_profesional = p.id_profesional
        LEFT JOIN PRECIOS pr ON c.id_precio = pr.id_precio
        WHERE c.id_clientes = ?
        ORDER BY c.fecha DESC
        LIMIT ? OFFSET ?
      `;
      
      const result = await executeQuery(query, [this.id_clientes, limit, offset]);
      return result;
    } catch (error) {
      throw error;
    }
  }

  // Eliminar clientes
  async delete() {
    try {
      const query = 'DELETE FROM clientesS WHERE id_clientes = ?';
      await executeQuery(query, [this.id_clientes]);
      return true;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = clientes;
