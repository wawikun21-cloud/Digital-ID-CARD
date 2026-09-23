import { query } from '../config/database.js';
import bcrypt from 'bcrypt';

const CREATE_USERS_SQL = `
CREATE TABLE IF NOT EXISTS users (
  id CHAR(36) PRIMARY KEY,
  username VARCHAR(191) UNIQUE NOT NULL,
  email VARCHAR(191) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'user',
  full_name TEXT NOT NULL DEFAULT '',
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
);
`;

async function columnExists(table, column) {
  const res = await query(
    `SELECT COUNT(*) as cnt FROM information_schema.columns WHERE table_name = ? AND column_name = ?`,
    [table, column]
  );
  return res.rows[0].cnt > 0;
}

async function addColumnIfMissing(table, column, definition) {
  const exists = await columnExists(table, column);
  if (!exists) {
    await query(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}

async function run() {
  if (process.env.RUN_MIGRATIONS === 'false') {
    console.log('Migrations skipped because RUN_MIGRATIONS=false');
    return;
  }

  try {
    await query(CREATE_USERS_SQL);
    await addColumnIfMissing('digital_ids', 'user_id', 'CHAR(36) NULL');
    await addColumnIfMissing('digital_ids', 'background', 'TEXT NULL');
    await addColumnIfMissing('digital_ids', 'logo', 'LONGBLOB NULL');

    const { ADMIN_USERNAME, ADMIN_PASSWORD, ADMIN_EMAIL } = process.env;
    if (ADMIN_USERNAME && ADMIN_PASSWORD && ADMIN_EMAIL) {
      const existing = await query('SELECT id FROM users WHERE username = ? LIMIT 1', [ADMIN_USERNAME]);
      if (existing.rows.length === 0) {
        const id = crypto.randomUUID();
        const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
        await query(
          `INSERT INTO users (id, username, email, password_hash, role, full_name) VALUES (?, ?, ?, ?, 'admin', ?)`,
          [id, ADMIN_USERNAME, ADMIN_EMAIL, passwordHash, ADMIN_USERNAME]
        );
        console.log('Admin user seeded successfully');

        await query(
          `UPDATE digital_ids SET user_id = ? WHERE id = 'CIT-2026-0001' AND user_id IS NULL`,
          [id]
        );
        console.log('Linked existing digital ID to admin');
      } else {
        const adminId = existing.rows[0].id;
        await query(
          `UPDATE digital_ids SET user_id = ? WHERE id = 'CIT-2026-0001' AND user_id IS NULL`,
          [adminId]
        );
        console.log('Linked existing digital ID to admin');
      }
    } else {
      console.log('Skipping admin seed: ADMIN_USERNAME, ADMIN_PASSWORD, or ADMIN_EMAIL not set');
    }

    console.log('Migration 002-create-users-mysql executed successfully');
  } catch (err) {
    console.error('Migration 002-create-users-mysql failed', err);
    process.exit(1);
  }
}

export default run;
