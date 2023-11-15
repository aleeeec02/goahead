// Servidor en localhost
const express = require("express");
const path = require("path");
const app = express();
let PORT = process.env.PORT || 3002;
const MAX_PORT = 3010

app.use(express.static(path.join(__dirname)));

// Sesiones de usuario; Iniciar sesión, Registro
const Sequelize = require("sequelize");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/auth/google/callback"
},
  function(accessToken, refreshToken, profile, done){
  // to implement lol
  }
));

app.get("/auth/google/callback",
  passport.authenticate("google", {failureRedirect: "login"}),
  function(req, res){
    res.redirect("/");
  }
});


// REST API middleware
const bodyParser = require("body-parser");


app.get("/", (req, res) => {
    res.send("¡Servidor funcionando :V!");
});

const startServer = (port) => {
    const server = app.listen(port, () => {
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


// Conectar a la database y utilizar Sequelize 
const sequelize = new Sequelize('postgres://username:password@localhost:5432/yourdbname', {
  dialect: 'postgres',
});

// Utilizando middleware `bodyParser` para manejar solicitudes entrantes
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Initialize Passport
app.use(passport.initialize());

startServer(PORT);
// Inicializa el servidor 
// const server = app.listen(PORT, () =>{
//   console.log(`El servidor está corriendo en el puerto ${server.address().port}`)
//   console.log(`URL del server: http://localhost:${PORT}`);
// });
