const { spawn } = require('child_process');
const { setTimeout } = require('timers/promises');

const SERVER_PORT = 5001;
const BASE = `http://localhost:${SERVER_PORT}`;

function runServer() {
  return new Promise((resolve, reject) => {
    const env = {
      ...process.env,
      PORT: String(SERVER_PORT),
      NODE_ENV: 'test',
      JWT_SECRET: 'a'.repeat(32),
      ADMIN_USERNAME: 'admin',
      ADMIN_PASSWORD: 'admin123',
      ADMIN_EMAIL: 'admin@test.local',
      RUN_MIGRATIONS: 'true',
      DB_DRIVER: process.env.TEST_DB_DRIVER || 'mysql',
    };

    const proc = spawn('node', ['index.js'], {
      cwd: 'server',
      env,
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (data) => {
      stdout += data.toString();
      if (stdout.includes('Server listening')) {
        resolve({ proc, stdout, stderr });
      }
    });

    proc.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    proc.on('error', reject);

    setTimeout(10000).then(() => {
      reject(new Error(`Server did not start within 10s\nstdout: ${stdout}\nstderr: ${stderr}`));
    });
  });
}

async function main() {
  console.log('Starting test server...');
  let server;
  try {
    server = await runServer();
    console.log('Server started\n');
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }

  try {
    // Run API tests
    const testModule = await import('./api.test.js');
    await testModule.default();
  } catch (err) {
    console.error('Tests failed:', err);
    process.exitCode = 1;
  } finally {
    console.log('\nShutting down test server...');
    server.proc.kill('SIGTERM');
    await setTimeout(500);
    console.log('Done.');
    process.exit(process.exitCode || 0);
  }
}

main();
