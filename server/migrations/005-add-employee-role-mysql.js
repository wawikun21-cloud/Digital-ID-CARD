import { query } from '../config/database.js';
import bcrypt from 'bcrypt';
import crypto from 'node:crypto';

// MySQL / MariaDB counterpart of 005-add-employee-role.js.
// MySQL ignores CHECK constraints, so we only need to seed the employee users.
async function run() {
  if (process.env.RUN_MIGRATIONS === 'false') {
    console.log('Migrations skipped because RUN_MIGRATIONS=false');
    return;
  }

  try {
    const employees = [
      { username: 'employee1', email: 'employee1@baadigital.com', fullName: 'Alice Santos' },
      { username: 'employee2', email: 'employee2@baadigital.com', fullName: 'Bob Reyes' },
      { username: 'employee3', email: 'employee3@baadigital.com', fullName: 'Carol Mendoza' },
      { username: 'employee4', email: 'employee4@baadigital.com', fullName: 'David Cruz' },
      { username: 'employee5', email: 'employee5@baadigital.com', fullName: 'Elena Garcia' },
      { username: 'employee6', email: 'employee6@baadigital.com', fullName: 'Frank Torres' },
    ];

    const passwordHash = await bcrypt.hash('password123', 12);

    for (const emp of employees) {
      const existing = await query('SELECT id FROM users WHERE username = ? LIMIT 1', [emp.username]);
      if (existing.rows.length > 0) {
        console.log(`Employee ${emp.username} already exists, skipping seed`);
        continue;
      }

      const id = crypto.randomUUID();
      await query(
        `INSERT INTO users (id, username, email, password_hash, role, full_name) VALUES (?, ?, ?, ?, 'employee', ?)`,
        [id, emp.username, emp.email, passwordHash, emp.fullName],
      );
      console.log(`Seeded employee: ${emp.username} (${emp.fullName})`);
    }

    console.log('Migration 005-add-employee-role-mysql executed successfully');
  } catch (err) {
    console.error('Migration 005-add-employee-role-mysql failed', err);
    process.exit(1);
  }
}

export default run;
