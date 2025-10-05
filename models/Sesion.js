const { executeQuery } = require('../config/database');

class Sesion {
  constructor(data) {
    this.id_sesion = data.id_sesion;
    this.id_cliente = data.id_cliente;
    this.id_profesional = data.id_profesional;
    this.id_precio = data.id_precio;
    this.id_cita = data.id_cita;
    this.numero_pedido = data.numero_pedido;
    this.fecha = data.fecha;
    this.estado = data.estado;
    this.acciones = data.acciones;
    this.producto = data.producto;
    this.metodo_pago = data.metodo_pago;
  }

  // Crear nueva sesión
  static async create(sesionData) {
    try {
      const {
        id_cliente,
        id_profesional,
        id_precio,
        id_cita,
        numero_pedido,
        fecha,
        estado,
        acciones,
        producto,
        metodo_pago
      } = sesionData;

      const query = `
        INSERT INTO SESIONES (
          id_cliente, id_profesional, id_precio, id_cita, numero_pedido,
          fecha, estado, acciones, producto, metodo_pago
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const result = await executeQuery(query, [
        id_cliente,
        id_profesional,
        id_precio,
        id_cita,
        numero_pedido,
        fecha,
        estado,
        acciones,
        producto,
        metodo_pago
      ]);

      return await this.findById(result.insertId);
    } catch (error) {
      throw error;
    }
  }

  // Buscar sesión por ID
  static async findById(id) {
    try {
      const query = `
        SELECT s.*, 
               c.nombre_completo as cliente_nombre,
               p.nombre_completo as profesional_nombre,
               pr.nombre_paquete
        FROM SESIONES s
        JOIN CLIENTES c ON s.id_cliente = c.id_cliente
        JOIN PROFESIONALES p ON s.id_profesional = p.id_profesional
        LEFT JOIN PRECIOS pr ON s.id_precio = pr.id_precio
        WHERE s.id_sesion = ?
      `;
      const result = await executeQuery(query, [id]);
      return result.length > 0 ? new Sesion(result[0]) : null;
    } catch (error) {
      throw error;
    }
  }

  // Buscar sesión por número de pedido
  static async findByNumeroPedido(numero_pedido) {
    try {
      const query = `
        SELECT s.*, 
               c.nombre_completo as cliente_nombre,
               p.nombre_completo as profesional_nombre,
               pr.nombre_paquete
        FROM SESIONES s
        JOIN CLIENTES c ON s.id_cliente = c.id_cliente
        JOIN PROFESIONALES p ON s.id_profesional = p.id_profesional
        LEFT JOIN PRECIOS pr ON s.id_precio = pr.id_precio
        WHERE s.numero_pedido = ?
      `;
      const result = await executeQuery(query, [numero_pedido]);
      return result.length > 0 ? new Sesion(result[0]) : null;
    } catch (error) {
      throw error;
    }
  }

  // Obtener todas las sesiones
  static async findAll(limit = 50, offset = 0) {
    try {
      const query = `
        SELECT s.*, 
               c.nombre_completo as cliente_nombre,
               p.nombre_completo as profesional_nombre,
               pr.nombre_paquete
        FROM SESIONES s
        JOIN CLIENTES c ON s.id_cliente = c.id_cliente
        JOIN PROFESIONALES p ON s.id_profesional = p.id_profesional
        LEFT JOIN PRECIOS pr ON s.id_precio = pr.id_precio
        ORDER BY s.fecha DESC
        LIMIT ? OFFSET ?
      `;
      const result = await executeQuery(query, [limit, offset]);
      return result.map(sesion => new Sesion(sesion));
    } catch (error) {
      throw error;
    }
  }

  // Buscar sesiones por cliente
  static async findByCliente(id_cliente, limit = 50, offset = 0) {
    try {
      const query = `
        SELECT s.*, 
               p.nombre_completo as profesional_nombre,
               pr.nombre_paquete
        FROM SESIONES s
        JOIN PROFESIONALES p ON s.id_profesional = p.id_profesional
        LEFT JOIN PRECIOS pr ON s.id_precio = pr.id_precio
        WHERE s.id_cliente = ?
        ORDER BY s.fecha DESC
        LIMIT ? OFFSET ?
      `;
      const result = await executeQuery(query, [id_cliente, limit, offset]);
      return result.map(sesion => new Sesion(sesion));
    } catch (error) {
      throw error;
    }
  }

  // Buscar sesiones por profesional
  static async findByProfesional(id_profesional, limit = 50, offset = 0) {
    try {
      const query = `
        SELECT s.*, 
               c.nombre_completo as cliente_nombre,
               pr.nombre_paquete
        FROM SESIONES s
        JOIN CLIENTES c ON s.id_cliente = c.id_cliente
        LEFT JOIN PRECIOS pr ON s.id_precio = pr.id_precio
        WHERE s.id_profesional = ?
        ORDER BY s.fecha DESC
        LIMIT ? OFFSET ?
      `;
      const result = await executeQuery(query, [id_profesional, limit, offset]);
      return result.map(sesion => new Sesion(sesion));
    } catch (error) {
      throw error;
    }
  }

  // Buscar sesiones por estado
  static async findByEstado(estado, limit = 50, offset = 0) {
    try {
      const query = `
        SELECT s.*, 
               c.nombre_completo as cliente_nombre,
               p.nombre_completo as profesional_nombre,
               pr.nombre_paquete
        FROM SESIONES s
        JOIN CLIENTES c ON s.id_cliente = c.id_cliente
        JOIN PROFESIONALES p ON s.id_profesional = p.id_profesional
        LEFT JOIN PRECIOS pr ON s.id_precio = pr.id_precio
        WHERE s.estado = ?
        ORDER BY s.fecha DESC
        LIMIT ? OFFSET ?
      `;
      const result = await executeQuery(query, [estado, limit, offset]);
      return result.map(sesion => new Sesion(sesion));
    } catch (error) {
      throw error;
    }
  }

  // Buscar sesiones por fecha
  static async findByFecha(fecha, limit = 50, offset = 0) {
    try {
      const query = `
        SELECT s.*, 
               c.nombre_completo as cliente_nombre,
               p.nombre_completo as profesional_nombre,
               pr.nombre_paquete
        FROM SESIONES s
        JOIN CLIENTES c ON s.id_cliente = c.id_cliente
        JOIN PROFESIONALES p ON s.id_profesional = p.id_profesional
        LEFT JOIN PRECIOS pr ON s.id_precio = pr.id_precio
        WHERE DATE(s.fecha) = ?
        ORDER BY s.fecha ASC
        LIMIT ? OFFSET ?
      `;
      const result = await executeQuery(query, [fecha, limit, offset]);
      return result.map(sesion => new Sesion(sesion));
    } catch (error) {
      throw error;
    }
  }

  // Buscar sesiones por rango de fechas
  static async findByRangoFechas(fecha_inicio, fecha_fin, limit = 50, offset = 0) {
    try {
      const query = `
        SELECT s.*, 
               c.nombre_completo as cliente_nombre,
               p.nombre_completo as profesional_nombre,
               pr.nombre_paquete
        FROM SESIONES s
        JOIN CLIENTES c ON s.id_cliente = c.id_cliente
        JOIN PROFESIONALES p ON s.id_profesional = p.id_profesional
        LEFT JOIN PRECIOS pr ON s.id_precio = pr.id_precio
        WHERE DATE(s.fecha) BETWEEN ? AND ?
        ORDER BY s.fecha ASC
        LIMIT ? OFFSET ?
      `;
      const result = await executeQuery(query, [fecha_inicio, fecha_fin, limit, offset]);
      return result.map(sesion => new Sesion(sesion));
    } catch (error) {
      throw error;
    }
  }

  // Buscar sesiones por criterios
  static async search(criteria, limit = 50, offset = 0) {
    try {
      let query = `
        SELECT s.*, 
               c.nombre_completo as cliente_nombre,
               p.nombre_completo as profesional_nombre,
               pr.nombre_paquete
        FROM SESIONES s
        JOIN CLIENTES c ON s.id_cliente = c.id_cliente
        JOIN PROFESIONALES p ON s.id_profesional = p.id_profesional
        LEFT JOIN PRECIOS pr ON s.id_precio = pr.id_precio
        WHERE 1=1
      `;
      const values = [];

      if (criteria.id_cliente) {
        query += ' AND s.id_cliente = ?';
        values.push(criteria.id_cliente);
      }

      if (criteria.id_profesional) {
        query += ' AND s.id_profesional = ?';
        values.push(criteria.id_profesional);
      }

      if (criteria.estado) {
        query += ' AND s.estado = ?';
        values.push(criteria.estado);
      }

      if (criteria.fecha_desde) {
        query += ' AND DATE(s.fecha) >= ?';
        values.push(criteria.fecha_desde);
      }

      if (criteria.fecha_hasta) {
        query += ' AND DATE(s.fecha) <= ?';
        values.push(criteria.fecha_hasta);
      }

      if (criteria.producto) {
        query += ' AND s.producto LIKE ?';
        values.push(`%${criteria.producto}%`);
      }

      if (criteria.metodo_pago) {
        query += ' AND s.metodo_pago = ?';
        values.push(criteria.metodo_pago);
      }

      query += ' ORDER BY s.fecha DESC LIMIT ? OFFSET ?';
      values.push(limit, offset);

      const result = await executeQuery(query, values);
      return result.map(sesion => new Sesion(sesion));
    } catch (error) {
      throw error;
    }
  }

  // Actualizar sesión
  async update(updateData) {
    try {
      const allowedFields = [
        'id_cliente', 'id_profesional', 'id_precio', 'id_cita',
        'numero_pedido', 'fecha', 'estado', 'acciones', 'producto', 'metodo_pago'
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

      values.push(this.id_sesion);
      const query = `UPDATE SESIONES SET ${updateFields.join(', ')} WHERE id_sesion = ?`;
      
      await executeQuery(query, values);
      return await Sesion.findById(this.id_sesion);
    } catch (error) {
      throw error;
    }
  }

  // Cambiar estado de la sesión
  async cambiarEstado(nuevoEstado) {
    try {
      const query = 'UPDATE SESIONES SET estado = ? WHERE id_sesion = ?';
      await executeQuery(query, [nuevoEstado, this.id_sesion]);
      return await Sesion.findById(this.id_sesion);
    } catch (error) {
      throw error;
    }
  }

  // Obtener estadísticas de sesiones
  static async getStats(fecha_inicio = null, fecha_fin = null) {
    try {
      let query = `
        SELECT 
          COUNT(*) as total_sesiones,
          COUNT(CASE WHEN estado = 'completada' THEN 1 END) as sesiones_completadas,
          COUNT(CASE WHEN estado = 'cancelada' THEN 1 END) as sesiones_canceladas,
          COUNT(CASE WHEN estado = 'pendiente' THEN 1 END) as sesiones_pendientes
        FROM SESIONES
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

  // Obtener valoraciones de la sesión
  async getValoraciones() {
    try {
      const query = `
        SELECT v.*, c.nombre_completo as cliente_nombre
        FROM VALORACIONES v
        JOIN SESIONES s ON v.id_sesion = s.id_sesion
        JOIN CLIENTES c ON s.id_cliente = c.id_cliente
        WHERE v.id_sesion = ?
        ORDER BY v.fecha DESC
      `;
      
      const result = await executeQuery(query, [this.id_sesion]);
      return result;
    } catch (error) {
      throw error;
    }
  }

  // Eliminar sesión
  async delete() {
    try {
      const query = 'DELETE FROM SESIONES WHERE id_sesion = ?';
      await executeQuery(query, [this.id_sesion]);
      return true;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Sesion;
