'use strict';

const express     = require('express');
const bodyParser  = require('body-parser');
const cors        = require('cors');
const mongoose    = require('mongoose');
require('dotenv').config();

const apiRoutes   = require('./routes/api.js');
const fccTestingRoutes = require('./routes/fcctesting.js');
const runner = require('./test-runner');

const app = express();

// Middleware
app.use('/public', express.static(process.cwd() + '/public'));
app.use(cors({origin: '*'})); // Para FCC
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Conexión a MongoDB
mongoose.connect(process.env.DB, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("✅ Conectado a MongoDB Atlas"))
  .catch(err => console.error("❌ Error al conectar MongoDB:", err));

// Rutas
app.route('/')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
  });

fccTestingRoutes(app);
apiRoutes(app);

// 404
app.use(function(req, res, next) {
  res.status(404)
     .type('text')
     .send('Not Found');
});

// Iniciar servidor
const listener = app.listen(process.env.PORT || 3000, function () {
  console.log('🚀 App corriendo en el puerto ' + listener.address().port);

  // Correr tests si está en entorno de test
  if (process.env.NODE_ENV === 'test') {
    console.log('🧪 Ejecutando tests...');
    setTimeout(function () {
      try {
        runner.run();
      } catch(e) {
        console.log('❌ Error al ejecutar los tests:');
        console.log(e);
      }
    }, 1500);
  }
});

module.exports = app; // para los tests
