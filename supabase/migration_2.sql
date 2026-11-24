-- Grader AI migration 2: tables the application server needs. Run after schema.sql.
-- Only touches the grader_ai schema. Aborts if it was already applied.
begin;
set local search_path = grader_ai, pg_temp;

alter table profiles add column email text;
create unique index profiles_email_key on profiles (lower(email));
alter table organizations add column demo boolean not null default false;

-- Document style records used by the course, assignment, submission and grading modules.
create table records (
  id text primary key,
  org_id uuid not null references organizations on delete cascade,
  collection text not null,
  data jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index records_org_collection on records (org_id, collection);

create table invites (
  id text primary key,
  org_id uuid not null references organizations on delete cascade,
  email text not null,
  role app_role not null,
  student_id text,
  token text not null unique,
  used boolean not null default false,
  expires timestamptz not null,
  created_at timestamptz not null default now()
);

create table app_tokens (
  id text primary key,
  user_id uuid not null references auth.users on delete cascade,
  kind text not null check (kind in ('reset','verify')),
  hash text not null,
  expires timestamptz not null
);

-- Server only tables: row level security on, no policies, so only the service role can read or write.
alter table records enable row level security;
alter table invites enable row level security;
alter table app_tokens enable row level security;
grant all on records, invites, app_tokens to service_role;
commit;
