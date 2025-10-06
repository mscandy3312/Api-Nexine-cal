# API de Calendario Terapéutico

Una API REST completa para la gestión de un sistema de calendario terapéutico que permite la administración de profesionales, clientes, citas, sesiones y pagos.

## 🚀 Características

- **Autenticación JWT** - Sistema seguro de autenticación con roles
- **OAuth Integration** - Login con Google y WhatsApp
- **Gestión de Usuarios** - Registro, login y perfil de usuarios con roles (admin, profesional, cliente)
- **Profesionales** - Gestión completa de profesionales de la salud con estados de aprobación
- **Clientes** - Administración de clientes y sus datos
- **Citas** - Sistema de reserva y gestión de citas
- **Sesiones** - Seguimiento de sesiones terapéuticas
- **Valoraciones** - Sistema de calificaciones y reseñas
- **Pagos** - Gestión de pagos y comisiones
- **Transacciones Stripe** - Integración completa con Stripe para pagos
- **Precios** - Configuración de paquetes y precios
- **Sistema de Roles** - Control de acceso basado en roles
- **Favoritos** - Sistema para que clientes guarden profesionales favoritos
- **Mensajería** - Sistema de mensajes entre usuarios y profesionales
- **Documentos** - Subida y gestión de documentos por profesionales
- **Notificaciones** - Sistema completo de notificaciones push y email
- **Validación de datos** - Validación robusta de entrada
- **Rate limiting** - Protección contra abuso
- **CORS** - Configuración de CORS para desarrollo y producción

## 📋 Requisitos

- Node.js (v14 o superior)
- MySQL (v8.0 o superior)
- npm o yarn

## 🛠️ Instalación

1. **Clonar el repositorio**
```bash
git clone <url-del-repositorio>
cd api-calendario-terapeutico
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp env.example .env
```

Editar el archivo `.env` con tus configuraciones:
```env
# Configuración de la base de datos
DB_HOST=localhost
DB_USER=tu_usuario
DB_PASSWORD=tu_password
DB_NAME=calendario_terapeutico
DB_PORT=3306

# Configuración JWT
JWT_SECRET=tu_jwt_secret_muy_seguro_aqui
JWT_EXPIRES_IN=24h

# Configuración del servidor
PORT=3000
NODE_ENV=development
```

4. **Crear la base de datos**
```sql
CREATE DATABASE calendario_terapeutico;
```

5. **Ejecutar el script SQL**
Ejecuta el script SQL proporcionado para crear todas las tablas necesarias.

6. **Iniciar el servidor**
```bash
# Desarrollo
npm run dev

# Producción
npm start
```

## 📚 Documentación de la API

### Base URL
```
http://localhost:3000/api
```

### Autenticación
La API utiliza JWT (JSON Web Tokens) para la autenticación. Incluye el token en el header:
```
Authorization: Bearer <tu_token>
```

### Endpoints Principales

#### 👤 Usuarios
- `POST /api/usuarios/registro` - Registrar nuevo usuario
- `POST /api/usuarios/login` - Iniciar sesión
- `GET /api/usuarios/perfil` - Obtener perfil del usuario
- `PUT /api/usuarios/perfil` - Actualizar perfil
- `PUT /api/usuarios/cambiar-password` - Cambiar contraseña

#### 👨‍⚕️ Profesionales
- `POST /api/profesionales` - Crear profesional
- `GET /api/profesionales` - Listar profesionales
- `GET /api/profesionales/:id` - Obtener profesional por ID
- `PUT /api/profesionales/:id` - Actualizar profesional
- `GET /api/profesionales/buscar` - Buscar profesionales

#### 👥 Clientes
- `POST /api/clientes` - Crear cliente
- `GET /api/clientes` - Listar clientes
- `GET /api/clientes/:id` - Obtener cliente por ID
- `PUT /api/clientes/:id` - Actualizar cliente
- `GET /api/clientes/:id/sesiones` - Historial de sesiones
- `GET /api/clientes/:id/citas` - Historial de citas

#### 💰 Precios
- `POST /api/precios` - Crear precio
- `GET /api/precios` - Listar precios
- `GET /api/precios/:id` - Obtener precio por ID
- `PUT /api/precios/:id` - Actualizar precio
- `GET /api/precios/modalidad/:modalidad` - Precios por modalidad

#### 📅 Citas
- `POST /api/citas` - Crear cita
- `GET /api/citas` - Listar citas
- `GET /api/citas/:id` - Obtener cita por ID
- `PUT /api/citas/:id` - Actualizar cita
- `PUT /api/citas/:id/estado` - Cambiar estado de cita
- `GET /api/citas/cliente/:id_cliente` - Citas por cliente
- `GET /api/citas/profesional/:id_profesional` - Citas por profesional

