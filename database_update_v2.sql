-- ============================================
-- Script SQL para nuevas funcionalidades v2.0.0
-- ============================================

USE sistema_citas;

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
-- Actualizar tabla PROFESIONALES
-- =====================
ALTER TABLE PROFESIONALES 
ADD COLUMN IF NOT EXISTS estado_aprobacion ENUM('pendiente', 'aprobado', 'rechazado') DEFAULT 'pendiente',
ADD COLUMN IF NOT EXISTS fecha_aprobacion DATETIME,
ADD COLUMN IF NOT EXISTS motivo_rechazo TEXT,
ADD COLUMN IF NOT EXISTS video_presentacion VARCHAR(500),
ADD COLUMN IF NOT EXISTS modalidad_cita ENUM('presencial', 'virtual', 'ambas') DEFAULT 'presencial';

-- =====================
-- Índices para optimización
-- =====================

-- Índices para FAVORITOS
CREATE INDEX idx_favoritos_cliente ON FAVORITOS(id_cliente);
CREATE INDEX idx_favoritos_profesional ON FAVORITOS(id_profesional);
CREATE INDEX idx_favoritos_fecha ON FAVORITOS(fecha_agregado);

-- Índices para MENSAJES
CREATE INDEX idx_mensajes_remitente ON MENSAJES(id_remitente);
CREATE INDEX idx_mensajes_destinatario ON MENSAJES(id_destinatario);
CREATE INDEX idx_mensajes_fecha ON MENSAJES(fecha_envio);
CREATE INDEX idx_mensajes_leido ON MENSAJES(leido);
CREATE INDEX idx_mensajes_tipo ON MENSAJES(tipo_mensaje);

-- Índices para DOCUMENTOS
CREATE INDEX idx_documentos_profesional ON DOCUMENTOS(id_profesional);
CREATE INDEX idx_documentos_tipo ON DOCUMENTOS(tipo_documento);
CREATE INDEX idx_documentos_estado ON DOCUMENTOS(estado);
CREATE INDEX idx_documentos_publico ON DOCUMENTOS(es_publico);
CREATE INDEX idx_documentos_fecha ON DOCUMENTOS(fecha_subida);

-- Índices para NOTIFICACIONES
CREATE INDEX idx_notificaciones_usuario ON NOTIFICACIONES(id_usuario);
CREATE INDEX idx_notificaciones_tipo ON NOTIFICACIONES(tipo_notificacion);
CREATE INDEX idx_notificaciones_leida ON NOTIFICACIONES(leida);
CREATE INDEX idx_notificaciones_prioridad ON NOTIFICACIONES(prioridad);
CREATE INDEX idx_notificaciones_fecha ON NOTIFICACIONES(fecha_creacion);
CREATE INDEX idx_notificaciones_estado ON NOTIFICACIONES(estado);

-- Índices para PROFESIONALES actualizados
CREATE INDEX idx_profesionales_estado_aprobacion ON PROFESIONALES(estado_aprobacion);
CREATE INDEX idx_profesionales_modalidad ON PROFESIONALES(modalidad_cita);

-- =====================
-- Datos de ejemplo (opcional)
-- =====================

-- Insertar tipos de documentos comunes
INSERT IGNORE INTO DOCUMENTOS (id_profesional, nombre_archivo, nombre_original, tipo_documento, ruta_archivo, descripcion, es_publico) 
VALUES 
(1, 'ejemplo-certificado.pdf', 'certificado_profesional.pdf', 'certificado', '/uploads/certificado.pdf', 'Certificado profesional', true),
(1, 'ejemplo-cv.pdf', 'curriculum_vitae.pdf', 'curriculum', '/uploads/cv.pdf', 'Curriculum vitae', false);

-- Insertar notificación de ejemplo
INSERT IGNORE INTO NOTIFICACIONES (id_usuario, tipo_notificacion, titulo, mensaje, prioridad) 
VALUES 
(1, 'bienvenida', '¡Bienvenido!', 'Bienvenido a nuestro sistema de citas terapéuticas', 'normal');

-- =====================
-- Comentarios sobre las nuevas funcionalidades
-- =====================

/*
NUEVAS FUNCIONALIDADES IMPLEMENTADAS:

1. SISTEMA DE FAVORITOS:
   - Los clientes pueden agregar profesionales a sus favoritos
   - Relación única entre cliente y profesional
   - Estadísticas de favoritos por profesional

2. SISTEMA DE MENSAJERÍA:
   - Mensajes entre usuarios y profesionales
   - Estados de lectura y prioridades
   - Tipos de mensajes (general, cita, sesión, pago, soporte)
   - Conversaciones entre usuarios

3. GESTIÓN DE DOCUMENTOS:
   - Subida de archivos por profesionales
   - Control de visibilidad (público/privado)
   - Tipos de documentos y metadatos
   - Descarga segura de documentos

4. SISTEMA DE NOTIFICACIONES:
   - Notificaciones push, email, SMS, WhatsApp
   - Prioridades y canales múltiples
   - Notificaciones automáticas por eventos
   - Estadísticas de notificaciones

5. ESTADOS DE APROBACIÓN PARA PROFESIONALES:
   - Pendiente, aprobado, rechazado
   - Fecha de aprobación y motivo de rechazo
   - Video de presentación opcional
   - Modalidad de citas (presencial/virtual/ambas)

6. OAuth INTEGRATION:
   - Login con Google y WhatsApp
   - Vinculación/desvinculación de cuentas
   - Verificación de tokens

TODAS LAS TABLAS INCLUYEN:
- Índices optimizados para consultas frecuentes
- Relaciones de integridad referencial
- Campos de auditoría (fechas de creación)
- Estados y flags para control de flujo
*/
