#!/usr/bin/env node

/**
 * Test script for PR2 - Enhanced Error Handling + Tool Migration
 */

import { isRunningTool } from './dist/tools/isRunning.js';
import { createRecordTool } from './dist/tools/createRecord.js';

async function testEnhancements() {
  console.log('Testing PR2 Enhancements...\n');

  // Test 1: isRunning with enhanced error handling
  console.log('Test 1: Check if DEVONthink is running');
  try {
    const result = await isRunningTool.run();
    console.log('Result:', result);
    console.log('✓ Test 1 passed\n');
  } catch (error) {
    console.log('✗ Test 1 failed:', error.message);
    console.log('Error type:', error.errorType || 'Unknown');
    console.log('');
  }

  // Test 2: Create a simple record
  console.log('Test 2: Create a test record');
  try {
    const result = await createRecordTool.run({
      name: 'Test Record from PR2',
      type: 'markdown',
      content: '# Test Content\n\nThis record was created to test PR2 enhancements:\n- JXA Builder integration\n- Enhanced error handling\n- Automatic escaping'
    });
    console.log('Result:', result);
    if (result.success) {
      console.log('✓ Test 2 passed - Record created with UUID:', result.uuid, '\n');
    } else {
      console.log('✗ Test 2 failed:', result.error, '\n');
    }
  } catch (error) {
    console.log('✗ Test 2 failed:', error.message);
    console.log('Error type:', error.errorType || 'Unknown');
    console.log('');
  }

  // Test 3: Create record with special characters
  console.log('Test 3: Create record with special characters');
  try {
    const result = await createRecordTool.run({
      name: 'Test "Quotes" & Special\'s',
      type: 'markdown',
      content: 'Content with "quotes", \'apostrophes\', & ampersands\n\nBackslash: \\\nTab:\t\tIndented'
    });
    console.log('Result:', result);
    if (result.success) {
      console.log('✓ Test 3 passed - Special characters handled correctly\n');
    } else {
      console.log('✗ Test 3 failed:', result.error, '\n');
    }
  } catch (error) {
    console.log('✗ Test 3 failed:', error.message);
    console.log('Error type:', error.errorType || 'Unknown');
    console.log('');
  }

  // Test 4: Test error handling with invalid database
  console.log('Test 4: Error handling with invalid database');
  try {
    const result = await createRecordTool.run({
      name: 'Test Record',
      type: 'markdown',
      content: 'Test content',
      databaseName: 'NonExistentDatabase123'
    });
    if (!result.success) {
      console.log('✓ Test 4 passed - Error handled gracefully:', result.error, '\n');
    } else {
      console.log('✗ Test 4 failed - Should have failed with invalid database\n');
    }
  } catch (error) {
    console.log('✓ Test 4 passed - Error caught:', error.message);
    console.log('Error type:', error.errorType || 'Unknown');
    console.log('');
  }

  console.log('All tests completed!');
}

// Run tests
testEnhancements().catch(console.error);