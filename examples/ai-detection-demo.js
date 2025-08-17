#!/usr/bin/env node

/**
 * AI Detection System Demo
 * 
 * This script demonstrates the new smart AI service detection capabilities
 * that automatically discover configured AI engines in DEVONthink.
 * 
 * Run with: node examples/ai-detection-demo.js
 */

import { createServer } from "../dist/devonthink.js";

async function demonstrateAIDetection() {
  console.log("🔍 AI Detection System Demo\n");
  
  try {
    // Create the MCP server
    const { server } = await createServer();
    
    // Get the check_ai_status tool
    const tools = (await server.request({
      method: "tools/list"
    })).tools;
    
    const aiStatusTool = tools.find(tool => tool.name === "check_ai_status");
    
    if (!aiStatusTool) {
      console.log("❌ AI Status tool not found");
      return;
    }
    
    console.log("✅ AI Status tool found");
    console.log("📋 Description:", aiStatusTool.description.split('\n')[0]);
    
    // Test basic AI status check
    console.log("\n🔍 Checking AI service availability...");
    
    const statusResult = await server.request({
      method: "tools/call",
      params: {
        name: "check_ai_status",
        arguments: {
          includeModels: true,
          includeConfiguration: true
        }
      }
    });
    
    const status = JSON.parse(statusResult.content[0].text);
    
    console.log("\n📊 AI Status Results:");
    console.log("   Status:", status.summary);
    console.log("   DEVONthink Running:", status.devonthinkRunning ? "✅" : "❌");
    console.log("   AI Features Enabled:", status.aiFeatureEnabled ? "✅" : "❌");
    
    if (status.configuredEngines && status.configuredEngines.length > 0) {
      console.log("\n🤖 Configured AI Engines:");
      status.configuredEngines.forEach(engine => {
        console.log(`   • ${engine.engine}`);
        if (engine.models && engine.models.length > 0) {
          console.log(`     Models: ${engine.models.join(', ')}`);
        }
      });
    } else {
      console.log("\n⚠️ No AI engines configured");
    }
    
    if (status.unconfiguredEngines && status.unconfiguredEngines.length > 0) {
      console.log("\n🔧 Available for Setup:");
      status.unconfiguredEngines.forEach(engine => {
        console.log(`   • ${engine.engine} (not configured)`);
      });
    }
    
    // Test engine recommendation for different operations
    const operations = ["chat", "summarize", "classify"];
    
    for (const operation of operations) {
      console.log(`\n🎯 Testing engine selection for '${operation}'...`);
      
      const opResult = await server.request({
        method: "tools/call",
        params: {
          name: "check_ai_status",
          arguments: {
            testOperation: operation,
            includeModels: false,
            includeConfiguration: false
          }
        }
      });
      
      const opStatus = JSON.parse(opResult.content[0].text);
      
      if (opStatus.recommendedEngine) {
        const rec = opStatus.recommendedEngine;
        console.log(`   Recommended: ${rec.engine}${rec.model ? ` (${rec.model})` : ""}`);
        console.log(`   Reason: ${rec.reason}`);
      } else {
        console.log(`   No engine available for ${operation}`);
      }
    }
    
    // Demonstrate smart chat tool usage
    console.log("\n💬 Testing smart chat tool...");
    
    const chatResult = await server.request({
      method: "tools/call", 
      params: {
        name: "chat_with_knowledge_base",
        arguments: {
          query: "What AI engines do I have configured?",
          maxResults: 1
          // Note: No engine specified - should auto-select
        }
      }
    });
    
    const chatResponse = JSON.parse(chatResult.content[0].text);
    
    if (chatResponse.success) {
      console.log("   ✅ Smart chat worked!");
      if (chatResponse.aiMetadata) {
        console.log(`   Selected engine: ${chatResponse.aiMetadata.engine}`);
        console.log(`   Selection reason: ${chatResponse.aiMetadata.engineSelected || 'Auto-selected'}`);
      }
    } else {
      console.log("   ❌ Smart chat failed:", chatResponse.error);
      if (chatResponse.recommendations) {
        console.log("   💡 Recommendations:");
        chatResponse.recommendations.forEach(rec => {
          console.log(`      • ${rec}`);
        });
      }
    }
    
    console.log("\n🎉 AI Detection Demo Complete!");
    console.log("\n📖 Key Benefits:");
    console.log("   • Automatic engine detection using DEVONthink's getChatModelsForEngine() API");
    console.log("   • Smart engine selection based on operation type");
    console.log("   • User-friendly error messages with setup guidance");
    console.log("   • No more 'I have ChatGPT!' - system knows what's configured");
    console.log("   • Proactive configuration guidance for unconfigured engines");
    
  } catch (error) {
    console.error("❌ Demo failed:", error.message);
    
    if (error.message.includes("DEVONthink")) {
      console.log("\n💡 This demo requires DEVONthink to be running.");
      console.log("   Start DEVONthink and try again!");
    }
  }
}

// Run the demo
demonstrateAIDetection().catch(console.error);