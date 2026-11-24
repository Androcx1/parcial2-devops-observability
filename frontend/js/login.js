const loginForm =
  document.getElementById(
    'login-form'
  );

const usernameInput =
  document.getElementById(
    'username'
  );

const passwordInput =
  document.getElementById(
    'password'
  );

const message =
  document.getElementById(
    'login-message'
  );


loginForm.addEventListener(
  'submit',

  async (event) => {

    event.preventDefault();

    message.textContent = '';

    const username =
      usernameInput.value.trim();

    const password =
      passwordInput.value;


    // ==================================================
    // VALIDACIONES
    // ==================================================

    if (!username) {
      message.textContent =
        'Ingresa tu usuario.';

      usernameInput.focus();

      return;
    }


    if (!password) {
      message.textContent =
        'Ingresa tu contraseña.';

      passwordInput.focus();

      return;
    }


    try {

      const response =
        await fetch(
          '/api/auth/login',
          {
            method: 'POST',

            headers: {
              'Content-Type':
                'application/json',
            },

            body:
              JSON.stringify({
                username,
                password,
              }),
          }
        );


      const data =
        await response.json();


      if (!response.ok) {
        message.textContent =
          data.error ||
          'Error al iniciar sesión';

        return;
      }


      // Login correcto
      window.location.href = '/';


    } catch (error) {

      message.textContent =
        'No se pudo conectar con el servidor.';

    }

  }
);