const { executeQuery } = require('../config/database');

class Cliente {
  constructor(data) {
    this.id_cliente = data.id_cliente;
    this.id_usuario = data.id_usuario;
    this.nombre_completo = data.nombre_completo;
    this.telefono = data.telefono;
    this.nombre_usuario = data.nombre_usuario;
    this.ciudad = data.ciudad;
    this.codigo_postal = data.codigo_postal;
    this.ingreso = data.ingreso;
    this.estado = data.estado;
  }

  // Crear nuevo cliente
  static async create(clienteData) {
    try {
      const {
        id_usuario,
        nombre_completo,
        telefono,
        nombre_usuario,
        ciudad,
        codigo_postal,
        ingreso,
        estado
      } = clienteData;

      const query = `
        INSERT INTO CLIENTES (
          id_usuario, nombre_completo, telefono, nombre_usuario,
          ciudad, codigo_postal, ingreso, estado
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const result = await executeQuery(query, [
        id_usuario,
        nombre_completo,
        telefono,
        nombre_usuario,
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

  // Buscar cliente por ID
  static async findById(id) {
    try {
      const query = `
        SELECT c.*, u.email, u.nombre, u.is_verified
        FROM CLIENTES c
        JOIN USUARIOS u ON c.id_usuario = u.id_usuario
        WHERE c.id_cliente = ?
      `;
      const result = await executeQuery(query, [id]);
      return result.length > 0 ? new Cliente(result[0]) : null;
    } catch (error) {
      throw error;
    }
  }

  // Buscar cliente por ID de usuario
  static async findByUserId(userId) {
    try {
      const query = `
        SELECT c.*, u.email, u.nombre, u.is_verified
        FROM CLIENTES c
        JOIN USUARIOS u ON c.id_usuario = u.id_usuario
        WHERE c.id_usuario = ?
      `;
      const result = await executeQuery(query, [userId]);
      return result.length > 0 ? new Cliente(result[0]) : null;
    } catch (error) {
      throw error;
    }
  }

  // Buscar cliente por nombre de usuario
  static async findByUsername(username) {
    try {
      const query = `
        SELECT c.*, u.email, u.nombre, u.is_verified
        FROM CLIENTES c
        JOIN USUARIOS u ON c.id_usuario = u.id_usuario
        WHERE c.nombre_usuario = ?
      `;
      const result = await executeQuery(query, [username]);
      return result.length > 0 ? new Cliente(result[0]) : null;
    } catch (error) {
      throw error;
    }
  }

  // Obtener todos los clientes
  static async findAll(limit = 50, offset = 0) {
    try {
      const query = `
        SELECT c.*, u.email, u.nombre, u.is_verified
        FROM CLIENTES c
        JOIN USUARIOS u ON c.id_usuario = u.id_usuario
        ORDER BY c.id_cliente DESC
        LIMIT ? OFFSET ?
      `;
      const result = await executeQuery(query, [limit, offset]);
      return result.map(cliente => new Cliente(result[0]));
    } catch (error) {
      throw error;
    }
  }

  // Buscar clientes por criterios
  static async search(criteria, limit = 50, offset = 0) {
    try {
      let query = `
        SELECT c.*, u.email, u.nombre, u.is_verified
        FROM CLIENTES c
        JOIN USUARIOS u ON c.id_usuario = u.id_usuario
        WHERE 1=1
      `;
      const values = [];

      if (criteria.nombre_completo) {
        query += ' AND c.nombre_completo LIKE ?';
        values.push(`%${criteria.nombre_completo}%`);
      }

      if (criteria.nombre_usuario) {
        query += ' AND c.nombre_usuario LIKE ?';
        values.push(`%${criteria.nombre_usuario}%`);
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

      query += ' ORDER BY c.id_cliente DESC LIMIT ? OFFSET ?';
      values.push(limit, offset);

      const result = await executeQuery(query, values);
      return result.map(cliente => new Cliente(cliente));
    } catch (error) {
      throw error;
    }
  }

  // Actualizar cliente
  async update(updateData) {
    try {
      const allowedFields = [
        'nombre_completo', 'telefono', 'nombre_usuario', 'ciudad',
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

      values.push(this.id_cliente);
      const query = `UPDATE CLIENTES SET ${updateFields.join(', ')} WHERE id_cliente = ?`;
      
      await executeQuery(query, values);
      return await Cliente.findById(this.id_cliente);
    } catch (error) {
      throw error;
    }
  }

  // Obtener estadísticas del cliente
  async getStats() {
    try {
      const statsQuery = `
        SELECT 
          COUNT(DISTINCT s.id_sesion) as total_sesiones,
          COUNT(DISTINCT c.id_cita) as total_citas,
          SUM(CASE WHEN s.estado = 'completada' THEN 1 ELSE 0 END) as sesiones_completadas,
          SUM(CASE WHEN c.estado = 'completada' THEN 1 ELSE 0 END) as citas_completadas
        FROM CLIENTES cl
        LEFT JOIN SESIONES s ON cl.id_cliente = s.id_cliente
        LEFT JOIN CITAS c ON cl.id_cliente = c.id_cliente
        WHERE cl.id_cliente = ?
      `;
      
      const result = await executeQuery(statsQuery, [this.id_cliente]);
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
        WHERE s.id_cliente = ?
        ORDER BY s.fecha DESC
        LIMIT ? OFFSET ?
      `;
      
      const result = await executeQuery(query, [this.id_cliente, limit, offset]);
      return result;
    } catch (error) {
      throw error;
    }
  }

  // Obtener historial de citas
  async getCitas(limit = 20, offset = 0) {
    try {
      const query = `
        SELECT c.*, p.nombre_completo as profesional_nombre, pr.nombre_paquete
        FROM CITAS c
        JOIN PROFESIONALES p ON c.id_profesional = p.id_profesional
        LEFT JOIN PRECIOS pr ON c.id_precio = pr.id_precio
        WHERE c.id_cliente = ?
        ORDER BY c.fecha DESC
        LIMIT ? OFFSET ?
      `;
      
      const result = await executeQuery(query, [this.id_cliente, limit, offset]);
      return result;
    } catch (error) {
      throw error;
    }
  }

  // Eliminar cliente
  async delete() {
    try {
      const query = 'DELETE FROM CLIENTES WHERE id_cliente = ?';
      await executeQuery(query, [this.id_cliente]);
      return true;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Cliente;
