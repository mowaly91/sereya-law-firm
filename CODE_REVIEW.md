# Code Review Notes (2026-04-30)

## Scope reviewed
- Backend auth and authorization flow (`server/server.js`, `server/middleware/auth.js`, `server/routes/users.js`).
- Configuration and startup validation.

## What looks good
1. **Layered auth checks**
   - Route-level `requireAuth` is applied centrally in `server/server.js` before mounting protected routers.
   - Sensitive endpoints additionally enforce `requireSuperAdmin`.

2. **Production startup hardening**
   - Server exits early in production when critical env vars are missing.
   - Clear diagnostic messages are provided without leaking secret values.

3. **Reasonable CORS configuration model**
   - Allows explicit allowlist via `FRONTEND_URL`.
   - Rejects unknown origins by default.

## Risks / follow-ups
1. **Development JWT fallback secret**
   - `server/middleware/auth.js` allows a hard-coded fallback JWT secret in non-production.
   - This is convenient locally, but risky if a non-production environment is accidentally exposed.
   - Recommendation: gate fallback behind an explicit `ALLOW_INSECURE_DEV_SECRET=true` flag.

2. **Inconsistent role normalization semantics**
   - `server/routes/users.js` rewrites incoming role `شريك` to `admin` on create/update.
   - This can lose original business-role semantics and create ambiguity in audit/reporting.
   - Recommendation: preserve the input role value and enforce privilege via RBAC mapping only.

3. **CORS UX for multi-origin deployments**
   - Current CORS callback rejects unknown origins with an Error object; depending on client stack, this can surface as generic network failure.
   - Recommendation: add structured logging with request origin to simplify support diagnostics.
