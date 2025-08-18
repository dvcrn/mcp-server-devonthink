#!/usr/bin/env node

// Test script to verify JXA escaping in template literals

const testCases = [
  {
    name: "Regex with \\d",
    template: `/^\\d+\\./`,
    expected: `/^\\d+\\./`
  },
  {
    name: "Regex with \\*",
    template: `/^\\*\\*/`,
    expected: `/^\\*\\*/`
  },
  {
    name: "String split with newline",
    template: `split("\\n")`,
    expected: `split("\\n")`
  },
  {
    name: "String split with \\\\n",
    template: `split("\\\\n")`,
    expected: `split("\\n")`  // In JXA output
  }
];

console.log("Testing JXA escaping patterns:\n");

testCases.forEach(test => {
  const script = `
    const regex = ${test.template};
    const result = String(regex);
  `;
  
  console.log(`Test: ${test.name}`);
  console.log(`  Template literal: ${test.template}`);
  console.log(`  In script: ${script}`);
  console.log("");
});

// Test what actually gets generated
const generateJXAScript = () => {
  const script = `
    (() => {
      // Test regex patterns
      const regex1 = /^\\d+\\./;
      const regex2 = /^\\*\\*/;
      const regex3 = /^\\d+\\.|^\\*\\*|\\*\\*$/;
      
      // Test string operations  
      const lines = "line1\\nline2".split("\\n");
      
      return JSON.stringify({
        regex1: String(regex1),
        regex2: String(regex2),
        regex3: String(regex3),
        linesCount: lines.length
      });
    })();
  `;
  
  return script;
};

console.log("\nGenerated JXA script:");
console.log(generateJXAScript());

// Now test with proper escaping for template literals
const generateProperJXA = () => {
  // When generating JXA inside template literals, we need to escape backslashes
  const regexPattern = `/^\\\\d+\\\\.|^\\\\*\\\\*|\\\\*\\\\*$/`;
  const splitPattern = `"\\\\n"`;
  
  const script = `
    (() => {
      const regex = ${regexPattern};
      const lines = "test\\\\nline".split(${splitPattern});
      
      return JSON.stringify({
        regex: String(regex),
        linesCount: lines.length
      });
    })();
  `;
  
  return script;
};

console.log("\n\nProperly escaped JXA script:");
console.log(generateProperJXA());