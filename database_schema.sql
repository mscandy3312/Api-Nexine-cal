-- ============================================
-- Script SQL para el sistema de citas terapéuticas
-- Esquema principal de la base de datos
-- ============================================

USE sistema_citas;

-- =====================
-- Tabla USUARIOS
-- =====================
CREATE TABLE IF NOT EXISTS USUARIOS (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255),
    nombre VARCHAR(255) NOT NULL,
    rol ENUM('admin', 'profesional', 'cliente') DEFAULT 'cliente',
    is_verified BOOLEAN DEFAULT FALSE,
    oauth_provider VARCHAR(50),
    oauth_id VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =====================
-- Tabla PROFESIONALES
-- =====================
CREATE TABLE IF NOT EXISTS PROFESIONALES (
    id_profesional INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    nombre_completo VARCHAR(255) NOT NULL,
    especialidad VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    email VARCHAR(255),
    direccion TEXT,
    descripcion TEXT,
    experiencia_años INT,
    tarifa_por_hora DECIMAL(10,2),
    disponibilidad JSON,
    estado_aprobacion ENUM('pendiente', 'aprobado', 'rechazado') DEFAULT 'pendiente',
    fecha_aprobacion DATETIME,
    motivo_rechazo TEXT,
    video_presentacion VARCHAR(500),
    modalidad_cita ENUM('presencial', 'virtual', 'ambas') DEFAULT 'presencial',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES USUARIOS(id_usuario) ON DELETE CASCADE
);

-- =====================
-- Tabla CLIENTES
-- =====================
CREATE TABLE IF NOT EXISTS CLIENTES (
    id_cliente INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    nombre_completo VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    email VARCHAR(255),
    fecha_nacimiento DATE,
    direccion TEXT,
    historial_medico TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES USUARIOS(id_usuario) ON DELETE CASCADE
);

-- =====================
-- Tabla PRECIOS
-- =====================
CREATE TABLE IF NOT EXISTS PRECIOS (
    id_precio INT AUTO_INCREMENT PRIMARY KEY,
    id_profesional INT NOT NULL,
    nombre_paquete VARCHAR(255) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10,2) NOT NULL,
    duracion_minutos INT NOT NULL,
    modalidad ENUM('presencial', 'virtual', 'ambas') DEFAULT 'presencial',
    activo BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_profesional) REFERENCES PROFESIONALES(id_profesional) ON DELETE CASCADE
);

-- =====================
-- Tabla CITAS
-- =====================
CREATE TABLE IF NOT EXISTS CITAS (
    id_cita INT AUTO_INCREMENT PRIMARY KEY,
    id_cliente INT NOT NULL,
    id_profesional INT NOT NULL,
    fecha_inicio DATETIME NOT NULL,
    fecha_fin DATETIME NOT NULL,
    duracion INT AS (TIMESTAMPDIFF(MINUTE, fecha_inicio, fecha_fin)) PERSISTENT,
    tipo_cita ENUM('presencial', 'virtual', 'ambas') DEFAULT 'presencial',
    estado ENUM('pendiente', 'confirmada', 'cancelada', 'finalizada') DEFAULT 'pendiente',
    notas TEXT,
    id_pago INT,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_cliente) REFERENCES CLIENTES(id_cliente) ON DELETE CASCADE,
    FOREIGN KEY (id_profesional) REFERENCES PROFESIONALES(id_profesional) ON DELETE CASCADE
);

-- =====================
-- Tabla SESIONES
-- =====================
CREATE TABLE IF NOT EXISTS SESIONES (
    id_sesion INT AUTO_INCREMENT PRIMARY KEY,
    id_cita INT NOT NULL,
    id_cliente INT NOT NULL,
    id_profesional INT NOT NULL,
    fecha_sesion DATETIME NOT NULL,
    duracion_minutos INT NOT NULL,
    notas_profesional TEXT,
    notas_cliente TEXT,
    objetivos TEXT,
    tareas TEXT,
    proxima_cita DATETIME,
    estado ENUM('programada', 'en_progreso', 'completada', 'cancelada') DEFAULT 'programada',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_cita) REFERENCES CITAS(id_cita) ON DELETE CASCADE,
    FOREIGN KEY (id_cliente) REFERENCES CLIENTES(id_cliente) ON DELETE CASCADE,
    FOREIGN KEY (id_profesional) REFERENCES PROFESIONALES(id_profesional) ON DELETE CASCADE
);

