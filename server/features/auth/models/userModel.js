import { query, driver as dbDriver } from '../../../config/database.js';

const TABLE = 'users';
const driver = dbDriver;

function placeholder(index) {
  if (driver === 'mysql') {
    return '?';
  }
  return `$${index}`;
}

export async function findUserByUsername(username) {
  const sql = `SELECT * FROM ${TABLE} WHERE username = ${placeholder(1)}`;
  const res = await query(sql, [username]);
  if (res.rowCount === 0) {
    return null;
  }
  return res.rows[0];
}

export async function findUserById(id) {
  const sql = `SELECT id, username, email, role, full_name, created_at, updated_at FROM ${TABLE} WHERE id = ${placeholder(1)}`;
  const res = await query(sql, [id]);
  if (res.rowCount === 0) {
    return null;
  }
  return res.rows[0];
}

export async function createUser({ username, email, passwordHash, role = 'user', fullName = '' }) {
  const id = driver === 'mysql' ? require('crypto').randomUUID() : undefined;
  const sql = `
    INSERT INTO ${TABLE} (id, username, email, password_hash, role, full_name)
    VALUES (${placeholder(1)}, ${placeholder(2)}, ${placeholder(3)}, ${placeholder(4)}, ${placeholder(5)}, ${placeholder(6)})
    RETURNING id, username, email, role, full_name, created_at, updated_at
  `;
  const values = driver === 'mysql'
    ? [id, username, email, passwordHash, role, fullName]
    : [username, email, passwordHash, role, fullName];
  const res = await query(sql, values);
  return res.rows[0];
}

export async function updateUser(id, { username, email, passwordHash, role, fullName }) {
  const sets = [];
  const values = [];
  let idx = 1;

  if (username !== undefined) {
    sets.push(`username = ${placeholder(idx)}`);
    values.push(username);
    idx++;
  }
  if (email !== undefined) {
    sets.push(`email = ${placeholder(idx)}`);
    values.push(email);
    idx++;
  }
  if (passwordHash !== undefined) {
    sets.push(`password_hash = ${placeholder(idx)}`);
    values.push(passwordHash);
    idx++;
  }
  if (role !== undefined) {
    sets.push(`role = ${placeholder(idx)}`);
    values.push(role);
    idx++;
  }
  if (fullName !== undefined) {
    sets.push(`full_name = ${placeholder(idx)}`);
    values.push(fullName);
    idx++;
  }

  sets.push(`updated_at = ${placeholder(idx)}`);
  values.push(driver === 'mysql' ? 'NOW(6)' : 'NOW()');
  idx++;

  values.push(id);
  const sql = `UPDATE ${TABLE} SET ${sets.join(', ')} WHERE id = ${placeholder(idx)} RETURNING id, username, email, role, full_name, created_at, updated_at`;
  const res = await query(sql, values);
  if (res.rowCount === 0) {
    return null;
  }
  return res.rows[0];
}

export async function deleteUser(id) {
  const sql = `DELETE FROM ${TABLE} WHERE id = ${placeholder(1)}`;
  const res = await query(sql, [id]);
  return res.rowCount > 0;
}

export async function listUsers() {
  const sql = `SELECT id, username, email, role, full_name, created_at, updated_at FROM ${TABLE} ORDER BY created_at ASC`;
  const res = await query(sql);
  return res.rows;
}

export async function findUserByEmail(email) {
  const sql = `SELECT * FROM ${TABLE} WHERE email = ${placeholder(1)}`;
  const res = await query(sql, [email]);
  if (res.rowCount === 0) {
    return null;
  }
  return res.rows[0];
}
