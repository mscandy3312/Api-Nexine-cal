// --- [MODELO] models/usuarios.js ¡CARGADO CORRECTAMENTE! ---
// (Si ves este mensaje, el archivo se cargó)
console.log('--- [MODELO] models/usuarios.js ¡CARGADO CORRECTAMENTE! ---');

// Corregido: Importa el 'pool' directamente desde el config
const pool = require('../config/database'); 
const bcrypt = require('bcryptjs');

class Usuario {
  constructor(data) {
    this.id_usuario = data.id_usuario;
    this.email = data.email;
    this.password = data.password;
    this.nombre = data.nombre;
    this.rol = data.rol;
    this.is_verified = data.is_verified;
    this.oauth_provider = data.oauth_provider;
    this.oauth_id = data.oauth_id;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
    this.verification_token = data.verification_token;
    this.token_expires_at = data.token_expires_at;
  }

  toJSON() {
    const data = { ...this };
    delete data.password;
    delete data.verification_token;
    delete data.token_expires_at;
    return data;
  }

  // --- MÉTODOS DE INSTANCIA ---

  async verifyPassword(candidatePassword) {
    if (!this.password) {
      return false; 
    }
    return await bcrypt.compare(candidatePassword, this.password);
  }

  async update(updateData) {
    const allowedFields = ['nombre', 'email', 'rol', 'is_verified'];
    const queryParts = [];
    const values = [];

    for (const [key, value] of Object.entries(updateData)) {
      if (allowedFields.includes(key) && value !== undefined) {
        queryParts.push(`${key} = ?`);
        values.push(value);
      }
    }

    if (queryParts.length === 0) {
      return this;
    }

    values.push(this.id_usuario);
    const query = `UPDATE usuarios SET ${queryParts.join(', ')} WHERE id_usuario = ?`;
    
    await pool.query(query, values);
    return await Usuario.findById(this.id_usuario);
  }

  async changePassword(newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await pool.query('UPDATE usuarios SET password = ? WHERE id_usuario = ?', [hashedPassword, this.id_usuario]);
  }

  async delete() {
    await pool.query('DELETE FROM usuarios WHERE id_usuario = ?', [this.id_usuario]);
  }

  // --- MÉTODOS ESTÁTICOS ---

