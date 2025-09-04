/** @type {import('jest').Config} */
module.exports = {
  displayName: 'API Tests',
  testEnvironment: 'node',
  roots: ['<rootDir>/src/app/api'],
  testMatch: ['<rootDir>/src/app/api/**/*.test.{ts,js}'],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: {
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
      },
    }],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  clearMocks: true,
  restoreMocks: true,
};