-- =====================
-- Tabla VALORACIONES
-- =====================
CREATE TABLE IF NOT EXISTS VALORACIONES (
    id_valoracion INT AUTO_INCREMENT PRIMARY KEY,
    id_cliente INT NOT NULL,
    id_profesional INT NOT NULL,
    id_sesion INT,
    calificacion INT NOT NULL CHECK (calificacion >= 1 AND calificacion <= 5),
    comentario TEXT,
    fecha_valoracion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_cliente) REFERENCES CLIENTES(id_cliente) ON DELETE CASCADE,
    FOREIGN KEY (id_profesional) REFERENCES PROFESIONALES(id_profesional) ON DELETE CASCADE,
    FOREIGN KEY (id_sesion) REFERENCES SESIONES(id_sesion) ON DELETE SET NULL
);

-- =====================
-- Tabla PAGOS
-- =====================
CREATE TABLE IF NOT EXISTS PAGOS (
    id_pago INT AUTO_INCREMENT PRIMARY KEY,
    id_cliente INT NOT NULL,
    id_profesional INT NOT NULL,
    id_cita INT,
    monto DECIMAL(10,2) NOT NULL,
    metodo_pago ENUM('efectivo', 'tarjeta', 'transferencia', 'stripe') DEFAULT 'efectivo',
    estado ENUM('pendiente', 'completado', 'fallido', 'reembolsado') DEFAULT 'pendiente',
    fecha_pago DATETIME,
    referencia_pago VARCHAR(255),
    comision DECIMAL(10,2) DEFAULT 0.00,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_cliente) REFERENCES CLIENTES(id_cliente) ON DELETE CASCADE,
    FOREIGN KEY (id_profesional) REFERENCES PROFESIONALES(id_profesional) ON DELETE CASCADE,
    FOREIGN KEY (id_cita) REFERENCES CITAS(id_cita) ON DELETE SET NULL
);

-- =====================
-- Tabla TRANSACCIONES_STRIPE
-- =====================
CREATE TABLE IF NOT EXISTS TRANSACCIONES_STRIPE (
    id_transaccion INT AUTO_INCREMENT PRIMARY KEY,
    id_pago INT NOT NULL,
    stripe_payment_intent_id VARCHAR(255) UNIQUE NOT NULL,
    stripe_customer_id VARCHAR(255),
    monto_centavos INT NOT NULL,
    moneda VARCHAR(3) DEFAULT 'usd',
    estado_stripe VARCHAR(50) NOT NULL,
    metadata JSON,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_pago) REFERENCES PAGOS(id_pago) ON DELETE CASCADE
);

-- =====================
-- Tabla FAVORITOS
-- =====================
CREATE TABLE IF NOT EXISTS FAVORITOS (
    id_favorito INT AUTO_INCREMENT PRIMARY KEY,
    id_cliente INT NOT NULL,
    id_profesional INT NOT NULL,
    fecha_agregado DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_cliente) REFERENCES CLIENTES(id_cliente) ON DELETE CASCADE,
    FOREIGN KEY (id_profesional) REFERENCES PROFESIONALES(id_profesional) ON DELETE CASCADE,
    UNIQUE KEY unique_favorito (id_cliente, id_profesional)
);

