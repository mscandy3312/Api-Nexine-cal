// --- [MIDDLEWARE] middleware/validation.js ¡CARGADO Y CORREGIDO! ---
console.log('--- [MIDDLEWARE] middleware/validation.js ¡CARGADO Y CORREGIDO! ---');

const { body, param, query, validationResult } = require('express-validator');

// --- ¡CORREGIDO! ---
// Validaciones para usuarios (Nombre de objeto singular)
const validateUsuario = {
  registro: [
    body('email')
      .isEmail()
      .withMessage('Debe ser un email válido')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 6 })
      .withMessage('La contraseña debe tener al menos 6 caracteres'),
    body('nombre')
      .notEmpty()
      .withMessage('El nombre es requerido')
      .isLength({ min: 2, max: 100 })
      .withMessage('El nombre debe tener entre 2 y 100 caracteres'),
    body('rol')
      .optional()
      .isIn(['admin', 'profesional', 'cliente']) // <-- Corregido a 'cliente'
      .withMessage('El rol debe ser admin, profesional o cliente')
  ],
  
  verificarCodigo: [
    body('email')
      .isEmail()
      .withMessage('Debe ser un email válido')
      .normalizeEmail(),
    body('codigo')
      .isString()
      .isLength({ min: 6, max: 6 })
      .withMessage('El código debe tener 6 dígitos')
  ],
  
  login: [
    body('email')
      .isEmail()
      .withMessage('Debe ser un email válido')
      .normalizeEmail(),
    body('password')
      .notEmpty()
      .withMessage('La contraseña es requerida')
  ],
  
  actualizarPerfil: [
    body('nombre')
      .optional()
      .isLength({ min: 2, max: 100 })
      .withMessage('El nombre debe tener entre 2 y 100 caracteres'),
    body('email')
      .optional()
      .isEmail()
      .withMessage('Debe ser un email válido')
      .normalizeEmail(),
    body('rol')
      .optional()
      .isIn(['admin', 'profesional', 'cliente']) // <-- Corregido a 'cliente'
      .withMessage('El rol debe ser admin, profesional o cliente')
  ],
  
  cambiarPassword: [
    body('password_actual')
      .notEmpty()
      .withMessage('La contraseña actual es requerida'),
    body('password_nueva')
      .isLength({ min: 6 })
      .withMessage('La nueva contraseña debe tener al menos 6 caracteres')
  ]
};

// --- ¡CORREGIDO! ---
// Validaciones para profesionales (Ajustado a schema real)
const validateProfesional = {
  crear: [
    // --- ¡CORREGIDO! ---
    body('id_usuario')
      .isInt({ min: 1 })
      .withMessage('ID de usuario debe ser un número entero positivo'),
    body('id_especialidad')
      .optional()
      .isInt({ min: 1 })
      .withMessage('ID de especialidad debe ser un número entero positivo'),
    body('nombre_completo')
      .notEmpty()
      .withMessage('El nombre completo es requerido')
      .isLength({ min: 2, max: 150 }),
    body('email')
      .optional()
      .isEmail()
      .withMessage('Debe ser un email válido'),
    body('telefono')
      .optional()
      .isLength({ max: 20 })
      .withMessage('El teléfono no puede tener más de 20 caracteres'),
    body('especialidad') // Campo string
      .optional()
      .isLength({ max: 100 })
      .withMessage('La especialidad no puede tener más de 100 caracteres'),
    body('direccion')
      .optional()
      .isLength({ max: 255 })
      .withMessage('La dirección no puede tener más de 255 caracteres'),
    // --- ¡CORREGIDO! --- (biografia -> descripcion)
    body('descripcion')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('La descripción no puede tener más de 1000 caracteres'),
    body('tarifa_por_hora')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('La tarifa debe ser un número positivo'),
    body('modalidad_cita')
      .optional()
      .isIn(['presencial', 'virtual', 'hibrida'])
      .withMessage('Modalidad no válida'),
    body('modo_atencion')
      .optional()
      .isIn(['consultorio', 'domicilio'])
      .withMessage('Modo de atención no válido')
  ]
};

