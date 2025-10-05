const jwt = require('jsonwebtoken');

// Middleware de autenticación
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Token de acceso requerido'
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'Token inválido o expirado'
      });
    }
    
    req.user = user;
    next();
  });
};

// Middleware para verificar roles
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Token de acceso requerido'
      });
    }

    // Si roles es un string, convertirlo a array
    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    
    if (!allowedRoles.includes(req.user.rol)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos suficientes para acceder a este recurso'
      });
    }
    
    next();
  };
};

// Middleware para verificar que el usuario es admin
const requireAdmin = requireRole('admin');

// Middleware para verificar que el usuario es profesional o admin
const requireProfesionalOrAdmin = requireRole(['profesional', 'admin']);

// Middleware para verificar que el usuario es cliente o admin
const requireClienteOrAdmin = requireRole(['cliente', 'admin']);

// Middleware para verificar que el usuario es el propietario del recurso
const requireOwnership = (req, res, next) => {
  const userId = req.params.userId || req.params.id;
  
  if (req.user.id !== parseInt(userId)) {
    return res.status(403).json({
      success: false,
      message: 'No tienes permisos para acceder a este recurso'
    });
  }
  
  next();
};

module.exports = {
  authenticateToken,
  requireRole,
  requireAdmin,
  requireProfesionalOrAdmin,
  requireClienteOrAdmin,
  requireOwnership
};
