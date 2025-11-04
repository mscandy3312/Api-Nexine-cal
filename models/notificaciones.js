const { executeQuery } = require('../config/database');

class Notificacion {
  constructor(data) {
    this.id_notificacion = data.id_notificacion;
    this.id_usuarioss = data.id_usuarioss;
    this.tipo_notificacion = data.tipo_notificacion;
    this.titulo = data.titulo;
    this.mensaje = data.mensaje;
    this.datos_adicionales = data.datos_adicionales;
    this.leida = data.leida || false;
    this.fecha_creacion = data.fecha_creacion;
    this.fecha_lectura = data.fecha_lectura;
    this.prioridad = data.prioridad || 'normal';
    this.canal = data.canal || 'app';
    this.estado = data.estado || 'activa';
  }

  // Crear nueva notificación
  static async create(notificacionData) {
    try {
      const {
        id_usuarioss,
        tipo_notificacion,
        titulo,
        mensaje,
        datos_adicionales = null,
        prioridad = 'normal',
        canal = 'app'
      } = notificacionData;

      const query = `
        INSERT INTO NOTIFICACIONES (
          id_usuarioss, tipo_notificacion, titulo, mensaje, 
          datos_adicionales, prioridad, canal
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

      const result = await executeQuery(query, [
        id_usuarioss,
        tipo_notificacion,
        titulo,
        mensaje,
        datos_adicionales ? JSON.stringify(datos_adicionales) : null,
        prioridad,
        canal
      ]);

      return await this.findById(result.insertId);
    } catch (error) {
      throw error;
    }
  }

  // Crear notificación masiva para múltiples usuariosss
  static async createMasiva(usuariosss, notificacionData) {
    try {
      const {
        tipo_notificacion,
        titulo,
        mensaje,
        datos_adicionales = null,
        prioridad = 'normal',
        canal = 'app'
      } = notificacionData;

      const values = [];
      const placeholders = [];

      usuariosss.forEach(id_usuarioss => {
        placeholders.push('(?, ?, ?, ?, ?, ?, ?)');
        values.push(
          id_usuarioss,
          tipo_notificacion,
          titulo,
          mensaje,
          datos_adicionales ? JSON.stringify(datos_adicionales) : null,
          prioridad,
          canal
        );
      });

      const query = `
        INSERT INTO NOTIFICACIONES (
          id_usuarioss, tipo_notificacion, titulo, mensaje, 
          datos_adicionales, prioridad, canal
        ) VALUES ${placeholders.join(', ')}
      `;

      const result = await executeQuery(query, values);
      return result.affectedRows;
    } catch (error) {
      throw error;
    }
  }

  // Buscar notificación por ID
  static async findById(id) {
    try {
      const query = `
        SELECT n.*, 
               u.nombre as usuarioss_nombre,
               u.email as usuarioss_email
        FROM NOTIFICACIONES n
        JOIN usuariossS u ON n.id_usuarioss = u.id_usuarioss
        WHERE n.id_notificacion = ?
      `;
      const result = await executeQuery(query, [id]);
      return result.length > 0 ? new Notificacion(result[0]) : null;
    } catch (error) {
      throw error;
    }
  }

  // Obtener notificaciones de un usuarioss
  static async findByusuarioss(id_usuarioss, limit = 50, offset = 0, solo_no_leidas = false) {
    try {
      let query = `
        SELECT n.*, 
               u.nombre as usuarioss_nombre,
               u.email as usuarioss_email
        FROM NOTIFICACIONES n
        JOIN usuariossS u ON n.id_usuarioss = u.id_usuarioss
        WHERE n.id_usuarioss = ?
      `;
      const values = [id_usuarioss];

      if (solo_no_leidas) {
        query += ' AND n.leida = false';
      }

      query += ' ORDER BY n.fecha_creacion DESC LIMIT ? OFFSET ?';
      values.push(limit, offset);

      const result = await executeQuery(query, values);
      return result.map(notificacion => new Notificacion(notificacion));
    } catch (error) {
      throw error;
    }
  }

  // Obtener notificaciones por tipo
  static async findByTipo(tipo_notificacion, limit = 50, offset = 0) {
    try {
      const query = `
        SELECT n.*, 
               u.nombre as usuarioss_nombre,
               u.email as usuarioss_email
        FROM NOTIFICACIONES n
        JOIN usuariossS u ON n.id_usuarioss = u.id_usuarioss
        WHERE n.tipo_notificacion = ?
        ORDER BY n.fecha_creacion DESC
        LIMIT ? OFFSET ?
      `;
      const result = await executeQuery(query, [tipo_notificacion, limit, offset]);
      return result.map(notificacion => new Notificacion(notificacion));
    } catch (error) {
      throw error;
    }
  }

  // Obtener notificaciones por prioridad
  static async findByPrioridad(prioridad, limit = 50, offset = 0) {
    try {
      const query = `
        SELECT n.*, 
               u.nombre as usuarioss_nombre,
               u.email as usuarioss_email
        FROM NOTIFICACIONES n
        JOIN usuariossS u ON n.id_usuarioss = u.id_usuarioss
        WHERE n.prioridad = ?
        ORDER BY n.fecha_creacion DESC
        LIMIT ? OFFSET ?
      `;
      const result = await executeQuery(query, [prioridad, limit, offset]);
      return result.map(notificacion => new Notificacion(notificacion));
    } catch (error) {
      throw error;
    }
  }

  // Marcar notificación como leída
  async marcarComoLeida() {
    try {
      const query = `
        UPDATE NOTIFICACIONES 
        SET leida = true, fecha_lectura = NOW() 
        WHERE id_notificacion = ?
      `;
      await executeQuery(query, [this.id_notificacion]);
      this.leida = true;
      this.fecha_lectura = new Date();
      return this;
    } catch (error) {
      throw error;
    }
  }

  // Marcar múltiples notificaciones como leídas
  static async marcarComoLeidas(ids_notificaciones) {
    try {
      if (ids_notificaciones.length === 0) return [];
      
      const placeholders = ids_notificaciones.map(() => '?').join(',');
      const query = `
        UPDATE NOTIFICACIONES 
        SET leida = true, fecha_lectura = NOW() 
        WHERE id_notificacion IN (${placeholders})
      `;
      await executeQuery(query, ids_notificaciones);
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Marcar todas las notificaciones de un usuarioss como leídas
  static async marcarTodasComoLeidas(id_usuarioss) {
    try {
      const query = `
        UPDATE NOTIFICACIONES 
        SET leida = true, fecha_lectura = NOW() 
        WHERE id_usuarioss = ? AND leida = false
      `;
      const result = await executeQuery(query, [id_usuarioss]);
      return result.affectedRows;
    } catch (error) {
      throw error;
    }
  }

  // Obtener estadísticas de notificaciones
  static async getStats(id_usuarioss = null) {
    try {
      let query = `
        SELECT 
          COUNT(*) as total_notificaciones,
          SUM(CASE WHEN leida = false THEN 1 ELSE 0 END) as no_leidas,
          SUM(CASE WHEN prioridad = 'alta' THEN 1 ELSE 0 END) as alta_prioridad,
          SUM(CASE WHEN prioridad = 'media' THEN 1 ELSE 0 END) as media_prioridad,
          SUM(CASE WHEN prioridad = 'normal' THEN 1 ELSE 0 END) as normal_prioridad
        FROM NOTIFICACIONES
        WHERE estado = 'activa'
      `;
      const values = [];

      if (id_usuarioss) {
        query += ' AND id_usuarioss = ?';
        values.push(id_usuarioss);
      }

      const result = await executeQuery(query, values);
      return result[0];
    } catch (error) {
      throw error;
    }
  }

  // Obtener estadísticas por tipo de notificación
  static async getStatsByType() {
    try {
      const query = `
        SELECT 
          tipo_notificacion,
          COUNT(*) as total,
          SUM(CASE WHEN leida = false THEN 1 ELSE 0 END) as no_leidas,
          AVG(CASE WHEN leida = true THEN TIMESTAMPDIFF(MINUTE, fecha_creacion, fecha_lectura) END) as tiempo_promedio_lectura
        FROM NOTIFICACIONES
        WHERE estado = 'activa'
        GROUP BY tipo_notificacion
        ORDER BY total DESC
      `;
      const result = await executeQuery(query);
      return result;
    } catch (error) {
      throw error;
    }
  }

  // Obtener notificaciones recientes
  static async getRecent(limit = 10) {
    try {
      const query = `
        SELECT n.*, 
               u.nombre as usuarioss_nombre,
               u.email as usuarioss_email
        FROM NOTIFICACIONES n
        JOIN usuariossS u ON n.id_usuarioss = u.id_usuarioss
        WHERE n.estado = 'activa'
        ORDER BY n.fecha_creacion DESC
        LIMIT ?
      `;
      const result = await executeQuery(query, [limit]);
      return result.map(notificacion => new Notificacion(notificacion));
    } catch (error) {
      throw error;
    }
  }

  // Buscar notificaciones por contenido
  static async searchByContent(searchTerm, limit = 50, offset = 0) {
    try {
      const query = `
        SELECT n.*, 
               u.nombre as usuarioss_nombre,
               u.email as usuarioss_email
        FROM NOTIFICACIONES n
        JOIN usuariossS u ON n.id_usuarioss = u.id_usuarioss
        WHERE (n.titulo LIKE ? OR n.mensaje LIKE ?)
          AND n.estado = 'activa'
        ORDER BY n.fecha_creacion DESC
        LIMIT ? OFFSET ?
      `;
      const searchPattern = `%${searchTerm}%`;
      const result = await executeQuery(query, [searchPattern, searchPattern, limit, offset]);
      return result.map(notificacion => new Notificacion(notificacion));
    } catch (error) {
      throw error;
    }
  }

  // Actualizar notificación
  async update(updateData) {
    try {
      const allowedFields = [
        'titulo', 'mensaje', 'datos_adicionales', 'prioridad', 'canal', 'estado'
      ];
      
      const updateFields = [];
      const values = [];

      for (const [key, value] of Object.entries(updateData)) {
        if (allowedFields.includes(key) && value !== undefined) {
          if (key === 'datos_adicionales' && value) {
            updateFields.push(`${key} = ?`);
            values.push(JSON.stringify(value));
          } else {
            updateFields.push(`${key} = ?`);
            values.push(value);
          }
        }
      }

      if (updateFields.length === 0) {
        throw new Error('No hay campos válidos para actualizar');
      }

      values.push(this.id_notificacion);
      const query = `UPDATE NOTIFICACIONES SET ${updateFields.join(', ')} WHERE id_notificacion = ?`;
      
      await executeQuery(query, values);
      return await Notificacion.findById(this.id_notificacion);
    } catch (error) {
      throw error;
    }
  }

  // Archivar notificación (soft delete)
  async archivar() {
    try {
      const query = `
        UPDATE NOTIFICACIONES 
        SET estado = 'archivada' 
        WHERE id_notificacion = ?
      `;
      await executeQuery(query, [this.id_notificacion]);
      this.estado = 'archivada';
      return this;
    } catch (error) {
      throw error;
    }
  }

  // Eliminar notificación
  async delete() {
    try {
      const query = 'DELETE FROM NOTIFICACIONES WHERE id_notificacion = ?';
      await executeQuery(query, [this.id_notificacion]);
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Eliminar notificaciones antiguas (para limpieza)
  static async deleteOldNotifications(daysOld = 30) {
    try {
      const query = `
        DELETE FROM NOTIFICACIONES 
        WHERE fecha_creacion < DATE_SUB(NOW(), INTERVAL ? DAY)
          AND estado = 'archivada'
      `;
      const result = await executeQuery(query, [daysOld]);
      return result.affectedRows;
    } catch (error) {
      throw error;
    }
  }

  // Obtener tipos de notificación disponibles
  static async getNotificationTypes() {
    try {
      const query = `
        SELECT DISTINCT tipo_notificacion, COUNT(*) as total
        FROM NOTIFICACIONES
        WHERE estado = 'activa'
        GROUP BY tipo_notificacion
        ORDER BY total DESC
      `;
      const result = await executeQuery(query);
      return result;
    } catch (error) {
      throw error;
    }
  }

  // Crear notificaciones automáticas para eventos del sistema
  static async crearNotificacionEvento(evento, datos) {
    try {
      const tiposEvento = {
        'citas_creada': {
          tipo: 'citas',
          titulo: 'Nueva citas programada',
          mensaje: 'Se ha programado una nueva citas para el {fecha}',
          prioridad: 'normal'
        },
        'citas_confirmada': {
          tipo: 'citas',
          titulo: 'citas confirmada',
          mensaje: 'Tu citas del {fecha} ha sido confirmada',
          prioridad: 'normal'
        },
        'citas_cancelada': {
          tipo: 'citas',
          titulo: 'citas cancelada',
          mensaje: 'La citas del {fecha} ha sido cancelada',
          prioridad: 'media'
        },
        'sesion_completada': {
          tipo: 'sesion',
          titulo: 'Sesión completada',
          mensaje: 'Tu sesión del {fecha} ha sido completada. ¡Valora tu experiencia!',
          prioridad: 'normal'
        },
        'profesional_aprobado': {
          tipo: 'profesional',
          titulo: 'Perfil aprobado',
          mensaje: '¡Felicidades! Tu perfil profesional ha sido aprobado',
          prioridad: 'alta'
        },
        'profesional_rechazado': {
          tipo: 'profesional',
          titulo: 'Perfil rechazado',
          mensaje: 'Tu perfil profesional ha sido rechazado. Revisa los comentarios',
          prioridad: 'alta'
        },
        'pago_recibido': {
          tipo: 'pago',
          titulo: 'Pago recibido',
          mensaje: 'Se ha recibido un pago de ${monto}',
          prioridad: 'normal'
        }
      };

      const configEvento = tiposEvento[evento];
      if (!configEvento) {
        throw new Error(`Tipo de evento no válido: ${evento}`);
      }

      // Reemplazar placeholders en el mensaje
      let mensaje = configEvento.mensaje;
      Object.keys(datos).forEach(key => {
        mensaje = mensaje.replace(`{${key}}`, datos[key]);
      });

      return await this.create({
        id_usuarioss: datos.id_usuarioss,
        tipo_notificacion: configEvento.tipo,
        titulo: configEvento.titulo,
        mensaje: mensaje,
        datos_adicionales: datos,
        prioridad: configEvento.prioridad
      });
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Notificacion;

