// --- [SERVER] server.js ¡CARGADO CORRECTAMENTE! ---
console.log('--- [SERVER] server.js ¡CARGADO CORRECTAMENTE! ---');

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// ===============================================================
// CORS CONFIG (CORREGIDO PARA ENTORNO MULTI-MÁQUINA)
// ===============================================================
// IP de la computadora del Backend (A)
const BACKEND_IP = '192.168.100.28'; 

// Orígenes permitidos (incluye la IP y el origen localhost del frontend B)
const allowedOrigins = [
  'http://localhost:3001',             // Origen del navegador en Computadora B
  `http://${BACKEND_IP}:3000`,         // El propio backend
  `http://${BACKEND_IP}:3001`          // IP del frontend B con su puerto
];

// Opcional: Si CORS_ORIGIN está configurado a '*' en .env, lo añadimos
if (process.env.CORS_ORIGIN === '*') {
    allowedOrigins.push('*');
}

app.use(cors({
    origin: (origin, callback) => {
        // Si no hay origen (ej. Postman) o el origen está permitido (incluyendo '*'), permitir.
        if (!origin || allowedOrigins.includes('*') || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            // Rechazar si el origen no está en la lista.
            console.error(`Error: Origen no permitido por CORS: ${origin}`);
            callback(new Error('No permitido por CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true
}));

// ===============================================================
// Middlewares globales
// ===============================================================
app.use(helmet());

// --- IMPORTANTE: RUTA DE WEBHOOK DE STRIPE ---
try {
    // Asumiendo que tu controlador se llama 'stripeController.js'
    const stripeController = require('./controllers/stripeController.js');
    // La ruta del webhook debe ir ANTES de express.json()
    app.post(
        '/api/stripe/webhook', 
        express.raw({type: 'application/json'}), 
        stripeController.manejarWebhook // Asumiendo que tienes esta función
    );
    console.log('--- [SERVER] Ruta de Webhook de Stripe cargada. ---');
} catch (e) {
    console.warn('--- [SERVER] ADVERTENCIA: No se pudo cargar la ruta de webhook de Stripe. (¿Falta el controlador?) ---');
    console.warn(e.message); // <-- Añadido para más detalle del error
}

// Ahora sí, el resto de los middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Limitador de peticiones
app.use(rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 300, // Límite de 300 peticiones por IP en esa ventana
    message: { success: false, message: 'Demasiadas solicitudes, intenta más tarde.' }
}));

// ===============================================================
// IMPORTACIÓN Y USO DE RUTAS
// (Corregido para coincidir con los nombres de tus archivos)
// ===============================================================
console.log('--- [SERVER] Cargando rutas... ---');

try {
    // --- Módulos que SÍ tienes ---
    const usuarioRoutes = require('./routes/usuarios.js'); 
    app.use('/api/usuarios', usuarioRoutes);

    const especialidadRoutes = require('./routes/especialidad.js');
    app.use('/api/especialidades', especialidadRoutes);

    const disponibilidadHorarioRoutes = require('./routes/disponibilidad_horario.js');
    app.use('/api/disponibilidad-horarios', disponibilidadHorarioRoutes);

    const calendarioExternoRoutes = require('./routes/calendario_externos.js');
    app.use('/api/calendarios-externos', calendarioExternoRoutes);

    const clienteRoutes = require('./routes/clientes.js');
    app.use('/api/clientes', clienteRoutes);

    const citaRoutes = require('./routes/citas.js');
    app.use('/api/citas', citaRoutes);

    const favoritoRoutes = require('./routes/favoritos.js');
    app.use('/api/favoritos', favoritoRoutes);

    const mensajeRoutes = require('./routes/mensajes.js');
    app.use('/api/mensajes', mensajeRoutes);

    const documentoRoutes = require('./routes/documentos.js');
    app.use('/api/documentos', documentoRoutes);
    
    const notificacionRoutes = require('./routes/notificaciones.js');
    app.use('/api/notificaciones', notificacionRoutes);
    
    const oauthRoutes = require('./routes/oauth.js');
    app.use('/api/oauth', oauthRoutes);

    // --- ¡CORREGIDO! ---
    // Se descomentó la ruta de profesionales para solucionar el error 404
    const profesionalRoutes = require('./routes/profesionales.js');
    app.use('/api/profesionales', profesionalRoutes);


    // --- Módulos que AÚN FALTAN (Comentados) ---
    // (Deberás crear estos archivos para que el servidor los cargue)

    // const tipoEventoRoutes = require('./routes/tipos_evento.js'); // Asumiendo nueva convención
    // app.use('/api/tipos-evento', tipoEventoRoutes);

    // const sincronizacionCalendarioRoutes = require('./routes/sincronizaciones_calendario.js'); // Asumiendo nueva convención
    // app.use('/api/sincronizaciones-calendario', sincronizacionCalendarioRoutes);

    // const precioRoutes = require('./routes/precios.js');
    // app.use('/api/precios', precioRoutes);

    // const sesionRoutes = require('./routes/sesiones.js');
    // app.use('/api/sesiones', sesionRoutes);

    // const valoracionRoutes = require('./routes/valoraciones.js');
    // app.use('/api/valoraciones', valoracionRoutes);

    // const pagoRoutes = require('./routes/pagos.js');
    // app.use('/api/pagos', pagoRoutes);

    // --- MODIFICADO ---
    // Ajustado para reflejar tu nueva convención de nombres (ej. transaccion_stripe.js)
    // const transaccionStripeRoutes = require('./routes/transacciones_stripe.js');
    // app.use('/api/stripe', transaccionStripeRoutes); // Rutas restantes (no-webhook)


    console.log('--- [SERVER] ¡Rutas cargadas! ---');

} catch (error) {
    console.error('--- [SERVER] ERROR FATAL AL CARGAR RUTAS ---');
    console.error(error);
    process.exit(1); // Detener el servidor si las rutas no cargan
}

// ===============================================================
// Servidor en ejecución
// ===============================================================
async function startServer() {
    console.log('🚀 Iniciando servidor modular...');
    
    // La conexión a la BD ahora se maneja en el archivo de pool
    // (ej: config/database.js) y se importa en los modelos.
    
    app.listen(PORT, () => {
        console.log(`✅ Servidor backend escuchando en http://localhost:${PORT}`);
        console.log(`🌐 CORS permitido para: ${allowedOrigins.join(', ')}`);
    });
}

startServer();
