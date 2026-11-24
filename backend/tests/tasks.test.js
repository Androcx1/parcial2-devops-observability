const request = require('supertest');
const app = require('../../server');
const db = require('../db/database');

describe('DEVOPS TASKS API - BACKEND TESTS', () => {

  let agent;

  // ====================================================
  // LOGIN ANTES DE CADA PRUEBA PROTEGIDA
  // ====================================================

  async function loginAdmin() {

    agent = request.agent(app);

    const response =
      await agent
        .post('/api/auth/login')
        .send({
          username: 'admin',
          password: 'Admin123!',
        });

    expect(
      response.statusCode
    ).toBe(200);

    return agent;
  }


  // ====================================================
  // LIMPIAR TAREAS
  // ====================================================

  beforeEach((done) => {

    db.run(
      'DELETE FROM tasks',
      done
    );

  });


  // ====================================================
  // HEALTH
  // ====================================================

  test(
    'GET /api/health debe responder 200',

    async () => {

      const response =
        await request(app)
          .get('/api/health');


      expect(
        response.statusCode
      ).toBe(200);


      expect(
        response.body.status
      ).toBe('OK');

    }
  );


  // ====================================================
  // AUTH - LOGIN
  // ====================================================

  test(
    'Login correcto debe responder 200',

    async () => {

      const response =
        await request(app)
          .post('/api/auth/login')
          .send({
            username: 'admin',
            password: 'Admin123!',
          });


      expect(
        response.statusCode
      ).toBe(200);


      expect(
        response.body.user.username
      ).toBe('admin');

    }
  );


  test(
    'Login con contraseña incorrecta debe responder 401',

    async () => {

      const response =
        await request(app)
          .post('/api/auth/login')
          .send({
            username: 'admin',
            password: 'incorrecta',
          });


      expect(
        response.statusCode
      ).toBe(401);


      expect(
        response.body.error
      ).toBe(
        'Credenciales inválidas'
      );

    }
  );


  test(
    'Login con usuario inexistente debe responder 401',

    async () => {

      const response =
        await request(app)
          .post('/api/auth/login')
          .send({
            username: 'usuario999',
            password: 'Admin123!',
          });


      expect(
        response.statusCode
      ).toBe(401);

    }
  );


  test(
    'Login vacío debe responder 400',

    async () => {

      const response =
        await request(app)
          .post('/api/auth/login')
          .send({});


      expect(
        response.statusCode
      ).toBe(400);

    }
  );


  // ====================================================
  // SESSION
  // ====================================================

  test(
    'Sesión autenticada debe regresar usuario admin',

    async () => {

      const loggedAgent =
        await loginAdmin();


      const response =
        await loggedAgent
          .get('/api/auth/session');


      expect(
        response.statusCode
      ).toBe(200);


      expect(
        response.body.authenticated
      ).toBe(true);


      expect(
        response.body.user.username
      ).toBe('admin');

    }
  );


  test(
    'Sin login la sesión debe indicar authenticated false',

    async () => {

      const response =
        await request(app)
          .get('/api/auth/session');


      expect(
        response.statusCode
      ).toBe(200);


      expect(
        response.body.authenticated
      ).toBe(false);

    }
  );


  // ====================================================
  // PROTECCIÓN
  // ====================================================

  test(
    'GET /api/tasks sin sesión debe responder 401',

    async () => {

      const response =
        await request(app)
          .get('/api/tasks');


      expect(
        response.statusCode
      ).toBe(401);


      expect(
        response.body.error
      ).toBe(
        'No autorizado'
      );

    }
  );


  // ====================================================
  // GET TASKS
  // ====================================================

  test(
    'GET /api/tasks autenticado debe regresar arreglo vacío',

    async () => {

      const loggedAgent =
        await loginAdmin();


      const response =
        await loggedAgent
          .get('/api/tasks');


      expect(
        response.statusCode
      ).toBe(200);


      expect(
        Array.isArray(
          response.body
        )
      ).toBe(true);


      expect(
        response.body.length
      ).toBe(0);

    }
  );


  // ====================================================
  // POST
  // ====================================================

  test(
    'POST /api/tasks autenticado debe crear tarea',

    async () => {

      const loggedAgent =
        await loginAdmin();


      const response =
        await loggedAgent
          .post('/api/tasks')
          .send({
            title:
              'Configurar EC2',
          });


      expect(
        response.statusCode
      ).toBe(201);


      expect(
        response.body.title
      ).toBe(
        'Configurar EC2'
      );


      expect(
        response.body.completed
      ).toBe(false);

    }
  );


  test(
    'POST sin título debe responder 400',

    async () => {

      const loggedAgent =
        await loginAdmin();


      const response =
        await loggedAgent
          .post('/api/tasks')
          .send({});


      expect(
        response.statusCode
      ).toBe(400);

    }
  );


  test(
    'POST con título vacío debe responder 400',

    async () => {

      const loggedAgent =
        await loginAdmin();


      const response =
        await loggedAgent
          .post('/api/tasks')
          .send({
            title: '   ',
          });


      expect(
        response.statusCode
      ).toBe(400);

    }
  );


  test(
    'POST con más de 100 caracteres debe responder 400',

    async () => {

      const loggedAgent =
        await loginAdmin();


      const response =
        await loggedAgent
          .post('/api/tasks')
          .send({
            title:
              'A'.repeat(101),
          });


      expect(
        response.statusCode
      ).toBe(400);

    }
  );


  // ====================================================
  // PUT
  // ====================================================

  test(
    'PUT debe completar una tarea',

    async () => {

      const loggedAgent =
        await loginAdmin();


      const created =
        await loggedAgent
          .post('/api/tasks')
          .send({
            title:
              'Configurar OpenObserve',
          });


      const id =
        created.body.id;


      const response =
        await loggedAgent
          .put(
            `/api/tasks/${id}`
          )
          .send({
            completed: true,
          });


      expect(
        response.statusCode
      ).toBe(200);


      expect(
        response.body.completed
      ).toBe(true);

    }
  );


  test(
    'PUT con ID inexistente debe responder 404',

    async () => {

      const loggedAgent =
        await loginAdmin();


      const response =
        await loggedAgent
          .put(
            '/api/tasks/99999'
          )
          .send({
            completed: true,
          });


      expect(
        response.statusCode
      ).toBe(404);

    }
  );


  test(
    'PUT con ID inválido debe responder 400',

    async () => {

      const loggedAgent =
        await loginAdmin();


      const response =
        await loggedAgent
          .put(
            '/api/tasks/abc'
          )
          .send({
            completed: true,
          });


      expect(
        response.statusCode
      ).toBe(400);

    }
  );


  // ====================================================
  // DELETE
  // ====================================================

  test(
    'DELETE debe eliminar una tarea',

    async () => {

      const loggedAgent =
        await loginAdmin();


      const created =
        await loggedAgent
          .post('/api/tasks')
          .send({
            title:
              'Eliminar prueba',
          });


      const id =
        created.body.id;


      const response =
        await loggedAgent
          .delete(
            `/api/tasks/${id}`
          );


      expect(
        response.statusCode
      ).toBe(200);

    }
  );


  test(
    'DELETE con ID inexistente debe responder 404',

    async () => {

      const loggedAgent =
        await loginAdmin();


      const response =
        await loggedAgent
          .delete(
            '/api/tasks/99999'
          );


      expect(
        response.statusCode
      ).toBe(404);

    }
  );


  // ====================================================
  // LOGOUT
  // ====================================================

  test(
    'Logout debe destruir la sesión',

    async () => {

      const loggedAgent =
        await loginAdmin();


      const logout =
        await loggedAgent
          .post(
            '/api/auth/logout'
          );


      expect(
        logout.statusCode
      ).toBe(200);


      const tasks =
        await loggedAgent
          .get('/api/tasks');


      expect(
        tasks.statusCode
      ).toBe(401);

    }
  );


  // ====================================================
  // 404
  // ====================================================

  test(
    'Endpoint inexistente debe responder 404',

    async () => {

      const response =
        await request(app)
          .get(
            '/api/no-existe'
          );


      expect(
        response.statusCode
      ).toBe(404);

    }
  );


  // ====================================================
  // CERRAR BD
  // ====================================================

  afterAll((done) => {

    db.close(done);

  });

});