// Simple test without any async operations
test('basic addition', () => {
  expect(1 + 1).toBe(2);
});

test('string concatenation', () => {
  expect('hello' + ' world').toBe('hello world');
});

test('array operations', () => {
  const arr = [1, 2, 3];
  expect(arr.length).toBe(3);
  expect(arr[0]).toBe(1);
});
