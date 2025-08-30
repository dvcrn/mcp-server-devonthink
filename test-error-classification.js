#!/usr/bin/env node

// Quick test to debug error classification

function classifyError(error, stderr) {
  const errorMessage = typeof error === 'string' ? error : error.message;
  const combinedError = `${errorMessage} ${stderr || ''}`.toLowerCase();

  console.log('Error message:', errorMessage);
  console.log('Combined (lowercase):', combinedError);
  console.log('Includes "not running":', combinedError.includes('not running'));
  console.log('Includes "not found":', combinedError.includes('not found'));
  console.log('Includes "enoent":', combinedError.includes('enoent'));
  
  if (combinedError.includes('not running') || combinedError.includes('not found')) {
    return 'AppNotRunning';
  }
  if (combinedError.includes('enoent') || combinedError.includes('permission')) {
    return 'FileSystemError';
  }
  return 'Unknown';
}

// Test the actual case
const error = new Error('Application not running');
const result = classifyError(error, '');
console.log('\nResult:', result);
console.log('Expected: AppNotRunning');
console.log('Match:', result === 'AppNotRunning');