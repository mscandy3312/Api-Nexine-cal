// --- [MODELO] models/Clientes.js ¡CARGADO CORRECTAMENTE! ---
console.log('--- [MODELO] models/Clientes.js ¡CARGADO CORRECTAMENTE! ---');

// --- ¡CORREGIDO! ---
// Importamos el 'pool' de conexiones
const pool = require('../config/database');

// --- ¡CORREGIDO! ---
// Nombre de la clase en singular y mayúscula (convención)
class Cliente {
  constructor(data) {
    // --- ¡CORREGIDO! ---
    // Propiedades ajustadas a la tabla `clientes` de dbnaxine (la que usa App.js)
    this.id_cliente = data.id_cliente;
    this.id_usuario = data.id_usuario;
    this.nombre_completo = data.nombre_completo;
    this.telefono = data.telefono;
    this.email = data.email;
    this.fecha_nacimiento = data.fecha_nacimiento;
    this.historial_medico = data.historial_medico;

    // Campos de JOIN (de la tabla usuarios)
    this.email_usuario = data.email_usuario;
    this.nombre_usuario = data.nombre_usuario; // Nombre de la tabla usuarios
    this.is_verified = data.is_verified;
  }

  // Crear nuevo cliente
  static async create(clienteData) {
    try {
      // --- ¡CORREGIDO! ---
      // Campos ajustados al schema real
      const {
        id_usuario,
        nombre_completo,
        telefono,
        email,
        fecha_nacimiento,
        historial_medico
      } = clienteData;

      const query = `
        INSERT INTO clientes (
          id_usuario, nombre_completo, telefono, email, 
          fecha_nacimiento, historial_medico
        ) VALUES (?, ?, ?, ?, ?, ?)
      `;

      // --- ¡CORREGIDO! --- (pool.query)
      const [result] = await pool.query(query, [
        id_usuario,
        nombre_completo,
        telefono,
        email,
        fecha_nacimiento,
        historial_medico
      ]);

      return await this.findById(result.insertId);
    } catch (error) {
      throw error;
    }
  }

  // Buscar cliente por ID (id_cliente)
  static async findById(id) {
    try {
      const query = `
        SELECT c.*, u.email as email_usuario, u.nombre as nombre_usuario, u.is_verified
        FROM clientes c
        JOIN usuarios u ON c.id_usuario = u.id_usuario
        WHERE c.id_cliente = ?
      `;
      // --- ¡CORREGIDO! --- (pool.query)
      const [result] = await pool.query(query, [id]);
      return result.length > 0 ? new Cliente(result[0]) : null;
    } catch (error) {
      throw error;
    }
  }

  // Buscar cliente por ID de usuario (id_usuario)
  static async findByUserId(userId) {
    try {
      const query = `
        SELECT c.*, u.email as email_usuario, u.nombre as nombre_usuario, u.is_verified
        FROM clientes c
        JOIN usuarios u ON c.id_usuario = u.id_usuario
        WHERE c.id_usuario = ?
      `;
      // --- ¡CORREGIDO! --- (pool.query)
      const [result] = await pool.query(query, [userId]);
      return result.length > 0 ? new Cliente(result[0]) : null;
    } catch (error) {
      throw error;
    }
  }

  // Obtener todos los clientes
  static async findAll(limit = 50, offset = 0) {
    try {
      const query = `
        SELECT c.*, u.email as email_usuario, u.nombre as nombre_usuario, u.is_verified
        FROM clientes c
        JOIN usuarios u ON c.id_usuario = u.id_usuario
        ORDER BY c.id_cliente DESC
        LIMIT ? OFFSET ?
      `;
      // --- ¡CORREGIDO! --- (pool.query)
      const [result] = await pool.query(query, [limit, offset]);
      return result.map(cliente => new Cliente(cliente));
    } catch (error) {
      throw error;
    }
  }

