const express = require('express');
const session = require('express-session');
const path = require('path');

const tasksRoutes =
  require('./backend/routes/tasks');

const {
  router: authRoutes,
  requireAuth,
} = require('./backend/routes/auth');


// Inicializar base de datos
require('./backend/db/database');


const app = express();

const PORT =
  process.env.PORT || 3000;


// ======================================================
// BODY
// ======================================================

app.use(
  express.json()
);

app.use(
  express.urlencoded({
    extended: true,
  })
);


// ======================================================
// SESIONES
// ======================================================

app.use(
  session({
    name: 'devops.sid',

    secret:
      process.env.SESSION_SECRET ||
      'devops-tasks-secret-local',

    resave: false,

    saveUninitialized: false,

    cookie: {
      httpOnly: true,

      sameSite: 'lax',

      secure: false,

      maxAge:
        60 * 60 * 1000,
    },
  })
);


// ======================================================
// LOGS HTTP
// ======================================================

app.use((req, res, next) => {
  const inicio = Date.now();

  res.on('finish', () => {
    const duracion =
      Date.now() - inicio;

    const log = {
      evento: 'HTTP_REQUEST',
      metodo: req.method,
      endpoint: req.originalUrl,
      statusCode: res.statusCode,
      tiempoRespuestaMs: duracion,
      timestamp:
        new Date().toISOString(),
    };

    console.log(
      JSON.stringify(log)
    );
  });

  next();
});


// ======================================================
// API AUTH
// ======================================================

app.use(
  '/api/auth',
  authRoutes
);


// ======================================================
// API HEALTH - PÚBLICA
// ======================================================

app.get(
  '/api/health',
  (req, res) => {
    res.status(200).json({
      status: 'OK',
      servicio:
        'DevOps Tasks API',
      timestamp:
        new Date().toISOString(),
    });
  }
);


// ======================================================
// API TASKS - PROTEGIDA
// ======================================================

app.use(
  '/api/tasks',
  requireAuth,
  tasksRoutes
);


// ======================================================
// ARCHIVOS ESTÁTICOS
// ======================================================

app.use(
  '/css',
  express.static(
    path.join(
      __dirname,
      'frontend',
      'css'
    )
  )
);

app.use(
  '/js',
  express.static(
    path.join(
      __dirname,
      'frontend',
      'js'
    )
  )
);


// ======================================================
// LOGIN
// ======================================================

app.get(
  '/login',
  (req, res) => {
    if (req.session.user) {
      return res.redirect('/');
    }

    res.sendFile(
      path.join(
        __dirname,
        'frontend',
        'login.html'
      )
    );
  }
);


// ======================================================
// APLICACIÓN PRINCIPAL
// ======================================================

app.get(
  '/',
  (req, res) => {
    if (!req.session.user) {
      return res.redirect(
        '/login'
      );
    }

    res.sendFile(
      path.join(
        __dirname,
        'frontend',
        'index.html'
      )
    );
  }
);


// ======================================================
// 404 API
// ======================================================

app.use(
  '/api',
  (req, res) => {
    res.status(404).json({
      error:
        'Endpoint no encontrado',
    });
  }
);


// ======================================================
// CUALQUIER OTRA RUTA
// ======================================================

app.use(
  (req, res) => {
    if (!req.session.user) {
      return res.redirect(
        '/login'
      );
    }

    res.redirect('/');
  }
);


// ======================================================
// INICIAR SERVIDOR
// ======================================================

if (require.main === module) {
  app.listen(
    PORT,
    '0.0.0.0',
    () => {
      console.log(
        JSON.stringify({
          evento:
            'SERVER_STARTED',

          puerto:
            PORT,

          estado:
            'OK',

          timestamp:
            new Date().toISOString(),
        })
      );

      console.log(
        `Aplicación disponible en http://localhost:${PORT}`
      );
    }
  );
}


// ======================================================
// EXPORTAR PARA JEST
// ======================================================

module.exports = app;