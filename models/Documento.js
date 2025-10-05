const { executeQuery } = require('../config/database');

class Documento {
  constructor(data) {
    this.id_documento = data.id_documento;
    this.id_profesional = data.id_profesional;
    this.nombre_archivo = data.nombre_archivo;
    this.nombre_original = data.nombre_original;
    this.tipo_documento = data.tipo_documento;
    this.ruta_archivo = data.ruta_archivo;
    this.tamaño_archivo = data.tamaño_archivo;
    this.tipo_mime = data.tipo_mime;
    this.descripcion = data.descripcion;
    this.fecha_subida = data.fecha_subida;
    this.estado = data.estado || 'activo';
    this.es_publico = data.es_publico || false;
  }

  // Crear nuevo documento
  static async create(documentoData) {
    try {
      const {
        id_profesional,
        nombre_archivo,
        nombre_original,
        tipo_documento,
        ruta_archivo,
        tamaño_archivo,
        tipo_mime,
        descripcion,
        es_publico = false
      } = documentoData;

      const query = `
        INSERT INTO DOCUMENTOS (
          id_profesional, nombre_archivo, nombre_original, tipo_documento,
          ruta_archivo, tamaño_archivo, tipo_mime, descripcion, es_publico
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const result = await executeQuery(query, [
        id_profesional,
        nombre_archivo,
        nombre_original,
        tipo_documento,
        ruta_archivo,
        tamaño_archivo,
        tipo_mime,
        descripcion,
        es_publico
      ]);

      return await this.findById(result.insertId);
    } catch (error) {
      throw error;
    }
  }

  // Buscar documento por ID
  static async findById(id) {
    try {
      const query = `
        SELECT d.*, 
               p.nombre_completo as profesional_nombre,
               p.especialidad
        FROM DOCUMENTOS d
        JOIN PROFESIONALES p ON d.id_profesional = p.id_profesional
        WHERE d.id_documento = ?
      `;
      const result = await executeQuery(query, [id]);
      return result.length > 0 ? new Documento(result[0]) : null;
    } catch (error) {
      throw error;
    }
  }

  // Obtener documentos de un profesional
  static async findByProfesional(id_profesional, limit = 50, offset = 0, solo_publicos = false) {
    try {
      let query = `
        SELECT d.*, 
               p.nombre_completo as profesional_nombre,
               p.especialidad
        FROM DOCUMENTOS d
        JOIN PROFESIONALES p ON d.id_profesional = p.id_profesional
        WHERE d.id_profesional = ?
      `;
      const values = [id_profesional];

      if (solo_publicos) {
        query += ' AND d.es_publico = true AND d.estado = "activo"';
      }

      query += ' ORDER BY d.fecha_subida DESC LIMIT ? OFFSET ?';
      values.push(limit, offset);

      const result = await executeQuery(query, values);
      return result.map(documento => new Documento(documento));
    } catch (error) {
      throw error;
    }
  }

  // Obtener documentos por tipo
  static async findByTipo(tipo_documento, limit = 50, offset = 0) {
    try {
      const query = `
        SELECT d.*, 
               p.nombre_completo as profesional_nombre,
               p.especialidad
        FROM DOCUMENTOS d
        JOIN PROFESIONALES p ON d.id_profesional = p.id_profesional
        WHERE d.tipo_documento = ? AND d.estado = 'activo'
        ORDER BY d.fecha_subida DESC
        LIMIT ? OFFSET ?
      `;
      const result = await executeQuery(query, [tipo_documento, limit, offset]);
      return result.map(documento => new Documento(documento));
    } catch (error) {
      throw error;
    }
  }

  // Obtener documentos públicos
  static async findPublicos(limit = 50, offset = 0) {
    try {
      const query = `
        SELECT d.*, 
               p.nombre_completo as profesional_nombre,
               p.especialidad,
               p.foto_perfil
        FROM DOCUMENTOS d
        JOIN PROFESIONALES p ON d.id_profesional = p.id_profesional
        WHERE d.es_publico = true AND d.estado = 'activo'
        ORDER BY d.fecha_subida DESC
        LIMIT ? OFFSET ?
      `;
      const result = await executeQuery(query, [limit, offset]);
      return result.map(documento => new Documento(documento));
    } catch (error) {
      throw error;
    }
  }

  // Buscar documentos por nombre o descripción
  static async search(searchTerm, limit = 50, offset = 0) {
    try {
      const query = `
        SELECT d.*, 
               p.nombre_completo as profesional_nombre,
               p.especialidad
        FROM DOCUMENTOS d
        JOIN PROFESIONALES p ON d.id_profesional = p.id_profesional
        WHERE (d.nombre_original LIKE ? OR d.descripcion LIKE ?) 
          AND d.estado = 'activo'
        ORDER BY d.fecha_subida DESC
        LIMIT ? OFFSET ?
      `;
      const searchPattern = `%${searchTerm}%`;
      const result = await executeQuery(query, [searchPattern, searchPattern, limit, offset]);
      return result.map(documento => new Documento(documento));
    } catch (error) {
      throw error;
    }
  }

  // Obtener estadísticas de documentos
  static async getStats(id_profesional = null) {
    try {
      let query = `
        SELECT 
          COUNT(*) as total_documentos,
          SUM(tamaño_archivo) as tamaño_total,
          COUNT(DISTINCT tipo_documento) as tipos_diferentes,
          COUNT(CASE WHEN es_publico = true THEN 1 END) as documentos_publicos
        FROM DOCUMENTOS
        WHERE estado = 'activo'
      `;
      const values = [];

      if (id_profesional) {
        query += ' AND id_profesional = ?';
        values.push(id_profesional);
      }

      const result = await executeQuery(query, values);
      return result[0];
    } catch (error) {
      throw error;
    }
  }

  // Obtener estadísticas por tipo de documento
  static async getStatsByType() {
    try {
      const query = `
        SELECT 
          tipo_documento,
          COUNT(*) as total,
          SUM(tamaño_archivo) as tamaño_total,
          AVG(tamaño_archivo) as tamaño_promedio
        FROM DOCUMENTOS
        WHERE estado = 'activo'
        GROUP BY tipo_documento
        ORDER BY total DESC
      `;
      const result = await executeQuery(query);
      return result;
    } catch (error) {
      throw error;
    }
  }

  // Obtener documentos más recientes
  static async getRecent(limit = 10) {
    try {
      const query = `
        SELECT d.*, 
               p.nombre_completo as profesional_nombre,
               p.especialidad
        FROM DOCUMENTOS d
        JOIN PROFESIONALES p ON d.id_profesional = p.id_profesional
        WHERE d.estado = 'activo'
        ORDER BY d.fecha_subida DESC
        LIMIT ?
      `;
      const result = await executeQuery(query, [limit]);
      return result.map(documento => new Documento(documento));
    } catch (error) {
      throw error;
    }
  }

  // Actualizar documento
  async update(updateData) {
    try {
      const allowedFields = [
        'nombre_archivo', 'nombre_original', 'tipo_documento',
        'descripcion', 'estado', 'es_publico'
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

      values.push(this.id_documento);
      const query = `UPDATE DOCUMENTOS SET ${updateFields.join(', ')} WHERE id_documento = ?`;
      
      await executeQuery(query, values);
      return await Documento.findById(this.id_documento);
    } catch (error) {
      throw error;
    }
  }

  // Cambiar visibilidad del documento
  async toggleVisibility() {
    try {
      const query = `
        UPDATE DOCUMENTOS 
        SET es_publico = NOT es_publico 
        WHERE id_documento = ?
      `;
      await executeQuery(query, [this.id_documento]);
      this.es_publico = !this.es_publico;
      return this;
    } catch (error) {
      throw error;
    }
  }

  // Archivar documento (soft delete)
  async archivar() {
    try {
      const query = `
        UPDATE DOCUMENTOS 
        SET estado = 'archivado' 
        WHERE id_documento = ?
      `;
      await executeQuery(query, [this.id_documento]);
      this.estado = 'archivado';
      return this;
    } catch (error) {
      throw error;
    }
  }

  // Eliminar documento
  async delete() {
    try {
      const query = 'DELETE FROM DOCUMENTOS WHERE id_documento = ?';
      await executeQuery(query, [this.id_documento]);
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Eliminar documentos antiguos (para limpieza)
  static async deleteOldDocuments(daysOld = 365) {
    try {
      const query = `
        DELETE FROM DOCUMENTOS 
        WHERE fecha_subida < DATE_SUB(NOW(), INTERVAL ? DAY)
          AND estado = 'archivado'
      `;
      const result = await executeQuery(query, [daysOld]);
      return result.affectedRows;
    } catch (error) {
      throw error;
    }
  }

  // Obtener tipos de documentos disponibles
  static async getDocumentTypes() {
    try {
      const query = `
        SELECT DISTINCT tipo_documento, COUNT(*) as total
        FROM DOCUMENTOS
        WHERE estado = 'activo'
        GROUP BY tipo_documento
        ORDER BY total DESC
      `;
      const result = await executeQuery(query);
      return result;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Documento;

