// Test what actual error messages look like
import { exec } from 'child_process';
import { writeFile, unlink } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';

const testScript = `
  (() => {
    // This has a syntax error
    const app = Application("DEVONthink");
    return JSON.stringify({ success: true );
  })();
`;

const tempFile = join(tmpdir(), 'test.js');
await writeFile(tempFile, testScript, 'utf8');

exec(`osascript -l JavaScript "${tempFile}"`, (error, stdout, stderr) => {
  console.log('Error:', error?.message);
  console.log('Stderr:', stderr);
  console.log('Stdout:', stdout);
  unlink(tempFile);
});
