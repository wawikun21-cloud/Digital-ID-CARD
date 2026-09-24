import { query } from '../config/database.js';

// PostgreSQL. Adds the Website link that the QR code on the card front points at.
const SQL = `
ALTER TABLE digital_ids ADD COLUMN IF NOT EXISTS website_link TEXT NOT NULL DEFAULT '';
`;

async function run() {
  if (process.env.RUN_MIGRATIONS === 'false') {
    console.log('Migrations skipped because RUN_MIGRATIONS=false');
    return;
  }
  try {
    await query(SQL);
    console.log('Migration 004-add-website-link executed successfully');
  } catch (err) {
    console.error('Migration 004-add-website-link failed', err);
    process.exit(1);
  }
}

export default run;