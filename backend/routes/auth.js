const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db/database');

const router = express.Router();


// ======================================================
// LOGIN
// ======================================================

router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      error: 'Usuario y contraseña son obligatorios',
    });
  }

  db.get(
    `
    SELECT *
    FROM users
    WHERE username = ?
    `,
    [username.trim()],
    async (error, user) => {
      if (error) {
        return res.status(500).json({
          error: 'Error al consultar usuario',
        });
      }

      if (!user) {
        console.log(
          JSON.stringify({
            evento: 'LOGIN_FAILED',
            username,
            motivo: 'Usuario inexistente',
            timestamp: new Date().toISOString(),
          })
        );

        return res.status(401).json({
          error: 'Credenciales inválidas',
        });
      }

      const passwordCorrect =
        await bcrypt.compare(
          password,
          user.password
        );

      if (!passwordCorrect) {
        console.log(
          JSON.stringify({
            evento: 'LOGIN_FAILED',
            username,
            motivo: 'Contraseña incorrecta',
            timestamp: new Date().toISOString(),
          })
        );

        return res.status(401).json({
          error: 'Credenciales inválidas',
        });
      }

      req.session.user = {
        id: user.id,
        username: user.username,
        role: user.role,
      };

      req.session.save((sessionError) => {
        if (sessionError) {
          return res.status(500).json({
            error: 'No se pudo crear la sesión',
          });
        }

        console.log(
          JSON.stringify({
            evento: 'LOGIN_SUCCESS',
            username: user.username,
            role: user.role,
            timestamp: new Date().toISOString(),
          })
        );

        return res.status(200).json({
          mensaje: 'Inicio de sesión correcto',

          user: {
            id: user.id,
            username: user.username,
            role: user.role,
          },
        });
      });
    }
  );
});


// ======================================================
// CONSULTAR SESIÓN
// ======================================================

router.get('/session', (req, res) => {
  if (!req.session.user) {
    return res.status(200).json({
      authenticated: false,
    });
  }

  res.status(200).json({
    authenticated: true,
    user: req.session.user,
  });
});


// ======================================================
// LOGOUT
// ======================================================

router.post('/logout', (req, res) => {
  const username =
    req.session.user?.username || 'desconocido';

  req.session.destroy((error) => {
    if (error) {
      return res.status(500).json({
        error: 'No se pudo cerrar la sesión',
      });
    }

    console.log(
      JSON.stringify({
        evento: 'LOGOUT',
        username,
        timestamp: new Date().toISOString(),
      })
    );

    res.clearCookie('devops.sid');

    res.status(200).json({
      mensaje: 'Sesión cerrada correctamente',
    });
  });
});


// ======================================================
// MIDDLEWARE PARA PROTEGER RUTAS
// ======================================================

function requireAuth(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({
      error: 'No autorizado',
    });
  }

  next();
}


module.exports = {
  router,
  requireAuth,
};