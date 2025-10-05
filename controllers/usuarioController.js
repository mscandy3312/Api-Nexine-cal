const Usuario = require('../models/Usuario');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

// Generar JWT
const generarJWT = (usuario) => {
  return jwt.sign(
    { 
      id: usuario.id_usuario, 
      email: usuario.email,
      nombre: usuario.nombre 
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};

// Registro de usuario
const registrarUsuario = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Datos de entrada inválidos',
        errors: errors.array()
      });
    }

    const { email, password, nombre, oauth_provider, oauth_id } = req.body;

    // Verificar si el usuario ya existe
    const usuarioExistente = await Usuario.findByEmail(email);
    if (usuarioExistente) {
      return res.status(400).json({
        success: false,
        message: 'El usuario ya existe con este email'
      });
    }

    // Crear nuevo usuario
    const nuevoUsuario = await Usuario.create({
      email,
      password,
      nombre,
      oauth_provider,
      oauth_id
    });

    // Generar JWT
    const token = generarJWT(nuevoUsuario);

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: {
        usuario: nuevoUsuario.toJSON(),
        token
      }
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Login de usuario
const loginUsuario = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Datos de entrada inválidos',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Buscar usuario
    const usuario = await Usuario.findByEmail(email);
    if (!usuario) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Verificar contraseña (solo si no es OAuth)
    if (!usuario.oauth_provider) {
      const passwordValida = await usuario.verifyPassword(password);
      if (!passwordValida) {
        return res.status(401).json({
          success: false,
          message: 'Credenciales inválidas'
        });
      }
    }

    // Generar JWT
    const token = generarJWT(usuario);

    res.json({
      success: true,
      message: 'Login exitoso',
      data: {
        usuario: usuario.toJSON(),
        token
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener perfil del usuario autenticado
const obtenerPerfil = async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.user.id);
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      data: {
        usuario: usuario.toJSON()
      }
    });
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Actualizar perfil del usuario
const actualizarPerfil = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Datos de entrada inválidos',
        errors: errors.array()
      });
    }

    const usuario = await Usuario.findById(req.user.id);
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    const { nombre, email, rol } = req.body;
    const datosActualizacion = {};

    if (nombre) datosActualizacion.nombre = nombre;
    if (email) {
      // Verificar si el email ya existe en otro usuario
      const usuarioConEmail = await Usuario.findByEmail(email);
      if (usuarioConEmail && usuarioConEmail.id_usuario !== usuario.id_usuario) {
        return res.status(400).json({
          success: false,
          message: 'El email ya está en uso por otro usuario'
        });
      }
      datosActualizacion.email = email;
    }
    if (rol) datosActualizacion.rol = rol;

    const usuarioActualizado = await usuario.update(datosActualizacion);

    res.json({
      success: true,
      message: 'Perfil actualizado exitosamente',
      data: {
        usuario: usuarioActualizado.toJSON()
      }
    });
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Cambiar contraseña
const cambiarPassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Datos de entrada inválidos',
        errors: errors.array()
      });
    }

    const { password_actual, password_nueva } = req.body;

    const usuario = await Usuario.findById(req.user.id);
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Verificar contraseña actual
    const passwordValida = await usuario.verifyPassword(password_actual);
    if (!passwordValida) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña actual es incorrecta'
      });
    }

    // Cambiar contraseña
    await usuario.changePassword(password_nueva);

    res.json({
      success: true,
      message: 'Contraseña cambiada exitosamente'
    });
  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener todos los usuarios (admin)
const obtenerUsuarios = async (req, res) => {
  try {
    const { limit = 50, offset = 0, search, rol } = req.query;
    
    let usuarios;
    if (search) {
      usuarios = await Usuario.search({ nombre: search }, parseInt(limit), parseInt(offset));
    } else if (rol) {
      usuarios = await Usuario.findByRol(rol, parseInt(limit), parseInt(offset));
    } else {
      usuarios = await Usuario.findAll(parseInt(limit), parseInt(offset));
    }

    res.json({
      success: true,
      data: {
        usuarios: usuarios.map(u => u.toJSON()),
        paginacion: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: usuarios.length
        }
      }
    });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener usuario por ID (admin)
const obtenerUsuarioPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = await Usuario.findById(id);
    
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      data: {
        usuario: usuario.toJSON()
      }
    });
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Actualizar usuario (admin)
const actualizarUsuario = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Datos de entrada inválidos',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const usuario = await Usuario.findById(id);
    
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    const { nombre, email, rol, is_verified } = req.body;
    const datosActualizacion = {};

    if (nombre) datosActualizacion.nombre = nombre;
    if (email) {
      // Verificar si el email ya existe en otro usuario
      const usuarioConEmail = await Usuario.findByEmail(email);
      if (usuarioConEmail && usuarioConEmail.id_usuario !== usuario.id_usuario) {
        return res.status(400).json({
          success: false,
          message: 'El email ya está en uso por otro usuario'
        });
      }
      datosActualizacion.email = email;
    }
    if (rol) datosActualizacion.rol = rol;
    if (is_verified !== undefined) datosActualizacion.is_verified = is_verified;

    const usuarioActualizado = await usuario.update(datosActualizacion);

    res.json({
      success: true,
      message: 'Usuario actualizado exitosamente',
      data: {
        usuario: usuarioActualizado.toJSON()
      }
    });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Eliminar usuario (admin)
const eliminarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = await Usuario.findById(id);
    
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    await usuario.delete();

    res.json({
      success: true,
      message: 'Usuario eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

module.exports = {
  registrarUsuario,
  loginUsuario,
  obtenerPerfil,
  actualizarPerfil,
  cambiarPassword,
  obtenerUsuarios,
  obtenerUsuarioPorId,
  actualizarUsuario,
  eliminarUsuario
};
