// ===============================================================
// CONTROLADOR: USUARIOS
// ===============================================================
console.log('--- [CONTROLADOR] controllers/usuarioController.js ¡CARGADO CORRECTAMENTE! ---');

const Usuario = require('../models/Usuarios');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const emailService = require('../utils/emailService');
const { validationResult } = require('express-validator');

// ===============================================================
// FUNCIÓN AUXILIAR: GENERAR JWT
// ===============================================================
const generarJWT = (usuario) => {
  return jwt.sign(
    { 
      id: usuario.id_usuario,
      email: usuario.email,
      nombre: usuario.nombre,
      rol: usuario.rol
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};

// ===============================================================
// REGISTRO DE USUARIO CON CÓDIGO DE VERIFICACIÓN
// ===============================================================
const registrarUsuario = async (req, res) => {
  console.log('--- [CONTROLADOR] PASO 1: Iniciando registrarUsuario... ---');
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('--- [CONTROLADOR] ERROR: Validación fallida ---', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Datos de entrada inválidos',
        errors: errors.array()
      });
    }

    const { email, password, nombre, rol } = req.body;
    console.log(`--- [CONTROLADOR] PASO 2: Buscando usuario ${email} ---`);

    const usuarioExistente = await Usuario.findByEmail(email);
    if (usuarioExistente) {
      console.log('--- [CONTROLADOR] ERROR: El usuario ya existe ---');
      if (!usuarioExistente.is_verified) {
        return res.status(400).json({
          success: false,
          message: 'Email ya registrado, pero no verificado.'
        });
      }
      return res.status(400).json({
        success: false,
        message: 'El usuario ya existe con este email'
      });
    }

    // Generar código de verificación de 6 dígitos
    const verificationCode = crypto.randomInt(100000, 999999).toString();
    console.log('--- [CONTROLADOR] PASO 3: Código generado ---', verificationCode);

    const nuevoUsuario = await Usuario.register({
      email,
      password,
      nombre,
      rol: rol || 'cliente'
    }, verificationCode);

    // Enviar email de verificación
    try {
      await emailService.sendVerificationCode(nuevoUsuario.email, verificationCode);
      console.log('--- [CONTROLADOR] PASO 4: Email enviado ---');

      return res.status(201).json({
        success: true,
        message: 'Registro exitoso. Revisa tu email para el código de 6 dígitos.'
      });
    } catch (emailError) {
      console.error('--- [CONTROLADOR] ERROR: Falló el envío de email ---', emailError);
      return res.status(500).json({
        success: false,
        message: 'Usuario registrado, pero hubo un error al enviar el email.'
      });
    }

  } catch (error) {
    console.error('--- [CONTROLADOR] ERROR FATAL en registro ---', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// ===============================================================
// VERIFICAR CÓDIGO DE CONFIRMACIÓN
// ===============================================================
const verificarCodigo = async (req, res) => {
  console.log('--- [CONTROLADOR] Iniciando verificarCodigo... ---');
  try {
    const { email, codigo } = req.body;
    const usuario = await Usuario.findByVerificationCode(email, codigo);

    if (!usuario) {
      console.log('--- [CONTROLADOR] ERROR: Código inválido ---');
      return res.status(400).json({
        success: false,
        message: 'Código de verificación inválido o expirado.'
      });
    }

    await Usuario.markAsVerified(usuario.id_usuario);
    const jwtToken = generarJWT(usuario);

    res.status(200).json({
      success: true,
      message: 'Email verificado exitosamente. ¡Bienvenido!',
      data: {
        usuario: usuario.toJSON(),
        token: jwtToken
      }
    });
  } catch (error) {
    console.error('--- [CONTROLADOR] ERROR FATAL: verificarCodigo ---', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// ===============================================================
// LOGIN DE USUARIO
// ===============================================================
const loginUsuario = async (req, res) => {
  console.log('--- [CONTROLADOR] Iniciando login... ---');
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
    const usuario = await Usuario.findByEmail(email);
    if (!usuario) {
      return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
    }

    if (!usuario.is_verified && !usuario.oauth_provider) {
      return res.status(401).json({
        success: false,
        message: 'Tu cuenta no ha sido verificada. Revisa tu email.'
      });
    }

    if (!usuario.oauth_provider) {
      if (!password || !(await usuario.verifyPassword(password))) {
        return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
      }
    } else if (password) {
      return res.status(401).json({
        success: false,
        message: 'Usa el inicio de sesión social (Google, etc.).'
      });
    }

    const token = generarJWT(usuario);
    res.json({
      success: true,
      message: 'Login exitoso',
      data: { usuario: usuario.toJSON(), token }
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

// ===============================================================
// PERFIL DE USUARIO
// ===============================================================
const obtenerPerfil = async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.user.id);
    if (!usuario) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }
    res.json({ success: true, data: { usuario: usuario.toJSON() } });
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor', error: error.message });
  }
};

// ===============================================================
// ACTUALIZAR PERFIL
// ===============================================================
const actualizarPerfil = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Datos de entrada inválidos', errors: errors.array() });
    }

    const usuario = await Usuario.findById(req.user.id);
    if (!usuario) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    const { nombre, email } = req.body;
    const datosActualizacion = {};

    if (nombre) datosActualizacion.nombre = nombre;
    if (email) {
      const usuarioConEmail = await Usuario.findByEmail(email);
      if (usuarioConEmail && usuarioConEmail.id_usuario !== usuario.id_usuario) {
        return res.status(400).json({ success: false, message: 'El email ya está en uso por otro usuario' });
      }
      datosActualizacion.email = email;
    }

    const usuarioActualizado = await usuario.update(datosActualizacion);
    res.json({ success: true, message: 'Perfil actualizado', data: { usuario: usuarioActualizado.toJSON() } });
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor', error: error.message });
  }
};

// ===============================================================
// CAMBIAR CONTRASEÑA
// ===============================================================
const cambiarPassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Datos de entrada inválidos', errors: errors.array() });
    }

    const { password_actual, password_nueva } = req.body;
    const usuario = await Usuario.findById(req.user.id);
    if (!usuario) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    const passwordValida = await usuario.verifyPassword(password_actual);
    if (!passwordValida) {
      return res.status(400).json({ success: false, message: 'La contraseña actual es incorrecta' });
    }

    await usuario.changePassword(password_nueva);
    res.json({ success: true, message: 'Contraseña cambiada exitosamente' });
  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor', error: error.message });
  }
};

