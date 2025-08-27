const nextJest = require('next/jest')({ dir: './' });

const createJestConfig = nextJest({
  testEnvironment: 'jsdom',
});

module.exports = createJestConfig;


