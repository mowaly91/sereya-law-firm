# Sereya Law Firm – Backend Runbook

> **Stack:** Node.js · Express · PostgreSQL · node-pg-migrate

---

## Table of Contents

1. [Quick Start (Development)](#1-quick-start-development)
2. [Environment Variables Reference](#2-environment-variables-reference)
3. [Database Migrations](#3-database-migrations)
4. [Admin Bootstrap](#4-admin-bootstrap)
5. [Role Normalization](#5-role-normalization)
6. [Scripts Reference](#6-scripts-reference)
7. [Production Checklist](#7-production-checklist)
8. [Startup Validation Behavior](#8-startup-validation-behavior)
9. [Feature Flags](#9-feature-flags)
10. [Google Sheets / Drive Integration](#10-google-sheets--drive-integration)
11. [Secrets Hygiene](#11-secrets-hygiene)

---

## 1. Quick Start (Development)

```bash
# 1. Copy the example env file and fill in your local values
cp server/.env.example server/.env

# 2. Install backend dependencies
cd server && npm install

# 3. Run pending migrations
npm run migrate:up

# 4. (First run only) Seed an initial super-admin
INIT_ADMIN_EMAIL=you@example.com \
INIT_ADMIN_PASSWORD=ChangeMe123! \
npm run db:seed:admin

# 5. Start the server
npm start
```

The backend listens on `http://localhost:3000` by default.

---

## 2. Environment Variables Reference

Copy `server/.env.example` to `server/.env` for local development.  
For production, set these as **secure environment variables** in your hosting platform (Render, Railway, Heroku, etc.) — never commit real values.

### Runtime

| Variable | Required in Prod | Default | Description |
|---|---|---|---|
| `NODE_ENV` | ✅ | `development` | Set to `production` in hosting environments. |
| `PORT` | ❌ | `3000` | TCP port Express listens on. |
| `FRONTEND_URL` | ❌ | `http://localhost:5173` | Comma-separated list of allowed CORS origins. |

### Database

| Variable | Required in Prod | Description |
|---|---|---|
| `DATABASE_URL` | ✅ **Required** | Full PostgreSQL connection string, e.g. `postgres://user:pass@host:5432/db?sslmode=require`. The server will **exit immediately** if this is missing in production. |

### Authentication

| Variable | Required in Prod | Description |
|---|---|---|
| `JWT_SECRET` | ✅ **Required** | Random secret (≥ 32 chars) used to sign JWTs. Generate with: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`. The server will **exit immediately** if this is missing in production. |

### Role-Based Access Control

| Variable | Required in Prod | Default | Description |
|---|---|---|---|
| `RBAC_STRICT_ADMIN` | ❌ | `true` | When `"true"`, only the canonical lowercase `admin` role has super-admin access. Set to `"false"` only during legacy-role migration; remove after running `normalizeAdmins`. |

### Feature Flags

| Variable | Required in Prod | Default | Description |
|---|---|---|---|
| `FEATURE_DRIVE_OCR` | ❌ | `false` | Enable Google Drive OCR scanning (`GET /api/scan-drive-pdfs`, `GET /api/sync-drive`). Endpoints return `404` when `false`. |

### Google Integration (Sheets & Drive)

| Variable | Required in Prod | Description |
|---|---|---|
| `GOOGLE_SHEETS_CREDENTIALS` | ✅ **Required** (one of these two) | Inline JSON string of a Google service-account credentials blob. **Preferred** for cloud platforms. |
| `GOOGLE_CREDENTIALS` | ✅ **Required** (one of these two) | Alias for `GOOGLE_SHEETS_CREDENTIALS` accepted by some internal helpers. |
| `GOOGLE_APPLICATION_CREDENTIALS` | ❌ optional | Filesystem path to a service-account JSON file (Google ADC). Required when `FEATURE_DRIVE_OCR=true`. |

> **Note:** At least one of `GOOGLE_SHEETS_CREDENTIALS` or `GOOGLE_CREDENTIALS` must be set in production — the server will **exit immediately** if both are absent. `GOOGLE_APPLICATION_CREDENTIALS` is only needed for the Drive OCR feature flag.

### Admin Bootstrap (one-time use)

| Variable | Required | Description |
|---|---|---|
| `INIT_ADMIN_EMAIL` | ✅ (for seed) | Email of the initial super-admin. Consumed only by `npm run db:seed:admin`. |
| `INIT_ADMIN_PASSWORD` | ✅ (for seed) | Plain-text initial password. Hashed with bcrypt before storage. |

---

## 3. Database Migrations

Migrations live in `server/migrations/` and are managed by **node-pg-migrate**.

| Command | Description |
|---|---|
| `npm run migrate:up` | Apply all pending migrations. Safe to run multiple times (idempotent). |
| `npm run migrate:down` | Roll back the most recent migration batch. |
| `npm run migrate` | Raw `node-pg-migrate` CLI — pass extra flags as needed. |

> **Production tip:** Always run `migrate:up` before deploying new code that depends on schema changes.

### Example

```bash
# Apply migrations against a production DB
DATABASE_URL="postgres://..." npm run migrate:up
```

---

## 4. Admin Bootstrap

The `db:seed:admin` script creates the first super-admin user.  
It **skips** silently if any users already exist (idempotent).

```bash
INIT_ADMIN_EMAIL=admin@sereya.com \
INIT_ADMIN_PASSWORD=StrongP@ssw0rd! \
npm run db:seed:admin
```

> ⚠️  Run this **once** on a fresh database. Never store `INIT_ADMIN_PASSWORD` in a committed file.

---

## 5. Role Normalization

If the database contains legacy super-admin roles (`Admin`, `شريك`), normalize them to the canonical lowercase `admin`:

```bash
DATABASE_URL="postgres://..." npm run normalizeAdmins
```

This is a **one-time, idempotent** operation — safe to run multiple times. After normalization you may set `RBAC_STRICT_ADMIN=true` (or remove it, since `true` is the default).

---

## 6. Scripts Reference

All scripts are run from the `server/` directory.

| Script | Command | Description |
|---|---|---|
| **start** | `npm start` | Start the Express server (`node server.js`). |
| **test** | `npm test` | Run smoke tests (no live DB required). |
| **test:watch** | `npm run test:watch` | Watch mode for smoke tests. |
| **migrate:up** | `npm run migrate:up` | Apply all pending DB migrations. |
| **migrate:down** | `npm run migrate:down` | Roll back the last migration batch. |
| **db:seed:admin** | `npm run db:seed:admin` | Seed an initial super-admin (skips if users exist). |
| **normalizeAdmins** | `npm run normalizeAdmins` | Normalize legacy admin roles to `admin`. |

---

## 7. Production Checklist

Before going live, verify every item below:

- [ ] `DATABASE_URL` is set to a production PostgreSQL URL with SSL.
- [ ] `JWT_SECRET` is set to a long, random string (≥ 32 chars). Never reuse dev secrets.
- [ ] `NODE_ENV=production` is set in the deployment environment.
- [ ] `FRONTEND_URL` is set to the exact origin(s) of the deployed frontend.
- [ ] `npm run migrate:up` has been run against the production database.
- [ ] `npm run db:seed:admin` has been run once with strong credentials.
- [ ] `npm run normalizeAdmins` has been run if any legacy roles exist.
- [ ] No `.env` files with real secrets are committed to the repository.
- [ ] `FEATURE_DRIVE_OCR` is explicitly set (`true` or `false`).
- [ ] `GOOGLE_SHEETS_CREDENTIALS` or `GOOGLE_CREDENTIALS` is set (required — Sheets import is the primary onboarding path).
- [ ] Server logs have been checked for `[STARTUP] ✅` confirmation.

---

## 8. Startup Validation Behavior

When `NODE_ENV=production`, the server runs a **fail-fast validation** block before any routes or listeners are registered:

| Condition | Behavior |
|---|---|
| `DATABASE_URL` missing | Logs error with variable name + description, then `process.exit(1)`. |
| `JWT_SECRET` missing | Logs error with variable name + description, then `process.exit(1)`. |
| Both Google Sheets creds absent | Logs error listing `GOOGLE_SHEETS_CREDENTIALS or GOOGLE_CREDENTIALS`, then `process.exit(1)`. |
| All required vars present | Logs `[STARTUP] ✅ Production environment validated.` and continues. |

> **Secrets are never printed.** Error messages only name the missing variable, not its value.

In `development` / `test` mode the validation block is skipped entirely.

---

## 9. Feature Flags

| Flag | Env Var | Default | Effect when disabled |
|---|---|---|---|
| Drive OCR scanner | `FEATURE_DRIVE_OCR=true` | `false` | `GET /api/scan-drive-pdfs` and `GET /api/sync-drive` return `404`. |

---

## 10. Google Sheets / Drive Integration

### Sheets Import (`POST /api/clients/import/google-sheet/*`)

Protected by `requireAuth` + `requireSuperAdmin`. 

The route reads credentials in this order of preference:
1. `GOOGLE_SHEETS_CREDENTIALS` – inline JSON string (best for cloud envs)
2. `GOOGLE_CREDENTIALS` – alias for the above
3. `GOOGLE_APPLICATION_CREDENTIALS` – path to a JSON key file on disk

If none are set, the endpoint returns `500` in production (with a `⚠️` startup warning).

### Drive OCR (`GET /api/scan-drive-pdfs`, `GET /api/sync-drive`)

Enabled via `FEATURE_DRIVE_OCR=true`. Also requires `GOOGLE_APPLICATION_CREDENTIALS` pointing to a service-account key file with **Google Drive** and **Cloud Vision** API access.

---

## 11. Secrets Hygiene

| Rule | Detail |
|---|---|
| **Never commit real env files** | `.env`, `.env.*` are in `.gitignore`. Only `.env.example` (placeholders) is tracked. |
| **Never commit credential files** | `credentials.json`, `*.service-account.json` are in `.gitignore`. |
| **Use platform secrets** | Set `DATABASE_URL`, `JWT_SECRET`, and Google credentials as encrypted environment variables in your hosting platform. |
| **Rotate on exposure** | If a secret is accidentally committed, rotate it immediately and invalidate the old value. |
| **Audit the git history** | Use `git log --all -- '*.env'` periodically to verify no real env files were ever pushed. |

---

*Last updated: March 2026*
