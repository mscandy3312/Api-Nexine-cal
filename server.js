// ===============================================================
// SISTEMA TIPO CALL.COM - ESTRUCTURA Y SEGURIDAD DE LA APLICACIÓN
// ===============================================================
//
// Este sistema está diseñado con diferentes roles y funcionalidades
// enfocadas en la gestión de usuarios, profesionales y administradores,
// implementando medidas avanzadas de seguridad y control.
//
// ---------------------------------------------------------------
// USUARIOS / CLIENTES
// ---------------------------------------------------------------
// - Registro e inicio de sesión mediante correo electrónico, Google o WhatsApp (OAuth).
// - Perfil personal con información editable.
// - Historial completo de reservas y sesiones.
// - Sistema de valoraciones y favoritos de profesionales.
// - Envío y recepción de mensajes (chat interno o soporte).
//
// ---------------------------------------------------------------
// PROFESIONALES
// ---------------------------------------------------------------
// - Registro con aprobación previa del administrador.
// - Perfil profesional detallado (foto, descripción, especialidad, horarios, etc.).
// - Agenda de disponibilidad y gestión de reservas.
// - Historial de sesiones realizadas y valoraciones recibidas.
// - Subida y gestión de documentos profesionales.
// - Visualización de ingresos y estadísticas personales.
// - Configuración de modalidad de citas (presencial / virtual).
//
// ---------------------------------------------------------------
// ADMINISTRADOR
// ---------------------------------------------------------------
// - Gestión completa de usuarios y profesionales.
// - Aprobación o rechazo de nuevos profesionales registrados.
// - Moderación de valoraciones y comentarios.
// - Panel administrativo con estadísticas y métricas del sistema.
// - Control del contenido público y supervisión de actividades.
//
// ---------------------------------------------------------------
// SEGURIDAD AVANZADA
// ---------------------------------------------------------------
// - Autenticación segura con JWT y refresh tokens.
// - Roles definidos (admin, profesional, usuario) con control de permisos.
// - Encriptación de contraseñas con bcrypt.
// - Validaciones estrictas de entradas y sanitización de datos.
// - Protección con Helmet (cabeceras HTTP seguras).
// - Limitación de peticiones (rate limiting) para evitar ataques por fuerza bruta.
// - Configuración de CORS restringido a dominios permitidos.
// - Medidas antifraude en valoraciones y reservas (detección de anomalías).
//
// ===============================================================
// Fin del bloque de especificaciones
// ===============================================================


const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');
const { body, validationResult } = require('express-validator');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// ==========================
// Seguridad básica
// ==========================
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:3000' }));

// Rate Limiting global
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Demasiadas solicitudes, intenta más tarde' }
}));

// ==========================
// Base de datos
// ==========================
let dbPool;
async function initDB() {
  try {
    dbPool = await mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || 'dbnaxine',
      port: parseInt(process.env.DB_PORT || '3306', 10),
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
      connectionLimit: 20,
    });
    await dbPool.query('SELECT NOW()');
    console.log('✅ DB conectada correctamente');
    return true;
  } catch (error) {
    console.error('❌ Error DB:', error.message);
    return false;
  }
}

app.use((req, res, next) => {
  if (!dbPool) return res.status(500).json({ error: 'DB no disponible' });
  req.db = dbPool;
  next();
});

// ==========================
// JWT & Autenticación
// ==========================
const generateAccessToken = (user) =>
  jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '15m' });

const generateRefreshToken = (user) =>
  jwt.sign(user, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, message: 'Token requerido' });
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ success: false, message: 'Token inválido' });
    req.user = user;
    next();
  });
};

const requireRole = (roles) => (req, res, next) => {
  if (!roles.includes(req.user.rol)) return res.status(403).json({ success: false, message: 'Acceso denegado' });
  next();
};

// ==========================
// Registro/Login Usuarios
// ==========================

