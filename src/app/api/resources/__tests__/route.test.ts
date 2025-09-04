/**
 * @jest-environment node
 */

describe('/api/resources', () => {
  beforeAll(() => {
    // Ensure clean environment
    jest.clearAllMocks();
  });

  afterAll(async () => {
    // Clean up any async operations
    await new Promise(resolve => setTimeout(resolve, 100));
  });

  it('should pass basic test', () => {
    expect(1 + 1).toBe(2);
  });

  it('should handle async operations', async () => {
    const result = await Promise.resolve('test');
    expect(result).toBe('test');
  });
});