-- =====================
-- Tabla MENSAJES
-- =====================
CREATE TABLE IF NOT EXISTS MENSAJES (
    id_mensaje INT AUTO_INCREMENT PRIMARY KEY,
    id_remitente INT NOT NULL,
    id_destinatario INT NOT NULL,
    asunto VARCHAR(255),
    contenido TEXT NOT NULL,
    leido BOOLEAN DEFAULT FALSE,
    fecha_envio DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_lectura DATETIME,
    tipo_mensaje ENUM('general', 'cita', 'sesion', 'pago', 'soporte') DEFAULT 'general',
    prioridad ENUM('normal', 'media', 'alta') DEFAULT 'normal',
    FOREIGN KEY (id_remitente) REFERENCES USUARIOS(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_destinatario) REFERENCES USUARIOS(id_usuario) ON DELETE CASCADE
);

-- =====================
-- Tabla DOCUMENTOS
-- =====================
CREATE TABLE IF NOT EXISTS DOCUMENTOS (
    id_documento INT AUTO_INCREMENT PRIMARY KEY,
    id_profesional INT NOT NULL,
    nombre_archivo VARCHAR(255) NOT NULL,
    nombre_original VARCHAR(255) NOT NULL,
    tipo_documento VARCHAR(100) NOT NULL,
    ruta_archivo VARCHAR(500) NOT NULL,
    tamaño_archivo BIGINT,
    tipo_mime VARCHAR(100),
    descripcion TEXT,
    fecha_subida DATETIME DEFAULT CURRENT_TIMESTAMP,
    estado ENUM('activo', 'archivado') DEFAULT 'activo',
    es_publico BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (id_profesional) REFERENCES PROFESIONALES(id_profesional) ON DELETE CASCADE
);

-- =====================
-- Tabla NOTIFICACIONES
-- =====================
CREATE TABLE IF NOT EXISTS NOTIFICACIONES (
    id_notificacion INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    tipo_notificacion VARCHAR(100) NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    mensaje TEXT NOT NULL,
    datos_adicionales JSON,
    leida BOOLEAN DEFAULT FALSE,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_lectura DATETIME,
    prioridad ENUM('normal', 'media', 'alta') DEFAULT 'normal',
    canal ENUM('app', 'email', 'sms', 'whatsapp') DEFAULT 'app',
    estado ENUM('activa', 'archivada') DEFAULT 'activa',
    FOREIGN KEY (id_usuario) REFERENCES USUARIOS(id_usuario) ON DELETE CASCADE
);

-- =====================
-- Índices para optimización
-- =====================

-- Índices para USUARIOS
CREATE INDEX idx_usuarios_email ON USUARIOS(email);
CREATE INDEX idx_usuarios_rol ON USUARIOS(rol);

-- Índices para PROFESIONALES
CREATE INDEX idx_profesionales_usuario ON PROFESIONALES(id_usuario);
CREATE INDEX idx_profesionales_especialidad ON PROFESIONALES(especialidad);
CREATE INDEX idx_profesionales_estado ON PROFESIONALES(estado_aprobacion);

-- Índices para CLIENTES
CREATE INDEX idx_clientes_usuario ON CLIENTES(id_usuario);
CREATE INDEX idx_clientes_nombre ON CLIENTES(nombre_completo);

-- Índices para PRECIOS
CREATE INDEX idx_precios_profesional ON PRECIOS(id_profesional);
CREATE INDEX idx_precios_modalidad ON PRECIOS(modalidad);
CREATE INDEX idx_precios_activo ON PRECIOS(activo);

-- Índices para CITAS
CREATE INDEX idx_citas_cliente ON CITAS(id_cliente);
CREATE INDEX idx_citas_profesional ON CITAS(id_profesional);
CREATE INDEX idx_citas_fecha_inicio ON CITAS(fecha_inicio);
CREATE INDEX idx_citas_estado ON CITAS(estado);
CREATE INDEX idx_citas_tipo ON CITAS(tipo_cita);

-- Índices para SESIONES
CREATE INDEX idx_sesiones_cita ON SESIONES(id_cita);
CREATE INDEX idx_sesiones_cliente ON SESIONES(id_cliente);
CREATE INDEX idx_sesiones_profesional ON SESIONES(id_profesional);
CREATE INDEX idx_sesiones_fecha ON SESIONES(fecha_sesion);
CREATE INDEX idx_sesiones_estado ON SESIONES(estado);

