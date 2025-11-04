const { executeQuery } = require('../config/database');

class Precio {
  constructor(data) {
    this.id_precio = data.id_precio;
    this.numero_sesion = data.numero_sesion;
    this.nombre_paquete = data.nombre_paquete;
    this.duracion = data.duracion;
    this.modalidad = data.modalidad;
    this.horario = data.horario;
    this.ordenes_totales = data.ordenes_totales || 0;
    this.ingresos_totales = data.ingresos_totales || 0;
    this.fecha = data.fecha;
    this.dias_disponibles = data.dias_disponibles;
    this.hora_desde = data.hora_desde;
    this.hora_hasta = data.hora_hasta;
  }

  // Crear nuevo precio
  static async create(precioData) {
    try {
      const {
        numero_sesion,
        nombre_paquete,
        duracion,
        modalidad,
        horario,
        fecha,
        dias_disponibles,
        hora_desde,
        hora_hasta
      } = precioData;

      const query = `
        INSERT INTO PRECIOS (
          numero_sesion, nombre_paquete, duracion, modalidad, horario,
          fecha, dias_disponibles, hora_desde, hora_hasta
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const result = await executeQuery(query, [
        numero_sesion,
        nombre_paquete,
        duracion,
        modalidad,
        horario,
        fecha,
        dias_disponibles,
        hora_desde,
        hora_hasta
      ]);

      return await this.findById(result.insertId);
    } catch (error) {
      throw error;
    }
  }

  // Buscar precio por ID
  static async findById(id) {
    try {
      const query = 'SELECT * FROM PRECIOS WHERE id_precio = ?';
      const result = await executeQuery(query, [id]);
      return result.length > 0 ? new Precio(result[0]) : null;
    } catch (error) {
      throw error;
    }
  }

  // Obtener todos los precios
  static async findAll(limit = 50, offset = 0) {
    try {
      const query = 'SELECT * FROM PRECIOS ORDER BY id_precio DESC LIMIT ? OFFSET ?';
      const result = await executeQuery(query, [limit, offset]);
      return result.map(precio => new Precio(precio));
    } catch (error) {
      throw error;
    }
  }

  // Buscar precios por modalidad
  static async findByModalidad(modalidad, limit = 50, offset = 0) {
    try {
      const query = 'SELECT * FROM PRECIOS WHERE modalidad = ? ORDER BY id_precio DESC LIMIT ? OFFSET ?';
      const result = await executeQuery(query, [modalidad, limit, offset]);
      return result.map(precio => new Precio(precio));
    } catch (error) {
      throw error;
    }
  }

  // Buscar precios por paquete
  static async findByPaquete(nombre_paquete, limit = 50, offset = 0) {
    try {
      const query = 'SELECT * FROM PRECIOS WHERE nombre_paquete = ? ORDER BY id_precio DESC LIMIT ? OFFSET ?';
      const result = await executeQuery(query, [nombre_paquete, limit, offset]);
      return result.map(precio => new Precio(precio));
    } catch (error) {
      throw error;
    }
  }

  // Buscar precios por criterios
  static async search(criteria, limit = 50, offset = 0) {
    try {
      let query = 'SELECT * FROM PRECIOS WHERE 1=1';
      const values = [];

      if (criteria.modalidad) {
        query += ' AND modalidad = ?';
        values.push(criteria.modalidad);
      }

      if (criteria.nombre_paquete) {
        query += ' AND nombre_paquete LIKE ?';
        values.push(`%${criteria.nombre_paquete}%`);
      }

      if (criteria.duracion) {
        query += ' AND duracion = ?';
        values.push(criteria.duracion);
      }

      if (criteria.numero_sesion) {
        query += ' AND numero_sesion = ?';
        values.push(criteria.numero_sesion);
      }

      if (criteria.fecha_desde) {
        query += ' AND fecha >= ?';
        values.push(criteria.fecha_desde);
      }

      if (criteria.fecha_hasta) {
        query += ' AND fecha <= ?';
        values.push(criteria.fecha_hasta);
      }

      query += ' ORDER BY id_precio DESC LIMIT ? OFFSET ?';
      values.push(limit, offset);

      const result = await executeQuery(query, values);
      return result.map(precio => new Precio(precio));
    } catch (error) {
      throw error;
    }
  }

  // Actualizar precio
  async update(updateData) {
    try {
      const allowedFields = [
        'numero_sesion', 'nombre_paquete', 'duracion', 'modalidad',
        'horario', 'fecha', 'dias_disponibles', 'hora_desde', 'hora_hasta'
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

      values.push(this.id_precio);
      const query = `UPDATE PRECIOS SET ${updateFields.join(', ')} WHERE id_precio = ?`;
      
      await executeQuery(query, values);
      return await Precio.findById(this.id_precio);
    } catch (error) {
      throw error;
    }
  }

  // Actualizar estadísticas
  async updateStats() {
    try {
      const statsQuery = `
        SELECT 
          COUNT(*) as total_ordenes,
          SUM(CASE WHEN s.estado = 'completada' THEN 1 ELSE 0 END) as ordenes_completadas
        FROM SESIONES s
        WHERE s.id_precio = ?
      `;
      
      const result = await executeQuery(statsQuery, [this.id_precio]);
      const stats = result[0];

      const updateQuery = `
        UPDATE PRECIOS 
        SET ordenes_totales = ?, ingresos_totales = ?
        WHERE id_precio = ?
      `;
      
      await executeQuery(updateQuery, [
        stats.total_ordenes,
        stats.ordenes_completadas * (this.ingresos_totales / Math.max(this.ordenes_totales, 1)),
        this.id_precio
      ]);

      return await Precio.findById(this.id_precio);
    } catch (error) {
      throw error;
    }
  }

  // Obtener estadísticas del precio
  async getStats() {
    try {
      const statsQuery = `
        SELECT 
          COUNT(*) as total_sesiones,
          COUNT(CASE WHEN s.estado = 'completada' THEN 1 END) as sesiones_completadas,
          AVG(CASE WHEN s.estado = 'completada' THEN 1 ELSE 0 END) as tasa_completado
        FROM SESIONES s
        WHERE s.id_precio = ?
      `;
      
      const result = await executeQuery(statsQuery, [this.id_precio]);
      return result[0];
    } catch (error) {
      throw error;
    }
  }

  // Obtener sesiones asociadas
  async getSesiones(limit = 20, offset = 0) {
    try {
      const query = `
        SELECT s.*, c.nombre_completo as clientes_nombre, p.nombre_completo as profesional_nombre
        FROM SESIONES s
        JOIN clientesS c ON s.id_clientes = c.id_clientes
        JOIN PROFESIONALES p ON s.id_profesional = p.id_profesional
        WHERE s.id_precio = ?
        ORDER BY s.fecha DESC
        LIMIT ? OFFSET ?
      `;
      
      const result = await executeQuery(query, [this.id_precio, limit, offset]);
      return result;
    } catch (error) {
      throw error;
    }
  }

  // Eliminar precio
  async delete() {
    try {
      const query = 'DELETE FROM PRECIOS WHERE id_precio = ?';
      await executeQuery(query, [this.id_precio]);
      return true;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Precio;
