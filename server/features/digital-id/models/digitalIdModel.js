import { randomUUID } from 'crypto';
import { query, driver as dbDriver } from '../../../config/database.js';

const TABLE = 'digital_ids';
const FIXED_ID = 'CIT-2026-0001';
const driver = dbDriver;

const SEED = {
  name: '',
  position: '',
  secondary_role: '',
  department: '',
  organization: '',
  bio: '',
  contact_phone: '',
  contact_website: '',
  contact_email: '',
  issued: '',
  expires: '',
  social_links: [],
};

function formatDateValue(value) {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * BLOB column -> data URL. The client uses the value straight as an
 * <img src>, so it needs the `data:` prefix (a bare base64 string
 * renders as a broken image). Only PNG and JPEG are ever stored.
 */
function bufferToDataUrl(value) {
  if (!value) return null;
  const buffer = Buffer.isBuffer(value) ? value : Buffer.from(value);
  const mime = buffer[0] === 0xff && buffer[1] === 0xd8 ? 'image/jpeg' : 'image/png';
  return `data:${mime};base64,${buffer.toString('base64')}`;
}

function rowToRecord(row) {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    position: row.position,
    secondaryRole: row.secondary_role,
    department: row.department,
    organization: row.organization,
    bio: row.bio,
    idNumber: row.id_number ?? '',
    address: row.address ?? '',
    photo: bufferToDataUrl(row.photo),
    background: row.background || null,
    logo: bufferToDataUrl(row.logo),
    contact: {
      phone: row.contact_phone,
      website: row.contact_website,
      email: row.contact_email,
    },
    socialLinks: row.social_links ? (driver === 'mysql' ? JSON.parse(row.social_links) : row.social_links) : [],
    issued: formatDateValue(row.issued),
    expires: formatDateValue(row.expires),
  };
}

function placeholder(index) {
  if (driver === 'mysql') {
    return `?`;
  }
  return `$${index}`;
}

export async function findOne() {
  const sql = `SELECT * FROM ${TABLE} WHERE id = ${placeholder(1)}`;
  const res = await query(sql, [FIXED_ID]);
  if (res.rowCount === 0) {
    return null;
  }
  return rowToRecord(res.rows[0]);
}

export async function upsert(data, photoBuffer = null) {
  const values = [
    FIXED_ID,
    data.name ?? '',
    data.position ?? '',
    data.secondary_role ?? '',
    data.department ?? '',
    data.organization ?? '',
    data.bio ?? '',
    photoBuffer,
    data.contact_phone ?? '',
    data.contact_website ?? '',
    data.contact_email ?? '',
    data.issued ?? SEED.issued,
    data.expires ?? SEED.expires,
    data.social_links ?? SEED.social_links,
  ];

  let sql;
  if (driver === 'mysql') {
    sql = `
      INSERT INTO ${TABLE} (
        id, name, position, secondary_role, department, organization,
        bio, photo, contact_phone, contact_website, contact_email,
        issued, expires, social_links, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(6), NOW(6))
      ON DUPLICATE KEY UPDATE
        name = VALUES(name),
        position = VALUES(position),
        secondary_role = VALUES(secondary_role),
        department = VALUES(department),
        organization = VALUES(organization),
        bio = VALUES(bio),
        photo = COALESCE(VALUES(photo), photo),
        contact_phone = VALUES(contact_phone),
        contact_website = VALUES(contact_website),
        contact_email = VALUES(contact_email),
        issued = VALUES(issued),
        expires = VALUES(expires),
        social_links = VALUES(social_links),
        updated_at = NOW(6)
    `;
  } else {
    sql = `
      INSERT INTO ${TABLE} (
        id, name, position, secondary_role, department, organization,
        bio, photo, contact_phone, contact_website, contact_email,
        issued, expires, social_links, created_at, updated_at
      )
      VALUES (
        ${placeholder(1)}, ${placeholder(2)}, ${placeholder(3)}, ${placeholder(4)}, ${placeholder(5)}, ${placeholder(6)},
        ${placeholder(7)}, ${placeholder(8)}, ${placeholder(9)}, ${placeholder(10)}, ${placeholder(11)},
        ${placeholder(12)}, ${placeholder(13)}, ${placeholder(14)},
        COALESCE((SELECT created_at FROM ${TABLE} WHERE id = ${placeholder(1)}), NOW()),
        NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        position = EXCLUDED.position,
        secondary_role = EXCLUDED.secondary_role,
        department = EXCLUDED.department,
        organization = EXCLUDED.organization,
        bio = EXCLUDED.bio,
        photo = COALESCE(EXCLUDED.photo, ${TABLE}.photo),
        contact_phone = EXCLUDED.contact_phone,
        contact_website = EXCLUDED.contact_website,
        contact_email = EXCLUDED.contact_email,
        issued = EXCLUDED.issued,
        expires = EXCLUDED.expires,
        social_links = EXCLUDED.social_links,
        updated_at = NOW()
      RETURNING *
    `;
  }

  const res = await query(sql, values);
  return rowToRecord(res.rows[0]);
}