// --- ¡CORREGIDO! ---
// Validaciones para clientes (Ajustado a schema real)
const validateCliente = {
  crear: [
    // --- ¡CORREGIDO! ---
    body('id_usuario')
      .isInt({ min: 1 })
      .withMessage('ID de usuario debe ser un número entero positivo'),
    body('nombre_completo')
      .notEmpty()
      .withMessage('El nombre completo es requerido')
      .isLength({ min: 2, max: 150 }),
    body('telefono')
      .optional()
      .isLength({ max: 20 })
      .withMessage('El teléfono no puede tener más de 20 caracteres'),
    body('email')
      .optional()
      .isEmail()
      .withMessage('El email debe ser válido'),
    body('fecha_nacimiento')
      .optional()
      .isISO8601()
      .withMessage('La fecha de nacimiento debe ser una fecha válida'),
    body('historial_medico')
      .optional()
      .isString()
      .withMessage('El historial médico debe ser texto')
  ]
};

// --- ¡CORREGIDO! ---
// Validaciones para precios (Ajustado a schema real de App.js)
const validatePrecio = {
  crear: [
    body('id_profesional')
      .isInt({ min: 1 })
      .withMessage('ID de profesional debe ser un número entero positivo'),
    body('nombre_paquete')
      .notEmpty()
      .withMessage('El nombre del paquete es requerido')
      .isLength({ max: 100 }),
    body('precio')
      .isFloat({ min: 0 })
      .withMessage('El precio debe ser un número positivo'),
    body('duracion_minutos')
      .isInt({ min: 1 })
      .withMessage('La duración debe ser un entero positivo'),
    body('modalidad')
      .optional()
      .isIn(['presencial', 'virtual'])
      .withMessage('Modalidad no válida'),
    body('activo')
      .optional()
      .isBoolean()
      .withMessage('Activo debe ser booleano')
  ]
};

// --- ¡CORREGIDO! ---
// Validaciones para citas (Ajustado a schema real de App.js)
const validateCita = {
  crear: [
    body('id_cliente')
      .isInt({ min: 1 })
      .withMessage('ID de cliente debe ser un número entero positivo'),
    body('id_profesional')
      .isInt({ min: 1 })
      .withMessage('ID de profesional debe ser un número entero positivo'),
    body('id_evento')
      .optional()
      .isInt({ min: 1 })
      .withMessage('ID de evento debe ser un número entero positivo'),
    body('fecha_inicio')
      .isISO8601()
      .withMessage('La fecha de inicio debe ser válida en formato ISO 8601'),
    body('fecha_fin')
      .isISO8601()
      .withMessage('La fecha de fin debe ser válida en formato ISO 8601'),
    body('tipo_cita')
      .optional()
      .isIn(['presencial', 'virtual'])
      .withMessage('Tipo de cita no válido'),
    body('estado')
      .optional()
      .isIn(['pendiente', 'confirmada', 'cancelada', 'completada'])
      .withMessage('Estado no válido')
  ]
};

// --- ¡CORREGIDO! ---
// Validaciones para sesiones (Ajustado a schema real de App.js)
const validateSesion = {
  crear: [
    body('id_cita')
      .isInt({ min: 1 })
      .withMessage('ID de cita debe ser un número entero positivo'),
    body('id_cliente')
      .isInt({ min: 1 })
      .withMessage('ID de cliente debe ser un número entero positivo'),
    body('id_profesional')
      .isInt({ min: 1 })
      .withMessage('ID de profesional debe ser un número entero positivo'),
    body('fecha_sesion')
      .isISO8601()
      .withMessage('La fecha debe ser válida en formato ISO 8601'),
    body('duracion_minutos')
      .isInt({ min: 1 })
      .withMessage('La duración debe ser un entero positivo'),
    body('estado')
      .optional()
      .isIn(['programada', 'completada', 'cancelada', 'no_asistio'])
      .withMessage('Estado no válido'),
    body('notas_profesional')
      .optional()
      .isString(),
    body('notas_cliente')
      .optional()
      .isString()
  ]
};

// --- ¡CORREGIDO! ---
// Validaciones para valoraciones (Ajustado a schema real de App.js)
const validateValoracion = {
  crear: [
    body('id_cliente')
      .isInt({ min: 1 })
      .withMessage('ID de cliente debe ser un número entero positivo'),
    body('id_profesional')
      .isInt({ min: 1 })
      .withMessage('ID de profesional debe ser un número entero positivo'),
    body('id_sesion')
      .optional()
      .isInt({ min: 1 })
      .withMessage('ID de sesión debe ser un número entero positivo'),
    // --- ¡CORREGIDO! --- (rating -> calificacion)
    body('calificacion')
      .isInt({ min: 1, max: 5 })
      .withMessage('La calificación debe ser un número entero entre 1 y 5'),
    // --- ¡CORREGIDO! --- (mensaje -> comentario)
    body('comentario')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('El comentario no puede tener más de 1000 caracteres')
  ]
};

