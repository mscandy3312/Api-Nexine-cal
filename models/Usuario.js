const { executeQuery } = require('../config/database');
const bcrypt = require('bcryptjs');

class Usuario {
  constructor(data) {
    this.id_usuario = data.id_usuario;
    this.email = data.email;
    this.password = data.password;
    this.nombre = data.nombre;
    this.rol = data.rol || 'cliente';
    this.is_verified = data.is_verified || false;
    this.oauth_provider = data.oauth_provider;
    this.oauth_id = data.oauth_id;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Crear nuevo usuario
  static async create(usuarioData) {
    try {
      const { email, password, nombre, rol, oauth_provider, oauth_id } = usuarioData;
      
      // Hash de la contraseña si no es OAuth
      let hashedPassword = password;
      if (!oauth_provider && password) {
        hashedPassword = await bcrypt.hash(password, 12);
      }

      const query = `
        INSERT INTO USUARIOS (email, password, nombre, rol, oauth_provider, oauth_id)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      
      const result = await executeQuery(query, [
        email,
        hashedPassword,
        nombre,
        rol || 'cliente',
        oauth_provider,
        oauth_id
      ]);

      return await this.findById(result.insertId);
    } catch (error) {
      throw error;
    }
  }

  // Buscar usuario por ID
  static async findById(id) {
    try {
      const query = 'SELECT * FROM USUARIOS WHERE id_usuario = ?';
      const result = await executeQuery(query, [id]);
      return result.length > 0 ? new Usuario(result[0]) : null;
    } catch (error) {
      throw error;
    }
  }

  // Buscar usuario por email
  static async findByEmail(email) {
    try {
      const query = 'SELECT * FROM USUARIOS WHERE email = ?';
      const result = await executeQuery(query, [email]);
      return result.length > 0 ? new Usuario(result[0]) : null;
    } catch (error) {
      throw error;
    }
  }

  // Obtener todos los usuarios
  static async findAll(limit = 50, offset = 0) {
    try {
      const query = 'SELECT * FROM USUARIOS ORDER BY created_at DESC LIMIT ? OFFSET ?';
      const result = await executeQuery(query, [limit, offset]);
      return result.map(usuario => new Usuario(usuario));
    } catch (error) {
      throw error;
    }
  }

  // Actualizar usuario
  async update(updateData) {
    try {
      const allowedFields = ['email', 'nombre', 'rol', 'is_verified', 'oauth_provider', 'oauth_id'];
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

      values.push(this.id_usuario);
      const query = `UPDATE USUARIOS SET ${updateFields.join(', ')} WHERE id_usuario = ?`;
      
      await executeQuery(query, values);
      return await Usuario.findById(this.id_usuario);
    } catch (error) {
      throw error;
    }
  }

  // Cambiar contraseña
  async changePassword(newPassword) {
    try {
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      const query = 'UPDATE USUARIOS SET password = ? WHERE id_usuario = ?';
      await executeQuery(query, [hashedPassword, this.id_usuario]);
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Verificar contraseña
  async verifyPassword(password) {
    try {
      return await bcrypt.compare(password, this.password);
    } catch (error) {
      throw error;
    }
  }

  // Eliminar usuario
  async delete() {
    try {
      const query = 'DELETE FROM USUARIOS WHERE id_usuario = ?';
      await executeQuery(query, [this.id_usuario]);
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Buscar usuarios por criterios
  static async search(criteria, limit = 50, offset = 0) {
    try {
      let query = 'SELECT * FROM USUARIOS WHERE 1=1';
      const values = [];

      if (criteria.email) {
        query += ' AND email LIKE ?';
        values.push(`%${criteria.email}%`);
      }

      if (criteria.nombre) {
        query += ' AND nombre LIKE ?';
        values.push(`%${criteria.nombre}%`);
      }

      if (criteria.rol) {
        query += ' AND rol = ?';
        values.push(criteria.rol);
      }

      if (criteria.is_verified !== undefined) {
        query += ' AND is_verified = ?';
        values.push(criteria.is_verified);
      }

      query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
      values.push(limit, offset);

      const result = await executeQuery(query, values);
      return result.map(usuario => new Usuario(usuario));
    } catch (error) {
      throw error;
    }
  }

  // Buscar usuarios por rol
  static async findByRol(rol, limit = 50, offset = 0) {
    try {
      const query = 'SELECT * FROM USUARIOS WHERE rol = ? ORDER BY created_at DESC LIMIT ? OFFSET ?';
      const result = await executeQuery(query, [rol, limit, offset]);
      return result.map(usuario => new Usuario(usuario));
    } catch (error) {
      throw error;
    }
  }

  // Obtener datos sin información sensible
  toJSON() {
    const { password, ...usuarioSinPassword } = this;
    return usuarioSinPassword;
  }
}

module.exports = Usuario;
