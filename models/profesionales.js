// --- [MODELO] models/profesionales.js ¡CARGADO CORRECTAMENTE! ---
console.log('--- [MODELO] models/profesionales.js ¡CARGADO CORRECTAMENTE! ---');

// --- ¡CORREGIDO! ---
// Importamos el 'pool' de conexiones, no 'executeQuery'
const pool = require('../config/database');

class Profesional {
  constructor(data) {
    // --- CORREGIDO ---
    // Propiedades ajustadas a la tabla `profesionales` de dbnaxine
    this.id_profesional = data.id_profesional;
    this.id_usuario = data.id_usuario; // <--- CAMBIO
    this.id_especialidad = data.id_especialidad; // <--- AÑADIDO
    this.nombre_completo = data.nombre_completo;
    this.especialidad = data.especialidad; // <--- CAMPO DE STRING (además de ID)
    this.telefono = data.telefono;
    this.email = data.email; // <--- AÑADIDO (de la tabla o del join)
    this.direccion = data.direccion;
    this.domicilio_consultorio = data.domicilio_consultorio; // <--- AÑADIDO
    this.descripcion = data.descripcion; // <--- CAMBIO (era biografia)
    this.experiencia_años = data.experiencia_años; // <--- AÑADIDO
    this.tarifa_por_hora = data.tarifa_por_hora; // <--- AÑADIDO
    this.disponibilidad = data.disponibilidad; // <--- AÑADIDO (JSON)
    this.enlace_publico = data.enlace_publico; // <--- AÑADIDO
    this.estado_aprobacion = data.estado_aprobacion || 'pendiente';
    this.fecha_aprobacion = data.fecha_aprobacion;
    this.motivo_rechazo = data.motivo_rechazo;
    this.video_presentacion = data.video_presentacion;
    this.modalidad_cita = data.modalidad_cita; // <--- CAMBIO (era modalidad_citas)
    this.modo_atencion = data.modo_atencion; // <--- AÑADIDO

    // Campos de JOIN (de la tabla usuarios)
    this.email_usuario = data.email_usuario; // Email de la tabla usuarios
    this.nombre_usuario = data.nombre; // Nombre de la tabla usuarios
    this.is_verified = data.is_verified;

    // --- CAMPOS ELIMINADOS ---
    // this.id_stripe (no existe)
    // this.numero_colegiado (no existe)
    // this.rating (no existe, está en valoraciones)
    // this.foto_perfil (no existe)
    // this.certificaciones (no existe)
  }

  // Crear nuevo profesional
  static async create(profesionalData) {
    try {
      // --- CORREGIDO ---
      // Campos ajustados al controlador y la DB
      const {
        id_usuario,
        id_especialidad,
        nombre_completo,
        telefono,
        email,
        especialidad,
        direccion,
        domicilio_consultorio,
        descripcion,
        experiencia_años,
        tarifa_por_hora,
        disponibilidad,
        enlace_publico,
        video_presentacion,
        modalidad_cita,
        modo_atencion
      } = profesionalData;

      const query = `
        INSERT INTO profesionales (
          id_usuario, id_especialidad, nombre_completo, telefono, email,
          especialidad, direccion, domicilio_consultorio, descripcion, experiencia_años,
          tarifa_por_hora, disponibilidad, enlace_publico, video_presentacion,
          modalidad_cita, modo_atencion
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      // --- ¡CORREGIDO! ---
      const [result] = await pool.query(query, [
        id_usuario,
        id_especialidad,
        nombre_completo,
        telefono,
        email,
        especialidad,
        direccion,
        domicilio_consultorio,
        descripcion,
        experiencia_años,
        tarifa_por_hora,
        disponibilidad ? JSON.stringify(disponibilidad) : null, // Asegurarse de guardar JSON como string
        enlace_publico,
        video_presentacion,
        modalidad_cita,
        modo_atencion
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
        SELECT p.*, u.email as email_usuario, u.nombre, u.is_verified
        FROM profesionales p
        JOIN usuarios u ON p.id_usuario = u.id_usuario
        WHERE p.id_profesional = ?
      `;
      // --- ¡CORREGIDO! ---
      const [result] = await pool.query(query, [id]);
      return result.length > 0 ? new Profesional(result[0]) : null;
    } catch (error) {
      throw error;
    }
  }

