const { executeQuery } = require('../config/database');

class TransaccionStripe {
  constructor(data) {
    this.id_transaccion = data.id_transaccion;
    this.id_pago = data.id_pago;
    this.id_sesion = data.id_sesion;
    this.stripe_payment_id = data.stripe_payment_id;
    this.monto = data.monto;
    this.moneda = data.moneda || 'USD';
    this.estado = data.estado || 'pendiente';
    this.metodo_pago = data.metodo_pago;
    this.fecha = data.fecha;
  }

  // Crear nueva transacción Stripe
  static async create(transaccionData) {
    try {
      const {
        id_pago,
        id_sesion,
        stripe_payment_id,
        monto,
        moneda,
        estado,
        metodo_pago
      } = transaccionData;

      const query = `
        INSERT INTO TRANSACCIONES_STRIPE (
          id_pago, id_sesion, stripe_payment_id, monto, moneda, estado, metodo_pago
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

      const result = await executeQuery(query, [
        id_pago,
        id_sesion,
        stripe_payment_id,
        monto,
        moneda,
        estado,
        metodo_pago
      ]);

      return await this.findById(result.insertId);
    } catch (error) {
      throw error;
    }
  }

  // Buscar transacción por ID
  static async findById(id) {
    try {
      const query = `
        SELECT ts.*, 
               p.id_profesional,
               pr.nombre_completo as profesional_nombre,
               s.id_cliente,
               c.nombre_completo as cliente_nombre
        FROM TRANSACCIONES_STRIPE ts
        JOIN PAGOS p ON ts.id_pago = p.id_pago
        JOIN PROFESIONALES pr ON p.id_profesional = pr.id_profesional
        LEFT JOIN SESIONES s ON ts.id_sesion = s.id_sesion
        LEFT JOIN CLIENTES c ON s.id_cliente = c.id_cliente
        WHERE ts.id_transaccion = ?
      `;
      const result = await executeQuery(query, [id]);
      return result.length > 0 ? new TransaccionStripe(result[0]) : null;
    } catch (error) {
      throw error;
    }
  }

  // Buscar transacción por ID de Stripe
  static async findByStripePaymentId(stripe_payment_id) {
    try {
      const query = `
        SELECT ts.*, 
               p.id_profesional,
               pr.nombre_completo as profesional_nombre,
               s.id_cliente,
               c.nombre_completo as cliente_nombre
        FROM TRANSACCIONES_STRIPE ts
        JOIN PAGOS p ON ts.id_pago = p.id_pago
        JOIN PROFESIONALES pr ON p.id_profesional = pr.id_profesional
        LEFT JOIN SESIONES s ON ts.id_sesion = s.id_sesion
        LEFT JOIN CLIENTES c ON s.id_cliente = c.id_cliente
        WHERE ts.stripe_payment_id = ?
      `;
      const result = await executeQuery(query, [stripe_payment_id]);
      return result.length > 0 ? new TransaccionStripe(result[0]) : null;
    } catch (error) {
      throw error;
    }
  }

  // Obtener todas las transacciones
  static async findAll(limit = 50, offset = 0) {
    try {
      const query = `
        SELECT ts.*, 
               p.id_profesional,
               pr.nombre_completo as profesional_nombre,
               s.id_cliente,
               c.nombre_completo as cliente_nombre
        FROM TRANSACCIONES_STRIPE ts
        JOIN PAGOS p ON ts.id_pago = p.id_pago
        JOIN PROFESIONALES pr ON p.id_profesional = pr.id_profesional
        LEFT JOIN SESIONES s ON ts.id_sesion = s.id_sesion
        LEFT JOIN CLIENTES c ON s.id_cliente = c.id_cliente
        ORDER BY ts.fecha DESC
        LIMIT ? OFFSET ?
      `;
      const result = await executeQuery(query, [limit, offset]);
      return result.map(transaccion => new TransaccionStripe(transaccion));
    } catch (error) {
      throw error;
    }
  }

  // Buscar transacciones por pago
  static async findByPago(id_pago, limit = 50, offset = 0) {
    try {
      const query = `
        SELECT ts.*, 
               p.id_profesional,
               pr.nombre_completo as profesional_nombre,
               s.id_cliente,
               c.nombre_completo as cliente_nombre
        FROM TRANSACCIONES_STRIPE ts
        JOIN PAGOS p ON ts.id_pago = p.id_pago
        JOIN PROFESIONALES pr ON p.id_profesional = pr.id_profesional
        LEFT JOIN SESIONES s ON ts.id_sesion = s.id_sesion
        LEFT JOIN CLIENTES c ON s.id_cliente = c.id_cliente
        WHERE ts.id_pago = ?
        ORDER BY ts.fecha DESC
        LIMIT ? OFFSET ?
      `;
      const result = await executeQuery(query, [id_pago, limit, offset]);
      return result.map(transaccion => new TransaccionStripe(transaccion));
    } catch (error) {
      throw error;
    }
  }

  // Buscar transacciones por sesión
  static async findBySesion(id_sesion, limit = 50, offset = 0) {
    try {
      const query = `
        SELECT ts.*, 
               p.id_profesional,
               pr.nombre_completo as profesional_nombre,
               s.id_cliente,
               c.nombre_completo as cliente_nombre
        FROM TRANSACCIONES_STRIPE ts
        JOIN PAGOS p ON ts.id_pago = p.id_pago
        JOIN PROFESIONALES pr ON p.id_profesional = pr.id_profesional
        LEFT JOIN SESIONES s ON ts.id_sesion = s.id_sesion
        LEFT JOIN CLIENTES c ON s.id_cliente = c.id_cliente
        WHERE ts.id_sesion = ?
        ORDER BY ts.fecha DESC
        LIMIT ? OFFSET ?
      `;
      const result = await executeQuery(query, [id_sesion, limit, offset]);
      return result.map(transaccion => new TransaccionStripe(transaccion));
    } catch (error) {
      throw error;
    }
  }

  // Buscar transacciones por profesional
  static async findByProfesional(id_profesional, limit = 50, offset = 0) {
    try {
      const query = `
        SELECT ts.*, 
               p.id_profesional,
               pr.nombre_completo as profesional_nombre,
               s.id_cliente,
               c.nombre_completo as cliente_nombre
        FROM TRANSACCIONES_STRIPE ts
        JOIN PAGOS p ON ts.id_pago = p.id_pago
        JOIN PROFESIONALES pr ON p.id_profesional = pr.id_profesional
        LEFT JOIN SESIONES s ON ts.id_sesion = s.id_sesion
        LEFT JOIN CLIENTES c ON s.id_cliente = c.id_cliente
        WHERE p.id_profesional = ?
        ORDER BY ts.fecha DESC
        LIMIT ? OFFSET ?
      `;
      const result = await executeQuery(query, [id_profesional, limit, offset]);
      return result.map(transaccion => new TransaccionStripe(transaccion));
    } catch (error) {
      throw error;
    }
  }

  // Buscar transacciones por estado
  static async findByEstado(estado, limit = 50, offset = 0) {
    try {
      const query = `
        SELECT ts.*, 
               p.id_profesional,
               pr.nombre_completo as profesional_nombre,
               s.id_cliente,
               c.nombre_completo as cliente_nombre
        FROM TRANSACCIONES_STRIPE ts
        JOIN PAGOS p ON ts.id_pago = p.id_pago
        JOIN PROFESIONALES pr ON p.id_profesional = pr.id_profesional
        LEFT JOIN SESIONES s ON ts.id_sesion = s.id_sesion
        LEFT JOIN CLIENTES c ON s.id_cliente = c.id_cliente
        WHERE ts.estado = ?
        ORDER BY ts.fecha DESC
        LIMIT ? OFFSET ?
      `;
      const result = await executeQuery(query, [estado, limit, offset]);
      return result.map(transaccion => new TransaccionStripe(transaccion));
    } catch (error) {
      throw error;
    }
  }

  // Buscar transacciones por fecha
  static async findByFecha(fecha, limit = 50, offset = 0) {
    try {
      const query = `
        SELECT ts.*, 
               p.id_profesional,
               pr.nombre_completo as profesional_nombre,
               s.id_cliente,
               c.nombre_completo as cliente_nombre
        FROM TRANSACCIONES_STRIPE ts
        JOIN PAGOS p ON ts.id_pago = p.id_pago
        JOIN PROFESIONALES pr ON p.id_profesional = pr.id_profesional
        LEFT JOIN SESIONES s ON ts.id_sesion = s.id_sesion
        LEFT JOIN CLIENTES c ON s.id_cliente = c.id_cliente
        WHERE DATE(ts.fecha) = ?
        ORDER BY ts.fecha DESC
        LIMIT ? OFFSET ?
      `;
      const result = await executeQuery(query, [fecha, limit, offset]);
      return result.map(transaccion => new TransaccionStripe(transaccion));
    } catch (error) {
      throw error;
    }
  }

  // Buscar transacciones por rango de fechas
  static async findByRangoFechas(fecha_inicio, fecha_fin, limit = 50, offset = 0) {
    try {
      const query = `
        SELECT ts.*, 
               p.id_profesional,
               pr.nombre_completo as profesional_nombre,
               s.id_cliente,
               c.nombre_completo as cliente_nombre
        FROM TRANSACCIONES_STRIPE ts
        JOIN PAGOS p ON ts.id_pago = p.id_pago
        JOIN PROFESIONALES pr ON p.id_profesional = pr.id_profesional
        LEFT JOIN SESIONES s ON ts.id_sesion = s.id_sesion
        LEFT JOIN CLIENTES c ON s.id_cliente = c.id_cliente
        WHERE DATE(ts.fecha) BETWEEN ? AND ?
        ORDER BY ts.fecha DESC
        LIMIT ? OFFSET ?
      `;
      const result = await executeQuery(query, [fecha_inicio, fecha_fin, limit, offset]);
      return result.map(transaccion => new TransaccionStripe(transaccion));
    } catch (error) {
      throw error;
    }
  }

  // Buscar transacciones por criterios
  static async search(criteria, limit = 50, offset = 0) {
    try {
      let query = `
        SELECT ts.*, 
               p.id_profesional,
               pr.nombre_completo as profesional_nombre,
               s.id_cliente,
               c.nombre_completo as cliente_nombre
        FROM TRANSACCIONES_STRIPE ts
        JOIN PAGOS p ON ts.id_pago = p.id_pago
        JOIN PROFESIONALES pr ON p.id_profesional = pr.id_profesional
        LEFT JOIN SESIONES s ON ts.id_sesion = s.id_sesion
        LEFT JOIN CLIENTES c ON s.id_cliente = c.id_cliente
        WHERE 1=1
      `;
      const values = [];

      if (criteria.id_pago) {
        query += ' AND ts.id_pago = ?';
        values.push(criteria.id_pago);
      }

      if (criteria.id_sesion) {
        query += ' AND ts.id_sesion = ?';
        values.push(criteria.id_sesion);
      }

      if (criteria.id_profesional) {
        query += ' AND p.id_profesional = ?';
        values.push(criteria.id_profesional);
      }

      if (criteria.estado) {
        query += ' AND ts.estado = ?';
        values.push(criteria.estado);
      }

      if (criteria.moneda) {
        query += ' AND ts.moneda = ?';
        values.push(criteria.moneda);
      }

      if (criteria.monto_min) {
        query += ' AND ts.monto >= ?';
        values.push(criteria.monto_min);
      }

      if (criteria.monto_max) {
        query += ' AND ts.monto <= ?';
        values.push(criteria.monto_max);
      }

      if (criteria.fecha_desde) {
        query += ' AND DATE(ts.fecha) >= ?';
        values.push(criteria.fecha_desde);
      }

      if (criteria.fecha_hasta) {
        query += ' AND DATE(ts.fecha) <= ?';
        values.push(criteria.fecha_hasta);
      }

      if (criteria.metodo_pago) {
        query += ' AND ts.metodo_pago = ?';
        values.push(criteria.metodo_pago);
      }

      query += ' ORDER BY ts.fecha DESC LIMIT ? OFFSET ?';
      values.push(limit, offset);

      const result = await executeQuery(query, values);
      return result.map(transaccion => new TransaccionStripe(transaccion));
    } catch (error) {
      throw error;
    }
  }

  // Actualizar transacción
  async update(updateData) {
    try {
      const allowedFields = [
        'id_pago', 'id_sesion', 'stripe_payment_id', 'monto',
        'moneda', 'estado', 'metodo_pago'
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

      values.push(this.id_transaccion);
      const query = `UPDATE TRANSACCIONES_STRIPE SET ${updateFields.join(', ')} WHERE id_transaccion = ?`;
      
      await executeQuery(query, values);
      return await TransaccionStripe.findById(this.id_transaccion);
    } catch (error) {
      throw error;
    }
  }

  // Cambiar estado de la transacción
  async cambiarEstado(nuevoEstado) {
    try {
      const estadosValidos = ['pendiente', 'pagado', 'fallido', 'reembolsado'];
      if (!estadosValidos.includes(nuevoEstado)) {
        throw new Error('Estado no válido');
      }

      const query = 'UPDATE TRANSACCIONES_STRIPE SET estado = ? WHERE id_transaccion = ?';
      await executeQuery(query, [nuevoEstado, this.id_transaccion]);
      return await TransaccionStripe.findById(this.id_transaccion);
    } catch (error) {
      throw error;
    }
  }

  // Obtener estadísticas de transacciones
  static async getStats(id_profesional = null, fecha_inicio = null, fecha_fin = null) {
    try {
      let query = `
        SELECT 
          COUNT(*) as total_transacciones,
          SUM(CASE WHEN estado = 'pagado' THEN 1 ELSE 0 END) as transacciones_pagadas,
          SUM(CASE WHEN estado = 'fallido' THEN 1 ELSE 0 END) as transacciones_fallidas,
          SUM(CASE WHEN estado = 'reembolsado' THEN 1 ELSE 0 END) as transacciones_reembolsadas,
          SUM(CASE WHEN estado = 'pagado' THEN monto ELSE 0 END) as monto_total_pagado,
          AVG(CASE WHEN estado = 'pagado' THEN monto ELSE NULL END) as monto_promedio,
          COUNT(DISTINCT moneda) as monedas_utilizadas
        FROM TRANSACCIONES_STRIPE ts
        JOIN PAGOS p ON ts.id_pago = p.id_pago
        WHERE 1=1
      `;
      const values = [];

      if (id_profesional) {
        query += ' AND p.id_profesional = ?';
        values.push(id_profesional);
      }

      if (fecha_inicio && fecha_fin) {
        query += ' AND DATE(ts.fecha) BETWEEN ? AND ?';
        values.push(fecha_inicio, fecha_fin);
      }

      const result = await executeQuery(query, values);
      return result[0];
    } catch (error) {
      throw error;
    }
  }

  // Obtener estadísticas por moneda
  static async getStatsByMoneda(fecha_inicio = null, fecha_fin = null) {
    try {
      let query = `
        SELECT 
          moneda,
          COUNT(*) as total_transacciones,
          SUM(CASE WHEN estado = 'pagado' THEN 1 ELSE 0 END) as transacciones_pagadas,
          SUM(CASE WHEN estado = 'pagado' THEN monto ELSE 0 END) as monto_total,
          AVG(CASE WHEN estado = 'pagado' THEN monto ELSE NULL END) as monto_promedio
        FROM TRANSACCIONES_STRIPE
        WHERE 1=1
      `;
      const values = [];

      if (fecha_inicio && fecha_fin) {
        query += ' AND DATE(fecha) BETWEEN ? AND ?';
        values.push(fecha_inicio, fecha_fin);
      }

      query += ' GROUP BY moneda ORDER BY monto_total DESC';

      const result = await executeQuery(query, values);
      return result;
    } catch (error) {
      throw error;
    }
  }

  // Eliminar transacción
  async delete() {
    try {
      const query = 'DELETE FROM TRANSACCIONES_STRIPE WHERE id_transaccion = ?';
      await executeQuery(query, [this.id_transaccion]);
      return true;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = TransaccionStripe;
