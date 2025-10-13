// ========================================
// CONFIGURACIÓN DE BASE DE DATOS MYSQL
// ========================================

// Importar cliente MySQL2 con soporte para promesas
// MySQL2 es más rápido y eficiente que el cliente MySQL original
const mysql = require('mysql2/promise');

// Cargar variables de entorno para configuración de BD
require('dotenv').config();

// ========================================
// CONFIGURACIÓN DE CONEXIÓN
// ========================================

// Configuración del pool de conexiones MySQL
// Un pool permite reutilizar conexiones y mejora el rendimiento
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',        // Servidor de BD
  user: process.env.DB_USER || 'root',             // Usuario de BD
  password: process.env.DB_PASSWORD || '',         // Contraseña de BD
  database: process.env.DB_NAME || 'sistema_citas', // Nombre de BD
  port: process.env.DB_PORT || 3306,               // Puerto de BD
  waitForConnections: true,                        // Esperar conexiones disponibles
  connectionLimit: 10,                             // Máximo 10 conexiones simultáneas
  queueLimit: 0,                                   // Sin límite en cola de conexiones
  // Configuraciones específicas para AWS RDS y producción
  ssl: process.env.DB_SSL === 'true' ? {
    rejectUnauthorized: false
  } : false,                                       // SSL para AWS RDS
  connectTimeout: 60000,                           // 60 segundos timeout
  multipleStatements: false,                       // Seguridad: no permitir múltiples statements
  dateStrings: true,                               // Devolver fechas como strings
  timezone: 'Z'                                    // Usar UTC como timezone
};

// ========================================
// CREACIÓN DEL POOL DE CONEXIONES
// ========================================

// Crear pool de conexiones con la configuración especificada
// El pool maneja automáticamente la creación y destrucción de conexiones
const pool = mysql.createPool(dbConfig);

// ========================================
// FUNCIONES DE UTILIDAD
// ========================================

// Función para probar la conexión a la base de datos
// Útil para verificar que la BD está disponible antes de iniciar el servidor
const testConnection = async () => {
  try {
    // Obtener una conexión del pool
    const connection = await pool.getConnection();
    
    // Mostrar información de la conexión
    console.log('✅ Conexión a la base de datos establecida correctamente');
    console.log(`   Host: ${dbConfig.host}:${dbConfig.port}`);
    console.log(`   Base de datos: ${dbConfig.database}`);
    console.log(`   Usuario: ${dbConfig.user}`);
    console.log(`   SSL: ${dbConfig.ssl ? 'Habilitado' : 'Deshabilitado'}`);
    
    // Probar una consulta simple
    const [rows] = await connection.execute('SELECT 1 as test, NOW() as current_time');
    console.log('✅ Consulta de prueba exitosa');
    
    // Liberar la conexión de vuelta al pool
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Error al conectar con la base de datos:');
    console.error(`   Código: ${error.code}`);
    console.error(`   Mensaje: ${error.message}`);
    console.error(`   Host: ${dbConfig.host}:${dbConfig.port}`);
    console.error(`   Usuario: ${dbConfig.user}`);
    console.error(`   Base de datos: ${dbConfig.database}`);
    return false;
  }
};

// Función para ejecutar consultas SQL de forma segura
// Utiliza prepared statements para prevenir inyección SQL
const executeQuery = async (query, params = []) => {
  try {
    // Ejecutar consulta con parámetros preparados
    const [rows] = await pool.execute(query, params);
    return rows;
  } catch (error) {
    console.error('Error en la consulta:', error.message);
    throw error;
  }
};

// Función para obtener una conexión del pool
// Útil cuando necesitas mantener una conexión activa para múltiples operaciones
const getConnection = async () => {
  try {
    return await pool.getConnection();
  } catch (error) {
    console.error('Error al obtener conexión:', error.message);
    throw error;
  }
};

// ========================================
// EXPORTACIÓN DE FUNCIONES
// ========================================

// Exportar funciones y pool para uso en otros módulos
module.exports = {
  pool,              // Pool de conexiones para uso avanzado
  testConnection,    // Función para probar conexión
  executeQuery,      // Función para ejecutar consultas
  getConnection      // Función para obtener conexión individual
};
