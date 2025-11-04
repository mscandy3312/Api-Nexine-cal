// --- [CONFIG] config/database.js ¡CARGADO CORRECTAMENTE! ---
// (Si ves este mensaje, el archivo se cargó)
console.log('--- [CONFIG] config/database.js ¡CARGADO CORRECTAMENTE! ---');

const mysql = require('mysql2/promise');
require('dotenv').config(); // Asegura que las variables de .env estén disponibles

// Creamos el "pool" de conexiones usando las variables de tu .env
// que nos acabas de mostrar (DB_HOST, DB_USER, etc.)
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    // Tu .env dice DB_SSL=false, así que esto se manejará correctamente.
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
});

// Verificación de conexión (opcional pero útil)
// Intentamos hacer una consulta simple al iniciar
pool.query('SELECT 1')
    .then(() => {
        console.log('✅ Conexión a la base de datos (pool) exitosa.');
    })
    .catch((err) => {
        console.error('❌ Error al conectar a la base de datos (pool):', err.message);
    });

// EXPORTAMOS EL POOL para que los modelos (como models/usuarios.js) puedan usarlo
module.exports = pool;

