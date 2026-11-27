const { test, expect } = require('@playwright/test');

test('FALLO CONTROLADO - debe bloquear el despliegue', async () => {
  expect(true).toBe(false);
});