#!/usr/bin/env node

/**
 * Start Server Script
 * This script starts the server with proper configuration
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

async function startServer() {
  console.log("🚀 STARTING SERVER");
  console.log("==================\n");

  // Check if .env exists
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) {
    console.log("❌ .env file not found!");
    console.log("💡 Run: node create-env-file.js");
    return;
  }

  // Check if dist directory exists
  const distPath = path.join(__dirname, 'dist');
  if (!fs.existsSync(distPath)) {
    console.log("📦 Building project...");
    const buildProcess = spawn('npm', ['run', 'build'], {
      cwd: __dirname,
      stdio: 'inherit'
    });

    buildProcess.on('close', (code) => {
      if (code === 0) {
        console.log("✅ Build successful");
        startServerProcess();
      } else {
        console.log("❌ Build failed");
      }
    });
  } else {
    startServerProcess();
  }
}

function startServerProcess() {
  console.log("🔄 Starting server process...");
  
  const serverProcess = spawn('node', ['-r', 'dotenv/config', 'dist/server.js', '-p', '5001'], {
    cwd: __dirname,
    stdio: ['ignore', 'pipe', 'pipe']
  });

  // Redirect output to log file
  const logStream = fs.createWriteStream('server.log', { flags: 'a' });
  
  serverProcess.stdout.on('data', (data) => {
    const message = `[${new Date().toISOString()}] ${data}`;
    console.log(message.trim());
    logStream.write(message);
  });

  serverProcess.stderr.on('data', (data) => {
    const message = `[${new Date().toISOString()}] ERROR: ${data}`;
    console.error(message.trim());
    logStream.write(message);
  });

  serverProcess.on('close', (code) => {
    console.log(`Server process exited with code ${code}`);
    logStream.end();
  });

  // Wait a moment for server to start
  setTimeout(() => {
    console.log("\n✅ Server started successfully!");
    console.log("📋 Server logs: tail -f server.log");
    console.log("🧪 Test the system: node test-email-system-direct.js");
  }, 3000);
}

startServer().catch(console.error);

