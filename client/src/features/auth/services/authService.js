const API_BASE = '/api/auth';

export async function login(username, password) {
  console.log('[authService.login] sending', { username, passwordLen: password?.length });
  const res = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
    credentials: 'include',
  });
  console.log('[authService.login] status', res.status);
  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: 'Login failed' }));
    console.log('[authService.login] error body', data);
    throw new Error(data.error || 'Login failed');
  }
  return res.json();
}

export async function logout() {
  const res = await fetch(`${API_BASE}/logout`, {
    method: 'POST',
    credentials: 'include',
  });
  if (!res.ok) {
    throw new Error('Logout failed');
  }
}

export async function getCurrentUser() {
  const res = await fetch(`${API_BASE}/me`, { credentials: 'include' });
  if (!res.ok) {
    throw new Error('Not authenticated');
  }
  return res.json();
}

export async function createUser(username, email, password, role = 'user', fullName = '') {
  const res = await fetch(`${API_BASE}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password, role, full_name: fullName }),
    credentials: 'include',
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: 'Failed to create user' }));
    throw new Error(data.error || 'Failed to create user');
  }
  return res.json();
}

export async function listUsers() {
  const res = await fetch(`${API_BASE}/users`, { credentials: 'include' });
  if (!res.ok) {
    throw new Error('Failed to load users');
  }
  return res.json();
}

export async function updateUser(id, updates) {
  const res = await fetch(`${API_BASE}/users/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
    credentials: 'include',
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: 'Failed to update user' }));
    throw new Error(data.error || 'Failed to update user');
  }
  return res.json();
}

export async function deleteUser(id) {
  const res = await fetch(`${API_BASE}/users/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!res.ok && res.status !== 204) {
    throw new Error('Failed to delete user');
  }
}
