const { executeQuery } = require('../config/database');

class Mensaje {
  constructor(data) {
    this.id_mensaje = data.id_mensaje;
    this.id_remitente = data.id_remitente;
    this.id_destinatario = data.id_destinatario;
    this.asunto = data.asunto;
    this.contenido = data.contenido;
    this.leido = data.leido || false;
    this.fecha_envio = data.fecha_envio;
    this.tipo_mensaje = data.tipo_mensaje || 'general';
    this.prioridad = data.prioridad || 'normal';
  }

  // Crear nuevo mensaje
  static async create(mensajeData) {
    try {
      const { 
        id_remitente, 
        id_destinatario, 
        asunto, 
        contenido, 
        tipo_mensaje = 'general',
        prioridad = 'normal'
      } = mensajeData;

      const query = `
        INSERT INTO MENSAJES (id_remitente, id_destinatario, asunto, contenido, tipo_mensaje, prioridad)
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      const result = await executeQuery(query, [
        id_remitente,
        id_destinatario,
        asunto,
        contenido,
        tipo_mensaje,
        prioridad
      ]);

      return await this.findById(result.insertId);
    } catch (error) {
      throw error;
    }
  }

  // Buscar mensaje por ID
  static async findById(id) {
    try {
      const query = `
        SELECT m.*, 
               ur.nombre as remitente_nombre,
               ur.email as remitente_email,
               ud.nombre as destinatario_nombre,
               ud.email as destinatario_email
        FROM MENSAJES m
        JOIN USUARIOS ur ON m.id_remitente = ur.id_usuario
        JOIN USUARIOS ud ON m.id_destinatario = ud.id_usuario
        WHERE m.id_mensaje = ?
      `;
      const result = await executeQuery(query, [id]);
      return result.length > 0 ? new Mensaje(result[0]) : null;
    } catch (error) {
      throw error;
    }
  }

  // Obtener mensajes recibidos por un usuario
  static async findByDestinatario(id_destinatario, limit = 50, offset = 0, solo_no_leidos = false) {
    try {
      let query = `
        SELECT m.*, 
               ur.nombre as remitente_nombre,
               ur.email as remitente_email,
               ur.rol as remitente_rol
        FROM MENSAJES m
        JOIN USUARIOS ur ON m.id_remitente = ur.id_usuario
        WHERE m.id_destinatario = ?
      `;
      const values = [id_destinatario];

      if (solo_no_leidos) {
        query += ' AND m.leido = false';
      }

      query += ' ORDER BY m.fecha_envio DESC LIMIT ? OFFSET ?';
      values.push(limit, offset);

      const result = await executeQuery(query, values);
      return result.map(mensaje => new Mensaje(mensaje));
    } catch (error) {
      throw error;
    }
  }

  // Obtener mensajes enviados por un usuario
  static async findByRemitente(id_remitente, limit = 50, offset = 0) {
    try {
      const query = `
        SELECT m.*, 
               ud.nombre as destinatario_nombre,
               ud.email as destinatario_email,
               ud.rol as destinatario_rol
        FROM MENSAJES m
        JOIN USUARIOS ud ON m.id_destinatario = ud.id_usuario
        WHERE m.id_remitente = ?
        ORDER BY m.fecha_envio DESC
        LIMIT ? OFFSET ?
      `;
      const result = await executeQuery(query, [id_remitente, limit, offset]);
      return result.map(mensaje => new Mensaje(mensaje));
    } catch (error) {
      throw error;
    }
  }

  // Obtener conversación entre dos usuarios
  static async getConversacion(id_usuario1, id_usuario2, limit = 50, offset = 0) {
    try {
      const query = `
        SELECT m.*, 
               ur.nombre as remitente_nombre,
               ur.email as remitente_email,
               ur.rol as remitente_rol
        FROM MENSAJES m
        JOIN USUARIOS ur ON m.id_remitente = ur.id_usuario
        WHERE (m.id_remitente = ? AND m.id_destinatario = ?) 
           OR (m.id_remitente = ? AND m.id_destinatario = ?)
        ORDER BY m.fecha_envio ASC
        LIMIT ? OFFSET ?
      `;
      const result = await executeQuery(query, [
        id_usuario1, id_usuario2, 
        id_usuario2, id_usuario1, 
        limit, offset
      ]);
      return result.map(mensaje => new Mensaje(mensaje));
    } catch (error) {
      throw error;
    }
  }

  // Marcar mensaje como leído
  async marcarComoLeido() {
    try {
      const query = 'UPDATE MENSAJES SET leido = true WHERE id_mensaje = ?';
      await executeQuery(query, [this.id_mensaje]);
      this.leido = true;
      return this;
    } catch (error) {
      throw error;
    }
  }

  // Marcar múltiples mensajes como leídos
  static async marcarComoLeidos(ids_mensajes) {
    try {
      if (ids_mensajes.length === 0) return [];
      
      const placeholders = ids_mensajes.map(() => '?').join(',');
      const query = `UPDATE MENSAJES SET leido = true WHERE id_mensaje IN (${placeholders})`;
      await executeQuery(query, ids_mensajes);
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Obtener estadísticas de mensajes
  static async getStats(id_usuario) {
    try {
      const query = `
        SELECT 
          COUNT(*) as total_mensajes,
          SUM(CASE WHEN leido = false THEN 1 ELSE 0 END) as mensajes_no_leidos,
          SUM(CASE WHEN id_remitente = ? THEN 1 ELSE 0 END) as mensajes_enviados,
          SUM(CASE WHEN id_destinatario = ? THEN 1 ELSE 0 END) as mensajes_recibidos
        FROM MENSAJES
        WHERE id_remitente = ? OR id_destinatario = ?
      `;
      const result = await executeQuery(query, [id_usuario, id_usuario, id_usuario, id_usuario]);
      return result[0];
    } catch (error) {
      throw error;
    }
  }

  // Obtener contactos recientes
  static async getContactosRecientes(id_usuario, limit = 20) {
    try {
      const query = `
        SELECT DISTINCT
          CASE 
            WHEN m.id_remitente = ? THEN m.id_destinatario
            ELSE m.id_remitente
          END as id_contacto,
          CASE 
            WHEN m.id_remitente = ? THEN ud.nombre
            ELSE ur.nombre
          END as nombre_contacto,
          CASE 
            WHEN m.id_remitente = ? THEN ud.email
            ELSE ur.email
          END as email_contacto,
          CASE 
            WHEN m.id_remitente = ? THEN ud.rol
            ELSE ur.rol
          END as rol_contacto,
          MAX(m.fecha_envio) as ultimo_mensaje
        FROM MENSAJES m
        JOIN USUARIOS ur ON m.id_remitente = ur.id_usuario
        JOIN USUARIOS ud ON m.id_destinatario = ud.id_usuario
        WHERE m.id_remitente = ? OR m.id_destinatario = ?
        GROUP BY id_contacto
        ORDER BY ultimo_mensaje DESC
        LIMIT ?
      `;
      const result = await executeQuery(query, [
        id_usuario, id_usuario, id_usuario, id_usuario, 
        id_usuario, id_usuario, limit
      ]);
      return result;
    } catch (error) {
      throw error;
    }
  }

  // Buscar mensajes por contenido
  static async searchByContent(id_usuario, searchTerm, limit = 50, offset = 0) {
    try {
      const query = `
        SELECT m.*, 
               ur.nombre as remitente_nombre,
               ud.nombre as destinatario_nombre
        FROM MENSAJES m
        JOIN USUARIOS ur ON m.id_remitente = ur.id_usuario
        JOIN USUARIOS ud ON m.id_destinatario = ud.id_usuario
        WHERE (m.id_remitente = ? OR m.id_destinatario = ?)
          AND (m.contenido LIKE ? OR m.asunto LIKE ?)
        ORDER BY m.fecha_envio DESC
        LIMIT ? OFFSET ?
      `;
      const searchPattern = `%${searchTerm}%`;
      const result = await executeQuery(query, [
        id_usuario, id_usuario, searchPattern, searchPattern, limit, offset
      ]);
      return result.map(mensaje => new Mensaje(mensaje));
    } catch (error) {
      throw error;
    }
  }

  // Eliminar mensaje
  async delete() {
    try {
      const query = 'DELETE FROM MENSAJES WHERE id_mensaje = ?';
      await executeQuery(query, [this.id_mensaje]);
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Eliminar mensajes antiguos (para limpieza)
  static async deleteOldMessages(daysOld = 365) {
    try {
      const query = `
        DELETE FROM MENSAJES 
        WHERE fecha_envio < DATE_SUB(NOW(), INTERVAL ? DAY)
      `;
      const result = await executeQuery(query, [daysOld]);
      return result.affectedRows;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Mensaje;

