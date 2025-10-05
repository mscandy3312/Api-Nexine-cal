const { executeQuery } = require('../config/database');

class Profesional {
  constructor(data) {
    this.id_profesional = data.id_profesional;
    this.id_usuario = data.id_usuario;
    this.id_stripe = data.id_stripe;
    this.nombre_completo = data.nombre_completo;
    this.telefono = data.telefono;
    this.numero_colegiado = data.numero_colegiado;
    this.especialidad = data.especialidad;
    this.direccion = data.direccion;
    this.rating = data.rating || 0;
    this.biografia = data.biografia;
    this.foto_perfil = data.foto_perfil;
    this.certificaciones = data.certificaciones;
    this.estado_aprobacion = data.estado_aprobacion || 'pendiente';
    this.fecha_aprobacion = data.fecha_aprobacion;
    this.motivo_rechazo = data.motivo_rechazo;
    this.video_presentacion = data.video_presentacion;
    this.modalidad_cita = data.modalidad_cita || 'presencial';
  }

  // Crear nuevo profesional
  static async create(profesionalData) {
    try {
      const {
        id_usuario,
        id_stripe,
        nombre_completo,
        telefono,
        numero_colegiado,
        especialidad,
        direccion,
        biografia,
        foto_perfil,
        certificaciones,
        video_presentacion,
        modalidad_cita
      } = profesionalData;

      const query = `
        INSERT INTO PROFESIONALES (
          id_usuario, id_stripe, nombre_completo, telefono, numero_colegiado,
          especialidad, direccion, biografia, foto_perfil, certificaciones,
          video_presentacion, modalidad_cita
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const result = await executeQuery(query, [
        id_usuario,
        id_stripe,
        nombre_completo,
        telefono,
        numero_colegiado,
        especialidad,
        direccion,
        biografia,
        foto_perfil,
        certificaciones,
        video_presentacion,
        modalidad_cita
      ]);

      return await this.findById(result.insertId);
    } catch (error) {
      throw error;
    }
  }

  // Buscar profesional por ID
  static async findById(id) {
    try {
      const query = `
        SELECT p.*, u.email, u.nombre, u.is_verified
        FROM PROFESIONALES p
        JOIN USUARIOS u ON p.id_usuario = u.id_usuario
        WHERE p.id_profesional = ?
      `;
      const result = await executeQuery(query, [id]);
      return result.length > 0 ? new Profesional(result[0]) : null;
    } catch (error) {
      throw error;
    }
  }

  // Buscar profesional por ID de usuario
  static async findByUserId(userId) {
    try {
      const query = `
        SELECT p.*, u.email, u.nombre, u.is_verified
        FROM PROFESIONALES p
        JOIN USUARIOS u ON p.id_usuario = u.id_usuario
        WHERE p.id_usuario = ?
      `;
      const result = await executeQuery(query, [userId]);
      return result.length > 0 ? new Profesional(result[0]) : null;
    } catch (error) {
      throw error;
    }
  }

  // Obtener todos los profesionales
  static async findAll(limit = 50, offset = 0) {
    try {
      const query = `
        SELECT p.*, u.email, u.nombre, u.is_verified
        FROM PROFESIONALES p
        JOIN USUARIOS u ON p.id_usuario = u.id_usuario
        ORDER BY p.id_profesional DESC
        LIMIT ? OFFSET ?
      `;
      const result = await executeQuery(query, [limit, offset]);
      return result.map(profesional => new Profesional(profesional));
    } catch (error) {
      throw error;
    }
  }

  // Buscar profesionales por especialidad
  static async findByEspecialidad(especialidad, limit = 50, offset = 0) {
    try {
      const query = `
        SELECT p.*, u.email, u.nombre, u.is_verified
        FROM PROFESIONALES p
        JOIN USUARIOS u ON p.id_usuario = u.id_usuario
        WHERE p.especialidad = ?
        ORDER BY p.rating DESC, p.id_profesional DESC
        LIMIT ? OFFSET ?
      `;
      const result = await executeQuery(query, [especialidad, limit, offset]);
      return result.map(profesional => new Profesional(profesional));
    } catch (error) {
      throw error;
    }
  }

  // Buscar profesionales por criterios
  static async search(criteria, limit = 50, offset = 0) {
    try {
      let query = `
        SELECT p.*, u.email, u.nombre, u.is_verified
        FROM PROFESIONALES p
        JOIN USUARIOS u ON p.id_usuario = u.id_usuario
        WHERE 1=1
      `;
      const values = [];

      if (criteria.especialidad) {
        query += ' AND p.especialidad = ?';
        values.push(criteria.especialidad);
      }

      if (criteria.nombre_completo) {
        query += ' AND p.nombre_completo LIKE ?';
        values.push(`%${criteria.nombre_completo}%`);
      }

      if (criteria.rating_min) {
        query += ' AND p.rating >= ?';
        values.push(criteria.rating_min);
      }

      if (criteria.numero_colegiado) {
        query += ' AND p.numero_colegiado = ?';
        values.push(criteria.numero_colegiado);
      }

      query += ' ORDER BY p.rating DESC, p.id_profesional DESC LIMIT ? OFFSET ?';
      values.push(limit, offset);

      const result = await executeQuery(query, values);
      return result.map(profesional => new Profesional(profesional));
    } catch (error) {
      throw error;
    }
  }

  // Actualizar profesional
  async update(updateData) {
    try {
      const allowedFields = [
        'id_stripe', 'nombre_completo', 'telefono', 'numero_colegiado',
        'especialidad', 'direccion', 'biografia', 'foto_perfil', 'certificaciones',
        'video_presentacion', 'modalidad_cita', 'estado_aprobacion', 'motivo_rechazo'
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

      values.push(this.id_profesional);
      const query = `UPDATE PROFESIONALES SET ${updateFields.join(', ')} WHERE id_profesional = ?`;
      
      await executeQuery(query, values);
      return await Profesional.findById(this.id_profesional);
    } catch (error) {
      throw error;
    }
  }

  // Actualizar rating
  async updateRating() {
    try {
      const query = `
        UPDATE PROFESIONALES 
        SET rating = (
          SELECT AVG(rating) 
          FROM VALORACIONES v 
          JOIN SESIONES s ON v.id_sesion = s.id_sesion 
          WHERE s.id_profesional = ?
        )
        WHERE id_profesional = ?
      `;
      await executeQuery(query, [this.id_profesional, this.id_profesional]);
      return await Profesional.findById(this.id_profesional);
    } catch (error) {
      throw error;
    }
  }

  // Obtener estadísticas del profesional
  async getStats() {
    try {
      const statsQuery = `
        SELECT 
          COUNT(DISTINCT s.id_sesion) as total_sesiones,
          COUNT(DISTINCT c.id_cita) as total_citas,
          AVG(v.rating) as rating_promedio,
          COUNT(DISTINCT v.id_valoracion) as total_valoraciones
        FROM PROFESIONALES p
        LEFT JOIN SESIONES s ON p.id_profesional = s.id_profesional
        LEFT JOIN CITAS c ON p.id_profesional = c.id_profesional
        LEFT JOIN VALORACIONES v ON s.id_sesion = v.id_sesion
        WHERE p.id_profesional = ?
      `;
      
      const result = await executeQuery(statsQuery, [this.id_profesional]);
      return result[0];
    } catch (error) {
      throw error;
    }
  }

  // Aprobar profesional
  async aprobar() {
    try {
      const query = `
        UPDATE PROFESIONALES 
        SET estado_aprobacion = 'aprobado', 
            fecha_aprobacion = NOW(),
            motivo_rechazo = NULL
        WHERE id_profesional = ?
      `;
      await executeQuery(query, [this.id_profesional]);
      return await Profesional.findById(this.id_profesional);
    } catch (error) {
      throw error;
    }
  }

  // Rechazar profesional
  async rechazar(motivo_rechazo) {
    try {
      const query = `
        UPDATE PROFESIONALES 
        SET estado_aprobacion = 'rechazado', 
            motivo_rechazo = ?
        WHERE id_profesional = ?
      `;
      await executeQuery(query, [motivo_rechazo, this.id_profesional]);
      return await Profesional.findById(this.id_profesional);
    } catch (error) {
      throw error;
    }
  }

  // Obtener profesionales pendientes de aprobación
  static async findPendientes(limit = 50, offset = 0) {
    try {
      const query = `
        SELECT p.*, u.email, u.nombre, u.is_verified
        FROM PROFESIONALES p
        JOIN USUARIOS u ON p.id_usuario = u.id_usuario
        WHERE p.estado_aprobacion = 'pendiente'
        ORDER BY p.id_profesional ASC
        LIMIT ? OFFSET ?
      `;
      const result = await executeQuery(query, [limit, offset]);
      return result.map(profesional => new Profesional(profesional));
    } catch (error) {
      throw error;
    }
  }

  // Obtener profesionales aprobados
  static async findAprobados(limit = 50, offset = 0) {
    try {
      const query = `
        SELECT p.*, u.email, u.nombre, u.is_verified
        FROM PROFESIONALES p
        JOIN USUARIOS u ON p.id_usuario = u.id_usuario
        WHERE p.estado_aprobacion = 'aprobado'
        ORDER BY p.rating DESC, p.id_profesional DESC
        LIMIT ? OFFSET ?
      `;
      const result = await executeQuery(query, [limit, offset]);
      return result.map(profesional => new Profesional(profesional));
    } catch (error) {
      throw error;
    }
  }

  // Obtener profesionales por estado de aprobación
  static async findByEstadoAprobacion(estado, limit = 50, offset = 0) {
    try {
      const query = `
        SELECT p.*, u.email, u.nombre, u.is_verified
        FROM PROFESIONALES p
        JOIN USUARIOS u ON p.id_usuario = u.id_usuario
        WHERE p.estado_aprobacion = ?
        ORDER BY p.id_profesional DESC
        LIMIT ? OFFSET ?
      `;
      const result = await executeQuery(query, [estado, limit, offset]);
      return result.map(profesional => new Profesional(profesional));
    } catch (error) {
      throw error;
    }
  }

  // Obtener estadísticas de aprobación
  static async getAprobacionStats() {
    try {
      const query = `
        SELECT 
          estado_aprobacion,
          COUNT(*) as total
        FROM PROFESIONALES
        GROUP BY estado_aprobacion
      `;
      const result = await executeQuery(query);
      return result;
    } catch (error) {
      throw error;
    }
  }

  // Eliminar profesional
  async delete() {
    try {
      const query = 'DELETE FROM PROFESIONALES WHERE id_profesional = ?';
      await executeQuery(query, [this.id_profesional]);
      return true;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Profesional;