  static async findByEmail(email) {
    try {
      // Corregido: pool.query SÍ existe porque importamos el pool directamente
      const [rows] = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email]);
      return rows.length > 0 ? new Usuario(rows[0]) : null;
    } catch (error) {
      console.error("Error en findByEmail:", error.message);
      throw error;
    }
  }

  static async findById(id) {
    const [rows] = await pool.query('SELECT * FROM usuarios WHERE id_usuario = ?', [id]);
    return rows.length > 0 ? new Usuario(rows[0]) : null;
  }

  static async create(userData) {
    const { email, password, nombre, rol = 'cliente', oauth_provider, oauth_id } = userData;
    let connection;

    try {
      const is_verified = !!oauth_provider;
      let hashedPassword = null;
      if (password) {
        hashedPassword = await bcrypt.hash(password, 12);
      }

      connection = await pool.getConnection();
      await connection.beginTransaction();

      const [userResult] = await connection.query(
        'INSERT INTO usuarios (email, password, nombre, rol, oauth_provider, oauth_id, is_verified) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [email, hashedPassword, nombre, rol, oauth_provider, oauth_id, is_verified]
      );
      const id_usuario = userResult.insertId;

      if (rol === 'cliente') {
        await connection.query(
          'INSERT INTO clientes (id_usuario, nombre_completo, email) VALUES (?, ?, ?)',
          [id_usuario, nombre, email]
        );
      } else if (rol === 'profesional') {
        await connection.query(
          'INSERT INTO profesionales (id_usuario, nombre_completo, email) VALUES (?, ?, ?)',
          [id_usuario, nombre, email]
        );
      }
      
      await connection.commit();
      return await this.findById(id_usuario);

    } catch (error) {
      if (connection) await connection.rollback();
      console.error("Error en Usuario.create:", error.message);
      throw error;
    } finally {
      if (connection) connection.release();
    }
  }

  static async findAll(limit = 50, offset = 0) {
    const [rows] = await pool.query('SELECT * FROM usuarios LIMIT ? OFFSET ?', [limit, offset]);
    return rows.map(row => new Usuario(row));
  }

  static async findByRol(rol, limit = 50, offset = 0) {
    const [rows] = await pool.query('SELECT * FROM usuarios WHERE rol = ? LIMIT ? OFFSET ?', [rol, limit, offset]);
    return rows.map(row => new Usuario(row));
  }

  static async search(criteria, limit = 50, offset = 0) {
    const nombre = criteria.nombre || '';
    const [rows] = await pool.query('SELECT * FROM usuarios WHERE nombre LIKE ? LIMIT ? OFFSET ?', [`%${nombre}%`, limit, offset]);
    return rows.map(row => new Usuario(row));
  }

  // --- MÉTODOS DE VERIFICACIÓN (AQUÍ ESTÁ LA CORRECCIÓN) ---

  static async register(userData, verificationToken) {
    const { nombre, email, password, rol = 'cliente' } = userData;
    const hashedPassword = await bcrypt.hash(password, 12);
    let connection;
    
    // --- ¡CORRECCIÓN! ---
    // Ya no calculamos la hora aquí. Dejamos que MySQL lo haga.
    // const tokenExpires = new Date(Date.now() + 10 * 60 * 1000); 

    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        // --- ¡CORRECCIÓN! ---
        // 1. Usamos `NOW() + INTERVAL 10 MINUTE` para que MySQL calcule la expiración
        const [userResult] = await connection.query(
            'INSERT INTO usuarios (nombre, email, password, rol, is_verified, verification_token, token_expires_at) VALUES (?, ?, ?, ?, ?, ?, NOW() + INTERVAL 10 MINUTE)',
            [nombre, email, hashedPassword, rol, false, verificationToken] // <--- Ya no pasamos tokenExpires
        );
        const id_usuario = userResult.insertId;

        // 2. Insertar en clientes/profesionales (sin cambios)
        if (rol === 'cliente') {
            await connection.query(
                'INSERT INTO clientes (id_usuario, nombre_completo, email) VALUES (?, ?, ?)',
                [id_usuario, nombre, email]
            );
        } else if (rol === 'profesional') {
             await connection.query(
                'INSERT INTO profesionales (id_usuario, nombre_completo, email) VALUES (?, ?, ?)',
                [id_usuario, nombre, email]
            );
        }

        await connection.commit();
      
        return await this.findById(id_usuario); 

    } catch (error) {
        if (connection) await connection.rollback();
        console.error("Error en el registro transaccional:", error.message);
        throw error; 
    } finally {
        if (connection) connection.release();
    }
  }
    
  /**
   * Busca el usuario por el email Y el código de verificación.
   * @param {string} email
   * @param {string} code - El código de 6 dígitos
   * @returns {Promise<Usuario|null>}
   */
  static async findByVerificationCode(email, code) {
        try {
            console.log(`--- [MODELO] Buscando código: ${code} para email: ${email} ---`);
            // La lógica aquí (token_expires_at > NOW()) es correcta
            const [rows] = await pool.query(
                'SELECT * FROM usuarios WHERE email = ? AND verification_token = ? AND token_expires_at > NOW()',
                [email, code]
            );
            return rows.length ? new Usuario(rows[0]) : null;
        } catch (error) {
            console.error("Error en findByVerificationCode:", error.message);
            throw new Error('Database query failed');
        }
  }

  /**
   * Marca un usuario como verificado y limpia el token.
   * @param {number} id_usuario 
   * @returns {Promise<void>}
   */
  static async markAsVerified(id_usuario) {
        try {
            await pool.query(
                'UPDATE usuarios SET is_verified = 1, verification_token = NULL, token_expires_at = NULL WHERE id_usuario = ?',
                [id_usuario]
            );
        } catch (error) {
            console.error("Error en markAsVerified:", error.message);
            throw new Error('Database update failed');
        }
    }
}

module.exports = Usuario;

