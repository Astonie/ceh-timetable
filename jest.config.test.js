/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testPathIgnorePatterns: ['/node_modules/', '/.next/'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: {
        jsx: 'react-jsx',
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
      },
    }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{ts,tsx,js}',
    '<rootDir>/src/**/*.{test,spec}.{ts,tsx,js}'
  ],
  clearMocks: true,
  restoreMocks: true,
  testTimeout: 10000,
  // Force exit after tests complete
  forceExit: true,
  // Detect open handles to identify what's keeping Jest alive
  detectOpenHandles: true,
  // Mock all external modules by default
  automock: false,
  // Set environment variables for testing
  setupFiles: ['<rootDir>/jest.test-env.js'],
};
