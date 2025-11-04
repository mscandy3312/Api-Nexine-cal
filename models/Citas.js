const { executeQuery } = require('../config/database');

class citas {
  constructor(data) {
    this.id_citas = data.id_citas;
    this.id_clientes = data.id_clientes;
    this.id_profesional = data.id_profesional;
    this.fecha_inicio = data.fecha_inicio;
    this.fecha_fin = data.fecha_fin;
    this.duracion = data.duracion;
    this.tipo_citas = data.tipo_citas || 'presencial';
    this.estado = data.estado || 'pendiente';
    this.notas = data.notas;
    this.id_pago = data.id_pago;
    this.fecha_creacion = data.fecha_creacion;
    this.fecha_actualizacion = data.fecha_actualizacion;
  }

  // Crear nueva citas
  static async create(citasData) {
    try {
      const {
        id_clientes,
        id_profesional,
        fecha_inicio,
        fecha_fin,
        tipo_citas,
        notas,
        id_pago
      } = citasData;

      const query = `
        INSERT INTO citasS (
          id_clientes, id_profesional, fecha_inicio, fecha_fin, tipo_citas, notas, id_pago
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

      const result = await executeQuery(query, [
        id_clientes,
        id_profesional,
        fecha_inicio,
        fecha_fin,
        tipo_citas,
        notas,
        id_pago
      ]);

      return await this.findById(result.insertId);
    } catch (error) {
      throw error;
    }
  }

  // Buscar citas por ID
  static async findById(id) {
    try {
      const query = `
        SELECT c.*, 
               cl.nombre_completo as clientes_nombre,
               p.nombre_completo as profesional_nombre,
               pa.monto as pago_monto,
               pa.estado as pago_estado
        FROM citasS c
        JOIN clientesS cl ON c.id_clientes = cl.id_clientes
        JOIN PROFESIONALES p ON c.id_profesional = p.id_profesional
        LEFT JOIN PAGOS pa ON c.id_pago = pa.id_pago
        WHERE c.id_citas = ?
      `;
      const result = await executeQuery(query, [id]);
      return result.length > 0 ? new citas(result[0]) : null;
    } catch (error) {
      throw error;
    }
  }

  // Obtener todas las citass
  static async findAll(limit = 50, offset = 0) {
    try {
      const query = `
        SELECT c.*, 
               cl.nombre_completo as clientes_nombre,
               p.nombre_completo as profesional_nombre,
               pa.monto as pago_monto,
               pa.estado as pago_estado
        FROM citasS c
        JOIN clientesS cl ON c.id_clientes = cl.id_clientes
        JOIN PROFESIONALES p ON c.id_profesional = p.id_profesional
        LEFT JOIN PAGOS pa ON c.id_pago = pa.id_pago
        ORDER BY c.fecha_inicio DESC
        LIMIT ? OFFSET ?
      `;
      const result = await executeQuery(query, [limit, offset]);
      return result.map(citas => new citas(citas));
    } catch (error) {
      throw error;
    }
  }

  // Buscar citass por clientes
  static async findByclientes(id_clientes, limit = 50, offset = 0) {
    try {
      const query = `
        SELECT c.*, 
               p.nombre_completo as profesional_nombre,
               pa.monto as pago_monto,
               pa.estado as pago_estado
        FROM citasS c
        JOIN PROFESIONALES p ON c.id_profesional = p.id_profesional
        LEFT JOIN PAGOS pa ON c.id_pago = pa.id_pago
        WHERE c.id_clientes = ?
        ORDER BY c.fecha_inicio DESC
        LIMIT ? OFFSET ?
      `;
      const result = await executeQuery(query, [id_clientes, limit, offset]);
      return result.map(citas => new citas(citas));
    } catch (error) {
      throw error;
    }
  }

  // Buscar citass por profesional
  static async findByProfesional(id_profesional, limit = 50, offset = 0) {
    try {
      const query = `
        SELECT c.*, 
               cl.nombre_completo as clientes_nombre,
               pa.monto as pago_monto,
               pa.estado as pago_estado
        FROM citasS c
        JOIN clientesS cl ON c.id_clientes = cl.id_clientes
        LEFT JOIN PAGOS pa ON c.id_pago = pa.id_pago
        WHERE c.id_profesional = ?
        ORDER BY c.fecha_inicio DESC
        LIMIT ? OFFSET ?
      `;
      const result = await executeQuery(query, [id_profesional, limit, offset]);
      return result.map(citas => new citas(citas));
    } catch (error) {
      throw error;
    }
  }

  // Buscar citass por estado
  static async findByEstado(estado, limit = 50, offset = 0) {
    try {
      const query = `
        SELECT c.*, 
               cl.nombre_completo as clientes_nombre,
               p.nombre_completo as profesional_nombre,
               pa.monto as pago_monto,
               pa.estado as pago_estado
        FROM citasS c
        JOIN clientesS cl ON c.id_clientes = cl.id_clientes
        JOIN PROFESIONALES p ON c.id_profesional = p.id_profesional
        LEFT JOIN PAGOS pa ON c.id_pago = pa.id_pago
        WHERE c.estado = ?
        ORDER BY c.fecha_inicio DESC
        LIMIT ? OFFSET ?
      `;
      const result = await executeQuery(query, [estado, limit, offset]);
      return result.map(citas => new citas(citas));
    } catch (error) {
      throw error;
    }
  }

  // Buscar citass por fecha
  static async findByFecha(fecha, limit = 50, offset = 0) {
    try {
      const query = `
        SELECT c.*, 
               cl.nombre_completo as clientes_nombre,
               p.nombre_completo as profesional_nombre,
               pa.monto as pago_monto,
               pa.estado as pago_estado
        FROM citasS c
        JOIN clientesS cl ON c.id_clientes = cl.id_clientes
        JOIN PROFESIONALES p ON c.id_profesional = p.id_profesional
        LEFT JOIN PAGOS pa ON c.id_pago = pa.id_pago
        WHERE DATE(c.fecha_inicio) = ?
        ORDER BY c.fecha_inicio ASC
        LIMIT ? OFFSET ?
      `;
      const result = await executeQuery(query, [fecha, limit, offset]);
      return result.map(citas => new citas(citas));
    } catch (error) {
      throw error;
    }
  }

  // Buscar citass por rango de fechas
  static async findByRangoFechas(fecha_inicio, fecha_fin, limit = 50, offset = 0) {
    try {
      const query = `
        SELECT c.*, 
               cl.nombre_completo as clientes_nombre,
               p.nombre_completo as profesional_nombre,
               pa.monto as pago_monto,
               pa.estado as pago_estado
        FROM citasS c
        JOIN clientesS cl ON c.id_clientes = cl.id_clientes
        JOIN PROFESIONALES p ON c.id_profesional = p.id_profesional
        LEFT JOIN PAGOS pa ON c.id_pago = pa.id_pago
        WHERE DATE(c.fecha_inicio) BETWEEN ? AND ?
        ORDER BY c.fecha_inicio ASC
        LIMIT ? OFFSET ?
      `;
      const result = await executeQuery(query, [fecha_inicio, fecha_fin, limit, offset]);
      return result.map(citas => new citas(citas));
    } catch (error) {
      throw error;
    }
  }

  // Buscar citass por criterios
  static async search(criteria, limit = 50, offset = 0) {
    try {
      let query = `
        SELECT c.*, 
               cl.nombre_completo as clientes_nombre,
               p.nombre_completo as profesional_nombre,
               pa.monto as pago_monto,
               pa.estado as pago_estado
        FROM citasS c
        JOIN clientesS cl ON c.id_clientes = cl.id_clientes
        JOIN PROFESIONALES p ON c.id_profesional = p.id_profesional
        LEFT JOIN PAGOS pa ON c.id_pago = pa.id_pago
        WHERE 1=1
      `;
      const values = [];

      if (criteria.id_clientes) {
        query += ' AND c.id_clientes = ?';
        values.push(criteria.id_clientes);
      }

      if (criteria.id_profesional) {
        query += ' AND c.id_profesional = ?';
        values.push(criteria.id_profesional);
      }

      if (criteria.estado) {
        query += ' AND c.estado = ?';
        values.push(criteria.estado);
      }

      if (criteria.tipo_citas) {
        query += ' AND c.tipo_citas = ?';
        values.push(criteria.tipo_citas);
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
      return result.map(citas => new citas(citas));
    } catch (error) {
      throw error;
    }
  }

  // Actualizar citas
  async update(updateData) {
    try {
      const allowedFields = [
        'id_clientes', 'id_profesional', 'fecha_inicio', 'fecha_fin',
        'tipo_citas', 'estado', 'notas', 'id_pago'
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

      values.push(this.id_citas);
      const query = `UPDATE citasS SET ${updateFields.join(', ')} WHERE id_citas = ?`;
      
      await executeQuery(query, values);
      return await citas.findById(this.id_citas);
    } catch (error) {
      throw error;
    }
  }

  // Cambiar estado de la citas
  async cambiarEstado(nuevoEstado) {
    try {
      const estadosValidos = ['pendiente', 'confirmada', 'cancelada', 'finalizada'];
      if (!estadosValidos.includes(nuevoEstado)) {
        throw new Error('Estado no válido');
      }

      const query = 'UPDATE citasS SET estado = ? WHERE id_citas = ?';
      await executeQuery(query, [nuevoEstado, this.id_citas]);
      return await citas.findById(this.id_citas);
    } catch (error) {
      throw error;
    }
  }

  // Obtener estadísticas de citass
  static async getStats(fecha_inicio = null, fecha_fin = null) {
    try {
      let query = `
        SELECT 
          COUNT(*) as total_citass,
          COUNT(CASE WHEN estado = 'pendiente' THEN 1 END) as citass_pendientes,
          COUNT(CASE WHEN estado = 'confirmada' THEN 1 END) as citass_confirmadas,
          COUNT(CASE WHEN estado = 'cancelada' THEN 1 END) as citass_canceladas,
          COUNT(CASE WHEN estado = 'finalizada' THEN 1 END) as citass_finalizadas,
          COUNT(CASE WHEN tipo_citas = 'presencial' THEN 1 END) as citass_presenciales,
          COUNT(CASE WHEN tipo_citas = 'virtual' THEN 1 END) as citass_virtuales,
          COUNT(CASE WHEN tipo_citas = 'ambas' THEN 1 END) as citass_mixtas
        FROM citasS
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

  // Eliminar citas
  async delete() {
    try {
      const query = 'DELETE FROM citasS WHERE id_citas = ?';
      await executeQuery(query, [this.id_citas]);
      return true;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = citas;
