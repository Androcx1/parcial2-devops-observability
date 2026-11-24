// ======================================================
// ELEMENTOS DEL DOM
// ======================================================

const taskForm =
  document.getElementById(
    'task-form'
  );

const taskInput =
  document.getElementById(
    'task-input'
  );

const taskList =
  document.getElementById(
    'task-list'
  );

const message =
  document.getElementById(
    'message'
  );

const apiStatus =
  document.getElementById(
    'api-status'
  );

const reloadButton =
  document.getElementById(
    'reload-button'
  );

const currentUser =
  document.getElementById(
    'current-user'
  );

const logoutButton =
  document.getElementById(
    'logout-button'
  );


// ======================================================
// MANEJAR SESIÓN EXPIRADA
// ======================================================

function handleUnauthorized(response) {

  if (response.status === 401) {

    window.location.href =
      '/login';

    return true;
  }

  return false;
}


// ======================================================
// CONSULTAR SESIÓN
// ======================================================

async function loadSession() {

  try {

    const response =
      await fetch(
        '/api/auth/session',
        {
          credentials:
            'same-origin',
        }
      );


    if (!response.ok) {

      window.location.href =
        '/login';

      return false;
    }


    const data =
      await response.json();


    if (!data.authenticated) {

      window.location.href =
        '/login';

      return false;
    }


    currentUser.textContent =
      `Usuario: ${data.user.username}`;


    return true;


  } catch (error) {

    console.error(
      'Error al consultar sesión:',
      error
    );


    window.location.href =
      '/login';

    return false;

  }

}


// ======================================================
// ESTADO DE LA API
// ======================================================

async function checkApi() {

  try {

    const response =
      await fetch(
        '/api/health',
        {
          credentials:
            'same-origin',
        }
      );


    if (!response.ok) {

      throw new Error(
        'API no disponible'
      );

    }


    apiStatus.textContent =
      'API funcionando';


    apiStatus.className =
      'status ok';


  } catch (error) {

    apiStatus.textContent =
      'API sin conexión';


    apiStatus.className =
      'status error';

  }

}


// ======================================================
// LISTAR TAREAS
// ======================================================

async function loadTasks() {

  try {

    const response =
      await fetch(
        '/api/tasks',
        {
          credentials:
            'same-origin',
        }
      );


    if (
      handleUnauthorized(
        response
      )
    ) {
      return;
    }


    if (!response.ok) {

      throw new Error(
        'Error al obtener tareas'
      );

    }


    const tasks =
      await response.json();


    taskList.innerHTML = '';


    // ==================================================
    // SIN TAREAS
    // ==================================================

    if (tasks.length === 0) {

      taskList.innerHTML = `
        <p class="empty">
          No hay tareas registradas.
        </p>
      `;

      return;

    }


    // ==================================================
    // MOSTRAR TAREAS
    // ==================================================

    tasks.forEach(
      (task) => {

        const element =
          document.createElement(
            'div'
          );


        element.className =
          task.completed
            ? 'task completed'
            : 'task';


        element.innerHTML = `

          <input
            type="checkbox"
            class="task-checkbox"
            ${task.completed ? 'checked' : ''}
          >

          <span class="task-title">
            ${escapeHtml(task.title)}
          </span>

          <button
            class="delete"
            type="button"
          >
            Eliminar
          </button>

        `;


        // ==============================================
        // CHECKBOX
        // ==============================================

        const checkbox =
          element.querySelector(
            '.task-checkbox'
          );


        checkbox.addEventListener(
          'change',
          () => {

            updateTask(
              task.id,
              checkbox.checked
            );

          }
        );


        // ==============================================
        // ELIMINAR
        // ==============================================

        const deleteButton =
          element.querySelector(
            '.delete'
          );


        deleteButton.addEventListener(
          'click',
          () => {

            deleteTask(
              task.id
            );

          }
        );


        taskList.appendChild(
          element
        );

      }
    );


  } catch (error) {

    console.error(
      'Error al cargar tareas:',
      error
    );


    taskList.innerHTML = `

      <p class="message">
        Error al cargar las tareas.
      </p>

    `;

  }

}


