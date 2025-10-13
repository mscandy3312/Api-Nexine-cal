# 📋 Scripts de Configuración de Base de Datos

Este directorio contiene scripts para configurar la base de datos y crear usuarios administradores.

## 🗄️ Scripts Disponibles

### 1. `setup-database.js`
Configura la base de datos y crea todas las tablas necesarias.

**Uso:**
```bash
node setup-database.js
```

**Qué hace:**
- Conecta al servidor MySQL
- Crea la base de datos `sistema_citas` si no existe
- Ejecuta el esquema SQL (`database_schema.sql`)
- Verifica que todas las tablas se crearon correctamente

### 2. `create-admin-user.js`
Crea un usuario administrador en el sistema.

**Uso:**
```bash
# Crear nuevo usuario admin
node create-admin-user.js

# Listar usuarios admin existentes
node create-admin-user.js --list
```

**Qué hace:**
- Conecta a la base de datos
- Verifica si ya existen usuarios admin
- Solicita datos del nuevo usuario (email, nombre, contraseña, teléfono)
- Encripta la contraseña con bcrypt
- Crea el usuario con rol 'admin'

## ⚙️ Configuración Requerida

### Opción 1: Archivo .env
Crea un archivo `.env` en la raíz del proyecto:

```env
# Para desarrollo local
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=sistema_citas
DB_PORT=3306

# Para AWS RDS
# DB_HOST=tu-instancia-rds.xxxxx.us-east-1.rds.amazonaws.com
# DB_USER=admin
# DB_PASSWORD=tu_password_seguro
# DB_NAME=sistema_citas
# DB_PORT=3306
# DB_SSL=true
```

### Opción 2: Variables de entorno del sistema
```bash
# Windows PowerShell
$env:DB_HOST="localhost"
$env:DB_USER="root"
$env:DB_PASSWORD="tu_password"
$env:DB_NAME="sistema_citas"
$env:DB_PORT="3306"

# Linux/Mac
export DB_HOST="localhost"
export DB_USER="root"
export DB_PASSWORD="tu_password"
export DB_NAME="sistema_citas"
export DB_PORT="3306"
```

## 🚀 Flujo de Configuración Completo

### Paso 1: Configurar MySQL
1. Instalar MySQL en tu sistema
2. Iniciar el servicio MySQL
3. Crear un usuario con permisos (o usar root)

### Paso 2: Configurar variables de entorno
```bash
# Crear archivo .env con tus credenciales
cp env.example .env
# Editar .env con tus datos reales
```

### Paso 3: Configurar base de datos
```bash
node setup-database.js
```

### Paso 4: Crear usuario administrador
```bash
node create-admin-user.js
```

### Paso 5: Iniciar servidor
```bash
npm start
```

## 🔧 Solución de Problemas

### Error: "Access denied for user 'root'@'localhost'"
- Verificar que MySQL esté ejecutándose
- Verificar usuario y contraseña en .env
- Verificar que el usuario tenga permisos

### Error: "Unknown database 'sistema_citas'"
- Ejecutar `node setup-database.js` primero
- Verificar que el nombre de la base de datos sea correcto

### Error: "Table 'USUARIOS' doesn't exist"
- Ejecutar `node setup-database.js` para crear las tablas
- Verificar que `database_schema.sql` existe

### Error: "ECONNREFUSED"
- Verificar que MySQL esté ejecutándose
- Verificar host y puerto de conexión
- Verificar firewall/security groups (para AWS)

## 📊 Verificación

### Verificar conexión a base de datos:
```bash
node -e "const { testConnection } = require('./config/database'); testConnection().then(result => console.log('Conexión:', result))"
```

### Verificar usuarios admin:
```bash
node create-admin-user.js --list
```

### Verificar servidor:
```bash
npm start
# Visitar: http://localhost:3000/health
```

## 🔐 Seguridad

- Las contraseñas se encriptan con bcrypt (12 rounds)
- Los usuarios admin tienen email verificado por defecto
- Se recomienda usar contraseñas seguras
- Para producción, usar variables de entorno del sistema

## 📝 Notas

- El script `create-admin-user.js` es interactivo
- Se puede ejecutar múltiples veces para crear varios admins
- Los usuarios admin se crean con `activo=1` y `email_verificado=1`
- El script verifica duplicados por email
