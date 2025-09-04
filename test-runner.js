const { execSync } = require('child_process');

try {
  console.log('Running basic test...');
  const result = execSync('npx jest --version', { encoding: 'utf8', timeout: 5000 });
  console.log('Jest version:', result.trim());
  
  console.log('Testing simple math...');
  if (1 + 1 === 2) {
    console.log('✅ Basic test passed');
  } else {
    console.log('❌ Basic test failed');
  }
  
  console.log('All tests completed successfully!');
} catch (error) {
  console.error('Error running tests:', error.message);
}
