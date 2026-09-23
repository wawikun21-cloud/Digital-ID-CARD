import { hashPassword, comparePassword, generateToken } from '../auth.service.js';
import { findUserByUsername, createUser, findUserById, updateUser, deleteUser, listUsers, findUserByEmail } from '../models/userModel.js';

export async function loginHandler(req, res) {
  const { username, password } = req.body;
  console.log('loginHandler body', { username, passwordLen: password?.length });
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  const user = await findUserByUsername(username);
  const isEmail = username.includes('@');
  const resolvedUser = user || (isEmail ? await findUserByEmail(username) : null);
  if (!resolvedUser) {
    return res.status(401).json({ error: 'Invalid username or password.' });
  }

  const valid = await comparePassword(password, resolvedUser.password_hash);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid username or password.' });
  }

  const token = generateToken(resolvedUser);

  const isProduction = process.env.NODE_ENV === 'production';
  res.cookie('token', token, {
    httpOnly: true,
    sameSite: 'strict',
    secure: isProduction,
    maxAge: 24 * 60 * 60 * 1000,
  });

  return res.json({
    id: resolvedUser.id,
    username: resolvedUser.username,
    email: resolvedUser.email,
    role: resolvedUser.role,
    full_name: resolvedUser.full_name,
  });
}

export async function logoutHandler(req, res) {
  const isProduction = process.env.NODE_ENV === 'production';
  res.clearCookie('token', {
    httpOnly: true,
    sameSite: 'strict',
    secure: isProduction,
  });
  return res.status(204).send();
}

export async function meHandler(req, res) {
  const user = await findUserById(req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }
  return res.json({
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    full_name: user.full_name,
  });
}

export async function createUserHandler(req, res) {
  const { username, email, password, role = 'user', full_name = '' } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Username, email, and password are required.' });
  }

  const existingUsername = await findUserByUsername(username);
  if (existingUsername) {
    return res.status(409).json({ error: 'Username already exists.' });
  }

  const existingEmail = await findUserByEmail(email);
  if (existingEmail) {
    return res.status(409).json({ error: 'Email already exists.' });
  }

  const passwordHash = await hashPassword(password);
  const user = await createUser({ username, email, passwordHash, role, fullName: full_name });

  return res.status(201).json({
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    full_name: user.full_name,
  });
}

export async function listUsersHandler(req, res) {
  const users = await listUsers();
  return res.json(users);
}

export async function updateUserHandler(req, res) {
  const userId = req.params.id;
  const { username, email, password, role, full_name } = req.body;

  if (username) {
    const existing = await findUserByUsername(username);
    if (existing && existing.id !== userId) {
      return res.status(409).json({ error: 'Username already exists.' });
    }
  }

  if (email) {
    const existing = await findUserByEmail(email);
    if (existing && existing.id !== userId) {
      return res.status(409).json({ error: 'Email already exists.' });
    }
  }

  const updates = {};
  if (username !== undefined) updates.username = username;
  if (email !== undefined) updates.email = email;
  if (password !== undefined) updates.passwordHash = await hashPassword(password);
  if (role !== undefined) updates.role = role;
  if (full_name !== undefined) updates.fullName = full_name;

  const user = await updateUser(userId, updates);
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }

  return res.json({
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    full_name: user.full_name,
  });
}

export async function deleteUserHandler(req, res) {
  const userId = req.params.id;
  const deleted = await deleteUser(userId);
  if (!deleted) {
    return res.status(404).json({ error: 'User not found.' });
  }
  return res.status(204).send();
}
