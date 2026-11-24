const {
  test,
  expect,
} = require('@playwright/test');


// ============================================================
// CREDENCIALES
// ============================================================

const USERNAME = 'admin';
const PASSWORD = 'Admin123!';


// ============================================================
// LOGIN
// ============================================================

async function iniciarSesion(page) {

  await page.goto('/login');


  await page
    .locator('#username')
    .fill(USERNAME);


  await page
    .locator('#password')
    .fill(PASSWORD);


  await page
    .getByRole(
      'button',
      {
        name: 'Iniciar sesión',
      }
    )
    .click();


  await expect(
    page
  ).toHaveURL(
    /\/$/
  );


  await expect(
    page.getByRole(
      'heading',
      {
        name: 'DevOps Tasks',
      }
    )
  ).toBeVisible();

}


// ============================================================
// LIMPIAR TAREAS
// ============================================================
//
// page.request comparte las cookies de la sesión del navegador.
// Por eso primero debemos iniciar sesión.
//
// ============================================================

async function limpiarTareas(page) {

  const response =
    await page.request.get(
      '/api/tasks'
    );


  expect(
    response.status()
  ).toBe(200);


  const tasks =
    await response.json();


  for (
    const task of tasks
  ) {

    const deleteResponse =
      await page.request.delete(
        `/api/tasks/${task.id}`
      );


    expect(
      deleteResponse.status()
    ).toBe(200);

  }

}


// ============================================================
// PRUEBAS DE AUTENTICACIÓN
// ============================================================

test.describe(
  'DEVOPS TASKS - LOGIN',

  () => {


    // ========================================================
    // 01
    // ========================================================

    test(
      'Ruta principal sin sesión debe redirigir al Login',

      async ({ page }) => {

        await page.goto('/');


        await expect(
          page
        ).toHaveURL(
          /\/login/
        );


        await expect(
          page.getByRole(
            'heading',
            {
              name:
                'Iniciar sesión',
            }
          )
        ).toBeVisible();

      }
    );


    // ========================================================
    // 02
    // ========================================================

    test(
      'Pantalla de Login debe cargar correctamente',

      async ({ page }) => {

        await page.goto(
          '/login'
        );


        await expect(
          page
        ).toHaveTitle(
          'Login | DevOps Tasks'
        );


        await expect(
          page.locator(
            '#username'
          )
        ).toBeVisible();


        await expect(
          page.locator(
            '#password'
          )
        ).toBeVisible();


        await expect(
          page.getByRole(
            'button',
            {
              name:
                'Iniciar sesión',
            }
          )
        ).toBeVisible();

      }
    );


    // ========================================================
    // 03
    // ========================================================

    test(
      'Login sin usuario debe mostrar validación',

      async ({ page }) => {

        await page.goto(
          '/login'
        );


        await page
          .getByRole(
            'button',
            {
              name:
                'Iniciar sesión',
            }
          )
          .click();


        await expect(
          page.locator(
            '#login-message'
          )
        ).toHaveText(
          'Ingresa tu usuario.'
        );

      }
    );


    // ========================================================
    // 04
    // ========================================================

    test(
      'Login sin contraseña debe mostrar validación',

      async ({ page }) => {

        await page.goto(
          '/login'
        );


        await page
          .locator(
            '#username'
          )
          .fill(
            USERNAME
          );


        await page
          .getByRole(
            'button',
            {
              name:
                'Iniciar sesión',
            }
          )
          .click();


        await expect(
          page.locator(
            '#login-message'
          )
        ).toHaveText(
          'Ingresa tu contraseña.'
        );

      }
    );


    // ========================================================
    // 05
    // ========================================================

    test(
      'Login con contraseña incorrecta debe mostrar error',

      async ({ page }) => {

        await page.goto(
          '/login'
        );


        await page
          .locator(
            '#username'
          )
          .fill(
            USERNAME
          );


        await page
          .locator(
            '#password'
          )
          .fill(
            'PasswordIncorrecto'
          );


        await page
          .getByRole(
            'button',
            {
              name:
                'Iniciar sesión',
            }
          )
          .click();


        await expect(
          page.locator(
            '#login-message'
          )
        ).toHaveText(
          'Credenciales inválidas'
        );

      }
    );


    // ========================================================
    // 06
    // ========================================================

    test(
      'Login correcto debe abrir DevOps Tasks',

      async ({ page }) => {

        await iniciarSesion(
          page
        );


        await expect(
          page.locator(
            '#current-user'
          )
        ).toHaveText(
          'Usuario: admin'
        );

      }
    );

  }
);


// ============================================================
// PRUEBAS DEL SISTEMA AUTENTICADO
// ============================================================

