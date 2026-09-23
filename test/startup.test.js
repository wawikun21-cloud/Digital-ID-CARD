import { spawn } from 'child_process';
import { setTimeout } from 'timers/promises';

function runServer(args = [], env = {}) {
  return new Promise((resolve, reject) => {
    const proc = spawn('node', ['index.js', ...args], {
      cwd: 'server',
      env: { ...process.env, ...env },
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    proc.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    proc.on('close', (code) => {
      resolve({ code, stdout, stderr, proc });
    });

    proc.on('error', reject);
  });
}

async function testServerFailsWithoutJwtSecret() {
  console.log('Test: Server fails without JWT_SECRET');
  const { code, stderr } = await runServer([], {
    JWT_SECRET: '',
    ADMIN_USERNAME: 'admin',
    ADMIN_PASSWORD: 'admin123',
    ADMIN_EMAIL: 'admin@test.local',
    RUN_MIGRATIONS: 'false',
  });

  if (code === 1 && stderr.includes('JWT_SECRET')) {
    console.log('  PASS: Server exits with JWT_SECRET error');
  } else {
    console.log('  FAIL: Expected exit code 1 with JWT_SECRET error');
    console.log('  stderr:', stderr);
  }
}

async function testServerFailsWithShortJwtSecret() {
  console.log('Test: Server fails with short JWT_SECRET');
  const { code, stderr } = await runServer([], {
    JWT_SECRET: 'short',
    ADMIN_USERNAME: 'admin',
    ADMIN_PASSWORD: 'admin123',
    ADMIN_EMAIL: 'admin@test.local',
    RUN_MIGRATIONS: 'false',
  });

  if (code === 1 && stderr.includes('JWT_SECRET')) {
    console.log('  PASS: Server exits with JWT_SECRET error');
  } else {
    console.log('  FAIL: Expected exit code 1 with JWT_SECRET error');
    console.log('  stderr:', stderr);
  }
}

async function testServerStartsWithValidEnv() {
  console.log('Test: Server starts with valid env');
  const { code, stdout, stderr, proc } = await runServer([], {
    JWT_SECRET: 'a'.repeat(32),
    ADMIN_USERNAME: 'admin',
    ADMIN_PASSWORD: 'admin123',
    ADMIN_EMAIL: 'admin@test.local',
    RUN_MIGRATIONS: 'false',
    NODE_ENV: 'test',
  });

  // Give it a moment to start
  await setTimeout(500);

  proc.kill('SIGTERM');

  if (code === null || (stdout.includes('Server listening') || stderr.includes('Server listening'))) {
    console.log('  PASS: Server starts successfully');
  } else {
    console.log('  FAIL: Server did not start');
    console.log('  stdout:', stdout);
    console.log('  stderr:', stderr);
  }
}

async function main() {
  console.log('Running server startup tests...\n');

  await testServerFailsWithoutJwtSecret();
  await testServerFailsWithShortJwtSecret();
  await testServerStartsWithValidEnv();

  console.log('\nStartup tests complete.');
}

main().catch((err) => {
  console.error('Test runner error:', err);
  process.exit(1);
});
