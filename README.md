# Grader AI

AI assisted assessment, grading and academic performance platform. Next.js 15, TypeScript, Tailwind CSS, Recharts, Lucide.

## Run it

```bash
npm install
cp .env.example .env.local      # set SESSION_SECRET (openssl rand -hex 32) and the three SUPABASE_ values
npm run dev                     # http://localhost:3000
```

Database setup, once per Supabase project, in the SQL editor: run `supabase/schema.sql`, then `supabase/migration_2.sql`, then add `grader_ai` under Settings > API > Exposed schemas.

Production: `npm run build && npm start`. Set `SESSION_SECRET`, `APP_URL` and the Supabase variables.

Tests (start the app first): `BASE=http://localhost:3000 npm test`, then `npm run test:cleanup` to delete the test users and workspaces they created.

## What is real and what needs configuring

| Area | State |
| --- | --- |
| Sign up, log in, logout, password reset, change password, protected routes, roles, organizations, invitations | Working. Scrypt password hashing, signed httpOnly session cookies, login throttling. |
| Email verification and emailed reset links | Active only when `SMTP_*` is set. Without SMTP, accounts are active immediately and reset links are shown on screen only outside production (or with `EXPOSE_RESET_LINKS=true`). |
| Authentication | Supabase Auth holds accounts and passwords (shared project: existing accounts can join with their password). The app issues its own signed session cookie after Supabase verifies the password. |
| Data storage | Postgres in the isolated `grader_ai` schema, uploads in the private `grader-ai-submissions` bucket. Core records (courses, assignments, submissions and so on) are stored as JSON documents in `grader_ai.records`; the relational tables in `schema.sql` are the target for a future move to fully relational storage. Access always goes through the server with role checks. |
| AI grading | Rule based draft engine by default (keywords against rubric and key, flags low confidence). Set `ANTHROPIC_API_KEY` for model based suggestions. Suggestions never become grades without instructor approval. |
| Handwriting OCR, bubble sheet scan detection | Not configured. Files are stored and shown beside a transcription form; unreadable work is flagged. Bubble sheets are scored from letters entered by a person, with uncertain marks needing confirmation. |
| Programming autograder | Test cases, code review, feedback work. Running tests requires an external isolated service at `SANDBOX_URL`. Code is never executed on the app server. |
| LMS integrations | Directory, setup and reachability test only. Nothing is shown as active. |
| Pricing | Three buttons link to the exact Selar URLs. No prices are invented. |

Brand mark is a placeholder `G` in `src/components/Nav.tsx` and `public/favicon.svg`. Replace both when your logo is ready.
