const { executeQuery } = require('../config/database');

class Pago {
  constructor(data) {
    this.id_pago = data.id_pago;
    this.id_profesional = data.id_profesional;
    this.balance_general = data.balance_general || 0;
    this.ventas = data.ventas || 0;
    this.comision = data.comision || 0;
    this.fecha = data.fecha;
    this.especialidad = data.especialidad;
    this.estado = data.estado;
    this.accion = data.accion;
  }

  // Crear nuevo pago
  static async create(pagoData) {
    try {
      const {
        id_profesional,
        balance_general,
        ventas,
        comision,
        fecha,
        especialidad,
        estado,
        accion
      } = pagoData;

      const query = `
        INSERT INTO PAGOS (
          id_profesional, balance_general, ventas, comision, fecha, especialidad, estado, accion
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const result = await executeQuery(query, [
        id_profesional,
        balance_general,
        ventas,
        comision,
        fecha,
        especialidad,
        estado,
        accion
      ]);

      return await this.findById(result.insertId);
    } catch (error) {
      throw error;
    }
  }

  // Buscar pago por ID
  static async findById(id) {
    try {
      const query = `
        SELECT p.*, pr.nombre_completo as profesional_nombre
        FROM PAGOS p
        JOIN PROFESIONALES pr ON p.id_profesional = pr.id_profesional
        WHERE p.id_pago = ?
      `;
      const result = await executeQuery(query, [id]);
      return result.length > 0 ? new Pago(result[0]) : null;
    } catch (error) {
      throw error;
    }
  }

  // Obtener todos los pagos
  static async findAll(limit = 50, offset = 0) {
    try {
      const query = `
        SELECT p.*, pr.nombre_completo as profesional_nombre
        FROM PAGOS p
        JOIN PROFESIONALES pr ON p.id_profesional = pr.id_profesional
        ORDER BY p.fecha DESC
        LIMIT ? OFFSET ?
      `;
      const result = await executeQuery(query, [limit, offset]);
      return result.map(pago => new Pago(pago));
    } catch (error) {
      throw error;
    }
  }

  // Buscar pagos por profesional
  static async findByProfesional(id_profesional, limit = 50, offset = 0) {
    try {
      const query = `
        SELECT p.*, pr.nombre_completo as profesional_nombre
        FROM PAGOS p
        JOIN PROFESIONALES pr ON p.id_profesional = pr.id_profesional
        WHERE p.id_profesional = ?
        ORDER BY p.fecha DESC
        LIMIT ? OFFSET ?
      `;
      const result = await executeQuery(query, [id_profesional, limit, offset]);
      return result.map(pago => new Pago(pago));
    } catch (error) {
      throw error;
    }
  }

  // Buscar pagos por estado
  static async findByEstado(estado, limit = 50, offset = 0) {
    try {
      const query = `
        SELECT p.*, pr.nombre_completo as profesional_nombre
        FROM PAGOS p
        JOIN PROFESIONALES pr ON p.id_profesional = pr.id_profesional
        WHERE p.estado = ?
        ORDER BY p.fecha DESC
        LIMIT ? OFFSET ?
      `;
      const result = await executeQuery(query, [estado, limit, offset]);
      return result.map(pago => new Pago(pago));
    } catch (error) {
      throw error;
    }
  }

  // Buscar pagos por especialidad
  static async findByEspecialidad(especialidad, limit = 50, offset = 0) {
    try {
      const query = `
        SELECT p.*, pr.nombre_completo as profesional_nombre
        FROM PAGOS p
        JOIN PROFESIONALES pr ON p.id_profesional = pr.id_profesional
        WHERE p.especialidad = ?
        ORDER BY p.fecha DESC
        LIMIT ? OFFSET ?
      `;
      const result = await executeQuery(query, [especialidad, limit, offset]);
      return result.map(pago => new Pago(pago));
    } catch (error) {
      throw error;
    }
  }

  // Buscar pagos por fecha
  static async findByFecha(fecha, limit = 50, offset = 0) {
    try {
      const query = `
        SELECT p.*, pr.nombre_completo as profesional_nombre
        FROM PAGOS p
        JOIN PROFESIONALES pr ON p.id_profesional = pr.id_profesional
        WHERE DATE(p.fecha) = ?
        ORDER BY p.fecha DESC
        LIMIT ? OFFSET ?
      `;
      const result = await executeQuery(query, [fecha, limit, offset]);
      return result.map(pago => new Pago(pago));
    } catch (error) {
      throw error;
    }
  }

  // Buscar pagos por rango de fechas
  static async findByRangoFechas(fecha_inicio, fecha_fin, limit = 50, offset = 0) {
    try {
      const query = `
        SELECT p.*, pr.nombre_completo as profesional_nombre
        FROM PAGOS p
        JOIN PROFESIONALES pr ON p.id_profesional = pr.id_profesional
        WHERE DATE(p.fecha) BETWEEN ? AND ?
        ORDER BY p.fecha DESC
        LIMIT ? OFFSET ?
      `;
      const result = await executeQuery(query, [fecha_inicio, fecha_fin, limit, offset]);
      return result.map(pago => new Pago(pago));
    } catch (error) {
      throw error;
    }
  }

  // Buscar pagos por criterios
  static async search(criteria, limit = 50, offset = 0) {
    try {
      let query = `
        SELECT p.*, pr.nombre_completo as profesional_nombre
        FROM PAGOS p
        JOIN PROFESIONALES pr ON p.id_profesional = pr.id_profesional
        WHERE 1=1
      `;
      const values = [];

      if (criteria.id_profesional) {
        query += ' AND p.id_profesional = ?';
        values.push(criteria.id_profesional);
      }

      if (criteria.estado) {
        query += ' AND p.estado = ?';
        values.push(criteria.estado);
      }

      if (criteria.especialidad) {
        query += ' AND p.especialidad = ?';
        values.push(criteria.especialidad);
      }

      if (criteria.accion) {
        query += ' AND p.accion = ?';
        values.push(criteria.accion);
      }

      if (criteria.fecha_desde) {
        query += ' AND DATE(p.fecha) >= ?';
        values.push(criteria.fecha_desde);
      }

      if (criteria.fecha_hasta) {
        query += ' AND DATE(p.fecha) <= ?';
        values.push(criteria.fecha_hasta);
      }

      if (criteria.ventas_min) {
        query += ' AND p.ventas >= ?';
        values.push(criteria.ventas_min);
      }

      if (criteria.ventas_max) {
        query += ' AND p.ventas <= ?';
        values.push(criteria.ventas_max);
      }

      query += ' ORDER BY p.fecha DESC LIMIT ? OFFSET ?';
      values.push(limit, offset);

      const result = await executeQuery(query, values);
      return result.map(pago => new Pago(pago));
    } catch (error) {
      throw error;
    }
  }

  // Actualizar pago
  async update(updateData) {
    try {
      const allowedFields = [
        'balance_general', 'ventas', 'comision', 'fecha',
        'especialidad', 'estado', 'accion'
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

      values.push(this.id_pago);
      const query = `UPDATE PAGOS SET ${updateFields.join(', ')} WHERE id_pago = ?`;
      
      await executeQuery(query, values);
      return await Pago.findById(this.id_pago);
    } catch (error) {
      throw error;
    }
  }

  // Cambiar estado del pago
  async cambiarEstado(nuevoEstado) {
    try {
      const query = 'UPDATE PAGOS SET estado = ? WHERE id_pago = ?';
      await executeQuery(query, [nuevoEstado, this.id_pago]);
      return await Pago.findById(this.id_pago);
    } catch (error) {
      throw error;
    }
  }

  // Obtener estadísticas de pagos
  static async getStats(id_profesional = null, fecha_inicio = null, fecha_fin = null) {
    try {
      let query = `
        SELECT 
          COUNT(*) as total_pagos,
          SUM(ventas) as total_ventas,
          SUM(comision) as total_comisiones,
          AVG(ventas) as promedio_ventas,
          AVG(comision) as promedio_comisiones,
          SUM(balance_general) as balance_total
        FROM PAGOS
        WHERE 1=1
      `;
      const values = [];

      if (id_profesional) {
        query += ' AND id_profesional = ?';
        values.push(id_profesional);
      }

      if (fecha_inicio && fecha_fin) {
        query += ' AND DATE(fecha) BETWEEN ? AND ?';
        values.push(fecha_inicio, fecha_fin);
      }

      const result = await executeQuery(query, values);
      return result[0];
    } catch (error) {
      throw error;
    }
  }

  // Obtener estadísticas por especialidad
  static async getStatsByEspecialidad(fecha_inicio = null, fecha_fin = null) {
    try {
      let query = `
        SELECT 
          especialidad,
          COUNT(*) as total_pagos,
          SUM(ventas) as total_ventas,
          SUM(comision) as total_comisiones,
          AVG(ventas) as promedio_ventas,
          AVG(comision) as promedio_comisiones
        FROM PAGOS
        WHERE 1=1
      `;
      const values = [];

      if (fecha_inicio && fecha_fin) {
        query += ' AND DATE(fecha) BETWEEN ? AND ?';
        values.push(fecha_inicio, fecha_fin);
      }

      query += ' GROUP BY especialidad ORDER BY total_ventas DESC';

      const result = await executeQuery(query, values);
      return result;
    } catch (error) {
      throw error;
    }
  }

  // Obtener balance actual del profesional
  static async getBalanceProfesional(id_profesional) {
    try {
      const query = `
        SELECT 
          SUM(balance_general) as balance_actual,
          SUM(ventas) as total_ventas,
          SUM(comision) as total_comisiones
        FROM PAGOS
        WHERE id_profesional = ?
      `;
      
      const result = await executeQuery(query, [id_profesional]);
      return result[0];
    } catch (error) {
      throw error;
    }
  }

  // Eliminar pago
  async delete() {
    try {
      const query = 'DELETE FROM PAGOS WHERE id_pago = ?';
      await executeQuery(query, [this.id_pago]);
      return true;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Pago;
