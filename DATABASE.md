# Database Setup

## Quick Start

1. Choose your database: **WAMPserver/MariaDB** (local dev) or **Hostinger/PostgreSQL** (production).
2. Set `NODE_ENV` in `server/.env`.
3. Fill in the matching connection block.
4. Run `npm run migrate` (PostgreSQL) or `npm run migrate:mysql` (MariaDB/MySQL).

## server/.env (development)

```env
NODE_ENV=development
PORT=3000
RUN_MIGRATIONS=true

# Development database (WAMPserver / MariaDB)
DB_DRIVER=mysql
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=digital_id_card
```

## server/.env (production)

```env
NODE_ENV=production
PORT=3000
RUN_MIGRATIONS=true

# Production database (Hostinger - PostgreSQL)
DATABASE_URL=postgres://USER:PASSWORD@HOST:PORT/DATABASE_NAME
```

## Skipping Migrations

To skip migrations without removing them from your deployment workflow, set:

```env
RUN_MIGRATIONS=false
```

This is useful for:
- Deploying to Hostinger after the database is already set up
- Running `npm run migrate` in CI/CD pipelines where migrations are handled separately

## Option A: Local MariaDB/MySQL (WAMPserver)

1. Open **phpMyAdmin** (usually at `http://localhost/phpmyadmin`) or use MySQL CLI.
2. Create a database named `digital_id_card`:
   ```sql
   CREATE DATABASE digital_id_card CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
3. In `server/.env`, use the **development** config above.
4. Run the MySQL migration:
   ```bash
   npm run migrate:mysql
   ```

## Option B: Local PostgreSQL

If you have PostgreSQL installed locally:

1. Create a database:
   ```bash
   createdb digital_id_card
   ```
   Or via SQL:
   ```sql
   CREATE DATABASE digital_id_card;
   ```

2. In `server/.env`, add a production-style `DATABASE_URL` or keep the default PostgreSQL block and run:
   ```bash
   npm run migrate
   ```

## Option C: Hostinger (Production - PostgreSQL)

1. In Hostinger **Hosting → Databases**, create a new PostgreSQL database.
2. Note the connection details: host, port, database name, username, password.
3. In Hostinger **Hosting → Node.js App**, set environment variables:
   - `NODE_ENV=production`
   - `DATABASE_URL` = `postgres://USER:PASSWORD@HOST:PORT/DATABASE_NAME`
   - `PORT` = your app port (Hostinger often sets this automatically)
4. Deploy your code.
5. Run the migration:
   ```bash
   npm run migrate
   ```

## Verify

```bash
# Start the server
npm run server

# Should output the seed record as JSON
curl http://localhost:3000/api/digital-id
```

Expected response:
```json
{
  "id": "CIT-2026-0001",
  "name": "Benneth A. Aloyon, MIT",
  ...
}
```

## Reset

To reset the database back to seed data:
```bash
curl -X DELETE http://localhost:3000/api/digital-id
```

Then run migrate again if needed, or simply fetch to re-seed:
```bash
curl http://localhost:3000/api/digital-id
```
