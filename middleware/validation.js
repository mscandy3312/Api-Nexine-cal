const { body, param, query, validationResult } = require('express-validator');

// Validaciones para usuariosss
const validateusuarioss = {
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
  
  // --- ¡NUEVA REGLA AÑADIDA! ---
  // Esta regla es la que faltaba y causaba el error
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

// Validaciones para profesionales
const validateProfesional = {
  crear: [
    body('id_usuarioss')
      .isInt({ min: 1 })
      .withMessage('ID de usuarioss debe ser un número entero positivo'),
    body('nombre_completo')
      .notEmpty()
      .withMessage('El nombre completo es requerido')
      .isLength({ min: 2, max: 150 })
      .withMessage('El nombre completo debe tener entre 2 y 150 caracteres'),
    body('telefono')
      .optional()
      .isLength({ max: 20 })
      .withMessage('El teléfono no puede tener más de 20 caracteres'),
    body('numero_colegiado')
      .optional()
      .isLength({ max: 50 })
      .withMessage('El número colegiado no puede tener más de 50 caracteres'),
    body('especialidad')
      .optional()
      .isLength({ max: 100 })
      .withMessage('La especialidad no puede tener más de 100 caracteres'),
    body('direccion')
      .optional()
      .isLength({ max: 255 })
      .withMessage('La dirección no puede tener más de 255 caracteres'),
    body('biografia')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('La biografía no puede tener más de 1000 caracteres')
  ]
};

// Validaciones para clientess
const validateclientes = {
  crear: [
    body('id_usuarioss')
      .isInt({ min: 1 })
      .withMessage('ID de usuarioss debe ser un número entero positivo'),
    body('nombre_completo')
      .notEmpty()
      .withMessage('El nombre completo es requerido')
      .isLength({ min: 2, max: 150 })
      .withMessage('El nombre completo debe tener entre 2 y 150 caracteres'),
    body('telefono')
      .optional()
      .isLength({ max: 20 })
      .withMessage('El teléfono no puede tener más de 20 caracteres'),
    body('nombre_usuarioss')
      .optional()
      .isLength({ min: 3, max: 50 })
      .withMessage('El nombre de usuarioss debe tener entre 3 y 50 caracteres'),
    body('ciudad')
      .optional()
      .isLength({ max: 100 })
      .withMessage('La ciudad no puede tener más de 100 caracteres'),
    body('codigo_postal')
      .optional()
      .isLength({ max: 20 })
      .withMessage('El código postal no puede tener más de 20 caracteres'),
    body('ingreso')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('El ingreso debe ser un número positivo'),
    body('estado')
      .optional()
      .isLength({ max: 50 })
      .withMessage('El estado no puede tener más de 50 caracteres')
  ]
};

// Validaciones para precios
const validatePrecio = {
  crear: [
    body('numero_sesion')
      .optional()
      .isInt({ min: 1 })
      .withMessage('El número de sesión debe ser un entero positivo'),
    body('nombre_paquete')
      .optional()
      .isLength({ max: 100 })
      .withMessage('El nombre del paquete no puede tener más de 100 caracteres'),
    body('duracion')
      .optional()
      .isLength({ max: 50 })
      .withMessage('La duración no puede tener más de 50 caracteres'),
    body('modalidad')
      .optional()
      .isLength({ max: 50 })
      .withMessage('La modalidad no puede tener más de 50 caracteres'),
    body('horario')
      .optional()
      .isLength({ max: 100 })
      .withMessage('El horario no puede tener más de 100 caracteres')
  ]
};

// Validaciones para citass
const validatecitas = {
  crear: [
    body('id_clientes')
      .isInt({ min: 1 })
      .withMessage('ID de clientes debe ser un número entero positivo'),
    body('id_profesional')
      .isInt({ min: 1 })
      .withMessage('ID de profesional debe ser un número entero positivo'),
    body('id_precio')
      .optional()
      .isInt({ min: 1 })
      .withMessage('ID de precio debe ser un número entero positivo'),
    body('fecha')
      .isISO8601()
      .withMessage('La fecha debe ser válida en formato ISO 8601'),
    body('motivo')
      .optional()
      .isLength({ max: 500 })
      .withMessage('El motivo no puede tener más de 500 caracteres'),
    body('notas')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Las notas no pueden tener más de 1000 caracteres')
  ]
};

// Validaciones para sesiones
const validateSesion = {
  crear: [
    body('id_clientes')
      .isInt({ min: 1 })
      .withMessage('ID de clientes debe ser un número entero positivo'),
    body('id_profesional')
      .isInt({ min: 1 })
      .withMessage('ID de profesional debe ser un número entero positivo'),
    body('id_precio')
      .isInt({ min: 1 })
      .withMessage('ID de precio debe ser un número entero positivo'),
    body('id_citas')
      .optional()
      .isInt({ min: 1 })
      .withMessage('ID de citas debe ser un número entero positivo'),
    body('numero_pedido')
      .optional()
      .isLength({ max: 100 })
      .withMessage('El número de pedido no puede tener más de 100 caracteres'),
    body('fecha')
      .isISO8601()
      .withMessage('La fecha debe ser válida en formato ISO 8601'),
    body('estado')
      .optional()
      .isLength({ max: 50 })
      .withMessage('El estado no puede tener más de 50 caracteres'),
    body('acciones')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Las acciones no pueden tener más de 1000 caracteres'),
    body('producto')
      .optional()
      .isLength({ max: 100 })
      .withMessage('El producto no puede tener más de 100 caracteres'),
    body('metodo_pago')
      .optional()
      .isLength({ max: 50 })
      .withMessage('El método de pago no puede tener más de 50 caracteres')
  ]
};

// Validaciones para valoraciones
const validateValoracion = {
  crear: [
    body('id_sesion')
      .isInt({ min: 1 })
      .withMessage('ID de sesión debe ser un número entero positivo'),
    body('rating')
      .isInt({ min: 1, max: 5 })
      .withMessage('El rating debe ser un número entero entre 1 y 5'),
    body('mensaje')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('El mensaje no puede tener más de 1000 caracteres'),
    body('estado')
      .optional()
      .isLength({ max: 50 })
      .withMessage('El estado no puede tener más de 50 caracteres')
  ]
};

// Validaciones para pagos
const validatePago = {
  crear: [
    body('id_profesional')
      .isInt({ min: 1 })
      .withMessage('ID de profesional debe ser un número entero positivo'),
    body('balance_general')
      .optional()
      .isFloat()
      .withMessage('El balance general debe ser un número'),
    body('ventas')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Las ventas deben ser un número positivo'),
    body('comision')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('La comisión debe ser un número positivo'),
    body('fecha')
      .optional()
      .isISO8601()
      .withMessage('La fecha debe ser válida en formato ISO 8601'),
    body('especialidad')
      .optional()
      .isLength({ max: 100 })
      .withMessage('La especialidad no puede tener más de 100 caracteres'),
    body('estado')
      .optional()
      .isLength({ max: 50 })
      .withMessage('El estado no puede tener más de 50 caracteres'),
    body('accion')
      .optional()
      .isLength({ max: 100 })
      .withMessage('La acción no puede tener más de 100 caracteres')
  ]
};

// Validaciones para transacciones Stripe
const validateTransaccionStripe = {
  crear: [
    body('id_pago')
      .isInt({ min: 1 })
      .withMessage('ID de pago debe ser un número entero positivo'),
    body('id_sesion')
      .optional()
      .isInt({ min: 1 })
      .withMessage('ID de sesión debe ser un número entero positivo'),
    body('stripe_payment_id')
      .notEmpty()
      .withMessage('El ID de pago de Stripe es requerido')
      .isLength({ max: 255 })
      .withMessage('El ID de pago de Stripe no puede tener más de 255 caracteres'),
    body('monto')
      .isFloat({ min: 0 })
      .withMessage('El monto debe ser un número positivo'),
    body('moneda')
      .optional()
      .isLength({ min: 3, max: 10 })
      .withMessage('La moneda debe tener entre 3 y 10 caracteres'),
    body('estado')
      .optional()
      .isIn(['pendiente', 'pagado', 'fallido', 'reembolsado'])
      .withMessage('El estado debe ser uno de: pendiente, pagado, fallido, reembolsado'),
    body('metodo_pago')
      .optional()
      .isLength({ max: 50 })
      .withMessage('El método de pago no puede tener más de 50 caracteres')
  ]
};

// Validaciones para parámetros de ruta
const validateParams = {
  id: [
    param('id')
      .isInt({ min: 1 })
      .withMessage('El ID debe ser un número entero positivo')
  ],
  
  userId: [
    param('userId')
      .isInt({ min: 1 })
      .withMessage('El ID de usuarioss debe ser un número entero positivo')
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

// Validaciones para favoritos
const validateFavorito = {
  crear: [
    body('id_profesional')
      .isInt({ min: 1 })
      .withMessage('ID de profesional debe ser un número entero positivo')
  ]
};

// Validaciones para mensajes
const validateMensaje = {
  crear: [
    body('id_destinatario')
      .isInt({ min: 1 })
      .withMessage('ID de destinatario debe ser un número entero positivo'),
    body('asunto')
      .optional()
      .isLength({ max: 255 })
      .withMessage('El asunto no puede tener más de 255 caracteres'),
    body('contenido')
      .notEmpty()
      .withMessage('El contenido es requerido')
      .isLength({ max: 2000 })
      .withMessage('El contenido no puede tener más de 2000 caracteres'),
    body('tipo_mensaje')
      .optional()
      .isIn(['general', 'citas', 'sesion', 'pago', 'soporte'])
      .withMessage('Tipo de mensaje no válido'),
    body('prioridad')
      .optional()
      .isIn(['normal', 'media', 'alta'])
      .withMessage('Prioridad no válida')
  ]
};

// Validaciones para documentos
const validateDocumento = {
  crear: [
    body('tipo_documento')
      .notEmpty()
      .withMessage('El tipo de documento es requerido')
      .isLength({ max: 100 })
      .withMessage('El tipo de documento no puede tener más de 100 caracteres'),
    body('descripcion')
      .optional()
      .isLength({ max: 500 })
      .withMessage('La descripción no puede tener más de 500 caracteres'),
    body('es_publico')
      .optional()
      .isBoolean()
      .withMessage('es_publico debe ser un valor booleano')
  ]
};

// Validaciones para notificaciones
const validateNotificacion = {
  crear: [
    body('id_usuarioss')
      .isInt({ min: 1 })
      .withMessage('ID de usuarioss debe ser un número entero positivo'),
    body('tipo_notificacion')
      .notEmpty()
      .withMessage('El tipo de notificación es requerido')
      .isLength({ max: 100 })
      .withMessage('El tipo de notificación no puede tener más de 100 caracteres'),
    body('titulo')
      .notEmpty()
      .withMessage('El título es requerido')
      .isLength({ max: 255 })
      .withMessage('El título no puede tener más de 255 caracteres'),
    body('mensaje')
      .notEmpty()
      .withMessage('El mensaje es requerido')
      .isLength({ max: 1000 })
      .withMessage('El mensaje no puede tener más de 1000 caracteres'),
    body('prioridad')
      .optional()
      .isIn(['normal', 'media', 'alta'])
      .withMessage('Prioridad no válida'),
    body('canal')
      .optional()
      .isIn(['app', 'email', 'sms', 'whatsapp'])
      .withMessage('Canal no válido')
  ],
  masiva: [
    body('usuariosss')
      .isArray({ min: 1 })
      .withMessage('Se requiere un array de usuariosss'),
    body('usuariosss.*')
      .isInt({ min: 1 })
      .withMessage('Cada usuarioss debe ser un ID válido'),
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
  idusuarioss: [
    param('id_usuarioss2')
      .isInt({ min: 1 })
      .withMessage('ID de usuarioss debe ser un número entero positivo')
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
      .isIn(['google', 'whatsapp'])
      .withMessage('Proveedor debe ser google o whatsapp')
  ]
};

module.exports = {
  validateusuarioss, // <-- Exporta el nombre correcto (plural)
  validateProfesional,
  validateclientes,
  validatePrecio,
  validatecitas,
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

