// --- [MODELO] models/citas.js ¡CARGADO Y CORREGIDO! ---
console.log('--- [MODELO] models/citas.js ¡CARGADO Y CORREGIDO! ---');

const pool = require('../config/database'); // <-- CORREGIDO

// --- CORREGIDO --- (Nombre de clase en singular y mayúscula)
class Cita {
  constructor(data) {
    // --- CORREGIDO --- (Campos ajustados al schema de App.js)
    this.id_cita = data.id_cita;
    this.id_cliente = data.id_cliente;
    this.id_profesional = data.id_profesional;
    this.id_evento = data.id_evento;
    this.fecha_inicio = data.fecha_inicio;
    this.fecha_fin = data.fecha_fin;
    this.tipo_cita = data.tipo_cita || 'virtual';
    this.estado = data.estado || 'pendiente';
    this.link_videollamada = data.link_videollamada;
    this.id_pago = data.id_pago;
    this.fecha_creacion = data.fecha_creacion;

    // Campos de JOIN
    this.cliente_nombre = data.cliente_nombre;
    this.profesional_nombre = data.profesional_nombre;
    this.pago_monto = data.pago_monto;
    this.pago_estado = data.pago_estado;
  }

  // Crear nueva cita
  static async create(citaData) {
    try {
      // --- CORREGIDO --- (Campos ajustados al schema de App.js y validación)
      const {
        id_cliente,
        id_profesional,
        id_evento,
        fecha_inicio,
        fecha_fin,
        tipo_cita,
        estado,
        link_videollamada,
        id_pago
      } = citaData;

      const query = `
        INSERT INTO citas (
          id_cliente, id_profesional, id_evento, fecha_inicio, fecha_fin, 
          tipo_cita, estado, link_videollamada, id_pago
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `; // <-- CORREGIDO

      const [result] = await pool.query(query, [ // <-- CORREGIDO
        id_cliente,
        id_profesional,
        id_evento,
        fecha_inicio,
        fecha_fin,
        tipo_cita,
        estado,
        link_videollamada,
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
        FROM citas c
        JOIN clientes cl ON c.id_cliente = cl.id_cliente
        JOIN profesionales p ON c.id_profesional = p.id_profesional
        LEFT JOIN pagos pa ON c.id_pago = pa.id_pago
        WHERE c.id_cita = ?
      `; // <-- CORREGIDO
      const [result] = await pool.query(query, [id]); // <-- CORREGIDO
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
        FROM citas c
        JOIN clientes cl ON c.id_cliente = cl.id_cliente
        JOIN profesionales p ON c.id_profesional = p.id_profesional
        LEFT JOIN pagos pa ON c.id_pago = pa.id_pago
        ORDER BY c.fecha_inicio DESC
        LIMIT ? OFFSET ?
      `; // <-- CORREGIDO
      const [result] = await pool.query(query, [limit, offset]); // <-- CORREGIDO
      return result.map(cita => new Cita(cita));
    } catch (error) {
      throw error;
    }
  }

  // --- CORREGIDO --- (Nombre de función y parámetro)
  // Buscar citas por cliente
  static async findByCliente(id_cliente, limit = 50, offset = 0) {
    try {
      const query = `
        SELECT c.*, 
               p.nombre_completo as profesional_nombre,
               pa.monto as pago_monto,
               pa.estado as pago_estado
        FROM citas c
        JOIN profesionales p ON c.id_profesional = p.id_profesional
        LEFT JOIN pagos pa ON c.id_pago = pa.id_pago
        WHERE c.id_cliente = ?
        ORDER BY c.fecha_inicio DESC
        LIMIT ? OFFSET ?
      `; // <-- CORREGIDO
      const [result] = await pool.query(query, [id_cliente, limit, offset]); // <-- CORREGIDO
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
        FROM citas c
        JOIN clientes cl ON c.id_cliente = cl.id_cliente
        LEFT JOIN pagos pa ON c.id_pago = pa.id_pago
        WHERE c.id_profesional = ?
        ORDER BY c.fecha_inicio DESC
        LIMIT ? OFFSET ?
      `; // <-- CORREGIDO
      const [result] = await pool.query(query, [id_profesional, limit, offset]); // <-- CORREGIDO
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
        FROM citas c
        JOIN clientes cl ON c.id_cliente = cl.id_cliente
        JOIN profesionales p ON c.id_profesional = p.id_profesional
        LEFT JOIN pagos pa ON c.id_pago = pa.id_pago
        WHERE c.estado = ?
        ORDER BY c.fecha_inicio DESC
        LIMIT ? OFFSET ?
      `; // <-- CORREGIDO
      const [result] = await pool.query(query, [estado, limit, offset]); // <-- CORREGIDO
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
        FROM citas c
        JOIN clientes cl ON c.id_cliente = cl.id_cliente
        JOIN profesionales p ON c.id_profesional = p.id_profesional
        LEFT JOIN pagos pa ON c.id_pago = pa.id_pago
        WHERE DATE(c.fecha_inicio) = ?
        ORDER BY c.fecha_inicio ASC
        LIMIT ? OFFSET ?
      `; // <-- CORREGIDO
      const [result] = await pool.query(query, [fecha, limit, offset]); // <-- CORREGIDO
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
        FROM citas c
        JOIN clientes cl ON c.id_cliente = cl.id_cliente
        JOIN profesionales p ON c.id_profesional = p.id_profesional
        LEFT JOIN pagos pa ON c.id_pago = pa.id_pago
        WHERE DATE(c.fecha_inicio) BETWEEN ? AND ?
        ORDER BY c.fecha_inicio ASC
        LIMIT ? OFFSET ?
      `; // <-- CORREGIDO
      const [result] = await pool.query(query, [fecha_inicio, fecha_fin, limit, offset]); // <-- CORREGIDO
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
        FROM citas c
        JOIN clientes cl ON c.id_cliente = cl.id_cliente
        JOIN profesionales p ON c.id_profesional = p.id_profesional
        LEFT JOIN pagos pa ON c.id_pago = pa.id_pago
        WHERE 1=1
      `; // <-- CORREGIDO
      const values = [];

      // --- CORREGIDO ---
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

      // --- CORREGIDO ---
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

      query += ' ORDER BY c.fecha_inicio DESC LIMIT ? OFFSET ?';
      values.push(limit, offset);

      const [result] = await pool.query(query, values); // <-- CORREGIDO
      return result.map(cita => new Cita(cita));
    } catch (error) {
      throw error;
    }
  }

  // Actualizar cita
  async update(updateData) {
    try {
      // --- CORREGIDO ---
      const allowedFields = [
        'id_cliente', 'id_profesional', 'id_evento', 'fecha_inicio', 'fecha_fin',
        'tipo_cita', 'estado', 'link_videollamada', 'id_pago'
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
        return this; // No hay nada que actualizar
      }

      values.push(this.id_cita); // <-- CORREGIDO
      const query = `UPDATE citas SET ${updateFields.join(', ')} WHERE id_cita = ?`; // <-- CORREGIDO
      
      await pool.query(query, values); // <-- CORREGIDO
      return await Cita.findById(this.id_cita); // <-- CORREGIDO
    } catch (error) {
      throw error;
    }
  }

  // Cambiar estado de la cita
  async cambiarEstado(nuevoEstado) {
    try {
      // --- CORREGIDO --- (estado 'finalizada' -> 'completada')
      const estadosValidos = ['pendiente', 'confirmada', 'cancelada', 'completada'];
      if (!estadosValidos.includes(nuevoEstado)) {
        throw new Error('Estado no válido');
      }

      const query = 'UPDATE citas SET estado = ? WHERE id_cita = ?'; // <-- CORREGIDO
      await pool.query(query, [nuevoEstado, this.id_cita]); // <-- CORREGIDO
      return await Cita.findById(this.id_cita); // <-- CORREGIDO
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
          COUNT(CASE WHEN estado = 'completada' THEN 1 END) as citas_completadas,
          COUNT(CASE WHEN tipo_cita = 'presencial' THEN 1 END) as citas_presenciales,
          COUNT(CASE WHEN tipo_cita = 'virtual' THEN 1 END) as citas_virtuales
        FROM citas
      `; // <-- CORREGIDO
      const values = [];

      if (fecha_inicio && fecha_fin) {
        query += ' WHERE DATE(fecha_inicio) BETWEEN ? AND ?';
        values.push(fecha_inicio, fecha_fin);
      }

      const [result] = await pool.query(query, values); // <-- CORREGIDO
      return result[0];
    } catch (error) {
      throw error;
    }
  }

  // Eliminar cita
  async delete() {
    try {
      const query = 'DELETE FROM citas WHERE id_cita = ?'; // <-- CORREGIDO
      await pool.query(query, [this.id_cita]); // <-- CORREGIDO
      return true;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Cita; // <-- CORREGIDO