#### 🏥 Sesiones
- `POST /api/sesiones` - Crear sesión
- `GET /api/sesiones` - Listar sesiones
- `GET /api/sesiones/:id` - Obtener sesión por ID
- `PUT /api/sesiones/:id` - Actualizar sesión
- `PUT /api/sesiones/:id/estado` - Cambiar estado de sesión
- `GET /api/sesiones/pedido/:numero_pedido` - Sesión por número de pedido

#### ⭐ Valoraciones
- `POST /api/valoraciones` - Crear valoración
- `GET /api/valoraciones` - Listar valoraciones
- `GET /api/valoraciones/:id` - Obtener valoración por ID
- `PUT /api/valoraciones/:id` - Actualizar valoración
- `GET /api/valoraciones/profesional/:id_profesional` - Valoraciones por profesional

#### 💳 Pagos
- `POST /api/pagos` - Crear pago
- `GET /api/pagos` - Listar pagos
- `GET /api/pagos/:id` - Obtener pago por ID
- `PUT /api/pagos/:id` - Actualizar pago
- `GET /api/pagos/profesional/:id_profesional` - Pagos por profesional
- `GET /api/pagos/profesional/:id_profesional/balance` - Balance del profesional

#### 💳 Transacciones Stripe
- `POST /api/transacciones-stripe` - Crear transacción Stripe
- `GET /api/transacciones-stripe` - Listar transacciones
- `GET /api/transacciones-stripe/:id` - Obtener transacción por ID
- `GET /api/transacciones-stripe/stripe/:stripe_payment_id` - Obtener por ID de Stripe
- `PUT /api/transacciones-stripe/:id` - Actualizar transacción
- `PUT /api/transacciones-stripe/:id/estado` - Cambiar estado
- `GET /api/transacciones-stripe/pago/:id_pago` - Transacciones por pago
- `GET /api/transacciones-stripe/sesion/:id_sesion` - Transacciones por sesión
- `GET /api/transacciones-stripe/profesional/:id_profesional` - Transacciones por profesional
- `GET /api/transacciones-stripe/estadisticas` - Estadísticas de transacciones
- `GET /api/transacciones-stripe/estadisticas/moneda` - Estadísticas por moneda

#### ❤️ Favoritos
- `POST /api/favoritos` - Agregar profesional a favoritos
- `GET /api/favoritos` - Obtener favoritos del usuario
- `GET /api/favoritos/verificar/:id_profesional` - Verificar si está en favoritos
- `GET /api/favoritos/profesional/:id_profesional` - Clientes que tienen como favorito
- `GET /api/favoritos/estadisticas` - Estadísticas de favoritos
- `GET /api/favoritos/top` - Profesionales más favoritos
- `DELETE /api/favoritos/profesional/:id_profesional` - Eliminar de favoritos

#### 💬 Mensajes
- `POST /api/mensajes` - Enviar mensaje
- `GET /api/mensajes/recibidos` - Obtener mensajes recibidos
- `GET /api/mensajes/enviados` - Obtener mensajes enviados
- `GET /api/mensajes/conversacion/:id_usuario2` - Obtener conversación
- `GET /api/mensajes/estadisticas` - Estadísticas de mensajes
- `GET /api/mensajes/contactos` - Contactos recientes
- `GET /api/mensajes/buscar` - Buscar mensajes
- `PUT /api/mensajes/:id/leer` - Marcar como leído
- `PUT /api/mensajes/leer-multiples` - Marcar múltiples como leídos
- `PUT /api/mensajes/leer-todos` - Marcar todos como leídos

#### 📄 Documentos
- `POST /api/documentos/subir` - Subir documento
- `GET /api/documentos/profesional` - Documentos del profesional
- `GET /api/documentos/publicos` - Documentos públicos
- `GET /api/documentos/tipo/:tipo_documento` - Documentos por tipo
- `GET /api/documentos/buscar` - Buscar documentos
- `GET /api/documentos/estadisticas` - Estadísticas de documentos
- `GET /api/documentos/recientes` - Documentos recientes
- `GET /api/documentos/:id/descargar` - Descargar documento
- `PUT /api/documentos/:id` - Actualizar documento
- `PUT /api/documentos/:id/visibilidad` - Cambiar visibilidad

#### 🔔 Notificaciones
- `POST /api/notificaciones` - Crear notificación
- `POST /api/notificaciones/masiva` - Crear notificación masiva
- `POST /api/notificaciones/evento` - Crear notificación de evento
- `GET /api/notificaciones` - Obtener notificaciones del usuario
- `GET /api/notificaciones/tipo/:tipo_notificacion` - Notificaciones por tipo
- `GET /api/notificaciones/prioridad/:prioridad` - Notificaciones por prioridad
- `GET /api/notificaciones/estadisticas` - Estadísticas de notificaciones
- `GET /api/notificaciones/recientes` - Notificaciones recientes
- `PUT /api/notificaciones/:id/leer` - Marcar como leída
- `PUT /api/notificaciones/leer-todos` - Marcar todas como leídas

