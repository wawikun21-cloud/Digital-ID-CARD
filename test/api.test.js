const BASE = 'http://localhost:5001';

function check(res, expectedStatus) {
  if (res.status !== expectedStatus) {
    throw new Error(`Expected ${expectedStatus}, got ${res.status}: ${JSON.stringify(res.data)}`);
  }
  return res.data;
}

async function api(path, options = {}) {
  const { method = 'GET', body, headers = {}, credentials = 'include' } = options;
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
    credentials,
  });

  const data = await res.json().catch(() => ({}));
  return { status: res.status, data, headers: res.headers };
}

let adminCookie = '';
let adminUserId = '';

async function setCookie(cookieHeader) {
  const match = cookieHeader.match(/token=([^;]+)/);
  if (match) {
    adminCookie = `token=${match[1]}`;
  }
}

async function testPublicEndpoints() {
  console.log('Public endpoints');

  // Verify page is public
  const verify = await fetch(`${BASE}/verify/abc`);
  check({ status: verify.status, data: 'ok' }, 200);
  console.log('  PASS GET /verify/:id');

  // Login with wrong credentials
  const badLogin = await api('/api/auth/login', {
    method: 'POST',
    body: { username: 'wrong', password: 'wrong' },
  });
  check(badLogin, 401);
  console.log('  PASS POST /api/auth/login with bad credentials');

  // Login with missing fields
  const emptyLogin = await api('/api/auth/login', {
    method: 'POST',
    body: {},
  });
  check(emptyLogin, 400);
  console.log('  PASS POST /api/auth/login with empty body');
}

async function testAuthFlow() {
  console.log('Auth flow');

  // Admin login
  const login = await api('/api/auth/login', {
    method: 'POST',
    body: {
      username: process.env.TEST_ADMIN_USERNAME || 'admin',
      password: process.env.TEST_ADMIN_PASSWORD || 'admin123',
    },
  });
  const loginData = check(login, 200);
  if (!loginData.id || !loginData.role) {
    throw new Error('Login response missing user fields');
  }
  adminUserId = loginData.id;
  await setCookie(login.headers.get('set-cookie') || '');
  console.log('  PASS POST /api/auth/login (admin)');

  // Me endpoint
  const me = await api('/api/auth/me');
  check(me, 200);
  if (me.data.role !== 'admin') {
    throw new Error('Me endpoint did not return admin role');
  }
  console.log('  PASS GET /api/auth/me');

  // Logout
  const logout = await api('/api/auth/logout', { method: 'POST' });
  check(logout, 204);
  console.log('  PASS POST /api/auth/logout');

  // Me after logout should fail
  const meAfterLogout = await api('/api/auth/me');
  check(meAfterLogout, 401);
  console.log('  PASS GET /api/auth/me returns 401 after logout');
}

async function testUserCrud() {
  console.log('User CRUD (admin)');

  // Re-login for admin actions
  const login = await api('/api/auth/login', {
    method: 'POST',
    body: {
      username: process.env.TEST_ADMIN_USERNAME || 'admin',
      password: process.env.TEST_ADMIN_PASSWORD || 'admin123',
    },
  });
  const loginData = check(login, 200);
  adminUserId = loginData.id;
  await setCookie(login.headers.get('set-cookie') || '');

  // List users
  const list = await api('/api/auth/users');
  check(list, 200);
  if (!Array.isArray(list.data)) {
    throw new Error('Users list should be an array');
  }
  console.log('  PASS GET /api/auth/users');

  // Create user
  const create = await api('/api/auth/users', {
    method: 'POST',
    body: {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      role: 'user',
      full_name: 'Test User',
    },
  });
  const created = check(create, 201);
  if (created.username !== 'testuser') {
    throw new Error('Created user username mismatch');
  }
  console.log('  PASS POST /api/auth/users');

  // Duplicate username
  const dupUsername = await api('/api/auth/users', {
    method: 'POST',
    body: {
      username: 'testuser',
      email: 'test2@example.com',
      password: 'password123',
    },
  });
  check(dupUsername, 409);
  console.log('  PASS POST /api/auth/users duplicate username');

  // Duplicate email
  const dupEmail = await api('/api/auth/users', {
    method: 'POST',
    body: {
      username: 'testuser2',
      email: 'test@example.com',
      password: 'password123',
    },
  });
  check(dupEmail, 409);
  console.log('  PASS POST /api/auth/users duplicate email');

  // Update user
  const update = await api(`/api/auth/users/${created.id}`, {
    method: 'PUT',
    body: { full_name: 'Updated User' },
  });
  const updated = check(update, 200);
  if (updated.full_name !== 'Updated User') {
    throw new Error('Update user full_name mismatch');
  }
  console.log('  PASS PUT /api/auth/users/:id');

  // Delete user
  const del = await api(`/api/auth/users/${created.id}`, { method: 'DELETE' });
  check(del, 204);
  console.log('  PASS DELETE /api/auth/users/:id');

  // Verify deleted
  const getDeleted = await api(`/api/auth/users/${created.id}`);
  // After deletion, listing should not include it
  const listAfter = await api('/api/auth/users');
  check(listAfter, 200);
  const exists = listAfter.data.some((u) => u.id === created.id);
  if (exists) {
    throw new Error('Deleted user still exists in list');
  }
  console.log('  PASS DELETE /api/auth/users/:id persists');
}

