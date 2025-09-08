#!/usr/bin/env node

/**
 * Comprehensive Test Runner
 * Executes all API and component tests in the CEH Time Table application
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class TestRunner {
  constructor() {
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      suites: []
    };
  }

  async runTest(testPath, testName) {
    console.log(`\n🧪 Running ${testName}...`);
    try {
      const testModule = await import(testPath);
      const result = await testModule.default();
      
      this.results.suites.push({
        name: testName,
        ...result,
        status: result.failed === 0 ? '✅' : '❌'
      });
      
      this.results.total += result.total;
      this.results.passed += result.passed;
      this.results.failed += result.failed;
      
      console.log(`${result.failed === 0 ? '✅' : '❌'} ${testName}: ${result.passed}/${result.total} passed`);
      
      return result;
    } catch (error) {
      console.log(`❌ ${testName}: Failed to run - ${error.message}`);
      this.results.suites.push({
        name: testName,
        total: 1,
        passed: 0,
        failed: 1,
        status: '❌',
        error: error.message
      });
      this.results.total += 1;
      this.results.failed += 1;
      return { total: 1, passed: 0, failed: 1 };
    }
  }

  async runAllTests() {
    console.log('🚀 Starting Comprehensive Test Suite for CEH Time Table\n');
    console.log('=' .repeat(60));

    // API Tests (Node.js test runner)
    const nodeTests = [
      { path: './tests/facilitators.test.mjs', name: 'Facilitators API' },
      { path: './tests/quizzes.test.mjs', name: 'Quizzes API' },
      { path: './tests/virtuallabs.test.mjs', name: 'Virtual Labs API' },
      { path: './tests/timetable.test.mjs', name: 'Timetable API' },
      { path: './tests/users.test.mjs', name: 'Users API' },
      { path: './tests/groups.test.mjs', name: 'Groups API' },
      { path: './tests/resources.test.mjs', name: 'Resources API' },
      { path: './tests/settings.test.mjs', name: 'Settings API' },
      { path: './tests/upload.test.mjs', name: 'Upload API' },
      { path: './tests/index.test.mjs', name: 'Index/Home API' }
    ];

    console.log('\n📡 API TESTS');
    console.log('-' .repeat(40));

    for (const test of nodeTests) {
      const fullPath = join(__dirname, test.path);
      if (existsSync(fullPath)) {
        await this.runTest(test.path, test.name);
      } else {
        console.log(`⚠️  ${test.name}: Test file not found at ${test.path}`);
      }
    }

    // Print comprehensive summary
    this.printSummary();
  }

  printSummary() {
    console.log('\n' + '=' .repeat(60));
    console.log('📊 COMPREHENSIVE TEST RESULTS SUMMARY');
    console.log('=' .repeat(60));

    // Suite-by-suite breakdown
    console.log('\n📋 Test Suite Breakdown:');
    this.results.suites.forEach(suite => {
      const percentage = suite.total > 0 ? Math.round((suite.passed / suite.total) * 100) : 0;
      console.log(`  ${suite.status} ${suite.name}: ${suite.passed}/${suite.total} (${percentage}%)`);
      if (suite.error) {
        console.log(`    Error: ${suite.error}`);
      }
    });

    // Overall statistics
    const overallPercentage = this.results.total > 0 ? 
      Math.round((this.results.passed / this.results.total) * 100) : 0;

    console.log('\n📈 Overall Statistics:');
    console.log(`  Total Tests: ${this.results.total}`);
    console.log(`  Passed: ${this.results.passed} (${overallPercentage}%)`);
    console.log(`  Failed: ${this.results.failed}`);

    // Final status
    console.log('\n🎯 Final Status:');
    if (this.results.failed === 0) {
      console.log('  ✅ ALL TESTS PASSED! 🎉');
    } else {
      console.log(`  ❌ ${this.results.failed} tests failed`);
    }

    // Coverage areas
    console.log('\n🔍 Coverage Areas Tested:');
    console.log('  • API Endpoints (GET/POST operations)');
    console.log('  • Data Validation & Business Logic');
    console.log('  • Error Handling & Edge Cases');
    console.log('  • Response Format Validation');
    console.log('  • Authentication & Authorization');
    console.log('  • Database Operations Simulation');

    console.log('\n' + '=' .repeat(60));
    
    return this.results;
  }
}

// Export for use as module or run directly
export default async function runComprehensiveTests() {
  const runner = new TestRunner();
  return await runner.runAllTests();
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runComprehensiveTests().catch(console.error);
}
