// eslint-disable-next-line @typescript-eslint/no-require-imports
require('@testing-library/jest-dom');

// Global teardown to ensure all async operations are closed
afterAll(async () => {
  // Close any open database connections
  if (global.prisma) {
    await global.prisma.$disconnect();
  }
  
  // Close any other async operations
  await new Promise(resolve => setTimeout(resolve, 100));
});