// ===============================================================
// ADMINISTRACIÓN
// ===============================================================
const obtenerUsuarios = async (req, res) => {
  try {
    const { limit = 50, offset = 0, search, rol } = req.query;
    let usuarios;

    if (search) usuarios = await Usuario.search({ nombre: search }, parseInt(limit), parseInt(offset));
    else if (rol) usuarios = await Usuario.findByRol(rol, parseInt(limit), parseInt(offset));
    else usuarios = await Usuario.findAll(parseInt(limit), parseInt(offset));

    res.json({
      success: true,
      data: {
        usuarios: usuarios.map(u => u.toJSON()),
        paginacion: { limit: parseInt(limit), offset: parseInt(offset), total: usuarios.length }
      }
    });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor', error: error.message });
  }
};


// ===============================================================
// OBTENER USUARIO POR ID
// ===============================================================
const obtenerUsuarioPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = await Usuario.findById(id);

    if (!usuario) {
      // --- CORREGIDO ---
      return res.status(404).json({ 
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      data: { usuario: usuario.toJSON() }
    });

  } catch (error) {
    console.error('Error al obtener usuario por ID:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// ===============================================================
// (ADMIN) ACTUALIZAR USUARIO
// ===============================================================
const actualizarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, email, rol } = req.body;

    const usuario = await Usuario.findById(id);
    if (!usuario) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }
    
    const datosActualizacion = {};
    if (nombre) datosActualizacion.nombre = nombre;
    if (rol) datosActualizacion.rol = rol;

    // Validar email solo si se proporciona y es diferente al actual
    if (email && email !== usuario.email) {
      const usuarioConEmail = await Usuario.findByEmail(email);
      // Asegurarse de que el email no esté en uso por OTRO usuario
      if (usuarioConEmail && usuarioConEmail.id_usuario.toString() !== id) {
        return res.status(400).json({ success: false, message: 'El email ya está en uso por otro usuario' });
      }
      datosActualizacion.email = email;
    }

    const usuarioActualizado = await usuario.update(datosActualizacion);
    res.json({ success: true, message: 'Usuario actualizado por admin', data: { usuario: usuarioActualizado.toJSON() } });

  } catch (error) {
    console.error('Error al actualizar usuario (admin):', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor', error: error.message });
  }
};

// ===============================================================
// (ADMIN) ELIMINAR USUARIO
// ===============================================================
const eliminarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = await Usuario.findById(id);

    if (!usuario) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    // Opcional: Impedir que un admin se elimine a sí mismo por esta ruta
    if (req.user.id && req.user.id.toString() === usuario.id_usuario.toString()) {
       return res.status(400).json({ success: false, message: 'No puedes eliminarte a ti mismo desde esta ruta. Usa la configuración de tu perfil.' });
    }

    await usuario.delete(); // Asumiendo que tu modelo tiene un método .delete()

    res.json({ success: true, message: 'Usuario eliminado exitosamente' });

  } catch (error) {
    console.error('Error al eliminar usuario (admin):', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor', error: error.message });
  }
};

// ===============================================================
// CERRAR SESIÓN (LOGOUT)
// ===============================================================
const cerrarSesion = (req, res) => {
  // Para JWT stateless, el logout es manejado principalmente por el cliente 
  // (borrando el token de localStorage/sessionStorage).
  //
  // Si estuvieras usando cookies HttpOnly para almacenar el token,
  // aquí es donde las limpiarías:
  //
  // res.cookie('tuNombreDeCookie', '', {
  //   httpOnly: true,
  //   expires: new Date(0), // Expira inmediatamente
  //   secure: process.env.NODE_ENV === 'production', // Solo en HTTPS en producción
  //   path: '/'
  // });
  //
  // Dado que este controlador no establece cookies, solo enviamos
  // una confirmación para que el frontend proceda.
  
  try {
    // req.user es insertado por el middleware 'authenticateToken'
    console.log(`--- [CONTROLADOR] Solicitud de cierre de sesión para usuario ${req.user?.id || '(token no provisto o inválido)'} ---`);
    
    // No hay una acción real del lado del servidor para invalidar un JWT stateless
    // a menos que se implemente una lista negra (blacklist) de tokens.
    
    res.status(200).json({
      success: true,
      message: 'Sesión cerrada exitosamente. El cliente debe borrar el token.'
    });

  } catch (error) {
    console.error('Error en cerrarSesion:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};


// ===============================================================
// EXPORTAR FUNCIONES
// ===============================================================
module.exports = {
  registrarUsuario,
  verificarCodigo,
  loginUsuario,
  obtenerPerfil,
  actualizarPerfil,
  cambiarPassword,
  obtenerUsuarios,
  obtenerUsuarioPorId,
  actualizarUsuario,
  eliminarUsuario,
  cerrarSesion // <-- ¡Añadido!
};

