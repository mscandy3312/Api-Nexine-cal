const { executeQuery } = require('../config/database');

class Valoracion {
  constructor(data) {
    this.id_valoracion = data.id_valoracion;
    this.id_sesion = data.id_sesion;
    this.rating = data.rating;
    this.mensaje = data.mensaje;
    this.fecha = data.fecha;
    this.estado = data.estado;
  }

  // Crear nueva valoración
  static async create(valoracionData) {
    try {
      const {
        id_sesion,
        rating,
        mensaje,
        estado = 'activa'
      } = valoracionData;

      // Validar que el rating esté entre 1 y 5
      if (rating < 1 || rating > 5) {
        throw new Error('El rating debe estar entre 1 y 5');
      }

      const query = `
        INSERT INTO VALORACIONES (id_sesion, rating, mensaje, fecha, estado)
        VALUES (?, ?, ?, NOW(), ?)
      `;

      const result = await executeQuery(query, [
        id_sesion,
        rating,
        mensaje,
        estado
      ]);

      // Actualizar el rating del profesional
      await this.actualizarRatingProfesional(id_sesion);

      return await this.findById(result.insertId);
    } catch (error) {
      throw error;
    }
  }

  // Buscar valoración por ID
  static async findById(id) {
    try {
      const query = `
        SELECT v.*, 
               s.id_cliente, s.id_profesional,
               c.nombre_completo as cliente_nombre,
               p.nombre_completo as profesional_nombre
        FROM VALORACIONES v
        JOIN SESIONES s ON v.id_sesion = s.id_sesion
        JOIN CLIENTES c ON s.id_cliente = c.id_cliente
        JOIN PROFESIONALES p ON s.id_profesional = p.id_profesional
        WHERE v.id_valoracion = ?
      `;
      const result = await executeQuery(query, [id]);
      return result.length > 0 ? new Valoracion(result[0]) : null;
    } catch (error) {
      throw error;
    }
  }

  // Obtener todas las valoraciones
  static async findAll(limit = 50, offset = 0) {
    try {
      const query = `
        SELECT v.*, 
               s.id_cliente, s.id_profesional,
               c.nombre_completo as cliente_nombre,
               p.nombre_completo as profesional_nombre
        FROM VALORACIONES v
        JOIN SESIONES s ON v.id_sesion = s.id_sesion
        JOIN CLIENTES c ON s.id_cliente = c.id_cliente
        JOIN PROFESIONALES p ON s.id_profesional = p.id_profesional
        ORDER BY v.fecha DESC
        LIMIT ? OFFSET ?
      `;
      const result = await executeQuery(query, [limit, offset]);
      return result.map(valoracion => new Valoracion(valoracion));
    } catch (error) {
      throw error;
    }
  }

  // Buscar valoraciones por sesión
  static async findBySesion(id_sesion) {
    try {
      const query = `
        SELECT v.*, 
               c.nombre_completo as cliente_nombre,
               p.nombre_completo as profesional_nombre
        FROM VALORACIONES v
        JOIN SESIONES s ON v.id_sesion = s.id_sesion
        JOIN CLIENTES c ON s.id_cliente = c.id_cliente
        JOIN PROFESIONALES p ON s.id_profesional = p.id_profesional
        WHERE v.id_sesion = ?
        ORDER BY v.fecha DESC
      `;
      const result = await executeQuery(query, [id_sesion]);
      return result.map(valoracion => new Valoracion(valoracion));
    } catch (error) {
      throw error;
    }
  }

  // Buscar valoraciones por profesional
  static async findByProfesional(id_profesional, limit = 50, offset = 0) {
    try {
      const query = `
        SELECT v.*, 
               s.id_cliente,
               c.nombre_completo as cliente_nombre
        FROM VALORACIONES v
        JOIN SESIONES s ON v.id_sesion = s.id_sesion
        JOIN CLIENTES c ON s.id_cliente = c.id_cliente
        WHERE s.id_profesional = ?
        ORDER BY v.fecha DESC
        LIMIT ? OFFSET ?
      `;
      const result = await executeQuery(query, [id_profesional, limit, offset]);
      return result.map(valoracion => new Valoracion(valoracion));
    } catch (error) {
      throw error;
    }
  }

