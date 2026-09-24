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

export async function upsertForUser(userId, data, photoBuffer = null, backgroundBuffer = null, logoBuffer = null) {
  const id = driver === 'mysql' ? require('crypto').randomUUID() : undefined;
  const values = [
    id ?? userId,
    userId,
    data.name ?? '',
    data.position ?? '',
    data.secondary_role ?? '',
    data.department ?? '',
    data.organization ?? '',
    data.bio ?? '',
    photoBuffer,
    backgroundBuffer,
    logoBuffer,
    data.contact_phone ?? '',
    data.contact_website ?? '',
    data.contact_email ?? '',
    data.issued ?? SEED.issued,
    data.expires ?? SEED.expires,
    data.social_links ?? SEED.social_links,
    data.id_number ?? '',
  ];

  let sql;
  if (driver === 'mysql') {
    sql = `
      INSERT INTO ${TABLE} (
        id, user_id, name, position, secondary_role, department, organization,
        bio, photo, background, logo, contact_phone, contact_website, contact_email,
        issued, expires, social_links, id_number, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(6), NOW(6))
      ON DUPLICATE KEY UPDATE
        name = VALUES(name),
        position = VALUES(position),
        secondary_role = VALUES(secondary_role),
        department = VALUES(department),
        organization = VALUES(organization),
        bio = VALUES(bio),
        photo = COALESCE(VALUES(photo), photo),
        background = COALESCE(VALUES(background), background),
        logo = COALESCE(VALUES(logo), logo),
        contact_phone = VALUES(contact_phone),
        contact_website = VALUES(contact_website),
        contact_email = VALUES(contact_email),
        issued = VALUES(issued),
        expires = VALUES(expires),
        social_links = VALUES(social_links),
        id_number = VALUES(id_number),
        updated_at = NOW(6)
    `;
  } else {
    sql = `
      INSERT INTO ${TABLE} (
        id, user_id, name, position, secondary_role, department, organization,
        bio, photo, background, logo, contact_phone, contact_website, contact_email,
        issued, expires, social_links, id_number, created_at, updated_at
      )
      VALUES (
        ${placeholder(1)}, ${placeholder(2)}, ${placeholder(3)}, ${placeholder(4)}, ${placeholder(5)}, ${placeholder(6)},
        ${placeholder(7)}, ${placeholder(8)}, ${placeholder(9)}, ${placeholder(10)}, ${placeholder(11)}, ${placeholder(12)}, ${placeholder(13)}, ${placeholder(14)},
        ${placeholder(15)}, ${placeholder(16)}, ${placeholder(17)}, ${placeholder(18)},
        COALESCE((SELECT created_at FROM ${TABLE} WHERE user_id = ${placeholder(2)}), NOW()),
        NOW()
      )
      ON CONFLICT (user_id) DO UPDATE SET
        name = EXCLUDED.name,
        position = EXCLUDED.position,
        secondary_role = EXCLUDED.secondary_role,
        department = EXCLUDED.department,
        organization = EXCLUDED.organization,
        bio = EXCLUDED.bio,
        photo = COALESCE(EXCLUDED.photo, ${TABLE}.photo),
        background = COALESCE(EXCLUDED.background, ${TABLE}.background),
        logo = COALESCE(EXCLUDED.logo, ${TABLE}.logo),
        contact_phone = EXCLUDED.contact_phone,
        contact_website = EXCLUDED.contact_website,
        contact_email = EXCLUDED.contact_email,
        issued = EXCLUDED.issued,
        expires = EXCLUDED.expires,
        social_links = EXCLUDED.social_links,
        id_number = EXCLUDED.id_number,
        updated_at = NOW()
      RETURNING *
    `;
  }

  const res = await query(sql, values);
  return rowToRecord(res.rows[0]);
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
