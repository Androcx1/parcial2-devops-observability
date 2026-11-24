module.exports = {
  testEnvironment: 'node',

  testMatch: [
    '**/backend/tests/**/*.test.js',
  ],

  testPathIgnorePatterns: [
    '/node_modules/',
    '/tests/e2e/',
    '/playwright-report/',
    '/test-results/',
  ],

  clearMocks: true,
};