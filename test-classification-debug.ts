import { executeJxa, JxaExecutionError } from './dist/applescript/execute.js';

async function testClassification() {
  const badScript = `
    (() => {
      // This has a syntax error - missing closing brace
      const app = Application("DEVONthink");
      return JSON.stringify({ success: true );
    })();
  `;

  try {
    await executeJxa(badScript, { retries: 0 });
    console.log('No error thrown - unexpected!');
  } catch (error) {
    console.log('Caught error:', error);
    if (error instanceof JxaExecutionError) {
      console.log('Error type:', error.errorType);
      console.log('Error message:', error.message);
      console.log('Error details:', error.details);
    }
  }
}

testClassification().catch(console.error);