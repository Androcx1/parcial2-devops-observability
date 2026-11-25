const OPENOBSERVE_URL =
  process.env.OPENOBSERVE_URL ||
  'http://openobserve:5080';

const OPENOBSERVE_ORG =
  process.env.OPENOBSERVE_ORG ||
  'default';

const OPENOBSERVE_STREAM =
  process.env.OPENOBSERVE_STREAM ||
  'devops_tasks';

const OPENOBSERVE_USER =
  process.env.OPENOBSERVE_USER ||
  'admin@devops.local';

const OPENOBSERVE_PASSWORD =
  process.env.OPENOBSERVE_PASSWORD ||
  'OpenObserve2026!';


async function enviarLogOpenObserve(log) {

  // ==================================================
  // NO ENVIAR LOGS DURANTE PRUEBAS JEST
  // ==================================================

  if (
    process.env.NODE_ENV === 'test'
  ) {
    return;
  }


  try {

    const credentials =
      Buffer.from(
        `${OPENOBSERVE_USER}:${OPENOBSERVE_PASSWORD}`
      ).toString('base64');


    // Evita conexiones colgadas
    const controller =
      new AbortController();

    const timeout =
      setTimeout(
        () => controller.abort(),
        2000
      );


    try {

      const response =
        await fetch(
          `${OPENOBSERVE_URL}/api/${OPENOBSERVE_ORG}/${OPENOBSERVE_STREAM}/_json`,
          {
            method: 'POST',

            headers: {
              'Content-Type':
                'application/json',

              Authorization:
                `Basic ${credentials}`,
            },

            body:
              JSON.stringify([
                {
                  ...log,

                  servicio:
                    'DevOps Tasks API',

                  ambiente:
                    process.env.NODE_ENV ||
                    'production',
                },
              ]),

            signal:
              controller.signal,
          }
        );


      if (!response.ok) {

        console.error(
          'OPENOBSERVE_ERROR',
          response.status
        );

      }

    } finally {

      clearTimeout(
        timeout
      );

    }

  } catch (error) {

    // OpenObserve nunca debe tumbar la API
    console.error(
      'OPENOBSERVE_CONNECTION_ERROR',
      error.message
    );

  }
}


module.exports = {
  enviarLogOpenObserve,
};