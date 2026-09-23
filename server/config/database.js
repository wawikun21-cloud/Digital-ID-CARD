import pg from 'pg';
import mysql from 'mysql2/promise';

const env = process.env.NODE_ENV || 'development';

function resolveDriver() {
  if (env === 'production') {
    if (process.env.DATABASE_URL) return 'pg';
    throw new Error('DATABASE_URL is required in production');
  }
  if (process.env.DB_DRIVER) return process.env.DB_DRIVER;
  return 'mysql';
}

const driver = resolveDriver();

let pool;
if (driver === 'mysql') {
  pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'digital_id_card',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });
} else {
  const { Pool } = pg;
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
}

pool.on('error', (err) => {
  console.error('Unexpected database error', err);
});

function isUnknownDatabaseError(err) {
  return !!err.code && err.code === 'ER_BAD_DB_ERROR';
}

async function createDatabaseIfMissing() {
  if (driver !== 'mysql') return;

  const dbName = process.env.DB_NAME || 'digital_id_card';

  try {
    await pool.query('SELECT 1');
    return;
  } catch (err) {
    if (!isUnknownDatabaseError(err)) {
      throw err;
    }
  }

  console.log(`Database '${dbName}' not found. Creating it now...`);

  const tempPool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    waitForConnections: true,
    connectionLimit: 1,
    queueLimit: 0,
  });

  try {
    await tempPool.query(`CREATE DATABASE ?? CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`, [dbName]);
    console.log(`Database '${dbName}' created successfully.`);
  } finally {
    await tempPool.end();
  }
}

export async function query(text, params) {
  const start = Date.now();

  let res;
  if (driver === 'mysql') {
    const [rows] = await pool.execute(text, params);
    res = {
      rows,
      rowCount: Array.isArray(rows) ? rows.length : 0,
    };
  } else {
    res = await pool.query(text, params);
  }

  const duration = Date.now() - start;
  if (duration > 1000) {
    console.log('Slow query', { text, duration });
  }
  return res;
}

export async function getClient() {
  if (driver === 'mysql') {
    return pool.getConnection();
  }
  return pool.connect();
}

export { pool, createDatabaseIfMissing, driver };
export default pool;