  // Buscar profesional por ID de usuario
  static async findByUserId(userId) {
    try {
      const query = `
        SELECT p.*, u.email as email_usuario, u.nombre, u.is_verified
        FROM profesionales p
        JOIN usuarios u ON p.id_usuario = u.id_usuario
        WHERE p.id_usuario = ?
      `;
      // --- ¡CORREGIDO! ---
      const [result] = await pool.query(query, [userId]);
      return result.length > 0 ? new Profesional(result[0]) : null;
    } catch (error) {
      throw error;
    }
  }

  // Obtener todos los profesionales
  static async findAll(limit = 50, offset = 0) {
    try {
      const query = `
        SELECT p.*, u.email as email_usuario, u.nombre, u.is_verified
        FROM profesionales p
        JOIN usuarios u ON p.id_usuario = u.id_usuario
        ORDER BY p.id_profesional DESC
        LIMIT ? OFFSET ?
      `;
      // --- ¡CORREGIDO! ---
      const [result] = await pool.query(query, [limit, offset]);
      return result.map(profesional => new Profesional(profesional));
    } catch (error) {
      throw error;
    }
  }

  // Buscar profesionales por especialidad
  static async findByEspecialidad(especialidad, limit = 50, offset = 0) {
    try {
      const query = `
        SELECT p.*, u.email as email_usuario, u.nombre, u.is_verified
        FROM profesionales p
        JOIN usuarios u ON p.id_usuario = u.id_usuario
        WHERE p.especialidad = ?
        ORDER BY p.nombre_completo ASC, p.id_profesional DESC
        LIMIT ? OFFSET ?
      `; // <--- CAMBIO: Quitado 'rating' del ORDER BY
      // --- ¡CORREGIDO! ---
      const [result] = await pool.query(query, [especialidad, limit, offset]);
      return result.map(profesional => new Profesional(profesional));
    } catch (error) {
      throw error;
    }
  }

