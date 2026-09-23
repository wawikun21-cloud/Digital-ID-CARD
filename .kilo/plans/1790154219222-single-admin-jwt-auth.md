# Auth Implementation Plan — Multi-User Company Digital ID Tool

## Recommendation
**Multi-user architecture** — each employee gets their own digital ID card, managed through a role-based system (admin + user). This is the only design that matches your confirmed requirements: multiple employees, separate cards per person, admin-created accounts, no external signup.

---

## Architecture

### Users & Roles
- **Admin**: Seeded from env vars at startup. Creates/manages users. Views/manages all digital IDs.
- **User**: Created by admin. Manages only their own digital ID.
- **No external signup** — zero public account-creation endpoints.

### Token Strategy
- **JWT + httpOnly cookie** (sameSite: strict) — stateless, scales horizontally, no session store
- Fallback `Authorization: Bearer` header for non-browser clients
- Payload: `{ sub: <user_id>, role: "admin|user", iat, exp }`
- 24h expiry (configurable via `JWT_EXPIRY`)

### Security
- bcrypt cost 12 for password hashing
- `JWT_SECRET` min 32 chars; server fails closed if missing/short in production
- Rate limiting: 5 failed login attempts per 15 min per IP (in-memory; Redis for production)
- No password reset (env var rotation only)
- `helmet` already enabled — keep it

---

## Data Model Changes

### New: `users` table
```sql
-- PostgreSQL
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  full_name TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- MySQL
CREATE TABLE IF NOT EXISTS users (
  id CHAR(36) PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'user',
  full_name TEXT NOT NULL DEFAULT '',
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
);
```

### Modified: `digital_ids` table
```sql
-- Add ownership column
ALTER TABLE digital_ids ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE CASCADE;

-- Link existing seed record to admin
UPDATE digital_ids SET user_id = (SELECT id FROM users WHERE role = 'admin' LIMIT 1)
WHERE id = 'CIT-2026-0001' AND user_id IS NULL;
```

---

## Field-Level Permissions
Digital ID fields are split into two tiers to enforce company branding control:

| Field | Editable By | Notes |
|-------|-------------|-------|
| `background` (image/color) | Admin only | Company branding, cannot be changed by users |
| `logo` (image) | Admin only | Company logo, cannot be changed by users |
| `name` (full_name) | User + Admin | Employee's full name |
| `position` | User + Admin | Job title/role |
| `motto/quote` (bio) | User + Admin | Personal motto or quote |
| `social_links` | User + Admin | Social media URLs |
| `QR code` | Auto-generated | Generated from digital ID data/URL; users do not edit the QR image directly, but the underlying data (name, position, etc.) that populates it is user-editable |

### Backend Enforcement
- When a non-admin user sends a `PUT /api/digital-id` request, the server **strips out** `background` and `logo` fields from the payload before saving. Any attempt to modify these fields is silently ignored.
- Admin users can update all fields for any user's digital ID via `/api/admin/digital-id/:userId`.
- `GET` responses return all fields regardless of requester role (users can view the admin-set background/logo, just not modify them).

---

## API Routes

### Public
- `POST /api/auth/login` — authenticate, return JWT cookie

### Authenticated
- `POST /api/auth/logout` — clear cookie
- `GET /api/auth/me` — current user info
- `GET /api/digital-id` — own digital ID (create seed if missing, returns all fields)
- `PUT /api/digital-id` — update own digital ID (user-editable fields only; admin-only fields stripped)
- `DELETE /api/digital-id` — reset own digital ID to seed defaults

### Admin Only
- `POST /api/auth/users` — create user
- `GET /api/auth/users` — list all users
- `PUT /api/auth/users/:id` — update user
- `DELETE /api/auth/users/:id` — delete user
- `GET /api/admin/digital-id` — all digital IDs with owner info
- `PUT /api/admin/digital-id/:userId` — update any user's ID (all fields allowed)
- `DELETE /api/admin/digital-id/:userId` — delete any user's ID

### Public (no auth)
- `GET /verify/:id` — public verification page

---

## Implementation Tasks

### 1. Dependencies
- Add `bcrypt` and `jsonwebtoken` to `package.json`

### 2. Server — Auth Service
- `server/features/auth/auth.service.js`
  - `hashPassword(password)` → bcrypt hash (cost 12)
  - `comparePassword(password, hash)` → boolean
  - `generateToken(user)` → JWT signed with `JWT_SECRET`
  - `verifyToken(token)` → payload or throw

### 3. Server — Auth Middleware
- Replace `server/middleware/auth.js` stub
- Extract token from `req.cookies` or `Authorization` header
- Verify token, attach `req.user = { id, role, username }`
- Return 401 on invalid/expired token

### 4. Server — Role Middleware
- `server/features/auth/middleware/requireRole.js`
- Factory: `requireRole('admin')` → 403 if `req.user.role !== 'admin'`

### 5. Server — Auth Controller & Routes
- `server/features/auth/controllers/authController.js`
  - `loginHandler` — find user, bcrypt.compare, generate token, set cookie
  - `logoutHandler` — clear cookie
  - `meHandler` — return `{ id, username, email, role, full_name }`
  - User CRUD handlers (admin only)
- `server/features/auth/routes/auth.js`
  - Public: `/login`, `/logout`, `/me`
  - Admin: `/users` CRUD
- `server/features/auth/routes/admin.js`
  - Admin-only digital ID bulk management

