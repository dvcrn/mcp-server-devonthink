// See what happens when exec fails
import { exec } from 'child_process';

console.log('Starting exec...');
try {
  const proc = exec('osascript -l JavaScript "/tmp/nonexistent.js"', (error, stdout, stderr) => {
    console.log('Callback called');
    console.log('Error:', error?.message);
    console.log('Stderr:', stderr);
  });
  
  proc.on('exit', () => {
    console.log('Process exited');
  });
  
  console.log('Exec returned');
} catch (e) {
  console.log('Caught sync error:', e.message);
}
