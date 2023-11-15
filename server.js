// Servidor en localhost
require('dotenv').config();

const express = require("express");
const path = require("path");
const app = express();
let PORT = process.env.PORT || 3002;
const MAX_PORT = 3010;

app.use(express.static(path.join(__dirname)));

// Sesiones de usuario; Iniciar sesión, Registro
const Sequelize = require("sequelize");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
// Configuración de Passport con la estrategia de Google
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://ec2-13-59-59-88.us-east-2.compute.amazonaws.com/auth/google/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    // Implementar la lógica para encontrar o crear un usuario
    // Ejemplo: done(null, profile);
  }
));

// Ruta de autenticación de Google
app.get("/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Ruta de callback después de la autenticación de Google
app.get("/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  function(req, res) {
    // Redirigir al usuario a la página deseada después de la autenticación exitosa
    res.redirect("/");
  }
);

// REST API middleware
const bodyParser = require("body-parser");

// Utilizando middleware `bodyParser` para manejar solicitudes entrantes
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Initialize Passport
app.use(passport.initialize());

// Ruta principal
app.get("/", (req, res) => {
    res.send("¡Servidor funcionando :V!");
});

// Función para iniciar el servidor en un puerto disponible
const startServer = (port) => {
    const server = app.listen(port, '0.0.0.0', () => {
        console.log(`El servidor está escuchando en http://localhost:${server.address().port}`);
    }).on("error", (err) => {
        if (err.code === "EADDRINUSE" && port < MAX_PORT) {
            console.log(`El puerto ${port} está en uso, intentando con el puerto ${port + 1}...`);
            startServer(port + 1);
        } else {
            console.error("Error al iniciar el servidor:", err);
        }
    });
};

// Conexión a la base de datos con Sequelize
const sequelize = new Sequelize('postgres://username:password@localhost:5432/yourdbname', {
  dialect: 'postgres',
});

// Inicializar el servidor
startServer(PORT);