async function testDigitalIdEndpoints() {
  console.log('Digital ID endpoints (user scoped)');

  // Re-login
  const login = await api('/api/auth/login', {
    method: 'POST',
    body: {
      username: process.env.TEST_ADMIN_USERNAME || 'admin',
      password: process.env.TEST_ADMIN_PASSWORD || 'admin123',
    },
  });
  const loginData = check(login, 200);
  await setCookie(login.headers.get('set-cookie') || '');

  // GET own digital ID (should create seed for admin)
  const getOwn = await api('/api/digital-id');
  check(getOwn, 200);
  if (!getOwn.data.id) {
    throw new Error('Digital ID missing id');
  }
  console.log('  PASS GET /api/digital-id (seeds if missing)');

  // PUT own digital ID
  const putOwn = await api('/api/digital-id', {
    method: 'PUT',
    body: {
      name: 'Admin User',
      position: 'Administrator',
    },
  });
  check(putOwn, 200);
  if (putOwn.data.name !== 'Admin User') {
    throw new Error('Digital ID update mismatch');
  }
  console.log('  PASS PUT /api/digital-id');

  // DELETE own digital ID
  const deleteOwn = await api('/api/digital-id', { method: 'DELETE' });
  check(deleteOwn, 204);
  console.log('  PASS DELETE /api/digital-id');
}

async function testAdminDigitalIdRoutes() {
  console.log('Admin digital ID routes');

  // Re-login as admin
  const login = await api('/api/auth/login', {
    method: 'POST',
    body: {
      username: process.env.TEST_ADMIN_USERNAME || 'admin',
      password: process.env.TEST_ADMIN_PASSWORD || 'admin123',
    },
  });
  check(login, 200);
  await setCookie(login.headers.get('set-cookie') || '');

  // GET all digital IDs (admin)
  const all = await api('/api/admin/digital-id');
  check(all, 200);
  if (!Array.isArray(all.data)) {
    throw new Error('Admin digital ID list should be array');
  }
  console.log('  PASS GET /api/admin/digital-id');

  // Non-admin should be blocked
  const createUserRes = await api('/api/auth/users', {
    method: 'POST',
    body: {
      username: 'regularuser',
      email: 'regular@example.com',
      password: 'password123',
      role: 'user',
    },
  });
  const regularUser = check(createUserRes, 201);

  // Login as regular user
  const userLogin = await api('/api/auth/login', {
    method: 'POST',
    body: {
      username: 'regularuser',
      password: 'password123',
    },
  });
  const userLoginData = check(userLogin, 200);
  const userCookie = userLogin.headers.get('set-cookie') || '';

  const adminAccessAsUser = await api('/api/admin/digital-id', {
    headers: { Cookie: userCookie },
  });
  check(adminAccessAsUser, 403);
  console.log('  PASS GET /api/admin/digital-id returns 403 for user');

  // Cleanup created user
  const delUser = await api(`/api/auth/users/${regularUser.id}`, { method: 'DELETE' });
  check(delUser, 204);
  console.log('  PASS cleaned up test user');
}

async function main() {
  console.log('Waiting for server on', BASE, '...\n');

  // Simple health check loop
  for (let i = 0; i < 40; i++) {
    try {
      const res = await fetch(`${BASE}/verify/x`);
      if (res.status === 200) break;
    } catch {
      // ignore
    }
    await setTimeout(250);
  }

  try {
    await testPublicEndpoints();
    await testAuthFlow();
    await testUserCrud();
    await testDigitalIdEndpoints();
    await testAdminDigitalIdRoutes();

    console.log('\nAll API tests passed.');
  } catch (err) {
    console.error('\nTest failed:', err.message);
    process.exitCode = 1;
  } finally {
    process.exit(0);
  }
}

main();
