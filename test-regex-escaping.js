#!/usr/bin/env node

// Test to understand regex escaping in template literals

console.log("Testing regex patterns in template literals:\n");

// Test 1: Direct regex
const regex1 = /^\d+\./;
console.log("Direct regex:", regex1);
console.log("Direct regex string:", String(regex1));

// Test 2: Template literal generating JS with regex
const generateCode = () => {
  // In the template literal, we need to consider how many times the string is processed
  
  // Single backslash - will be consumed by template literal
  const code1 = `const r = /^\d+\./;`;
  console.log("\nTemplate with single backslash:");
  console.log("Code:", code1);
  
  // Double backslash - template literal produces single backslash
  const code2 = `const r = /^\\d+\\./;`;
  console.log("\nTemplate with double backslash:");
  console.log("Code:", code2);
  
  // Try to execute it
  try {
    eval(code2);
    console.log("Eval successful");
  } catch (e) {
    console.log("Eval failed:", e.message);
  }
};

generateCode();

// Test 3: What we need for JXA
console.log("\n\nFor JXA via osascript:");
console.log("We need the final JXA to contain: /^\\d+\\./");
console.log("So in our template literal we need: /^\\\\d+\\\\./");

// Test actual generation
const generateJXA = () => {
  const regexPattern = `/^\\d+\\.|^\\*\\*.*\\*\\*$/`;
  const script = `
    (() => {
      const regex = ${regexPattern};
      return String(regex);
    })();
  `;
  return script;
};

console.log("\nGenerated JXA script:");
console.log(generateJXA());