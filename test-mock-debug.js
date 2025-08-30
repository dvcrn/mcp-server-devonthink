const { vi } = require('vitest');
const child_process = require('child_process');
const fs = require('fs/promises');

// Create a minimal test to understand the mocking
async function testMock() {
  const mockExec = vi.spyOn(child_process, 'exec');
  
  mockExec.mockImplementation((cmd, callback) => {
    console.log('Mock exec called with:', cmd);
    console.log('Callback type:', typeof callback);
    
    if (typeof callback === 'function') {
      // Call callback asynchronously
      setImmediate(() => {
        callback(new Error('Application not running'), '', '');
      });
    }
    
    return { 
      on: vi.fn(),
      kill: vi.fn()
    };
  });
  
  // Try to use exec
  child_process.exec('test command', (err, stdout, stderr) => {
    console.log('Callback received:', err?.message);
  });
}

testMock();
