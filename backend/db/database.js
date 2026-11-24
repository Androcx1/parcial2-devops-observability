const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, 'tasks.db');

const db = new sqlite3.Database(
  dbPath,
  (error) => {
    if (error) {
      console.error(
        JSON.stringify({
          evento: 'DATABASE_CONNECTION_ERROR',
          mensaje: error.message,
          timestamp: new Date().toISOString(),
        })
      );
    } else {
      console.log(
        JSON.stringify({
          evento: 'DATABASE_CONNECTED',
          archivo: dbPath,
          estado: 'OK',
          timestamp: new Date().toISOString(),
        })
      );
    }
  }
);


// ======================================================
// CREAR TABLAS
// ======================================================

db.serialize(() => {

  // ====================================================
  // TABLA DE TAREAS
  // ====================================================

  db.run(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      completed INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    )
  `);


  // ====================================================
  // TABLA DE USUARIOS
  // ====================================================

  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'admin',
      created_at TEXT NOT NULL
    )
  `);


  // ====================================================
  // CREAR USUARIO ADMINISTRADOR SI NO EXISTE
  // ====================================================

  const username = 'admin';

  const passwordPlano = 'Admin123!';

  db.get(
    `
    SELECT *
    FROM users
    WHERE username = ?
    `,
    [username],

    async (error, user) => {

      if (error) {
        console.error(
          JSON.stringify({
            evento: 'ADMIN_USER_CHECK_ERROR',
            mensaje: error.message,
            timestamp: new Date().toISOString(),
          })
        );

        return;
      }


      // Ya existe
      if (user) {
        console.log(
          JSON.stringify({
            evento: 'ADMIN_USER_EXISTS',
            username: username,
            estado: 'OK',
            timestamp: new Date().toISOString(),
          })
        );

        return;
      }


      try {

        // Nunca guardamos la contraseña directamente.
        const passwordHash =
          await bcrypt.hash(
            passwordPlano,
            10
          );


        db.run(
          `
          INSERT INTO users (
            username,
            password,
            role,
            created_at
          )
          VALUES (?, ?, ?, ?)
          `,
          [
            username,
            passwordHash,
            'admin',
            new Date().toISOString(),
          ],

          function (insertError) {

            if (insertError) {
              console.error(
                JSON.stringify({
                  evento: 'ADMIN_USER_CREATE_ERROR',
                  mensaje: insertError.message,
                  timestamp: new Date().toISOString(),
                })
              );

              return;
            }


            console.log(
              JSON.stringify({
                evento: 'ADMIN_USER_CREATED',
                id: this.lastID,
                username: username,
                role: 'admin',
                estado: 'OK',
                timestamp: new Date().toISOString(),
              })
            );

          }
        );

      } catch (hashError) {

        console.error(
          JSON.stringify({
            evento: 'PASSWORD_HASH_ERROR',
            mensaje: hashError.message,
            timestamp: new Date().toISOString(),
          })
        );

      }

    }
  );

});


module.exports = db;