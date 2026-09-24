import { query } from '../config/database.js';

// PostgreSQL. Adds the human-facing ID number printed on the card
// ("ID NO: 000001"); `id` stays the record key.
const SQL = `ALTER TABLE digital_ids ADD COLUMN IF NOT EXISTS id_number TEXT NOT NULL DEFAULT '';`;

async function run() {
  if (process.env.RUN_MIGRATIONS === 'false') {
    console.log('Migrations skipped because RUN_MIGRATIONS=false');
    return;
  }
  try {
    await query(SQL);
    console.log('Migration 003-add-id-number executed successfully');
  } catch (err) {
    console.error('Migration 003-add-id-number failed', err);
    process.exit(1);
  }
}

export default run;
