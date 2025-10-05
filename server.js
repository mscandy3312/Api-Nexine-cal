// ========================================
// IMPORTS Y CONFIGURACIÓN INICIAL
// ========================================

// Framework web para Node.js - maneja rutas HTTP y middleware
const express = require('express');

// Middleware para habilitar CORS (Cross-Origin Resource Sharing)
// Permite que el frontend se conecte desde diferentes dominios
const cors = require('cors');

// Middleware de seguridad que establece headers HTTP seguros
// Protege contra vulnerabilidades comunes como XSS, clickjacking, etc.
const helmet = require('helmet');

// Middleware para limitar el número de requests por IP
// Previene ataques de fuerza bruta y spam
const rateLimit = require('express-rate-limit');

// Carga variables de entorno desde archivo .env
// Permite configurar la aplicación sin hardcodear valores sensibles
require('dotenv').config();

// Importa función para probar conexión a la base de datos
const { testConnection } = require('./config/database');

// ========================================
// IMPORTACIÓN DE RUTAS DE LA API
// ========================================

// Cada archivo de ruta maneja endpoints específicos para diferentes entidades
// Estas rutas están organizadas por funcionalidad para mantener el código modular

// Rutas para gestión de usuarios (registro, login, perfil)
const usuariosRoutes = require('./routes/usuarios');

// Rutas para profesionales (terapeutas, psicólogos, etc.)
const profesionalesRoutes = require('./routes/profesionales');

// Rutas para clientes/pacientes
const clientesRoutes = require('./routes/clientes');

// Rutas para gestión de precios de servicios
const preciosRoutes = require('./routes/precios');

// Rutas para gestión de citas médicas/terapéuticas
const citasRoutes = require('./routes/citas');

// Rutas para sesiones de terapia
const sesionesRoutes = require('./routes/sesiones');

// Rutas para valoraciones y reseñas
const valoracionesRoutes = require('./routes/valoraciones');

// Rutas para gestión de pagos
const pagosRoutes = require('./routes/pagos');

// Rutas para transacciones con Stripe (pasarela de pagos)
const transaccionesStripeRoutes = require('./routes/transaccionesStripe');

// Rutas para favoritos de usuarios
const favoritosRoutes = require('./routes/favoritos');

// Rutas para sistema de mensajería
const mensajesRoutes = require('./routes/mensajes');

// Rutas para gestión de documentos
const documentosRoutes = require('./routes/documentos');

// Rutas para notificaciones del sistema
const notificacionesRoutes = require('./routes/notificaciones');

// Rutas para autenticación OAuth (Google, WhatsApp)
const oauthRoutes = require('./routes/oauth');

// ========================================
// INICIALIZACIÓN DE LA APLICACIÓN
// ========================================

// Crear instancia de la aplicación Express
const app = express();

// Puerto del servidor - usa variable de entorno o 3000 por defecto
const PORT = process.env.PORT || 3000;

// ========================================
// CONFIGURACIÓN DE MIDDLEWARE DE SEGURIDAD
// ========================================

// Helmet establece varios headers HTTP para mejorar la seguridad
// Protege contra XSS, clickjacking, y otros ataques comunes
app.use(helmet());

// ========================================
// CONFIGURACIÓN DE CORS
// ========================================

// Configuración de CORS para permitir requests desde el frontend
app.use(cors({
  // En producción, solo permite requests desde dominios específicos
  // En desarrollo, permite localhost en puertos 3000 y 3001
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://tu-dominio.com'] 
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true // Permite enviar cookies y headers de autenticación
}));

// ========================================
// CONFIGURACIÓN DE RATE LIMITING
// ========================================

// Limita el número de requests por IP para prevenir ataques
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // Ventana de tiempo: 15 minutos
  max: 100, // Máximo 100 requests por IP cada 15 minutos
  message: {
    success: false,
    message: 'Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde.'
  }
});
app.use(limiter);

// ========================================
// MIDDLEWARE DE PARSING
// ========================================

// Middleware para parsear JSON en el cuerpo de las peticiones
// Límite de 10MB para manejar archivos grandes
app.use(express.json({ limit: '10mb' }));

// Middleware para parsear datos de formularios URL-encoded
// Límite de 10MB para manejar archivos grandes
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ========================================
// MIDDLEWARE DE LOGGING
// ========================================

