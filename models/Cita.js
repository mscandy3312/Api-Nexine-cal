const { executeQuery } = require('../config/database');

class Cita {
  constructor(data) {
    this.id_cita = data.id_cita;
    this.id_cliente = data.id_cliente;
    this.id_profesional = data.id_profesional;
    this.fecha_inicio = data.fecha_inicio;
    this.fecha_fin = data.fecha_fin;
    this.duracion = data.duracion;
    this.tipo_cita = data.tipo_cita || 'presencial';
    this.estado = data.estado || 'pendiente';
    this.notas = data.notas;
    this.id_pago = data.id_pago;
    this.fecha_creacion = data.fecha_creacion;
    this.fecha_actualizacion = data.fecha_actualizacion;
  }

  // Crear nueva cita
  static async create(citaData) {
    try {
      const {
        id_cliente,
        id_profesional,
        fecha_inicio,
        fecha_fin,
        tipo_cita,
        notas,
        id_pago
      } = citaData;

      const query = `
        INSERT INTO CITAS (
          id_cliente, id_profesional, fecha_inicio, fecha_fin, tipo_cita, notas, id_pago
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

      const result = await executeQuery(query, [
        id_cliente,
        id_profesional,
        fecha_inicio,
        fecha_fin,
        tipo_cita,
        notas,
        id_pago
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
               pa.monto as pago_monto,
               pa.estado as pago_estado
        FROM CITAS c
        JOIN CLIENTES cl ON c.id_cliente = cl.id_cliente
        JOIN PROFESIONALES p ON c.id_profesional = p.id_profesional
        LEFT JOIN PAGOS pa ON c.id_pago = pa.id_pago
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
               pa.monto as pago_monto,
               pa.estado as pago_estado
        FROM CITAS c
        JOIN CLIENTES cl ON c.id_cliente = cl.id_cliente
        JOIN PROFESIONALES p ON c.id_profesional = p.id_profesional
        LEFT JOIN PAGOS pa ON c.id_pago = pa.id_pago
        ORDER BY c.fecha_inicio DESC
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
               pa.monto as pago_monto,
               pa.estado as pago_estado
        FROM CITAS c
        JOIN PROFESIONALES p ON c.id_profesional = p.id_profesional
        LEFT JOIN PAGOS pa ON c.id_pago = pa.id_pago
        WHERE c.id_cliente = ?
        ORDER BY c.fecha_inicio DESC
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
               pa.monto as pago_monto,
               pa.estado as pago_estado
        FROM CITAS c
        JOIN CLIENTES cl ON c.id_cliente = cl.id_cliente
        LEFT JOIN PAGOS pa ON c.id_pago = pa.id_pago
        WHERE c.id_profesional = ?
        ORDER BY c.fecha_inicio DESC
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
               pa.monto as pago_monto,
               pa.estado as pago_estado
        FROM CITAS c
        JOIN CLIENTES cl ON c.id_cliente = cl.id_cliente
        JOIN PROFESIONALES p ON c.id_profesional = p.id_profesional
        LEFT JOIN PAGOS pa ON c.id_pago = pa.id_pago
        WHERE c.estado = ?
        ORDER BY c.fecha_inicio DESC
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
               pa.monto as pago_monto,
               pa.estado as pago_estado
        FROM CITAS c
        JOIN CLIENTES cl ON c.id_cliente = cl.id_cliente
        JOIN PROFESIONALES p ON c.id_profesional = p.id_profesional
        LEFT JOIN PAGOS pa ON c.id_pago = pa.id_pago
        WHERE DATE(c.fecha_inicio) = ?
        ORDER BY c.fecha_inicio ASC
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
               pa.monto as pago_monto,
               pa.estado as pago_estado
        FROM CITAS c
        JOIN CLIENTES cl ON c.id_cliente = cl.id_cliente
        JOIN PROFESIONALES p ON c.id_profesional = p.id_profesional
        LEFT JOIN PAGOS pa ON c.id_pago = pa.id_pago
        WHERE DATE(c.fecha_inicio) BETWEEN ? AND ?
        ORDER BY c.fecha_inicio ASC
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
               pa.monto as pago_monto,
               pa.estado as pago_estado
        FROM CITAS c
        JOIN CLIENTES cl ON c.id_cliente = cl.id_cliente
        JOIN PROFESIONALES p ON c.id_profesional = p.id_profesional
        LEFT JOIN PAGOS pa ON c.id_pago = pa.id_pago
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

      if (criteria.tipo_cita) {
        query += ' AND c.tipo_cita = ?';
        values.push(criteria.tipo_cita);
      }

      if (criteria.fecha_desde) {
        query += ' AND DATE(c.fecha_inicio) >= ?';
        values.push(criteria.fecha_desde);
      }

      if (criteria.fecha_hasta) {
        query += ' AND DATE(c.fecha_inicio) <= ?';
        values.push(criteria.fecha_hasta);
      }

      if (criteria.notas) {
        query += ' AND c.notas LIKE ?';
        values.push(`%${criteria.notas}%`);
      }

      query += ' ORDER BY c.fecha_inicio DESC LIMIT ? OFFSET ?';
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
        'id_cliente', 'id_profesional', 'fecha_inicio', 'fecha_fin',
        'tipo_cita', 'estado', 'notas', 'id_pago'
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
      const estadosValidos = ['pendiente', 'confirmada', 'cancelada', 'finalizada'];
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
          COUNT(CASE WHEN estado = 'finalizada' THEN 1 END) as citas_finalizadas,
          COUNT(CASE WHEN tipo_cita = 'presencial' THEN 1 END) as citas_presenciales,
          COUNT(CASE WHEN tipo_cita = 'virtual' THEN 1 END) as citas_virtuales,
          COUNT(CASE WHEN tipo_cita = 'ambas' THEN 1 END) as citas_mixtas
        FROM CITAS
      `;
      const values = [];

      if (fecha_inicio && fecha_fin) {
        query += ' WHERE DATE(fecha_inicio) BETWEEN ? AND ?';
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
