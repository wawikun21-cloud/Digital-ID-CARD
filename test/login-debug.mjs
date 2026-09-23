import http from 'node:http';
import { setTimeout as delay } from 'timers/promises';

const BASE = 'http://localhost:5000';

function request(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE);
    const body = options.body ? JSON.stringify(options.body) : null;
    const req = http.request(url, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    }, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        const data = Buffer.concat(chunks).toString();
        let parsed;
        try { parsed = JSON.parse(data); } catch { parsed = data; }
        resolve({ status: res.statusCode, data: parsed, headers: res.headers });
      });
      res.on('error', reject);
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function waitForServer() {
  console.log(`Waiting for server at ${BASE} ...`);
  for (let i = 0; i < 60; i++) {
    try {
      const res = await request('/verify/x');
      console.log(`Attempt ${i + 1}: ${res.status}`);
      if (res.status === 200) return;
    } catch (err) {
      console.log(`Attempt ${i + 1}: error -> ${err.message}`);
    }
    await delay(250);
  }
  throw new Error('Server did not become ready on ' + BASE);
}

async function main() {
  await waitForServer();
  console.log('Server is up\n');

  console.log('1) POST /api/auth/login with email');
  try {
    const loginEmail = await request('/api/auth/login', {
      method: 'POST',
      body: { username: 'admin@company.local', password: 'admin123' },
    });
    console.log('status:', loginEmail.status);
    console.log('body:', loginEmail.data);
  } catch (err) {
    console.log('request failed:', err.message);
  }
  console.log();

  console.log('2) POST /api/auth/login with username');
  try {
    const loginUser = await request('/api/auth/login', {
      method: 'POST',
      body: { username: 'admin', password: 'admin123' },
    });
    console.log('status:', loginUser.status);
    console.log('body:', loginUser.data);
  } catch (err) {
    console.log('request failed:', err.message);
  }
}

main().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