test.describe(
  'DEVOPS TASKS - FRONTEND AUTENTICADO',

  () => {


    // ========================================================
    // PREPARACIÓN DE CADA PRUEBA
    // ========================================================

    test.beforeEach(
      async ({ page }) => {

        await iniciarSesion(
          page
        );


        await limpiarTareas(
          page
        );


        await page.reload();


        await expect(
          page.locator(
            '#task-list'
          )
        ).toBeVisible();

      }
    );


    // ========================================================
    // 07
    // ========================================================

    test(
      'Debe mostrar usuario autenticado y API funcionando',

      async ({ page }) => {

        await expect(
          page.locator(
            '#current-user'
          )
        ).toHaveText(
          'Usuario: admin'
        );


        await expect(
          page.locator(
            '#api-status'
          )
        ).toHaveText(
          'API funcionando'
        );


        await expect(
          page.locator(
            '#api-status'
          )
        ).toHaveClass(
          /ok/
        );

      }
    );


    // ========================================================
    // 08
    // ========================================================

    test(
      'Debe mostrar mensaje cuando no existen tareas',

      async ({ page }) => {

        await expect(
          page.locator(
            '#task-list'
          )
        ).toContainText(
          'No hay tareas registradas.'
        );

      }
    );


    // ========================================================
    // 09
    // ========================================================

    test(
      'No debe permitir agregar una tarea vacía',

      async ({ page }) => {

        await page
          .getByRole(
            'button',
            {
              name: 'Agregar',
            }
          )
          .click();


        await expect(
          page.locator(
            '#message'
          )
        ).toHaveText(
          'Escribe una tarea.'
        );

      }
    );


    // ========================================================
    // 10
    // ========================================================

    test(
      'Debe permitir agregar una tarea',

      async ({ page }) => {

        await page
          .locator(
            '#task-input'
          )
          .fill(
            'Configurar EC2'
          );


        await page
          .getByRole(
            'button',
            {
              name: 'Agregar',
            }
          )
          .click();


        await expect(
          page.locator(
            '#task-list'
          )
        ).toContainText(
          'Configurar EC2'
        );

      }
    );


    // ========================================================
    // 11
    // ========================================================

    test(
      'La tarea debe permanecer después de recargar la página',

      async ({ page }) => {

        await page
          .locator(
            '#task-input'
          )
          .fill(
            'Configurar OpenObserve'
          );


        await page
          .getByRole(
            'button',
            {
              name: 'Agregar',
            }
          )
          .click();


        await expect(
          page.locator(
            '#task-list'
          )
        ).toContainText(
          'Configurar OpenObserve'
        );


        await page.reload();


        await expect(
          page.locator(
            '#task-list'
          )
        ).toContainText(
          'Configurar OpenObserve'
        );

      }
    );


    // ========================================================
    // 12
    // ========================================================

    test(
      'Debe permitir marcar una tarea como completada',

      async ({ page }) => {

        await page
          .locator(
            '#task-input'
          )
          .fill(
            'Ejecutar pruebas'
          );


        await page
          .getByRole(
            'button',
            {
              name: 'Agregar',
            }
          )
          .click();


        const tarea =
          page
            .locator('.task')
            .filter({
              hasText:
                'Ejecutar pruebas',
            });


        const checkbox =
          tarea.locator(
            '.task-checkbox'
          );


        await checkbox.check();


        await expect(
          page
            .locator('.task')
            .filter({
              hasText:
                'Ejecutar pruebas',
            })
        ).toHaveClass(
          /completed/
        );

      }
    );


    // ========================================================
    // 13
    // ========================================================

    test(
      'Debe permitir eliminar una tarea',

      async ({ page }) => {

        await page
          .locator(
            '#task-input'
          )
          .fill(
            'Tarea temporal'
          );


        await page
          .getByRole(
            'button',
            {
              name: 'Agregar',
            }
          )
          .click();


        const tarea =
          page
            .locator('.task')
            .filter({
              hasText:
                'Tarea temporal',
            });


        await expect(
          tarea
        ).toBeVisible();


        await tarea
          .getByRole(
            'button',
            {
              name: 'Eliminar',
            }
          )
          .click();


        await expect(
          page.locator(
            '#task-list'
          )
        ).not.toContainText(
          'Tarea temporal'
        );


        await expect(
          page.locator(
            '#task-list'
          )
        ).toContainText(
          'No hay tareas registradas.'
        );

      }
    );


    // ========================================================
    // 14
    // ========================================================

    test(
      'Debe permitir crear múltiples tareas',

      async ({ page }) => {

        const input =
          page.locator(
            '#task-input'
          );


        await input.fill(
          'Configurar Docker'
        );


        await page
          .getByRole(
            'button',
            {
              name: 'Agregar',
            }
          )
          .click();


        await input.fill(
          'Configurar GitHub Actions'
        );


        await page
          .getByRole(
            'button',
            {
              name: 'Agregar',
            }
          )
          .click();


        await expect(
          page.locator(
            '#task-list'
          )
        ).toContainText(
          'Configurar Docker'
        );


        await expect(
          page.locator(
            '#task-list'
          )
        ).toContainText(
          'Configurar GitHub Actions'
        );


        await expect(
          page.locator(
            '.task'
          )
        ).toHaveCount(2);

      }
    );


    // ========================================================
    // 15
    // ========================================================

    test(
      'Botón Actualizar debe volver a consultar las tareas',

      async ({ page }) => {

        const response =
          await page.request.post(
            '/api/tasks',
            {
              data: {
                title:
                  'Tarea creada por API',
              },
            }
          );


        expect(
          response.status()
        ).toBe(201);


        await page
          .getByRole(
            'button',
            {
              name: 'Actualizar',
            }
          )
          .click();


        await expect(
          page.locator(
            '#task-list'
          )
        ).toContainText(
          'Tarea creada por API'
        );

      }
    );


    // ========================================================
    // 16
    // ========================================================

    test(
      'Cerrar sesión debe regresar al Login',

      async ({ page }) => {

        await page
          .getByRole(
            'button',
            {
              name:
                'Cerrar sesión',
            }
          )
          .click();


        await expect(
          page
        ).toHaveURL(
          /\/login/
        );


        await expect(
          page.getByRole(
            'heading',
            {
              name:
                'Iniciar sesión',
            }
          )
        ).toBeVisible();

      }
    );

  }
);