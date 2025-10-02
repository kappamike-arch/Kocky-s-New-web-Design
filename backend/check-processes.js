#!/usr/bin/env node

/**
 * Process Check Script
 * Check if server processes are running
 */

const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

async function checkProcesses() {
  console.log("🔍 CHECKING SERVER PROCESSES");
  console.log("=============================\n");

  try {
    // Check for Node.js processes
    console.log("1. Checking for Node.js processes...");
    const { stdout: nodeProcesses } = await execAsync('ps aux | grep node | grep -v grep');
    
    if (nodeProcesses.trim()) {
      console.log("   ✅ Node.js processes found:");
      const lines = nodeProcesses.trim().split('\n');
      lines.forEach(line => {
        const parts = line.trim().split(/\s+/);
        const pid = parts[1];
        const command = parts.slice(10).join(' ');
        console.log(`   📋 PID ${pid}: ${command}`);
      });
    } else {
      console.log("   ❌ No Node.js processes found");
    }

    // Check for processes on port 5001
    console.log("\n2. Checking port 5001...");
    try {
      const { stdout: portProcesses } = await execAsync('lsof -i :5001');
      console.log("   ✅ Port 5001 is in use:");
      console.log(`   📋 ${portProcesses.trim()}`);
    } catch (error) {
      console.log("   ❌ Port 5001 is not in use");
      console.log("   💡 Server is not running on port 5001");
    }

    // Check for any server.log files
    console.log("\n3. Checking for log files...");
    const fs = require('fs');
    const logFiles = ['server.log', 'logs/app.log', 'logs/error.log'];
    
    logFiles.forEach(logFile => {
      if (fs.existsSync(logFile)) {
        const stats = fs.statSync(logFile);
        const lastModified = new Date(stats.mtime);
        const now = new Date();
        const diffMinutes = Math.floor((now - lastModified) / (1000 * 60));
        
        console.log(`   📋 Found: ${logFile} (${diffMinutes} minutes ago)`);
        
        if (diffMinutes < 5) {
          console.log("   📖 Recent entries:");
          const content = fs.readFileSync(logFile, 'utf8');
          const lines = content.split('\n').slice(-3);
          lines.forEach(line => {
            if (line.trim()) {
              console.log(`      ${line}`);
            }
          });
        }
      }
    });

  } catch (error) {
    console.error("❌ Error checking processes:", error.message);
  }
}

checkProcesses();