// --- ¡CORREGIDO! ---
// Validaciones para pagos (Ajustado a schema real de App.js)
const validatePago = {
  crear: [
    body('id_cliente')
      .isInt({ min: 1 })
      .withMessage('ID de cliente debe ser un número entero positivo'),
    body('id_profesional')
      .isInt({ min: 1 })
      .withMessage('ID de profesional debe ser un número entero positivo'),
    body('id_cita')
      .optional()
      .isInt({ min: 1 })
      .withMessage('ID de cita debe ser un número entero positivo'),
    body('monto')
      .isFloat({ min: 0 })
      .withMessage('El monto debe ser un número positivo'),
    body('metodo_pago')
      .optional()
      .isIn(['stripe', 'transferencia', 'efectivo'])
      .withMessage('Método de pago no válido'),
    body('estado')
      .optional()
      .isIn(['pendiente', 'completado', 'fallido', 'reembolsado'])
      .withMessage('Estado no válido')
  ]
};

// --- ¡CORREGIDO! ---
// Validaciones para transacciones Stripe (Ajustado a schema real de App.js)
const validateTransaccionStripe = {
  crear: [
    body('id_pago')
      .isInt({ min: 1 })
      .withMessage('ID de pago debe ser un número entero positivo'),
    // --- ¡CORREGIDO! --- (stripe_payment_id -> stripe_payment_intent_id)
    body('stripe_payment_intent_id')
      .notEmpty()
      .withMessage('El ID de pago de Stripe es requerido')
      .isLength({ max: 255 }),
    // --- ¡CORREGIDO! --- (monto -> monto_centavos)
    body('monto_centavos')
      .isInt({ min: 0 })
      .withMessage('El monto en centavos debe ser un número positivo'),
    body('moneda')
      .optional()
      .isLength({ min: 3, max: 3 })
      .withMessage('La moneda debe ser un código de 3 letras (ej. usd, mxn)'),
    // --- ¡CORREGIDO! --- (estado -> estado_stripe)
    body('estado_stripe')
      .optional()
      .isLength({ max: 50 })
      .withMessage('El estado de Stripe no puede tener más de 50 caracteres')
  ]
};

// Validaciones para parámetros de ruta
const validateParams = {
  id: [
    param('id')
      .isInt({ min: 1 })
      .withMessage('El ID debe ser un número entero positivo')
  ],
  
  // --- ¡CORREGIDO! ---
  userId: [
    param('userId') // Asumiendo que la ruta usa /:userId
      .isInt({ min: 1 })
      .withMessage('El ID de usuario debe ser un número entero positivo')
  ]
};

// Validaciones para consultas
const validateQuery = {
  paginacion: [
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('El límite debe ser un número entre 1 y 100'),
    query('offset')
      .optional()
      .isInt({ min: 0 })
      .withMessage('El offset debe ser un número positivo')
  ],
  
  fechas: [
    query('fecha')
      .optional()
      .isISO8601()
      .withMessage('La fecha debe ser válida en formato ISO 8601'),
    query('fecha_desde')
      .optional()
      .isISO8601()
      .withMessage('La fecha desde debe ser válida en formato ISO 8601'),
    query('fecha_hasta')
      .optional()
      .isISO8601()
      .withMessage('La fecha hasta debe ser válida en formato ISO 8601')
  ]
};

// Middleware para manejar errores de validación
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Errores de validación',
      errors: errors.array()
    });
  }
  next();
};

// Validaciones para favoritos (Ajustado a schema real de App.js)
const validateFavorito = {
  crear: [
    body('id_cliente')
      .isInt({ min: 1 })
      .withMessage('ID de cliente debe ser un número entero positivo'),
    body('id_profesional')
      .isInt({ min: 1 })
      .withMessage('ID de profesional debe ser un número entero positivo')
  ]
};

