const assert = require('assert');

console.log('Starting Node.js native tests...');

// Test 1: Basic arithmetic
try {
  assert.strictEqual(1 + 1, 2);
  console.log('✅ Test 1 passed: Basic arithmetic');
} catch (error) {
  console.log('❌ Test 1 failed:', error.message);
}

// Test 2: String operations
try {
  assert.strictEqual('hello' + ' world', 'hello world');
  console.log('✅ Test 2 passed: String concatenation');
} catch (error) {
  console.log('❌ Test 2 failed:', error.message);
}

// Test 3: Array operations
try {
  const arr = [1, 2, 3];
  assert.strictEqual(arr.length, 3);
  assert.strictEqual(arr[0], 1);
  console.log('✅ Test 3 passed: Array operations');
} catch (error) {
  console.log('❌ Test 3 failed:', error.message);
}

// Test 4: Async operations
async function testAsync() {
  try {
    const result = await Promise.resolve('async test');
    assert.strictEqual(result, 'async test');
    console.log('✅ Test 4 passed: Async operations');
  } catch (error) {
    console.log('❌ Test 4 failed:', error.message);
  }
}

// Run async test
testAsync().then(() => {
  console.log('\n🎉 All tests completed successfully!');
  console.log('Node.js testing environment is working properly.');
}).catch((error) => {
  console.error('❌ Async test failed:', error);
});