### 6. Server — Update Digital ID Routes
- `server/features/digital-id/controllers/digitalIdController.js`
  - Scope `GET/PUT/DELETE /api/digital-id` to `req.user.id`
  - Create seed digital ID for new users if missing
  - **Field filtering**: In `normalizeBody` or a new middleware, strip `background` and `logo` from request body if `req.user.role !== 'admin'` before saving
  - Admin routes (`/api/admin/digital-id/:userId`) allow all fields
- `server/features/digital-id/routes/digital-id.js`
  - Keep `authMiddleware` (already applied)
- `server/features/auth/routes/admin.js`
  - Add admin-only digital ID management routes with full field access

### 7. Server — Migrations
- `server/migrations/002-create-users.js` (PostgreSQL)
- `server/migrations/002-create-users-mysql.js` (MySQL)
  - Create `users` table
  - Seed admin from env vars if not exists
  - Add `user_id` to `digital_ids`
  - Link existing seed record to admin

### 8. Server — Bootstrap
- `server/index.js`
  - Wire auth routes (`/api/auth/*`, `/api/admin/*`)
  - Validate required env vars on startup
  - Run migration 002

### 9. Server — Cleanup
- Delete `server/app/auth.js` (duplicate stub)

### 10. Client — Auth Context
- `client/src/features/auth/AuthContext.jsx` — React context with `user`, `isAuthenticated`, `login`, `logout`
- `client/src/features/auth/AuthProvider.jsx` — wrap app, check session on mount via `/api/auth/me`

### 11. Client — Login Page
- `client/src/features/auth/pages/LoginPage.jsx` — username + password form

### 12. Client — Admin Dashboard
- `client/src/features/auth/pages/AdminDashboard.jsx` — user management UI (admin only)

### 13. Client — Auth Service
- `client/src/features/auth/services/authService.js` — `login`, `logout`, `me`, user CRUD

### 14. Client — App Routing
- `client/src/App.jsx` — wrap in `AuthProvider`, add `/login` route, protect `/` and `/verify/:id`
- Redirect unauthenticated users to `/login`
- Show admin dashboard only for `role === 'admin'`

### Client — Digital ID Service Update
- `client/src/features/digital-id/services/digitalIdService.js` — include credentials automatically

### 16. Client — Field-Level UI Enforcement
- `client/src/features/digital-id/pages/DigitalIdPage.jsx` and form components
  - Hide/disable background color/image picker and logo upload controls when `user.role !== 'admin'`
  - Show full edit form for all user-editable fields (name, position, motto, social links) for all authenticated users
  - QR code is auto-generated from digital ID data; no direct edit control needed

---

## Environment Variables

| Variable | Required (Prod) | Dev Default | Notes |
|----------|-----------------|-------------|-------|
| `ADMIN_USERNAME` | ✅ | `admin` | Fail closed if absent |
| `ADMIN_PASSWORD` | ✅ | `admin123` | Fail closed if absent |
| `ADMIN_EMAIL` | ✅ | `admin@company.local` | Fail closed if absent |
| `JWT_SECRET` | ✅ | — | Min 32 chars, fail closed if short |
| `JWT_EXPIRY` | ❌ | `24h` | Configurable token lifetime |

---

## Error Responses
```json
{ "error": "Authentication required." }              // 401
{ "error": "Invalid username or password." }         // 401
{ "error": "Token has expired." }                    // 401
{ "error": "Invalid token." }                        // 401
{ "error": "Admin access required." }                // 403
{ "error": "Too many login attempts. Try later." }   // 429
{ "error": "User not found." }                       // 404
{ "error": "Username already exists." }              // 409
{ "error": "Email already exists." }                 // 409
```

---

## Migration Rollout
1. `npm install bcrypt jsonwebtoken`
2. Run `node server/migrations/002-create-users-mysql.js` (MySQL) or Postgres variant
3. Set env vars on server
4. Restart — admin seeded, existing digital ID linked
5. Build and deploy client

No data loss — existing seed record preserved and linked to admin.

---

## Validation Checklist
- [ ] Server fails to start without required env vars in production
- [ ] Login with wrong credentials returns 401
- [ ] Admin login returns 200 + cookie + `role: "admin"`
- [ ] Admin can create user via `POST /api/auth/users`
- [ ] Created user can log in and gets `role: "user"`
- [ ] User can access only their own digital ID
- [ ] User cannot access admin routes (403)
- [ ] Admin can access all admin routes
- [ ] User `PUT /api/digital-id` with `background`/`logo` fields silently ignores those fields (does not save)
- [ ] Admin `PUT /api/admin/digital-id/:userId` with `background`/`logo` fields saves successfully
- [ ] User `GET /api/digital-id` returns `background` and `logo` (read-only for users)
- [ ] 6th failed login within 15 min returns 429
- [ ] Client redirects unauthenticated users to `/login`
- [ ] Admin dashboard visible only for admins
- [ ] Client hides background/logo edit controls for non-admin users
- [ ] `verify/:id` stays public

---

## Out of Scope
- Password reset / forgot password
- Email verification
- Refresh tokens
- Audit logging
- OAuth / SSO
- Multi-tenant organization isolation

---

## Why Multi-User Over Single-Admin
- **Fits your requirement**: "employee get their own separate digital ID card"
- **Scalable**: Adding employees = admin creates account, no schema changes
- **Secure**: Role-based access ensures users see only their own data
- **Simple**: No public signup, admin-controlled, minimal attack surface
- **Future-proof**: Easy to add features like password reset, email invites, etc.

Single-admin would require reworking the entire data model later when you add more users. Multi-user from the start avoids that migration.
