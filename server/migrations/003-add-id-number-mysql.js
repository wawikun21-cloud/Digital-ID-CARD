import { query } from '../config/database.js';

// MySQL / MariaDB counterpart of 003-add-id-number.js.
async function run() {
  if (process.env.RUN_MIGRATIONS === 'false') {
    console.log('Migrations skipped because RUN_MIGRATIONS=false');
    return;
  }
  try {
    const columns = [
      ['id_number', "VARCHAR(50) NOT NULL DEFAULT ''"],
      ['address', "TEXT NULL"],
    ];
    for (const [name, definition] of columns) {
      const res = await query(
        `SELECT COUNT(*) AS cnt FROM information_schema.columns
         WHERE table_schema = DATABASE() AND table_name = 'digital_ids' AND column_name = ?`,
        [name],
      );
      if (res.rows[0].cnt === 0) {
        await query(`ALTER TABLE digital_ids ADD COLUMN ${name} ${definition}`);
      }
    }
    console.log('Migration 003-add-id-number-mysql executed successfully');
  } catch (err) {
    console.error('Migration 003-add-id-number-mysql failed', err);
    process.exit(1);
  }
}

export default run;