  // Buscar clientes por criterios
  static async search(criteria, limit = 50, offset = 0) {
    try {
      let query = `
        SELECT c.*, u.email as email_usuario, u.nombre as nombre_usuario, u.is_verified
        FROM clientes c
        JOIN usuarios u ON c.id_usuario = u.id_usuario
        WHERE 1=1
      `;
      const values = [];

      // --- ¡CORREGIDO! --- (Criterios ajustados)
      if (criteria.nombre_completo) {
        query += ' AND c.nombre_completo LIKE ?';
        values.push(`%${criteria.nombre_completo}%`);
      }

      if (criteria.email) {
        query += ' AND c.email LIKE ?';
        values.push(`%${criteria.email}%`);
      }
      
      if (criteria.telefono) {
        query += ' AND c.telefono = ?';
        values.push(criteria.telefono);
      }

      query += ' ORDER BY c.id_cliente DESC LIMIT ? OFFSET ?';
      values.push(limit, offset);

      // --- ¡CORREGIDO! --- (pool.query)
      const [result] = await pool.query(query, values);
      return result.map(cliente => new Cliente(cliente));
    } catch (error) {
      throw error;
    }
  }

  // Actualizar cliente
  async update(updateData) {
    try {
      // --- ¡CORREGIDO! --- (Campos permitidos ajustados)
      const allowedFields = [
        'nombre_completo', 'telefono', 'email', 
        'fecha_nacimiento', 'historial_medico'
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
        // No hay nada que actualizar
        return this;
      }

      values.push(this.id_cliente);
      const query = `UPDATE clientes SET ${updateFields.join(', ')} WHERE id_cliente = ?`;
      
      // --- ¡CORREGIDO! --- (pool.query)
      await pool.query(query, values);
      return await Cliente.findById(this.id_cliente);
    } catch (error) {
      throw error;
    }
  }

  // Obtener estadísticas del cliente
  async getStats() {
    try {
      // --- ¡CORREGIDO! --- (Nombres de tablas: sesiones, citas)
      const statsQuery = `
        SELECT 
          COUNT(DISTINCT s.id_sesion) as total_sesiones,
          COUNT(DISTINCT c.id_cita) as total_citas,
          SUM(CASE WHEN s.estado = 'completada' THEN 1 ELSE 0 END) as sesiones_completadas,
          SUM(CASE WHEN c.estado = 'completada' THEN 1 ELSE 0 END) as citas_completadas
        FROM clientes cl
        LEFT JOIN sesiones s ON cl.id_cliente = s.id_cliente
        LEFT JOIN citas c ON cl.id_cliente = c.id_cliente
        WHERE cl.id_cliente = ?
      `;
      
      // --- ¡CORREGIDO! --- (pool.query)
      const [result] = await pool.query(statsQuery, [this.id_cliente]);
      return result[0];
    } catch (error) {
      throw error;
    }
  }

  // Obtener historial de sesiones
  async getSesiones(limit = 20, offset = 0) {
    try {
      // --- ¡CORREGIDO! --- (Nombres de tablas: sesiones, profesionales, precios)
      const query = `
        SELECT s.*, p.nombre_completo as profesional_nombre
        FROM sesiones s
        JOIN profesionales p ON s.id_profesional = p.id_profesional
        WHERE s.id_cliente = ?
        ORDER BY s.fecha_sesion DESC
        LIMIT ? OFFSET ?
      `;
      
      // --- ¡CORREGIDO! --- (pool.query)
      const [result] = await pool.query(query, [this.id_cliente, limit, offset]);
      return result;
    } catch (error) {
      throw error;
    }
  }

  // Obtener historial de citas
  async getCitas(limit = 20, offset = 0) {
    try {
      // --- ¡CORREGIDO! --- (Nombres de tablas: citas, profesionales)
      const query = `
        SELECT c.*, p.nombre_completo as profesional_nombre
        FROM citas c
        JOIN profesionales p ON c.id_profesional = p.id_profesional
        WHERE c.id_cliente = ?
        ORDER BY c.fecha_inicio DESC
        LIMIT ? OFFSET ?
      `;
      
      // --- ¡CORREGIDO! --- (pool.query)
      const [result] = await pool.query(query, [this.id_cliente, limit, offset]);
      return result;
    } catch (error) {
      throw error;
    }
  }

  // Eliminar cliente
  async delete() {
    try {
      const query = 'DELETE FROM clientes WHERE id_cliente = ?';
      // --- ¡CORREGIDO! --- (pool.query)
      await pool.query(query, [this.id_cliente]);
      return true;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Cliente;