// Validaciones para mensajes (Ajustado a schema real de App.js)
const validateMensaje = {
  crear: [
    body('id_remitente')
      .isInt({ min: 1 })
      .withMessage('ID de remitente debe ser un número entero positivo'),
    body('id_destinatario')
      .isInt({ min: 1 })
      .withMessage('ID de destinatario debe ser un número entero positivo'),
    body('asunto')
      .optional()
      .isLength({ max: 255 }),
    body('contenido')
      .notEmpty()
      .withMessage('El contenido es requerido')
      .isLength({ max: 2000 }),
    body('tipo_mensaje')
      .optional()
      .isLength({ max: 50 }),
    body('prioridad')
      .optional()
      .isIn(['normal', 'media', 'alta'])
      .withMessage('Prioridad no válida')
  ]
};

// Validaciones para documentos (Ajustado a schema real de App.js)
const validateDocumento = {
  crear: [
    body('id_profesional')
      .isInt({ min: 1 })
      .withMessage('ID de profesional debe ser un número entero positivo'),
    body('nombre_archivo')
      .notEmpty()
      .withMessage('El nombre de archivo es requerido'),
    body('tipo_documento')
      .notEmpty()
      .withMessage('El tipo de documento es requerido')
      .isLength({ max: 100 }),
    body('estado')
      .optional()
      .isIn(['activo', 'archivado'])
      .withMessage('Estado no válido'),
    body('es_publico')
      .optional()
      .isBoolean()
      .withMessage('es_publico debe ser un valor booleano')
  ]
};

// Validaciones para notificaciones (Ajustado a schema real de App.js)
const validateNotificacion = {
  crear: [
    // --- ¡CORREGIDO! ---
    body('id_usuario')
      .isInt({ min: 1 })
      .withMessage('ID de usuario debe ser un número entero positivo'),
    body('tipo_notificacion')
      .notEmpty()
      .withMessage('El tipo de notificación es requerido')
      .isLength({ max: 100 }),
    body('titulo')
      .notEmpty()
      .withMessage('El título es requerido')
      .isLength({ max: 255 }),
    body('mensaje')
      .notEmpty()
      .withMessage('El mensaje es requerido')
      .isLength({ max: 1000 }),
    body('prioridad')
      .optional()
      .isIn(['normal', 'media', 'alta'])
      .withMessage('Prioridad no válida'),
    body('canal')
      .optional()
      .isIn(['app', 'email']) // Ajustado a valores probables
      .withMessage('Canal no válido')
  ],
  masiva: [
    // --- ¡CORREGIDO! ---
    body('usuarios')
      .isArray({ min: 1 })
      .withMessage('Se requiere un array de usuarios'),
    body('usuarios.*')
      .isInt({ min: 1 })
      .withMessage('Cada usuario debe ser un ID válido'),
    body('tipo_notificacion')
      .notEmpty()
      .withMessage('El tipo de notificación es requerido'),
    body('titulo')
      .notEmpty()
      .withMessage('El título es requerido'),
    body('mensaje')
      .notEmpty()
      .withMessage('El mensaje es requerido')
  ]
};

// Validaciones adicionales para parámetros
const validateParamsExtended = {
  ...validateParams,
  idProfesional: [
    param('id_profesional')
      .isInt({ min: 1 })
      .withMessage('ID de profesional debe ser un número entero positivo')
  ],
  // --- ¡CORREGIDO! ---
  idUsuario: [
    param('id_usuario') // <-- Corregido
      .isInt({ min: 1 })
      .withMessage('ID de usuario debe ser un número entero positivo')
  ],
  tipoDocumento: [
    param('tipo_documento')
      .notEmpty()
      .withMessage('Tipo de documento es requerido')
  ],
  tipoNotificacion: [
    param('tipo_notificacion')
      .notEmpty()
      .withMessage('Tipo de notificación es requerido')
  ],
  prioridad: [
    param('prioridad')
      .isIn(['normal', 'media', 'alta'])
      .withMessage('Prioridad debe ser normal, media o alta')
  ],
  proveedor: [
    param('proveedor')
      .isIn(['google', 'outlook']) // Ajustado
      .withMessage('Proveedor debe ser google u outlook')
  ]
};

// --- ¡CORREGIDO! --- (Exportaciones)
module.exports = {
  validateUsuario,
  validateProfesional,
  validateCliente,
  validatePrecio,
  validateCita,
  validateSesion,
  validateValoracion,
  validatePago,
  validateTransaccionStripe,
  validateFavorito,
  validateMensaje,
  validateDocumento,
  validateNotificacion,
  validateParams: validateParamsExtended,
  validateQuery,
  handleValidationErrors
};

