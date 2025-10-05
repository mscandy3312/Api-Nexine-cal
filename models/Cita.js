const { executeQuery } = require('../config/database');

class Cita {
  constructor(data) {
    this.id_cita = data.id_cita;
    this.id_cliente = data.id_cliente;
    this.id_profesional = data.id_profesional;
    this.id_precio = data.id_precio;
    this.fecha = data.fecha;
    this.estado = data.estado || 'pendiente';
    this.motivo = data.motivo;
    this.notas = data.notas;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Crear nueva cita
  static async create(citaData) {
    try {
      const {
        id_cliente,
        id_profesional,
        id_precio,
        fecha,
        motivo,
        notas
      } = citaData;

      const query = `
        INSERT INTO CITAS (
          id_cliente, id_profesional, id_precio, fecha, motivo, notas
        ) VALUES (?, ?, ?, ?, ?, ?)
      `;

      const result = await executeQuery(query, [
        id_cliente,
        id_profesional,
        id_precio,
        fecha,
        motivo,
        notas
      ]);

      return await this.findById(result.insertId);
    } catch (error) {
      throw error;
    }
  }

  // Buscar cita por ID
  static async findById(id) {
    try {
      const query = `
        SELECT c.*, 
               cl.nombre_completo as cliente_nombre,
               p.nombre_completo as profesional_nombre,
               pr.nombre_paquete
        FROM CITAS c
        JOIN CLIENTES cl ON c.id_cliente = cl.id_cliente
        JOIN PROFESIONALES p ON c.id_profesional = p.id_profesional
        LEFT JOIN PRECIOS pr ON c.id_precio = pr.id_precio
        WHERE c.id_cita = ?
      `;
      const result = await executeQuery(query, [id]);
      return result.length > 0 ? new Cita(result[0]) : null;
    } catch (error) {
      throw error;
    }
  }

  // Obtener todas las citas
  static async findAll(limit = 50, offset = 0) {
    try {
      const query = `
        SELECT c.*, 
               cl.nombre_completo as cliente_nombre,
               p.nombre_completo as profesional_nombre,
               pr.nombre_paquete
        FROM CITAS c
        JOIN CLIENTES cl ON c.id_cliente = cl.id_cliente
        JOIN PROFESIONALES p ON c.id_profesional = p.id_profesional
        LEFT JOIN PRECIOS pr ON c.id_precio = pr.id_precio
        ORDER BY c.fecha DESC
        LIMIT ? OFFSET ?
      `;
      const result = await executeQuery(query, [limit, offset]);
      return result.map(cita => new Cita(cita));
    } catch (error) {
      throw error;
    }
  }

  // Buscar citas por cliente
  static async findByCliente(id_cliente, limit = 50, offset = 0) {
    try {
      const query = `
        SELECT c.*, 
               p.nombre_completo as profesional_nombre,
               pr.nombre_paquete
        FROM CITAS c
        JOIN PROFESIONALES p ON c.id_profesional = p.id_profesional
        LEFT JOIN PRECIOS pr ON c.id_precio = pr.id_precio
        WHERE c.id_cliente = ?
        ORDER BY c.fecha DESC
        LIMIT ? OFFSET ?
      `;
      const result = await executeQuery(query, [id_cliente, limit, offset]);
      return result.map(cita => new Cita(cita));
    } catch (error) {
      throw error;
    }
  }

  // Buscar citas por profesional
  static async findByProfesional(id_profesional, limit = 50, offset = 0) {
    try {
      const query = `
        SELECT c.*, 
               cl.nombre_completo as cliente_nombre,
               pr.nombre_paquete
        FROM CITAS c
        JOIN CLIENTES cl ON c.id_cliente = cl.id_cliente
        LEFT JOIN PRECIOS pr ON c.id_precio = pr.id_precio
        WHERE c.id_profesional = ?
        ORDER BY c.fecha DESC
        LIMIT ? OFFSET ?
      `;
      const result = await executeQuery(query, [id_profesional, limit, offset]);
      return result.map(cita => new Cita(cita));
    } catch (error) {
      throw error;
    }
  }

  // Buscar citas por estado
  static async findByEstado(estado, limit = 50, offset = 0) {
    try {
      const query = `
        SELECT c.*, 
               cl.nombre_completo as cliente_nombre,
               p.nombre_completo as profesional_nombre,
               pr.nombre_paquete
        FROM CITAS c
        JOIN CLIENTES cl ON c.id_cliente = cl.id_cliente
        JOIN PROFESIONALES p ON c.id_profesional = p.id_profesional
        LEFT JOIN PRECIOS pr ON c.id_precio = pr.id_precio
        WHERE c.estado = ?
        ORDER BY c.fecha DESC
        LIMIT ? OFFSET ?
      `;
      const result = await executeQuery(query, [estado, limit, offset]);
      return result.map(cita => new Cita(cita));
    } catch (error) {
      throw error;
    }
  }

  // Buscar citas por fecha
  static async findByFecha(fecha, limit = 50, offset = 0) {
    try {
      const query = `
        SELECT c.*, 
               cl.nombre_completo as cliente_nombre,
               p.nombre_completo as profesional_nombre,
               pr.nombre_paquete
        FROM CITAS c
        JOIN CLIENTES cl ON c.id_cliente = cl.id_cliente
        JOIN PROFESIONALES p ON c.id_profesional = p.id_profesional
        LEFT JOIN PRECIOS pr ON c.id_precio = pr.id_precio
        WHERE DATE(c.fecha) = ?
        ORDER BY c.fecha ASC
        LIMIT ? OFFSET ?
      `;
      const result = await executeQuery(query, [fecha, limit, offset]);
      return result.map(cita => new Cita(cita));
    } catch (error) {
      throw error;
    }
  }

  // Buscar citas por rango de fechas
  static async findByRangoFechas(fecha_inicio, fecha_fin, limit = 50, offset = 0) {
    try {
      const query = `
        SELECT c.*, 
               cl.nombre_completo as cliente_nombre,
               p.nombre_completo as profesional_nombre,
               pr.nombre_paquete
        FROM CITAS c
        JOIN CLIENTES cl ON c.id_cliente = cl.id_cliente
        JOIN PROFESIONALES p ON c.id_profesional = p.id_profesional
        LEFT JOIN PRECIOS pr ON c.id_precio = pr.id_precio
        WHERE DATE(c.fecha) BETWEEN ? AND ?
        ORDER BY c.fecha ASC
        LIMIT ? OFFSET ?
      `;
      const result = await executeQuery(query, [fecha_inicio, fecha_fin, limit, offset]);
      return result.map(cita => new Cita(cita));
    } catch (error) {
      throw error;
    }
  }

  // Buscar citas por criterios
  static async search(criteria, limit = 50, offset = 0) {
    try {
      let query = `
        SELECT c.*, 
               cl.nombre_completo as cliente_nombre,
               p.nombre_completo as profesional_nombre,
               pr.nombre_paquete
        FROM CITAS c
        JOIN CLIENTES cl ON c.id_cliente = cl.id_cliente
        JOIN PROFESIONALES p ON c.id_profesional = p.id_profesional
        LEFT JOIN PRECIOS pr ON c.id_precio = pr.id_precio
        WHERE 1=1
      `;
      const values = [];

      if (criteria.id_cliente) {
        query += ' AND c.id_cliente = ?';
        values.push(criteria.id_cliente);
      }

      if (criteria.id_profesional) {
        query += ' AND c.id_profesional = ?';
        values.push(criteria.id_profesional);
      }

      if (criteria.estado) {
        query += ' AND c.estado = ?';
        values.push(criteria.estado);
      }

      if (criteria.fecha_desde) {
        query += ' AND DATE(c.fecha) >= ?';
        values.push(criteria.fecha_desde);
      }

      if (criteria.fecha_hasta) {
        query += ' AND DATE(c.fecha) <= ?';
        values.push(criteria.fecha_hasta);
      }

      if (criteria.motivo) {
        query += ' AND c.motivo LIKE ?';
        values.push(`%${criteria.motivo}%`);
      }

      query += ' ORDER BY c.fecha DESC LIMIT ? OFFSET ?';
      values.push(limit, offset);

      const result = await executeQuery(query, values);
      return result.map(cita => new Cita(cita));
    } catch (error) {
      throw error;
    }
  }

  // Actualizar cita
  async update(updateData) {
    try {
      const allowedFields = [
        'id_cliente', 'id_profesional', 'id_precio', 'fecha',
        'estado', 'motivo', 'notas'
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

      values.push(this.id_cita);
      const query = `UPDATE CITAS SET ${updateFields.join(', ')} WHERE id_cita = ?`;
      
      await executeQuery(query, values);
      return await Cita.findById(this.id_cita);
    } catch (error) {
      throw error;
    }
  }

  // Cambiar estado de la cita
  async cambiarEstado(nuevoEstado) {
    try {
      const estadosValidos = ['pendiente', 'confirmada', 'cancelada', 'completada'];
      if (!estadosValidos.includes(nuevoEstado)) {
        throw new Error('Estado no válido');
      }

      const query = 'UPDATE CITAS SET estado = ? WHERE id_cita = ?';
      await executeQuery(query, [nuevoEstado, this.id_cita]);
      return await Cita.findById(this.id_cita);
    } catch (error) {
      throw error;
    }
  }

  // Obtener estadísticas de citas
  static async getStats(fecha_inicio = null, fecha_fin = null) {
    try {
      let query = `
        SELECT 
          COUNT(*) as total_citas,
          COUNT(CASE WHEN estado = 'pendiente' THEN 1 END) as citas_pendientes,
          COUNT(CASE WHEN estado = 'confirmada' THEN 1 END) as citas_confirmadas,
          COUNT(CASE WHEN estado = 'cancelada' THEN 1 END) as citas_canceladas,
          COUNT(CASE WHEN estado = 'completada' THEN 1 END) as citas_completadas
        FROM CITAS
      `;
      const values = [];

      if (fecha_inicio && fecha_fin) {
        query += ' WHERE DATE(fecha) BETWEEN ? AND ?';
        values.push(fecha_inicio, fecha_fin);
      }

      const result = await executeQuery(query, values);
      return result[0];
    } catch (error) {
      throw error;
    }
  }

  // Eliminar cita
  async delete() {
    try {
      const query = 'DELETE FROM CITAS WHERE id_cita = ?';
      await executeQuery(query, [this.id_cita]);
      return true;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Cita;