export async function resetToSeed() {
  const sql = `DELETE FROM ${TABLE} WHERE id = ${placeholder(1)}`;
  await query(sql, [FIXED_ID]);
}

export function getSeedRecord() {
  return {
    id: FIXED_ID,
    ...SEED,
    photo: null,
    background: null,
    logo: null,
    contact: {
      phone: SEED.contact_phone,
      website: SEED.contact_website,
      email: SEED.contact_email,
    },
  };
}

export async function findOneByUserId(userId) {
  const sql = `SELECT * FROM ${TABLE} WHERE user_id = ${placeholder(1)} LIMIT 1`;
  const res = await query(sql, [userId]);
  if (res.rowCount === 0) {
    return null;
  }
  return rowToRecord(res.rows[0]);
}

export async function findOneById(id) {
  const sql = `SELECT * FROM ${TABLE} WHERE id = ${placeholder(1)}`;
  const res = await query(sql, [id]);
  if (res.rowCount === 0) {
    return null;
  }
  return rowToRecord(res.rows[0]);
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Create or update the Digital ID that belongs to `userId`.
 *
 * Written as look-up-then-UPDATE/INSERT instead of ON CONFLICT /
 * ON DUPLICATE KEY so it does not depend on a unique index over
 * user_id (the migrations do not create one) and behaves the same on
 * PostgreSQL and MySQL. Notes:
 *  - social_links is always sent as a JSON string (a raw JS array is
 *    turned into a Postgres array literal by `pg`, which JSONB rejects).
 *  - empty dates are never sent ('' is not a valid DATE): UPDATE keeps
 *    the stored value, INSERT falls back to today.
 *  - photo/logo are only written when a new file was uploaded.
 */
export async function upsertForUser(userId, data, photoBuffer = null, _backgroundBuffer = null, logoBuffer = null) {
  const text = {
    id_number: data.id_number ?? '',
    name: data.name ?? '',
    position: data.position ?? '',
    secondary_role: data.secondary_role ?? '',
    department: data.department ?? '',
    organization: data.organization ?? '',
    bio: data.bio ?? '',
    address: data.address ?? '',
    contact_phone: data.contact_phone ?? '',
    contact_website: data.contact_website ?? '',
    contact_email: data.contact_email ?? '',
    social_links: JSON.stringify(data.social_links ?? SEED.social_links),
  };
  const issued = data.issued || null;
  const expires = data.expires || null;
  const now = driver === 'mysql' ? 'NOW(6)' : 'NOW()';

  const existing = await query(`SELECT id FROM ${TABLE} WHERE user_id = ${placeholder(1)} LIMIT 1`, [userId]);

  const values = [];
  const bind = (value) => {
    values.push(value);
    return placeholder(values.length);
  };

  if (existing.rowCount > 0) {
    const sets = Object.entries(text).map(([column, value]) => `${column} = ${bind(value)}`);
    for (const [column, value] of [
      ['issued', issued],
      ['expires', expires],
      ['photo', photoBuffer],
      ['logo', logoBuffer],
    ]) {
      sets.push(`${column} = COALESCE(${bind(value)}, ${column})`);
    }
    const where = bind(userId);
    await query(`UPDATE ${TABLE} SET ${sets.join(', ')}, updated_at = ${now} WHERE user_id = ${where}`, values);
  } else {
    const columns = {
      id: driver === 'mysql' ? randomUUID() : String(userId),
      user_id: userId,
      ...text,
      issued: issued ?? today(),
      expires: expires ?? today(),
      photo: photoBuffer,
      logo: logoBuffer,
    };
    const names = Object.keys(columns);
    const marks = names.map((name) => bind(columns[name]));
    await query(
      `INSERT INTO ${TABLE} (${names.join(', ')}, created_at, updated_at) VALUES (${marks.join(', ')}, ${now}, ${now})`,
      values,
    );
  }

  return findOneByUserId(userId);
}

export async function resetToSeedForUser(userId) {
  const sql = `DELETE FROM ${TABLE} WHERE user_id = ${placeholder(1)}`;
  await query(sql, [userId]);
}

export async function getAllDigitalIds() {
  const sql = `
    SELECT d.*, u.username, u.email, u.role, u.full_name
    FROM ${TABLE} d
    LEFT JOIN users u ON d.user_id = u.id
    ORDER BY d.created_at ASC
  `;
  const res = await query(sql);
  return res.rows.map((row) => ({
    ...rowToRecord(row),
    owner: {
      username: row.username,
      email: row.email,
      role: row.role,
      full_name: row.full_name,
    },
  }));
}