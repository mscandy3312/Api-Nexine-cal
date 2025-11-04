// ========================================
// SETUP-DATABASE.JS - PRODUCCIÓN COMPLETA (DB: dbnaxine)
// Autor: Juan Carlos Andrés Hernández
// ========================================

const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");
require("dotenv").config();

// ==========================
// Configuración de la base de datos
// ==========================
const dbConfig = {
  host: process.env.DB_HOST || "dbnaxine.cp8i8u4minog.us-east-2.rds.amazonaws.com",
  user: process.env.DB_USER || "admin",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "dbnaxine",
  port: parseInt(process.env.DB_PORT || "3306", 10),
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10000,
};

// ==========================
// Función de inicialización
// ==========================
async function setupDatabase() {
  console.log("🔍 Conectando a la base de datos dbnaxine...");

  try {
    const pool = await mysql.createPool(dbConfig);

    // Crear base de datos y usarla
    await pool.query(
      `CREATE DATABASE IF NOT EXISTS dbnaxine CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;`
    );
    await pool.query(`USE dbnaxine;`);
    console.log("✅ Base de datos dbnaxine lista");

    // ======================
    // TABLAS PRINCIPALES
    // ======================

    // --- usuariossS ---
    await pool.query(`
      CREATE TABLE IF NOT EXISTS usuariosss (
        id_usuarioss INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        rol ENUM('admin', 'profesional', 'clientes') DEFAULT 'clientes',
        is_verified BOOLEAN DEFAULT FALSE,
        oauth_provider VARCHAR(50),
        oauth_id VARCHAR(255),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);

    // --- PROFESIONALES ---
    await pool.query(`
      CREATE TABLE IF NOT EXISTS profesionales (
        id_profesional INT AUTO_INCREMENT PRIMARY KEY,
        id_usuarioss INT NOT NULL,
        nombre_completo VARCHAR(255) NOT NULL,
        especialidad VARCHAR(255) NOT NULL,
        telefono VARCHAR(20),
        email VARCHAR(255),
        direccion TEXT,
        domicilio_consultorio TEXT,
        descripcion TEXT,
        experiencia_años INT,
        tarifa_por_hora DECIMAL(10,2),
        disponibilidad JSON,
        enlace_publico VARCHAR(255) UNIQUE,
        estado_aprobacion ENUM('pendiente','aprobado','rechazado') DEFAULT 'pendiente',
        fecha_aprobacion DATETIME,
        motivo_rechazo TEXT,
        video_presentacion VARCHAR(500),
        modalidad_citas ENUM('presencial','virtual','ambas') DEFAULT 'presencial',
        modo_atencion ENUM('consultorio','online','a_domicilio') DEFAULT 'consultorio',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (id_usuarioss) REFERENCES usuariosss(id_usuarioss) ON DELETE CASCADE
      );
    `);

    // --- clientesS ---
    await pool.query(`
      CREATE TABLE IF NOT EXISTS clientess (
        id_clientes INT AUTO_INCREMENT PRIMARY KEY,
        id_usuarioss INT NOT NULL,
        nombre_completo VARCHAR(255) NOT NULL,
        telefono VARCHAR(20),
        email VARCHAR(255),
        fecha_nacimiento DATE,
        direccion TEXT,
        historial_medico TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (id_usuarioss) REFERENCES usuariosss(id_usuarioss) ON DELETE CASCADE
      );
    `);

    // --- CALENDARIO ---
    await pool.query(`
      CREATE TABLE IF NOT EXISTS calendario (
        id_calendario INT AUTO_INCREMENT PRIMARY KEY,
        id_profesional INT NOT NULL,
        fecha DATE NOT NULL,
        hora_inicio TIME NOT NULL,
        hora_fin TIME NOT NULL,
        disponible BOOLEAN DEFAULT TRUE,
        observaciones TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (id_profesional) REFERENCES profesionales(id_profesional) ON DELETE CASCADE
      );
    `);

    // --- citasS ---
    await pool.query(`
      CREATE TABLE IF NOT EXISTS citass (
        id_citas INT AUTO_INCREMENT PRIMARY KEY,
        id_clientes INT NOT NULL,
        id_profesional INT NOT NULL,
        id_calendario INT,
        fecha DATE NOT NULL,
        hora TIME NOT NULL,
        estado ENUM('pendiente','confirmada','cancelada','completada') DEFAULT 'pendiente',
        motivo TEXT,
        notas TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (id_clientes) REFERENCES clientess(id_clientes) ON DELETE CASCADE,
        FOREIGN KEY (id_profesional) REFERENCES profesionales(id_profesional) ON DELETE CASCADE,
        FOREIGN KEY (id_calendario) REFERENCES calendario(id_calendario) ON DELETE SET NULL
      );
    `);

    // --- SESIONES ---
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sesiones (
        id_sesion INT AUTO_INCREMENT PRIMARY KEY,
        id_citas INT NOT NULL,
        duracion_minutos INT,
        notas TEXT,
        archivo_adjuntos JSON,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (id_citas) REFERENCES citass(id_citas) ON DELETE CASCADE
      );
    `);

    // --- VALORACIONES ---
    await pool.query(`
      CREATE TABLE IF NOT EXISTS valoraciones (
        id_valoracion INT AUTO_INCREMENT PRIMARY KEY,
        id_citas INT NOT NULL,
        calificacion INT CHECK (calificacion BETWEEN 1 AND 5),
        comentario TEXT,
        fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (id_citas) REFERENCES citass(id_citas) ON DELETE CASCADE
      );
    `);

    // --- PAGOS ---
    await pool.query(`
      CREATE TABLE IF NOT EXISTS pagos (
        id_pago INT AUTO_INCREMENT PRIMARY KEY,
        id_citas INT NOT NULL,
        monto DECIMAL(10,2) NOT NULL,
        metodo_pago ENUM('efectivo','tarjeta','transferencia','stripe') DEFAULT 'efectivo',
        estado ENUM('pendiente','pagado','fallido','reembolsado') DEFAULT 'pendiente',
        fecha_pago DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (id_citas) REFERENCES citass(id_citas) ON DELETE CASCADE
      );
    `);

    // --- TRANSACCIONES STRIPE ---
    await pool.query(`
      CREATE TABLE IF NOT EXISTS transacciones_stripe (
        id_transaccion INT AUTO_INCREMENT PRIMARY KEY,
        id_pago INT NOT NULL,
        stripe_charge_id VARCHAR(255),
        stripe_customer_id VARCHAR(255),
        estado ENUM('exitoso','fallido','pendiente') DEFAULT 'pendiente',
        detalles JSON,
        fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (id_pago) REFERENCES pagos(id_pago) ON DELETE CASCADE
      );
    `);

    // --- FAVORITOS ---
    await pool.query(`
      CREATE TABLE IF NOT EXISTS favoritos (
        id_favorito INT AUTO_INCREMENT PRIMARY KEY,
        id_clientes INT NOT NULL,
        id_profesional INT NOT NULL,
        fecha_agregado DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (id_clientes) REFERENCES clientess(id_clientes) ON DELETE CASCADE,
        FOREIGN KEY (id_profesional) REFERENCES profesionales(id_profesional) ON DELETE CASCADE
      );
    `);

    // --- MENSAJES ---
    await pool.query(`
      CREATE TABLE IF NOT EXISTS mensajes (
        id_mensaje INT AUTO_INCREMENT PRIMARY KEY,
        id_emisor INT NOT NULL,
        id_receptor INT NOT NULL,
        contenido TEXT NOT NULL,
        fecha_envio DATETIME DEFAULT CURRENT_TIMESTAMP,
        leido BOOLEAN DEFAULT FALSE,
        FOREIGN KEY (id_emisor) REFERENCES usuariosss(id_usuarioss) ON DELETE CASCADE,
        FOREIGN KEY (id_receptor) REFERENCES usuariosss(id_usuarioss) ON DELETE CASCADE
      );
    `);

    // --- DOCUMENTOS ---
    await pool.query(`
      CREATE TABLE IF NOT EXISTS documentos (
        id_documento INT AUTO_INCREMENT PRIMARY KEY,
        id_usuarioss INT NOT NULL,
        tipo_documento VARCHAR(100),
        url VARCHAR(500),
        fecha_subida DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (id_usuarioss) REFERENCES usuariosss(id_usuarioss) ON DELETE CASCADE
      );
    `);

    // --- NOTIFICACIONES ---
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notificaciones (
        id_notificacion INT AUTO_INCREMENT PRIMARY KEY,
        id_usuarioss INT NOT NULL,
        titulo VARCHAR(255),
        mensaje TEXT,
        leido BOOLEAN DEFAULT FALSE,
        fecha_envio DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (id_usuarioss) REFERENCES usuariosss(id_usuarioss) ON DELETE CASCADE
      );
    `);

    // --- PRECIOS ---
    await pool.query(`
      CREATE TABLE IF NOT EXISTS precios (
        id_precio INT AUTO_INCREMENT PRIMARY KEY,
        id_profesional INT NOT NULL,
        nombre_servicio VARCHAR(255),
        descripcion TEXT,
        monto DECIMAL(10,2) NOT NULL,
        moneda VARCHAR(10) DEFAULT 'MXN',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (id_profesional) REFERENCES profesionales(id_profesional) ON DELETE CASCADE
      );
    `);

    // ======================
    // ADMIN INICIAL
    // ======================
    const hashedPassword = await bcrypt.hash("Admin123!", 10);
    await pool.query(
      `INSERT INTO usuariosss (nombre, email, password, rol)
       VALUES ('Admin Principal', 'admin@example.com', ?, 'admin')
       ON DUPLICATE KEY UPDATE email=email;`,
      [hashedPassword]
    );

    console.log("✅ usuarioss admin inicial listo: admin@example.com / Admin123!");
    console.log("✅ Setup de base de datos completado correctamente");

    return pool;
  } catch (error) {
    console.error("❌ Error al configurar la base de datos:", error.message);
    throw error;
  }
}

module.exports = setupDatabase;
