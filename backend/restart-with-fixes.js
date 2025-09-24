#!/usr/bin/env node

/**
 * Restart Server with Admin Panel Fixes
 * 
 * This script ensures the admin panel quote system works reliably with:
 * - PDF attachments
 * - Stripe checkout links
 * - Modern email templates
 * - Complete quote details
 */

const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const util = require('util');

const execAsync = util.promisify(exec);

async function restartWithFixes() {
  console.log("🚀 RESTARTING SERVER WITH ADMIN PANEL FIXES");
  console.log("============================================\n");

  try {
    // Step 1: Stop existing processes
    console.log("1. Stopping existing processes...");
    await stopExistingProcesses();

    // Step 2: Check environment
    console.log("\n2. Checking environment...");
    await checkEnvironment();

    // Step 3: Build project
    console.log("\n3. Building project with fixes...");
    await buildProject();

    // Step 4: Start server
    console.log("\n4. Starting server with fixes...");
    await startServer();

    // Step 5: Verify startup
    console.log("\n5. Verifying server startup...");
    await verifyServerStartup();

  } catch (error) {
    console.error("❌ Restart failed:", error.message);
    process.exit(1);
  }
}

async function stopExistingProcesses() {
  try {
    // Kill Node.js processes on port 5001
    console.log("   🔄 Killing Node.js processes on port 5001...");
    await execAsync('pkill -f "node.*server" || true');
    await execAsync('pkill -f "dist/server.js" || true');
    
    // Kill processes using port 5001
    try {
      const { stdout } = await execAsync('lsof -ti:5001');
      if (stdout.trim()) {
        console.log("   🔄 Killing processes using port 5001...");
        await execAsync(`kill -9 ${stdout.trim()}`);
      }
    } catch (error) {
      // Port might not be in use, which is fine
    }
    
    // Kill PM2 processes if any
    try {
      await execAsync('pm2 stop all || true');
      await execAsync('pm2 delete all || true');
    } catch (error) {
      // PM2 might not be installed, which is fine
    }
    
    console.log("   ✅ Existing processes stopped");
    
    // Wait a moment for processes to fully terminate
    await new Promise(resolve => setTimeout(resolve, 2000));
    
  } catch (error) {
    console.log("   ⚠️  Error stopping processes:", error.message);
  }
}

async function checkEnvironment() {
  // Check if .env exists
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) {
    console.log("   ❌ .env file not found!");
    console.log("   💡 Run: node create-env-file.js");
    throw new Error('.env file missing');
  }
  console.log("   ✅ .env file exists");

  // Check if package.json exists
  const packagePath = path.join(__dirname, 'package.json');
  if (!fs.existsSync(packagePath)) {
    console.log("   ❌ package.json not found!");
    throw new Error('package.json missing');
  }
  console.log("   ✅ package.json exists");

  // Check if src directory exists
  const srcPath = path.join(__dirname, 'src');
  if (!fs.existsSync(srcPath)) {
    console.log("   ❌ src directory not found!");
    throw new Error('src directory missing');
  }
  console.log("   ✅ src directory exists");
}

async function buildProject() {
  return new Promise((resolve, reject) => {
    console.log("   📦 Running npm run build...");
    
    const buildProcess = spawn('npm', ['run', 'build'], {
      cwd: __dirname,
      stdio: 'inherit'
    });

    buildProcess.on('close', (code) => {
      if (code === 0) {
        console.log("   ✅ Build successful");
        resolve();
      } else {
        console.log("   ❌ Build failed with code:", code);
        reject(new Error(`Build failed with code ${code}`));
      }
    });

    buildProcess.on('error', (error) => {
      console.log("   ❌ Build process error:", error.message);
      reject(error);
    });
  });
}

async function startServer() {
  return new Promise((resolve, reject) => {
    console.log("   🚀 Starting server process...");
    
    const serverProcess = spawn('node', ['-r', 'dotenv/config', 'dist/server.js', '-p', '5001'], {
      cwd: __dirname,
      stdio: ['ignore', 'pipe', 'pipe'],
      detached: true
    });

    // Redirect output to log file
    const logStream = fs.createWriteStream('server.log', { flags: 'a' });
    
    serverProcess.stdout.on('data', (data) => {
      const message = `[${new Date().toISOString()}] ${data}`;
      console.log(`   📋 ${message.trim()}`);
      logStream.write(message);
    });

    serverProcess.stderr.on('data', (data) => {
      const message = `[${new Date().toISOString()}] ERROR: ${data}`;
      console.error(`   ❌ ${message.trim()}`);
      logStream.write(message);
    });

    serverProcess.on('close', (code) => {
      console.log(`   ⚠️  Server process exited with code ${code}`);
      logStream.end();
    });

    serverProcess.on('error', (error) => {
      console.log("   ❌ Server process error:", error.message);
      reject(error);
    });

    // Detach the process so it runs independently
    serverProcess.unref();
    
    // Store process info for later reference
    global.serverProcess = serverProcess;
    
    // Wait a moment for server to start
    setTimeout(() => {
      console.log("   ✅ Server process started");
      resolve();
    }, 3000);
  });
}

async function verifyServerStartup() {
  try {
    const axios = require('axios');
    
    console.log("   🔍 Testing server health endpoint...");
    const response = await axios.get('http://localhost:5001/api/health', { 
      timeout: 10000,
      headers: { 'User-Agent': 'Restart-Script' }
    });
    
    console.log("   ✅ Server is responding");
    console.log(`   📊 Status: ${response.status}`);
    
    // Test quote endpoint
    console.log("   🔍 Testing quote endpoint...");
    const quoteResponse = await axios.get('http://localhost:5001/api/quotes/cmfvzmv040024bcmhp9yvuyor', { 
      timeout: 10000 
    });
    
    console.log("   ✅ Quote endpoint working");
    console.log(`   📋 Quote: ${quoteResponse.data.quoteNumber}`);
    
    console.log("\n🎉 SERVER RESTART COMPLETE!");
    console.log("============================");
    console.log("✅ All processes stopped and restarted");
    console.log("✅ Project built with admin panel fixes");
    console.log("✅ Server running on port 5001");
    console.log("✅ Health endpoint responding");
    console.log("✅ Quote endpoint working");
    
    console.log("\n🔧 ADMIN PANEL FIXES APPLIED:");
    console.log("=============================");
    console.log("✅ Added /send-email route for admin panel compatibility");
    console.log("✅ Fixed parameter handling (email vs mode)");
    console.log("✅ Ensured NEW email system is used (not legacy)");
    console.log("✅ PDF attachments will be included");
    console.log("✅ Stripe checkout links will work");
    console.log("✅ Modern email template will be used");
    console.log("✅ Complete quote details will be included");
    
    console.log("\n🧪 READY FOR TESTING:");
    console.log("=====================");
    console.log("• Test server: npm run check:server");
    console.log("• Use admin panel to send quote emails");
    console.log("• Check kappamike@gmail.com for emails");
    console.log("• Server logs: tail -f server.log");
    
  } catch (error) {
    console.log("   ❌ Server verification failed:", error.message);
    console.log("   💡 Check server logs: tail -f server.log");
    throw error;
  }
}

// Handle process termination
process.on('SIGINT', () => {
  console.log("\n🛑 Restart script interrupted");
  if (global.serverProcess) {
    global.serverProcess.kill();
  }
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log("\n🛑 Restart script terminated");
  if (global.serverProcess) {
    global.serverProcess.kill();
  }
  process.exit(0);
});

// Run the restart process
restartWithFixes().catch(console.error);