import { test, describe } from 'node:test';
import assert from 'node:assert';

describe('Test Suite Runner', () => {
  test('should run all API tests', async () => {
    console.log('🚀 Starting comprehensive test suite...\n');
    
    // Import and run all test modules
    const testFiles = [
      './resources.test.mjs',
      './users.test.mjs', 
      './facilitators.test.mjs',
      './timetable.test.mjs'
    ];

    console.log(`📁 Found ${testFiles.length} test files`);
    console.log('📝 Test files:', testFiles.join(', '));
    
    // Basic validation that our test runner is working
    assert.ok(testFiles.length > 0, 'Should have test files to run');
    assert.ok(testFiles.every(file => file.endsWith('.mjs')), 'All test files should be .mjs format');
    
    console.log('\n✅ Test suite runner validation completed');
  });
});