// Registro tradicional
app.post('/api/usuarios/register',
  body('nombre').isLength({ min: 3 }),
  body('email').isEmail(),
  body('password').isStrongPassword({ minLength: 8, minLowercase:1, minUppercase:1, minNumbers:1, minSymbols:1 }),
  async (req,res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()) return res.status(400).json({success:false,errors:errors.array()});

    const {nombre,email,password} = req.body;
    try{
      const [existing] = await dbPool.query('SELECT * FROM usuarios WHERE email=?',[email]);
      if(existing.length) return res.status(400).json({success:false,message:'Email ya registrado'});

      const hashedPassword = await bcrypt.hash(password,12);
      const [result] = await dbPool.query('INSERT INTO usuarios (nombre,email,password,rol) VALUES (?,?,?,?)',
        [nombre,email,hashedPassword,'cliente']);
      res.json({success:true,id:result.insertId,message:'Usuario registrado'});
    }catch(error){ res.status(500).json({success:false,message:'Error creando usuario',error:error.message}); }
  }
);

// Login tradicional
app.post('/api/usuarios/login',
  body('email').isEmail(),
  body('password').isLength({min:6}),
  async (req,res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()) return res.status(400).json({success:false,errors:errors.array()});

    const {email,password} = req.body;
    try{
      const [rows] = await dbPool.query('SELECT * FROM usuarios WHERE email=?',[email]);
      if(!rows.length) return res.status(401).json({success:false,message:'Usuario no encontrado'});
      const user = rows[0];
      const match = await bcrypt.compare(password,user.password);
      if(!match) return res.status(401).json({success:false,message:'Contraseña incorrecta'});
      const payload = {id:user.id_usuario,rol:user.rol};
      res.json({success:true,accessToken:generateAccessToken(payload),refreshToken:generateRefreshToken(payload)});
    }catch(error){ res.status(500).json({success:false,message:'Error login',error:error.message}); }
  }
);

// OAuth Google
app.post('/api/usuarios/oauth/google', async(req,res)=>{
  const {token} = req.body;
  if(!token) return res.status(400).json({success:false,message:'Token requerido'});
  try{
    const response = await axios.get(`https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${token}`);
    const {email,name} = response.data;
    const [rows] = await dbPool.query('SELECT * FROM usuarios WHERE email=?',[email]);
    let userId;
    if(rows.length) userId = rows[0].id_usuario;
    else{
      const [result] = await dbPool.query('INSERT INTO usuarios (nombre,email,rol) VALUES (?,?,?)',[name,email,'cliente']);
      userId = result.insertId;
    }
    const payload = {id:userId,rol:'cliente'};
    res.json({success:true,accessToken:generateAccessToken(payload),refreshToken:generateRefreshToken(payload)});
  }catch(error){ res.status(500).json({success:false,message:'Error OAuth Google',error:error.message}); }
});

// OAuth WhatsApp (simulado con token)
app.post('/api/usuarios/oauth/whatsapp', async(req,res)=>{
  const {token} = req.body;
  if(!token) return res.status(400).json({success:false,message:'Token requerido'});
  try{
    const phone = token;
    const [rows] = await dbPool.query('SELECT * FROM usuarios WHERE email=?',[phone]);
    let userId;
    if(rows.length) userId = rows[0].id_usuario;
    else{
      const [result] = await dbPool.query('INSERT INTO usuarios (nombre,email,rol) VALUES (?,?,?)',['Usuario WhatsApp',phone,'cliente']);
      userId = result.insertId;
    }
    const payload = {id:userId,rol:'cliente'};
    res.json({success:true,accessToken:generateAccessToken(payload),refreshToken:generateRefreshToken(payload)});
  }catch(error){ res.status(500).json({success:false,message:'Error OAuth WhatsApp',error:error.message}); }
});

// Refresh token
app.post('/api/refresh-token', async(req,res)=>{
  const {token} = req.body;
  if(!token) return res.status(401).json({success:false,message:'Refresh token requerido'});
  jwt.verify(token,process.env.JWT_REFRESH_SECRET,(err,user)=>{
    if(err) return res.status(403).json({success:false,message:'Refresh token inválido'});
    res.json({success:true,accessToken:generateAccessToken({id:user.id,rol:user.rol})});
  });
});

// ==========================
// CRUD Usuarios seguro
// ====
