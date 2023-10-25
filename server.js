const express = require('express');
const path = require('path'); // path relativo


const bodyParser = require('body-parser');
const session = require('express-session');
const helmet = require('helmet');
const csurf = require('csurf');
const bcrypt = require('bcrypt');
const { Pool } = require('pg');

const app = express();
const PORT = 3002;

// Configuraciones iniciales
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // Para manejar datos de formularios
app.use(helmet());
app.use(session({
  secret: 'tu_secreto_aqui',
  resave: false,
  saveUninitialized: true,
}));
app.use(csurf());

// Configuración de la conexión con PostgreSQL
const pool = new Pool({
  user: 'tu_usuario',
  host: 'localhost',
  database: 'tu_base_de_datos',
  password: 'tu_contraseña',
  port: 5432,
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');

});

// Ruta de Registro
app.post('/register', async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const result = await pool.query('INSERT INTO users (username, password) VALUES ($1, $2)', [req.body.username, hashedPassword]);
    res.status(201).send("Usuario registrado con éxito");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al registrar al usuario");
  }
});

// Ruta de Inicio de Sesión
app.post('/login', async (req, res) => {
  const user = await pool.query('SELECT * FROM users WHERE username = $1', [req.body.username]);
  
  if (user.rows.length > 0 && await bcrypt.compare(req.body.password, user.rows[0].password)) {
    req.session.userId = user.rows[0].id;
    res.status(200).send("Ingreso exitoso");
  } else {
    res.status(403).send("Usuario o contraseña incorrectos");
  }
});

// Ruta para Cerrar Sesión
app.post('/logout', (req, res) => {
  req.session.destroy();
  res.status(200).send("Sesión cerrada con éxito");
});

// Middleware de autenticación
function checkAuth(req, res, next) {
  if (req.session.userId) {
    return next();
  } else {
    res.status(401).send("No estás autorizado");
  }
}

// Ruta protegida (ejemplo)
app.get('/dashboard', checkAuth, (req, res) => {
  res.send('Este es el dashboard del usuario');
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});


// Sirve archivos estáticos desde el directorio
app.use(express.static(__dirname));


// Sirve iniciar-sesion.html to express
app.get('/iniciar-sesion', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});
