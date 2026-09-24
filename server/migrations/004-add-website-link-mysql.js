import { query } from '../config/database.js';

// MySQL / MariaDB counterpart of 004-add-website-link.js.
async function run() {
  if (process.env.RUN_MIGRATIONS === 'false') {
    console.log('Migrations skipped because RUN_MIGRATIONS=false');
    return;
  }
  try {
    const res = await query(
      `SELECT COUNT(*) AS cnt FROM information_schema.columns
       WHERE table_schema = DATABASE() AND table_name = 'digital_ids' AND column_name = ?`,
      ['website_link'],
    );
    if (res.rows[0].cnt === 0) {
      // TEXT columns cannot have a DEFAULT on older MariaDB/MySQL, so allow NULL;
      // rowToRecord turns NULL into ''.
      await query('ALTER TABLE digital_ids ADD COLUMN website_link TEXT NULL');
    }
    console.log('Migration 004-add-website-link-mysql executed successfully');
  } catch (err) {
    console.error('Migration 004-add-website-link-mysql failed', err);
    process.exit(1);
  }
}

export default run;