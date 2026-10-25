# Kinetic production security and storage audit

Status: planning only. No production storage, authentication, data or configuration is changed by this file.

## Confirmed from source

- `src/app/api/auth/login/route.ts` uses a non-cryptographic integer hash for passwords and permits setting a password for an existing user that has none. **Do not rely on this flow for production authentication.**
- `src/app/api/auth/[...nextauth]/route.ts` accepts email and name as Credentials without verifying ownership and may create a user; it also logs user details. Authentication and account ownership need redesign before public exposure.
- File-backed `/api/users`, `/api/workouts`, `/api/exercises`, `/api/programs`, and `/api/weight` use `KINETIC_API_KEY || 'kinetic-dev-key'`; a default public development key is unsafe. The handlers use `fs.writeFileSync`, unsuitable for persistent production writes on Vercel.
- `src/lib/db/mongodb.ts` falls back to localhost if `MONGODB_URI` is missing. Vercel has `MONGODB_URI` configured for Production (value not inspected).
- Production Vercel runtime errors included MongoDB queries before connection ready (`/api/workouts`) and keepalive fetch failures. Validate which deployed routes emitted them: deployed code may differ from the repository's current default branch.
- Vercel also has Supabase production variables; reconcile whether the intended canonical database is Supabase, MongoDB, or browser localStorage before migration.

## Safe implementation order

1. Back up existing production data. Record whether any real users have profiles, workouts or saved plans before schema changes.
2. Select one canonical storage and identity backend. Do not silently migrate or delete existing records.
3. Design verified ownership authentication (e.g., Supabase Auth or verified email/OAuth), server-side sessions, and per-user authorization. Replace the custom password hash with Argon2id/bcrypt via a migration plan. Existing hashes are not secure password verifiers.
4. Protect against account takeover: do not allow existing users to set a password based solely on knowledge of their email/name; disable auto-create through unauthenticated credentials.
5. Remove default `kinetic-dev-key`; fail closed if an API key is missing for external API routes. Use secrets only on server-side. Validate authorization for each operation.
6. Replace JSON-file mutation endpoints with a persistent backend or remove them from production routing if unused. Avoid a breaking redirect until client/API callers are audited.
7. Test database connectivity and await an established connection before calling Mongoose models. Add a sanitized health diagnostic, timeout/retry policy and monitor runtime errors.
8. Deploy to a preview environment, test authenticated and unauthenticated requests, verify storage semantics, then review production promotion separately.

## Dependencies

Current app dependencies: Next.js 14.2.35, React 18, Mongoose 9, MongoDB driver 7, NextAuth 4.24.13. Run `npm audit` and build tests in CI before selecting upgrades; version strings alone are not proof of a vulnerability.
