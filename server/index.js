import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const nodeEnv = process.env.NODE_ENV || 'development';
const envPath = nodeEnv === 'production'
  ? path.join(__dirname, '.env.production')
  : path.join(__dirname, '.env.development');
dotenv.config({ path: envPath });

import digitalIdRoutes from './features/digital-id/routes/digital-id.js';
import authRoutes from './features/auth/routes/auth.js';
import adminRoutes from './features/auth/routes/admin.js';
import { query, createDatabaseIfMissing, driver } from './config/database.js';
import runMigration001 from './migrations/001-create-digital-id.js';
import runMigration001Mysql from './migrations/001-create-digital-id-mysql.js';
import runMigration002 from './migrations/002-create-users.js';
import runMigration002Mysql from './migrations/002-create-users-mysql.js';
import runMigration003 from './migrations/003-add-id-number.js';
import runMigration003Mysql from './migrations/003-add-id-number-mysql.js';
import runMigration004 from './migrations/004-add-website-link.js';
import runMigration004Mysql from './migrations/004-add-website-link-mysql.js';
const env = process.env.NODE_ENV || 'development';
const PORT = process.env.PORT || 5000;

const app = express();

app.use(helmet());
app.use(cors());
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/digital-id', digitalIdRoutes);

app.use(express.static(path.join(__dirname, '..', 'dist')));

app.get('/verify/:id', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
});

function validateEnv() {
  const missing = [];

  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    missing.push('JWT_SECRET (min 32 chars)');
  }

  if (env === 'production' && !process.env.DATABASE_URL) {
    missing.push('DATABASE_URL');
  }

  if (missing.length > 0) {
    console.error('Missing required environment variables:', missing.join(', '));
    process.exit(1);
  }
}

async function start() {
  try {
    validateEnv();
    await createDatabaseIfMissing();
    await query('SELECT NOW()');
    console.log(`Database connection established (${env} mode)`);

    if (process.env.RUN_MIGRATIONS !== 'false') {
      if (driver === 'mysql') {
        await runMigration001Mysql();
        await runMigration002Mysql();
        await runMigration003Mysql();
        await runMigration004Mysql();
      } else {
        await runMigration001();
        await runMigration002();
        await runMigration003();
        await runMigration004();
      }
    } else {
      console.log('Migrations skipped because RUN_MIGRATIONS=false');
    }

    app.listen(PORT, () => {
      console.log(`Server listening on http://localhost:${PORT}`);
      console.log(`Environment: ${env}`);
    });
  } catch (err) {
    console.error('Failed to connect to database', err);
    process.exit(1);
  }
}

start();