  // Buscar profesionales por criterios
  static async search(criteria, limit = 50, offset = 0) {
    try {
      let query = `
        SELECT p.*, u.email as email_usuario, u.nombre, u.is_verified
        FROM profesionales p
        JOIN usuarios u ON p.id_usuario = u.id_usuario
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

      // --- CORREGIDO ---
      // Se quitaron rating_min y numero_colegiado
      query += ' ORDER BY p.nombre_completo ASC, p.id_profesional DESC LIMIT ? OFFSET ?';
      values.push(limit, offset);

      // --- ¡CORREGIDO! ---
      const [result] = await pool.query(query, values);
      return result.map(profesional => new Profesional(profesional));
    } catch (error) {
      throw error;
    }
  }

  // Actualizar profesional
  async update(updateData) {
    try {
      // --- CORREGIDO ---
      // Campos permitidos ajustados a la DB
      const allowedFields = [
        'id_especialidad', 'nombre_completo', 'telefono', 'email', 'especialidad',
        'direccion', 'domicilio_consultorio', 'descripcion', 'experiencia_años',
        'tarifa_por_hora', 'disponibilidad', 'enlace_publico', 'estado_aprobacion',
        'video_presentacion', 'modalidad_cita', 'modo_atencion', 'motivo_rechazo'
      ];
      
      const updateFields = [];
      const values = [];

      for (const [key, value] of Object.entries(updateData)) {
        if (allowedFields.includes(key) && value !== undefined) {
          updateFields.push(`${key} = ?`);
          // Convertir JSON a string si es necesario
          if (key === 'disponibilidad') {
            values.push(JSON.stringify(value));
          } else {
            values.push(value);
          }
        }
      }

      if (updateFields.length === 0) {
        // Devolver el objeto actual si no hay nada que actualizar
        return this;
      }

      values.push(this.id_profesional);
      const query = `UPDATE profesionales SET ${updateFields.join(', ')} WHERE id_profesional = ?`;
      
      // --- ¡CORREGIDO! ---
      await pool.query(query, values);
      return await Profesional.findById(this.id_profesional);
    } catch (error) {
      throw error;
    }
  }

  // --- ELIMINADO ---
  // La función updateRating() fue eliminada porque la tabla `profesionales`
  // no tiene una columna `rating`. El rating debe calcularse
  // desde la tabla `valoraciones` cuando sea necesario (ej: en getStats).

  // Obtener estadísticas del profesional
  async getStats() {
    try {
      const statsQuery = `
        SELECT 
          COUNT(DISTINCT s.id_sesion) as total_sesiones,
          COUNT(DISTINCT c.id_cita) as total_citas,
          AVG(v.calificacion) as rating_promedio,
          COUNT(DISTINCT v.id_valoracion) as total_valoraciones
        FROM profesionales p
        LEFT JOIN sesiones s ON p.id_profesional = s.id_profesional
        LEFT JOIN citas c ON p.id_profesional = c.id_profesional
        LEFT JOIN valoraciones v ON p.id_profesional = v.id_profesional
        WHERE p.id_profesional = ?
        GROUP BY p.id_profesional
      `;
      // --- CORREGIDO ---
      // Corregidas tablas (citas, valoraciones) y join de valoraciones
      
      // --- ¡CORREGIDO! ---
      const [result] = await pool.query(statsQuery, [this.id_profesional]);
      return result.length > 0 ? result[0] : {
        total_sesiones: 0,
        total_citas: 0,
        rating_promedio: 0,
        total_valoraciones: 0
      };
    } catch (error) {
      throw error;
    }
  }

  // Aprobar profesional
  async aprobar() {
    try {
      const query = `
        UPDATE profesionales 
        SET estado_aprobacion = 'aprobado', 
            fecha_aprobacion = NOW(),
            motivo_rechazo = NULL
        WHERE id_profesional = ?
      `;
      // --- ¡CORREGIDO! ---
      await pool.query(query, [this.id_profesional]);
      return await Profesional.findById(this.id_profesional);
    } catch (error) {
      throw error;
    }
  }

  // Rechazar profesional
  async rechazar(motivo_rechazo) {
    try {
      const query = `
        UPDATE profesionales 
        SET estado_aprobacion = 'rechazado', 
            motivo_rechazo = ?
        WHERE id_profesional = ?
      `;
      // --- ¡CORREGIDO! ---
      await pool.query(query, [motivo_rechazo, this.id_profesional]);
      return await Profesional.findById(this.id_profesional);
    } catch (error) {
      throw error;
    }
  }

  // Obtener profesionales pendientes de aprobación
  static async findPendientes(limit = 50, offset = 0) {
    try {
      const query = `
        SELECT p.*, u.email as email_usuario, u.nombre, u.is_verified
        FROM profesionales p
        JOIN usuarios u ON p.id_usuario = u.id_usuario
        WHERE p.estado_aprobacion = 'pendiente'
        ORDER BY p.id_profesional ASC
        LIMIT ? OFFSET ?
      `;
      // --- ¡CORREGIDO! ---
      const [result] = await pool.query(query, [limit, offset]);
      return result.map(profesional => new Profesional(profesional));
    } catch (error) {
      throw error;
    }
  }

  // Obtener profesionales aprobados
  static async findAprobados(limit = 50, offset = 0) {
    try {
      const query = `
        SELECT p.*, u.email as email_usuario, u.nombre, u.is_verified
        FROM profesionales p
        JOIN usuarios u ON p.id_usuario = u.id_usuario
        WHERE p.estado_aprobacion = 'aprobado'
        ORDER BY p.nombre_completo ASC, p.id_profesional DESC
        LIMIT ? OFFSET ?
      `; // <--- CAMBIO: Quitado 'rating' del ORDER BY
      // --- ¡CORREGIDO! ---
      const [result] = await pool.query(query, [limit, offset]);
      return result.map(profesional => new Profesional(profesional));
    } catch (error) {
      throw error;
    }
  }

  // Obtener profesionales por estado de aprobación
  static async findByEstadoAprobacion(estado, limit = 50, offset = 0) {
    try {
      const query = `
        SELECT p.*, u.email as email_usuario, u.nombre, u.is_verified
        FROM profesionales p
        JOIN usuarios u ON p.id_usuario = u.id_usuario
        WHERE p.estado_aprobacion = ?
        ORDER BY p.id_profesional DESC
        LIMIT ? OFFSET ?
      `;
      // --- ¡CORREGIDO! ---
      const [result] = await pool.query(query, [estado, limit, offset]);
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
        FROM profesionales
        GROUP BY estado_aprobacion
      `;
      // --- ¡CORREGIDO! ---
      const [result] = await pool.query(query);
      return result;
    } catch (error) {
      throw error;
    }
  }

  // Eliminar profesional
  async delete() {
    try {
      const query = 'DELETE FROM profesionales WHERE id_profesional = ?';
      // --- ¡CORREGIDO! ---
      await pool.query(query, [this.id_profesional]);
      return true;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Profesional;
