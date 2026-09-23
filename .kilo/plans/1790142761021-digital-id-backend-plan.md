# Digital ID Backend Plan

## Goal
Add a Node.js/Express backend to `digital-id-card` that stores the Digital ID record in a remote PostgreSQL database (Hostinger), with the profile photo persisted as a BYTEA BLOB. The Express server will serve both the API and the built Vite frontend from `dist/`.

## Scope
Only the **Digital ID** feature. The provided large folder tree is noted, but this repo currently needs only the `digital-id` slice plus shared infrastructure. Other feature folders are out of scope.

## Target Folder Structure (minimal, aligned with user's requested pattern)
```
server/
  app/
    auth.js
  config/
    database.js
    uploads.js
  features/
    digital-id/
      controllers/
        digitalIdController.js
      middleware/
        upload.js
      models/
        digitalIdModel.js
      routes/
        digital-id.js
      services/
        digitalIdService.js
      validators/
        digitalIdValidator.js
  middleware/
    auth.js
  migrations/
    001-create-digital-id.js
  utils/
    activityMeta.js
  .env.example
  package.json
  server.js
```

## Data Model
**Table:** `digital_ids`

| Column | Type | Notes |
|--------|------|-------|
| `id` | `text` PRIMARY KEY | e.g. `CIT-2026-0001` |
| `name` | `text` | |
| `position` | `text` | |
| `secondary_role` | `text` | |
| `department` | `text` | |
| `organization` | `text` | |
| `bio` | `text` | |
| `photo` | `bytea` | JPEG bytes, null = use default |
| `contact_phone` | `text` | |
| `contact_website` | `text` | |
| `contact_email` | `text` | |
| `issued` | `date` | |
| `expires` | `date` | |
| `created_at` | `timestamptz` | |
| `updated_at` | `timestamptz` | |

`social_links` are stored as a **JSONB** array on the same row to keep this single-tenant app simple:
```json
[
  { "id": "social-seed-1", "url": "https://www.facebook.com/iamdeanbaa" }
]
```

## API Contract
Base path: `/api/digital-id`

| Method | Path | Body / Query | Response | Notes |
|--------|------|--------------|----------|-------|
| `GET` | `/` | — | `{ ...digitalId, photo: base64String \| null }` | Returns the single record. |
| `PUT` | `/` | JSON fields + optional `photo` as `multipart/form-data` | `{ ...digitalId }` | Creates or updates. If a `photo` file field is present, overwrite the BYTEA. |
| `DELETE` | `/` | — | `204 No Content` | Clears saved edits so the seed data returns on next fetch. |

Public verification endpoint (no auth):
| Method | Path | Response |
|--------|------|----------|
| `GET` | `/verify/:id` | Same shape as `GET /`, served from built frontend when hitting `/` but accessible at this path for QR scans. |

Frontend base URL is derived from the request host; no hardcoded domain needed for QR generation.

## Frontend Changes
- `src/features/digital-id/services/digitalIdService.js` — replace localStorage with:
  - `fetchDigitalId()` → `GET /api/digital-id/`
  - `saveDigitalId(digitalId)` → `PUT /api/digital-id/` with `FormData` when `digitalId.photo` is a data URL
  - `clearStoredDigitalId()` → `DELETE /api/digital-id/`
  - `getDefaultDigitalId()` → returns the same local seed object
- Remove direct `localStorage` reads/writes from the service layer.
- The rest of the React code (`DigitalIdPage`, `useDigitalIdForm`, `ProfilePhotoField`) stays unchanged.

## Server Setup
- **Express** with `cors`, `helmet`, `express.json()`, `multer` for multipart.
- **PostgreSQL** via `pg` (or `postgres`). Connection from `config/database.js` using `DATABASE_URL`.
- **Migrations**: simple JS files in `migrations/` run via `node -e "require('./migrations/001-create-digital-id')"` or a small runner.
- **Static frontend**: `app.use(express.static('dist'))` with a catch-all `index.html` rewrite for SPA routing.
- **Hostinger-ready**: single `server.js` entry, `node server.js` in `package.json`, `.env.example` for `DATABASE_URL`, `PORT`.

## Photo Upload Flow
1. Frontend sends `multipart/form-data` to `PUT /api/digital-id/`.
2. Server uses `multer` with `memoryStorage()`.
3. Controller validates the file is an image, converts buffer to `Buffer`.
4. SQL: `UPDATE digital_ids SET photo = $1, updated_at = NOW() WHERE id = 'CIT-2026-0001'`.
5. Response includes the photo as a base64 string so the card `<img src=...>` works immediately.

## Database Migration
Run once on deploy:
```sql
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

INSERT INTO digital_ids (id, name, position, secondary_role, department, organization)
VALUES ('CIT-2026-0001', 'Benneth A. Aloyon, MIT', 'Dean, College of Information Technology', 'Founder, BAA Digital Marketing Services', 'College of Information Technology', 'BAA Digital')
ON CONFLICT (id) DO NOTHING;
```

## Deployment Notes (Hostinger)
- Build frontend with `npm run build` → `dist/`
- Deploy `dist/` + `server/` to Hostinger Node.js hosting
- Set `DATABASE_URL` in Hostinger environment variables
- Start command: `node server.js`
- Ensure Hostinger allows `multipart/form-data` uploads and PostgreSQL connections

## Open Questions / Assumptions
- **Auth:** none for now. Digital ID is public-read, public-edit. Add auth later if needed.
- **Single record assumption:** app manages exactly one Digital ID. `id` is client-supplied in the seed but treated as fixed after first insert.
- **Photo size limit:** reuse `MAX_UPLOAD_BYTES = 8MB` from frontend; enforce same limit server-side via `multer` `fileFilter` + `limits`.
- **CORS:** not needed if server serves frontend from same origin.

## Validation Plan
1. `node server.js` locally with `DATABASE_URL` pointing at a local/test Postgres.
2. `curl -X PUT http://localhost:3000/api/digital-id -F "name=Test"` → 200, record created.
3. `curl http://localhost:3000/api/digital-id` → 200 with JSON, photo as base64 when set.
4. Upload an image via `-F "photo=@photo.jpg"` → photo stored as BYTEA, returned as base64.
5. `curl -X DELETE http://localhost:3000/api/digital-id` → 204, next GET returns seed defaults.
6. Frontend `npm run build`, serve from Express, navigate to `/verify/CIT-2026-0001` → public read-only page loads without 404.