// Middleware personalizado para registrar todas las peticiones
// Útil para debugging y monitoreo de la aplicación
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - IP: ${req.ip}`);
  next();
});

// ========================================
// RUTAS DE LA API
// ========================================

// Ruta de salud - endpoint para verificar que la API está funcionando
// Útil para monitoreo y health checks
app.get('/health', async (req, res) => {
  try {
    // Probar conexión a la base de datos
    const dbStatus = await testConnection();
    
    // Responder con estado de la API y base de datos
    res.json({
      success: true,
      message: 'API funcionando correctamente',
      timestamp: new Date().toISOString(),
      database: dbStatus ? 'conectada' : 'desconectada',
      version: '1.0.0'
    });
  } catch (error) {
    // Si hay error, responder con código 500
    res.status(500).json({
      success: false,
      message: 'Error en el servidor',
      error: error.message
    });
  }
});

// Ruta raíz - información general de la API
// Proporciona documentación básica de endpoints disponibles
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API de Calendario Terapéutico',
    version: '1.0.0',
    endpoints: {
      usuarios: '/api/usuarios',
      profesionales: '/api/profesionales',
      clientes: '/api/clientes',
      precios: '/api/precios',
      citas: '/api/citas',
      sesiones: '/api/sesiones',
      valoraciones: '/api/valoraciones',
      pagos: '/api/pagos',
      transaccionesStripe: '/api/transacciones-stripe',
      favoritos: '/api/favoritos',
      mensajes: '/api/mensajes',
      documentos: '/api/documentos',
      notificaciones: '/api/notificaciones',
      oauth: '/api/oauth'
    },
    documentation: '/api/docs'
  });
});

// ========================================
// CONFIGURACIÓN DE RUTAS DE LA API
// ========================================

// Montar todas las rutas de la API con prefijo '/api'
// Cada grupo de rutas maneja una funcionalidad específica
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/profesionales', profesionalesRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/precios', preciosRoutes);
app.use('/api/citas', citasRoutes);
app.use('/api/sesiones', sesionesRoutes);
app.use('/api/valoraciones', valoracionesRoutes);
app.use('/api/pagos', pagosRoutes);
app.use('/api/transacciones-stripe', transaccionesStripeRoutes);
app.use('/api/favoritos', favoritosRoutes);
app.use('/api/mensajes', mensajesRoutes);
app.use('/api/documentos', documentosRoutes);
app.use('/api/notificaciones', notificacionesRoutes);
app.use('/api/oauth', oauthRoutes);

// ========================================
// MIDDLEWARE DE MANEJO DE ERRORES
// ========================================

// Middleware para manejar rutas no encontradas (404)
// Se ejecuta cuando ninguna ruta coincide con la petición
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada',
    path: req.originalUrl,
    method: req.method
  });
});

// Middleware global para manejo de errores
// Captura todos los errores no manejados en la aplicación
app.use((error, req, res, next) => {
  console.error('Error no manejado:', error);
  
  // Error de validación de JSON malformado
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return res.status(400).json({
      success: false,
      message: 'JSON inválido en el cuerpo de la petición'
    });
  }
  
  // Error de límite de tamaño de archivo
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      success: false,
      message: 'Archivo demasiado grande'
    });
  }
  
  // Error genérico del servidor
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    // Solo mostrar detalles del error en desarrollo
    error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
  });
});

// ========================================
// FUNCIÓN DE INICIO DEL SERVIDOR
// ========================================

// Función asíncrona para iniciar el servidor con verificaciones previas
const startServer = async () => {
  try {
    // Probar conexión a la base de datos antes de iniciar
    console.log('🔍 Verificando conexión a la base de datos...');
    const dbConnected = await testConnection();
    
    // Si no se puede conectar a la BD, terminar el proceso
    if (!dbConnected) {
      console.error('❌ No se pudo conectar a la base de datos');
      process.exit(1);
    }
    
    // Iniciar servidor HTTP
    app.listen(PORT, () => {
      console.log('🚀 Servidor iniciado exitosamente');
      console.log(`📡 Servidor corriendo en puerto ${PORT}`);
      console.log(`🌐 URL: http://localhost:${PORT}`);
      console.log(`💚 Health check: http://localhost:${PORT}/health`);
      console.log(`📚 API Base: http://localhost:${PORT}/api`);
      console.log('✅ Base de datos conectada');
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

// ========================================
// MANEJO DE SEÑALES DEL SISTEMA
// ========================================

// Manejo de señales para cierre graceful del servidor
// Permite cerrar la aplicación de forma ordenada

// SIGTERM: Señal de terminación (usado por PM2, Docker, etc.)
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM recibido, cerrando servidor...');
  process.exit(0);
});

// SIGINT: Señal de interrupción (Ctrl+C)
process.on('SIGINT', () => {
  console.log('🛑 SIGINT recibido, cerrando servidor...');
  process.exit(0);
});

// ========================================
// MANEJO DE ERRORES NO CAPTURADOS
// ========================================

// Capturar excepciones no manejadas
process.on('uncaughtException', (error) => {
  console.error('❌ Error no capturado:', error);
  process.exit(1);
});

// Capturar promesas rechazadas no manejadas
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promesa rechazada no manejada:', reason);
  process.exit(1);
});

// ========================================
// INICIO DE LA APLICACIÓN
// ========================================

// Iniciar el servidor
startServer();

// Exportar la aplicación para testing
module.exports = app;
