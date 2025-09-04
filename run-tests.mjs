import { execSync } from 'child_process';
import { readdir } from 'fs/promises';

async function runTestSuite() {
  console.log('🧪 CEH Time Table - Comprehensive Test Suite');
  console.log('=' * 50);
  console.log('📅 Date:', new Date().toISOString());
  console.log('🛠️  Testing Framework: Node.js Built-in Test Runner');
  console.log();

  try {
    // Get list of test files
    const testFiles = await readdir('./tests');
    const testCount = testFiles.filter(file => file.endsWith('.test.mjs')).length;
    
    console.log(`📂 Found ${testCount} test files:`);
    testFiles.forEach(file => {
      if (file.endsWith('.test.mjs')) {
        console.log(`   ✓ ${file}`);
      }
    });
    console.log();

    // Run tests
    console.log('🚀 Running all tests...');
    console.log();
    
    const result = execSync('node --test tests/*.test.mjs', { 
      encoding: 'utf8',
      cwd: process.cwd()
    });
    
    console.log(result);
    console.log();
    console.log('✅ All tests completed successfully!');
    console.log('🎉 Test suite passed - Ready for deployment!');
    
  } catch (error) {
    console.error('❌ Test suite failed:');
    console.error(error.stdout || error.message);
    process.exit(1);
  }
}

// Run the test suite
runTestSuite().catch(console.error);
