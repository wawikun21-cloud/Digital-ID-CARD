import { query } from '../config/database.js';
import bcrypt from 'bcrypt';

const SQL = `
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  full_name TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE digital_ids ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE digital_ids ADD COLUMN IF NOT EXISTS background TEXT;
ALTER TABLE digital_ids ADD COLUMN IF NOT EXISTS logo BYTEA;

UPDATE digital_ids SET user_id = (SELECT id FROM users WHERE role = 'admin' LIMIT 1)
WHERE id = 'CIT-2026-0001' AND user_id IS NULL;
`;

async function seedAdmin() {
  const { ADMIN_USERNAME, ADMIN_PASSWORD, ADMIN_EMAIL } = process.env;
  if (!ADMIN_USERNAME || !ADMIN_PASSWORD || !ADMIN_EMAIL) {
    console.log('Skipping admin seed: ADMIN_USERNAME, ADMIN_PASSWORD, or ADMIN_EMAIL not set');
    return;
  }

  const existing = await query('SELECT id FROM users WHERE username = $1 LIMIT 1', [ADMIN_USERNAME]);
  if (existing.rowCount > 0) {
    console.log('Admin user already exists, skipping seed');
    return;
  }

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
  await query(
    `INSERT INTO users (username, email, password_hash, role, full_name)
     VALUES ($1, $2, $3, 'admin', $4)`,
    [ADMIN_USERNAME, ADMIN_EMAIL, passwordHash, ADMIN_USERNAME]
  );
  console.log('Admin user seeded successfully');
}

async function run() {
  if (process.env.RUN_MIGRATIONS === 'false') {
    console.log('Migrations skipped because RUN_MIGRATIONS=false');
    return;
  }

  try {
    await query(SQL);
    console.log('Migration 002-create-users executed successfully');
    await seedAdmin();
  } catch (err) {
    console.error('Migration 002-create-users failed', err);
    process.exit(1);
  }
}

export default run;
