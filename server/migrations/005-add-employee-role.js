import { query } from '../config/database.js';
import bcrypt from 'bcrypt';

// PostgreSQL. Adds `employee` to the allowed user roles and seeds 6 employee users.
const SQL = `
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('admin', 'user', 'employee'));
`;

async function seedEmployees() {
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
    const existing = await query('SELECT id FROM users WHERE username = $1 LIMIT 1', [emp.username]);
    if (existing.rowCount > 0) {
      console.log(`Employee ${emp.username} already exists, skipping seed`);
      continue;
    }

    await query(
      `INSERT INTO users (username, email, password_hash, role, full_name)
       VALUES ($1, $2, $3, 'employee', $4)`,
      [emp.username, emp.email, passwordHash, emp.fullName],
    );
    console.log(`Seeded employee: ${emp.username} (${emp.fullName})`);
  }
}

async function run() {
  if (process.env.RUN_MIGRATIONS === 'false') {
    console.log('Migrations skipped because RUN_MIGRATIONS=false');
    return;
  }

  try {
    await query(SQL);
    console.log('Migration 005-add-employee-role executed successfully');
    await seedEmployees();
  } catch (err) {
    console.error('Migration 005-add-employee-role failed', err);
    process.exit(1);
  }
}

export default run;