// ======================================================
// CREAR TAREA
// ======================================================

taskForm.addEventListener(
  'submit',

  async (event) => {

    event.preventDefault();


    message.textContent = '';


    const title =
      taskInput.value.trim();


    // ==================================================
    // VALIDACIÓN
    // ==================================================

    if (!title) {

      message.textContent =
        'Escribe una tarea.';


      taskInput.focus();


      return;
    }


    try {

      const response =
        await fetch(
          '/api/tasks',
          {
            method:
              'POST',

            headers: {
              'Content-Type':
                'application/json',
            },

            credentials:
              'same-origin',

            body:
              JSON.stringify({
                title,
              }),
          }
        );


      if (
        handleUnauthorized(
          response
        )
      ) {
        return;
      }


      const data =
        await response.json();


      if (!response.ok) {

        message.textContent =
          data.error ||
          'Error al agregar tarea';


        return;
      }


      taskInput.value = '';


      await loadTasks();


  } catch (error) {

      console.error(
        'Error al crear tarea:',
        error
      );


      message.textContent =
        'Error de comunicación con el servidor.';

    }

  }
);


// ======================================================
// ACTUALIZAR TAREA
// ======================================================

async function updateTask(
  id,
  completed
) {

  try {

    const response =
      await fetch(
        `/api/tasks/${id}`,
        {
          method:
            'PUT',

          headers: {
            'Content-Type':
              'application/json',
          },

          credentials:
            'same-origin',

          body:
            JSON.stringify({
              completed,
            }),
        }
      );


    if (
      handleUnauthorized(
        response
      )
    ) {
      return;
    }


    if (!response.ok) {

      const data =
        await response.json();


      message.textContent =
        data.error ||
        'Error al actualizar tarea';


      return;
    }


    await loadTasks();


  } catch (error) {

    console.error(
      'Error al actualizar:',
      error
    );


    message.textContent =
      'Error al actualizar tarea.';

  }

}


// ======================================================
// ELIMINAR TAREA
// ======================================================

async function deleteTask(id) {

  try {

    const response =
      await fetch(
        `/api/tasks/${id}`,
        {
          method:
            'DELETE',

          credentials:
            'same-origin',
        }
      );


    if (
      handleUnauthorized(
        response
      )
    ) {
      return;
    }


    if (!response.ok) {

      const data =
        await response.json();


      message.textContent =
        data.error ||
        'Error al eliminar tarea';


      return;
    }


    await loadTasks();


  } catch (error) {

    console.error(
      'Error al eliminar:',
      error
    );


    message.textContent =
      'Error al eliminar tarea.';

  }

}


// ======================================================
// BOTÓN ACTUALIZAR
// ======================================================

reloadButton.addEventListener(
  'click',

  async () => {

    message.textContent = '';

    await loadTasks();

  }
);


// ======================================================
// CERRAR SESIÓN
// ======================================================

logoutButton.addEventListener(
  'click',

  async () => {

    try {

      const response =
        await fetch(
          '/api/auth/logout',
          {
            method:
              'POST',

            credentials:
              'same-origin',
          }
        );


      if (!response.ok) {

        message.textContent =
          'No se pudo cerrar la sesión.';

        return;

      }


      window.location.href =
        '/login';


    } catch (error) {

      console.error(
        'Error al cerrar sesión:',
        error
      );


      message.textContent =
        'Error al cerrar la sesión.';

    }

  }
);


// ======================================================
// EVITAR INYECCIÓN DE HTML
// ======================================================

function escapeHtml(text) {

  const div =
    document.createElement(
      'div'
    );


  div.textContent =
    text;


  return div.innerHTML;

}


// ======================================================
// INICIALIZACIÓN
// ======================================================

async function init() {

  // Primero verificar autenticación
  const authenticated =
    await loadSession();


  if (!authenticated) {

    return;

  }


  // Después comprobar API
  await checkApi();


  // Finalmente cargar tareas
  await loadTasks();

}


// ======================================================
// INICIO
// ======================================================

init();