#### 🔐 OAuth
- `POST /api/oauth/google` - Login con Google
- `POST /api/oauth/whatsapp` - Login con WhatsApp
- `GET /api/oauth/estado/:proveedor` - Verificar estado del proveedor
- `POST /api/oauth/vincular` - Vincular cuenta OAuth
- `DELETE /api/oauth/desvincular/:proveedor` - Desvincular cuenta OAuth
- `GET /api/oauth/info` - Obtener información OAuth del usuario

### Respuestas de la API

#### Formato de respuesta exitosa
```json
{
  "success": true,
  "message": "Operación exitosa",
  "data": {
    // Datos de respuesta
  }
}
```

#### Formato de respuesta de error
```json
{
  "success": false,
  "message": "Descripción del error",
  "errors": [
    // Detalles de errores de validación
  ]
}
```

### Códigos de estado HTTP
- `200` - OK
- `201` - Creado
- `400` - Solicitud incorrecta
- `401` - No autorizado
- `403` - Prohibido
- `404` - No encontrado
- `500` - Error interno del servidor

## 🔧 Configuración

### Variables de entorno

| Variable | Descripción | Valor por defecto |
|----------|-------------|-------------------|
| `DB_HOST` | Host de la base de datos | localhost |
| `DB_USER` | Usuario de la base de datos | root |
| `DB_PASSWORD` | Contraseña de la base de datos | - |
| `DB_NAME` | Nombre de la base de datos | calendario_terapeutico |
| `DB_PORT` | Puerto de la base de datos | 3306 |
| `JWT_SECRET` | Secreto para JWT | - |
| `JWT_EXPIRES_IN` | Tiempo de expiración del JWT | 24h |
| `PORT` | Puerto del servidor | 3000 |
| `NODE_ENV` | Entorno de ejecución | development |

### Rate Limiting
- 100 requests por IP cada 15 minutos
- Configurable en `server.js`

## 🧪 Testing

```bash
# Ejecutar tests
npm test

# Tests con coverage
npm run test:coverage
```

## 📦 Scripts disponibles

```bash
npm start          # Iniciar en producción
npm run dev        # Iniciar en desarrollo con nodemon
npm test           # Ejecutar tests
```

## 🚀 Despliegue

### Docker (Recomendado)
```bash
# Construir imagen
docker build -t api-calendario-terapeutico .

# Ejecutar contenedor
docker run -p 3000:3000 --env-file .env api-calendario-terapeutico
```

### PM2
```bash
# Instalar PM2
npm install -g pm2

# Iniciar aplicación
pm2 start server.js --name "api-calendario"

# Monitorear
pm2 monit
```

## 🔒 Seguridad

- **Helmet.js** - Headers de seguridad
- **Rate limiting** - Protección contra abuso
- **CORS** - Control de acceso
- **JWT** - Autenticación segura
- **Validación de datos** - Prevención de inyecciones
- **Sanitización** - Limpieza de datos de entrada

## 📊 Monitoreo

### Health Check
```bash
GET /health
```

Respuesta:
```json
{
  "success": true,
  "message": "API funcionando correctamente",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "database": "conectada",
  "version": "1.0.0"
}
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🆘 Soporte

Si tienes problemas o preguntas:

1. Revisa la documentación
2. Busca en los issues existentes
3. Crea un nuevo issue con detalles del problema

## 🔄 Changelog

### v2.0.0
- ✅ Sistema de favoritos completo
- ✅ Sistema de mensajería entre usuarios
- ✅ Gestión de documentos con subida de archivos
- ✅ Sistema de notificaciones avanzado
- ✅ Estados de aprobación para profesionales
- ✅ OAuth con Google y WhatsApp
- ✅ Video de presentación para profesionales
- ✅ Modalidad de citas (presencial/virtual)
- ✅ Estadísticas avanzadas para todas las funcionalidades
- ✅ Validaciones mejoradas
- ✅ Controladores y rutas completas

### v1.1.0
- ✅ Integración con Stripe para pagos
- ✅ Sistema de roles (admin, profesional, cliente)
- ✅ Transacciones Stripe completas
- ✅ Control de acceso basado en roles
- ✅ Estadísticas de transacciones
- ✅ Validaciones actualizadas

### v1.0.0
- ✅ Implementación inicial de la API
- ✅ Sistema de autenticación JWT
- ✅ CRUD completo para todas las entidades
- ✅ Validación de datos
- ✅ Rate limiting y seguridad
- ✅ Documentación completa

---

**Desarrollado con ❤️ para la gestión de calendarios terapéuticos**
#   A p i - N e x i n e - c a l  
 #   A p i - N e x i n e - c a l  
 