  // Buscar valoraciones por cliente
  static async findByCliente(id_cliente, limit = 50, offset = 0) {
    try {
      const query = `
        SELECT v.*, 
               s.id_profesional,
               p.nombre_completo as profesional_nombre
        FROM VALORACIONES v
        JOIN SESIONES s ON v.id_sesion = s.id_sesion
        JOIN PROFESIONALES p ON s.id_profesional = p.id_profesional
        WHERE s.id_cliente = ?
        ORDER BY v.fecha DESC
        LIMIT ? OFFSET ?
      `;
      const result = await executeQuery(query, [id_cliente, limit, offset]);
      return result.map(valoracion => new Valoracion(valoracion));
    } catch (error) {
      throw error;
    }
  }

  // Buscar valoraciones por rating
  static async findByRating(rating, limit = 50, offset = 0) {
    try {
      const query = `
        SELECT v.*, 
               s.id_cliente, s.id_profesional,
               c.nombre_completo as cliente_nombre,
               p.nombre_completo as profesional_nombre
        FROM VALORACIONES v
        JOIN SESIONES s ON v.id_sesion = s.id_sesion
        JOIN CLIENTES c ON s.id_cliente = c.id_cliente
        JOIN PROFESIONALES p ON s.id_profesional = p.id_profesional
        WHERE v.rating = ?
        ORDER BY v.fecha DESC
        LIMIT ? OFFSET ?
      `;
      const result = await executeQuery(query, [rating, limit, offset]);
      return result.map(valoracion => new Valoracion(valoracion));
    } catch (error) {
      throw error;
    }
  }

  // Buscar valoraciones por estado
  static async findByEstado(estado, limit = 50, offset = 0) {
    try {
      const query = `
        SELECT v.*, 
               s.id_cliente, s.id_profesional,
               c.nombre_completo as cliente_nombre,
               p.nombre_completo as profesional_nombre
        FROM VALORACIONES v
        JOIN SESIONES s ON v.id_sesion = s.id_sesion
        JOIN CLIENTES c ON s.id_cliente = c.id_cliente
        JOIN PROFESIONALES p ON s.id_profesional = p.id_profesional
        WHERE v.estado = ?
        ORDER BY v.fecha DESC
        LIMIT ? OFFSET ?
      `;
      const result = await executeQuery(query, [estado, limit, offset]);
      return result.map(valoracion => new Valoracion(valoracion));
    } catch (error) {
      throw error;
    }
  }

  // Buscar valoraciones por criterios
  static async search(criteria, limit = 50, offset = 0) {
    try {
      let query = `
        SELECT v.*, 
               s.id_cliente, s.id_profesional,
               c.nombre_completo as cliente_nombre,
               p.nombre_completo as profesional_nombre
        FROM VALORACIONES v
        JOIN SESIONES s ON v.id_sesion = s.id_sesion
        JOIN CLIENTES c ON s.id_cliente = c.id_cliente
        JOIN PROFESIONALES p ON s.id_profesional = p.id_profesional
        WHERE 1=1
      `;
      const values = [];

      if (criteria.id_profesional) {
        query += ' AND s.id_profesional = ?';
        values.push(criteria.id_profesional);
      }

      if (criteria.id_cliente) {
        query += ' AND s.id_cliente = ?';
        values.push(criteria.id_cliente);
      }

      if (criteria.rating) {
        query += ' AND v.rating = ?';
        values.push(criteria.rating);
      }

      if (criteria.rating_min) {
        query += ' AND v.rating >= ?';
        values.push(criteria.rating_min);
      }

      if (criteria.rating_max) {
        query += ' AND v.rating <= ?';
        values.push(criteria.rating_max);
      }

      if (criteria.estado) {
        query += ' AND v.estado = ?';
        values.push(criteria.estado);
      }

      if (criteria.fecha_desde) {
        query += ' AND DATE(v.fecha) >= ?';
        values.push(criteria.fecha_desde);
      }

      if (criteria.fecha_hasta) {
        query += ' AND DATE(v.fecha) <= ?';
        values.push(criteria.fecha_hasta);
      }

      if (criteria.mensaje) {
        query += ' AND v.mensaje LIKE ?';
        values.push(`%${criteria.mensaje}%`);
      }

      query += ' ORDER BY v.fecha DESC LIMIT ? OFFSET ?';
      values.push(limit, offset);

      const result = await executeQuery(query, values);
      return result.map(valoracion => new Valoracion(valoracion));
    } catch (error) {
      throw error;
    }
  }

