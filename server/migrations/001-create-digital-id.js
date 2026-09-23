import { query } from '../config/database.js';

const SQL = `
CREATE TABLE IF NOT EXISTS digital_ids (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL DEFAULT '',
  position TEXT NOT NULL DEFAULT '',
  secondary_role TEXT NOT NULL DEFAULT '',
  department TEXT NOT NULL DEFAULT '',
  organization TEXT NOT NULL DEFAULT '',
  bio TEXT NOT NULL DEFAULT '',
  photo BYTEA,
  contact_phone TEXT NOT NULL DEFAULT '',
  contact_website TEXT NOT NULL DEFAULT '',
  contact_email TEXT NOT NULL DEFAULT '',
  issued DATE NOT NULL DEFAULT CURRENT_DATE,
  expires DATE NOT NULL DEFAULT CURRENT_DATE,
  social_links JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO digital_ids (
  id, name, position, secondary_role, department, organization,
  bio, contact_phone, contact_website, contact_email,
  issued, expires, social_links
)
VALUES (
  'CIT-2026-0001',
  'Benneth A. Aloyon, MIT',
  'Dean, College of Information Technology',
  'Founder, BAA Digital Marketing Services',
  'College of Information Technology',
  'BAA Digital',
  'Turning bold ideas into working systems — one launch at a time.',
  '+63 931 984 9574',
  'www.baadigital.com',
  'bennethaloyon@gmail.com',
  '2026-01-15',
  '2028-01-15',
  '[{"id":"social-seed-1","url":"https://www.facebook.com/iamdeanbaa"},{"id":"social-seed-2","url":"https://www.instagram.com/iamdeanbaa?stkn=M3NqNDI4NGF5Y3lr"}]'
)
ON CONFLICT (id) DO NOTHING;
`;

async function run() {
  if (process.env.RUN_MIGRATIONS === 'false') {
    console.log('Migrations skipped because RUN_MIGRATIONS=false');
    return;
  }

  try {
    await query(SQL);
    console.log('Migration 001-create-digital-id executed successfully');
  } catch (err) {
    console.error('Migration 001-create-digital-id failed', err);
    process.exit(1);
  }
}

export default run;