-- Índices para VALORACIONES
CREATE INDEX idx_valoraciones_cliente ON VALORACIONES(id_cliente);
CREATE INDEX idx_valoraciones_profesional ON VALORACIONES(id_profesional);
CREATE INDEX idx_valoraciones_sesion ON VALORACIONES(id_sesion);
CREATE INDEX idx_valoraciones_fecha ON VALORACIONES(fecha_valoracion);

-- Índices para PAGOS
CREATE INDEX idx_pagos_cliente ON PAGOS(id_cliente);
CREATE INDEX idx_pagos_profesional ON PAGOS(id_profesional);
CREATE INDEX idx_pagos_cita ON PAGOS(id_cita);
CREATE INDEX idx_pagos_estado ON PAGOS(estado);
CREATE INDEX idx_pagos_fecha ON PAGOS(fecha_pago);

-- Índices para TRANSACCIONES_STRIPE
CREATE INDEX idx_transacciones_pago ON TRANSACCIONES_STRIPE(id_pago);
CREATE INDEX idx_transacciones_stripe_id ON TRANSACCIONES_STRIPE(stripe_payment_intent_id);
CREATE INDEX idx_transacciones_estado ON TRANSACCIONES_STRIPE(estado_stripe);

-- Índices para FAVORITOS
CREATE INDEX idx_favoritos_cliente ON FAVORITOS(id_cliente);
CREATE INDEX idx_favoritos_profesional ON FAVORITOS(id_profesional);

-- Índices para MENSAJES
CREATE INDEX idx_mensajes_remitente ON MENSAJES(id_remitente);
CREATE INDEX idx_mensajes_destinatario ON MENSAJES(id_destinatario);
CREATE INDEX idx_mensajes_fecha ON MENSAJES(fecha_envio);
CREATE INDEX idx_mensajes_leido ON MENSAJES(leido);

-- Índices para DOCUMENTOS
CREATE INDEX idx_documentos_profesional ON DOCUMENTOS(id_profesional);
CREATE INDEX idx_documentos_tipo ON DOCUMENTOS(tipo_documento);
CREATE INDEX idx_documentos_estado ON DOCUMENTOS(estado);

-- Índices para NOTIFICACIONES
CREATE INDEX idx_notificaciones_usuario ON NOTIFICACIONES(id_usuario);
CREATE INDEX idx_notificaciones_tipo ON NOTIFICACIONES(tipo_notificacion);
CREATE INDEX idx_notificaciones_leida ON NOTIFICACIONES(leida);
CREATE INDEX idx_notificaciones_prioridad ON NOTIFICACIONES(prioridad);

-- =====================
-- Comentarios sobre el esquema
-- =====================

/*
ESQUEMA PRINCIPAL DEL SISTEMA DE CITAS TERAPÉUTICAS:

1. USUARIOS: Tabla base para autenticación y roles
2. PROFESIONALES: Información de profesionales de la salud
3. CLIENTES: Información de clientes/pacientes
4. PRECIOS: Paquetes y precios de servicios
5. CITAS: Sistema principal de citas con duración calculada automáticamente
6. SESIONES: Seguimiento de sesiones terapéuticas
7. VALORACIONES: Sistema de calificaciones y reseñas
8. PAGOS: Gestión de pagos y comisiones
9. TRANSACCIONES_STRIPE: Integración con Stripe
10. FAVORITOS: Sistema de favoritos para clientes
11. MENSAJES: Sistema de mensajería interna
12. DOCUMENTOS: Gestión de documentos por profesionales
13. NOTIFICACIONES: Sistema de notificaciones

CARACTERÍSTICAS PRINCIPALES:
- Integridad referencial completa
- Índices optimizados para consultas frecuentes
- Campos de auditoría (created_at, updated_at)
- Estados y enums para control de flujo
- Soporte para modalidades presencial/virtual
- Cálculo automático de duración en CITAS
- Relaciones flexibles con opciones de CASCADE y SET NULL
*/