  // Actualizar valoración
  async update(updateData) {
    try {
      const allowedFields = ['rating', 'mensaje', 'estado'];
      const updateFields = [];
      const values = [];

      for (const [key, value] of Object.entries(updateData)) {
        if (allowedFields.includes(key) && value !== undefined) {
          if (key === 'rating' && (value < 1 || value > 5)) {
            throw new Error('El rating debe estar entre 1 y 5');
          }
          updateFields.push(`${key} = ?`);
          values.push(value);
        }
      }

      if (updateFields.length === 0) {
        throw new Error('No hay campos válidos para actualizar');
      }

      values.push(this.id_valoracion);
      const query = `UPDATE VALORACIONES SET ${updateFields.join(', ')} WHERE id_valoracion = ?`;
      
      await executeQuery(query, values);

      // Actualizar el rating del profesional si se cambió el rating
      if (updateData.rating) {
        await Valoracion.actualizarRatingProfesional(this.id_sesion);
      }

      return await Valoracion.findById(this.id_valoracion);
    } catch (error) {
      throw error;
    }
  }

  // Cambiar estado de la valoración
  async cambiarEstado(nuevoEstado) {
    try {
      const query = 'UPDATE VALORACIONES SET estado = ? WHERE id_valoracion = ?';
      await executeQuery(query, [nuevoEstado, this.id_valoracion]);
      return await Valoracion.findById(this.id_valoracion);
    } catch (error) {
      throw error;
    }
  }

  // Actualizar rating del profesional
  static async actualizarRatingProfesional(id_sesion) {
    try {
      // Obtener el profesional de la sesión
      const sesionQuery = 'SELECT id_profesional FROM SESIONES WHERE id_sesion = ?';
      const sesionResult = await executeQuery(sesionQuery, [id_sesion]);
      
      if (sesionResult.length === 0) return;

      const id_profesional = sesionResult[0].id_profesional;

      // Calcular el nuevo rating promedio
      const ratingQuery = `
        SELECT AVG(rating) as rating_promedio
        FROM VALORACIONES v
        JOIN SESIONES s ON v.id_sesion = s.id_sesion
        WHERE s.id_profesional = ? AND v.estado = 'activa'
      `;
      
      const ratingResult = await executeQuery(ratingQuery, [id_profesional]);
      const ratingPromedio = ratingResult[0].rating_promedio || 0;

      // Actualizar el rating del profesional
      const updateQuery = 'UPDATE PROFESIONALES SET rating = ? WHERE id_profesional = ?';
      await executeQuery(updateQuery, [ratingPromedio, id_profesional]);
    } catch (error) {
      console.error('Error al actualizar rating del profesional:', error);
    }
  }

  // Obtener estadísticas de valoraciones
  static async getStats(id_profesional = null, fecha_inicio = null, fecha_fin = null) {
    try {
      let query = `
        SELECT 
          COUNT(*) as total_valoraciones,
          AVG(rating) as rating_promedio,
          COUNT(CASE WHEN rating = 5 THEN 1 END) as valoraciones_5_estrellas,
          COUNT(CASE WHEN rating = 4 THEN 1 END) as valoraciones_4_estrellas,
          COUNT(CASE WHEN rating = 3 THEN 1 END) as valoraciones_3_estrellas,
          COUNT(CASE WHEN rating = 2 THEN 1 END) as valoraciones_2_estrellas,
          COUNT(CASE WHEN rating = 1 THEN 1 END) as valoraciones_1_estrella
        FROM VALORACIONES v
        JOIN SESIONES s ON v.id_sesion = s.id_sesion
        WHERE v.estado = 'activa'
      `;
      const values = [];

      if (id_profesional) {
        query += ' AND s.id_profesional = ?';
        values.push(id_profesional);
      }

      if (fecha_inicio && fecha_fin) {
        query += ' AND DATE(v.fecha) BETWEEN ? AND ?';
        values.push(fecha_inicio, fecha_fin);
      }

      const result = await executeQuery(query, values);
      return result[0];
    } catch (error) {
      throw error;
    }
  }

  // Eliminar valoración
  async delete() {
    try {
      const query = 'DELETE FROM VALORACIONES WHERE id_valoracion = ?';
      await executeQuery(query, [this.id_valoracion]);
      
      // Actualizar el rating del profesional
      await Valoracion.actualizarRatingProfesional(this.id_sesion);
      
      return true;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Valoracion;
