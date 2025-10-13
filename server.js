// ========================================
// SERVER.JS - API COMPLETA DBNAXINE (CALL.COM STYLE)
// Actualizado con tabla CALENDARIOS_EXTERNOS (versión extendida)
// ========================================

const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// ==========================
// Middlewares
// ==========================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==========================
// Configuración de base de datos
// ==========================
let dbPool;

async function initDB() {
  console.log('🔍 Verificando conexión a la base de datos...');
  try {
    dbPool = await mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || 'dbnaxine',
      port: parseInt(process.env.DB_PORT || '3306', 10),
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
      connectionLimit: 10,
    });

    await dbPool.query('SELECT NOW()');
    console.log('✅ Conexión a la base de datos establecida correctamente');
    return true;
  } catch (error) {
    console.error('❌ Error al conectar con la base de datos:', error.message);
    return false;
  }
}

// Middleware para inyectar DB
app.use((req, res, next) => {
  if (!dbPool) return res.status(500).json({ error: 'Base de datos no disponible' });
  req.db = dbPool;
  next();
});

// ==========================
// CRUD especial para usuarios
// ==========================
app.post('/api/usuarios', async (req, res) => {
  let { nombre, email, password, rol } = req.body;

  if (!nombre || !email || !password) {
    return res.status(400).json({ success: false, message: 'Faltan datos obligatorios' });
  }

  if (rol === 'admin') {
    try {
      const [admins] = await dbPool.query(`SELECT COUNT(*) AS total FROM usuarios WHERE rol = 'admin'`);
      if (admins[0].total > 0) {
        return res.status(403).json({ success: false, message: 'Ya existe un usuario admin. No se puede crear otro' });
      }
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Error verificando admin existente', error: error.message });
    }
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await dbPool.query(
      `INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)`,
      [nombre, email, hashedPassword, rol || 'cliente']
    );
    res.json({ success: true, id: result.insertId, message: 'Usuario creado correctamente' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creando usuario', error: error.message });
  }
});

app.put('/api/usuarios/:id_usuario', async (req, res) => {
  const id = req.params.id_usuario;
  const { nombre, email, password, rol } = req.body;

  if (rol === 'admin') {
    try {
      const [admins] = await dbPool.query(
        `SELECT COUNT(*) AS total FROM usuarios WHERE rol = 'admin' AND id_usuario != ?`,
        [id]
      );
      if (admins[0].total > 0) {
        return res.status(403).json({ success: false, message: 'Ya existe un usuario admin. No se puede asignar este rol' });
      }
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Error verificando admin existente', error: error.message });
    }
  }

  const updates = [];
  const values = [];

  if (nombre) { updates.push('nombre = ?'); values.push(nombre); }
  if (email) { updates.push('email = ?'); values.push(email); }
  if (password) { 
    const hashedPassword = await bcrypt.hash(password, 10);
    updates.push('password = ?'); 
    values.push(hashedPassword); 
  }
  if (rol) { updates.push('rol = ?'); values.push(rol); }

  if (updates.length === 0) return res.status(400).json({ success: false, message: 'No hay datos para actualizar' });

  try {
    const [result] = await dbPool.query(
      `UPDATE usuarios SET ${updates.join(', ')} WHERE id_usuario = ?`,
      [...values, id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });

    res.json({ success: true, message: 'Usuario actualizado correctamente' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error actualizando usuario', error: error.message });
  }
});

// ==========================
// CRUD genérico para todas las tablas
// ==========================
function createCRUDRoutes(table, idColumn) {
  const basePath = `/api/${table.toLowerCase()}`;

  // GET all
  app.get(basePath, async (req, res) => {
    try {
      const [rows] = await req.db.query(`SELECT * FROM ${table}`);
      res.json({ success: true, data: rows });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // GET by ID
  app.get(`${basePath}/:${idColumn}`, async (req, res) => {
    const id = req.params[idColumn];
    try {
      const [rows] = await req.db.query(`SELECT * FROM ${table} WHERE ${idColumn} = ?`, [id]);
      if (rows.length === 0) return res.status(404).json({ success: false, message: `${table} no encontrado` });
      res.json({ success: true, data: rows[0] });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // POST
  app.post(basePath, async (req, res) => {
    try {
      const fields = Object.keys(req.body).filter(f => !f.startsWith('id_'));
      const values = fields.map(f => req.body[f]);
      if (fields.length === 0) return res.status(400).json({ success: false, message: 'Datos no proporcionados' });

      const [result] = await req.db.query(
        `INSERT INTO ${table} (${fields.join(',')}) VALUES (${fields.map(() => '?').join(',')})`,
        values
      );
      res.json({ success: true, id: result.insertId, message: `${table} agregado correctamente` });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // PUT
  app.put(`${basePath}/:${idColumn}`, async (req, res) => {
    try {
      const id = req.params[idColumn];
      const fields = Object.keys(req.body).filter(f => !f.startsWith('id_'));
      const values = fields.map(f => req.body[f]);
      if (fields.length === 0) return res.status(400).json({ success: false, message: 'Datos no proporcionados' });

      const [result] = await req.db.query(
        `UPDATE ${table} SET ${fields.map(f => `${f} = ?`).join(', ')} WHERE ${idColumn} = ?`,
        [...values, id]
      );
      if (result.affectedRows === 0) return res.status(404).json({ success: false, message: `${table} no encontrado` });

      res.json({ success: true, message: `${table} actualizado correctamente` });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // DELETE
  app.delete(`${basePath}/:${idColumn}`, async (req, res) => {
    try {
      const id = req.params[idColumn];
      const [result] = await req.db.query(`DELETE FROM ${table} WHERE ${idColumn} = ?`, [id]);
      if (result.affectedRows === 0) return res.status(404).json({ success: false, message: `${table} no encontrado` });
      res.json({ success: true, message: `${table} eliminado correctamente` });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });
}

// ==========================
// Crear CRUDs para todas las tablas
// ==========================
const tables = [
  { table: 'profesionales', id: 'id_profesional' },
  { table: 'clientes', id: 'id_cliente' },
  { table: 'precios', id: 'id_precio' },
  { table: 'tipos_evento', id: 'id_evento' },
  { table: 'disponibilidad_horarios', id: 'id_disponibilidad' },
  { table: 'calendarios_externos', id: 'id_calendario' }, // ✅ nueva tabla actualizada
  { table: 'citas', id: 'id_cita' },
  { table: 'sesiones', id: 'id_sesion' },
  { table: 'valoraciones', id: 'id_valoracion' },
  { table: 'pagos', id: 'id_pago' },
  { table: 'transacciones_stripe', id: 'id_transaccion' },
  { table: 'favoritos', id: 'id_favorito' },
  { table: 'mensajes', id: 'id_mensaje' },
  { table: 'documentos', id: 'id_documento' },
  { table: 'notificaciones', id: 'id_notificacion' },
];

tables.forEach(t => createCRUDRoutes(t.table, t.id));

// ==========================
// Health Check
// ==========================
app.get('/health', async (req, res) => {
  try {
    const [rows] = await dbPool.query('SELECT NOW() AS tiempo');
    res.json({
      status: 'ok',
      environment: process.env.NODE_ENV || 'production',
      dbTime: rows[0].tiempo,
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Error de conexión con la base de datos' });
  }
});

// ==========================
// Iniciar servidor
// ==========================
(async () => {
  const connected = await initDB();
  if (connected) {
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
      console.log(`🌐 URL Local: http://localhost:${PORT}`);
    });
  } else {
    console.error('💥 No se pudo iniciar el servidor: error de conexión con la BD');
    process.exit(1);
  }
})();
