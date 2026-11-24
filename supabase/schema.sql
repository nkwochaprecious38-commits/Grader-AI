-- Grader AI: isolated PostgreSQL schema for Supabase.
-- Everything lives in the "grader_ai" schema. Nothing is created in "public", no triggers are added
-- to auth.users, and no existing policy or table is modified. Safe to run next to other apps.
-- Run once in the Supabase SQL editor. It aborts if the schema already exists.

begin;
do $$ begin
  if exists (select 1 from pg_namespace where nspname = 'grader_ai') then
    raise exception 'Schema grader_ai already exists. Nothing was changed.';
  end if;
end $$;
create schema grader_ai;
set local search_path = grader_ai, pg_temp;
create extension if not exists pgcrypto with schema extensions;

create type app_role as enum ('org_admin','institution_admin','instructor','ta','examiner','student');

create table organizations (id uuid primary key default extensions.gen_random_uuid(), name text not null, org_type text, created_at timestamptz not null default now());
create table profiles (id uuid primary key references auth.users on delete cascade, full_name text not null, created_at timestamptz not null default now());
create table memberships (
  id uuid primary key default extensions.gen_random_uuid(), org_id uuid not null references organizations on delete cascade,
  user_id uuid not null references auth.users on delete cascade, role app_role not null, job_title text, disabled boolean not null default false,
  created_at timestamptz not null default now(), unique (org_id, user_id));
create table institutions (id uuid primary key default extensions.gen_random_uuid(), org_id uuid not null references organizations on delete cascade, name text not null, kind text, contact text, created_at timestamptz default now());
create table courses (id uuid primary key default extensions.gen_random_uuid(), org_id uuid not null references organizations on delete cascade, institution_id uuid references institutions, title text not null, code text, term text, description text, archived boolean not null default false, created_at timestamptz default now());
create table students (id uuid primary key default extensions.gen_random_uuid(), org_id uuid not null references organizations on delete cascade, user_id uuid references auth.users, name text not null, email text, student_number text, created_at timestamptz default now());
create table course_enrollments (course_id uuid references courses on delete cascade, student_id uuid references students on delete cascade, org_id uuid not null, primary key (course_id, student_id));
create table course_instructors (course_id uuid references courses on delete cascade, user_id uuid references auth.users on delete cascade, org_id uuid not null, primary key (course_id, user_id));
create table rubrics (id uuid primary key default extensions.gen_random_uuid(), org_id uuid not null references organizations on delete cascade, name text not null, created_by uuid references auth.users, created_at timestamptz default now());
create table rubric_criteria (id uuid primary key default extensions.gen_random_uuid(), rubric_id uuid not null references rubrics on delete cascade, org_id uuid not null, label text not null, description text, points numeric not null check (points > 0), kind text not null default 'positive' check (kind in ('positive','negative')), allow_partial boolean default false, keywords text[]);
create table rubric_history (id uuid primary key default extensions.gen_random_uuid(), rubric_id uuid not null references rubrics on delete cascade, org_id uuid not null, changed_by uuid references auth.users, action text, before jsonb, after jsonb, effect jsonb, created_at timestamptz default now());
create table assignments (
  id uuid primary key default extensions.gen_random_uuid(), org_id uuid not null references organizations on delete cascade, course_id uuid references courses on delete cascade,
  title text not null, assessment_type text not null, instructions text, total_marks numeric not null default 0, rubric_id uuid references rubrics,
  release_date date, due_date date, late_policy text, submission_format text, status text not null default 'draft' check (status in ('draft','published','closed')), created_at timestamptz default now());
create table assignment_questions (id uuid primary key default extensions.gen_random_uuid(), assignment_id uuid not null references assignments on delete cascade, org_id uuid not null, position int not null, qtype text not null, prompt text not null, points numeric not null, rubric_id uuid references rubrics, options text[]);
-- Answer keys are kept apart from questions so students can never be granted read access to them.
create table answer_keys (question_id uuid primary key references assignment_questions on delete cascade, org_id uuid not null, answer text, versions jsonb);
create table programming_assignments (assignment_id uuid primary key references assignments on delete cascade, org_id uuid not null, language text not null, time_limit_ms int default 5000, memory_mb int default 128);
create table programming_test_cases (id uuid primary key default extensions.gen_random_uuid(), assignment_id uuid not null references assignments on delete cascade, org_id uuid not null, name text, input text, expected_output text, points numeric not null, hidden boolean default false);
create table submissions (
  id uuid primary key default extensions.gen_random_uuid(), org_id uuid not null references organizations on delete cascade, assignment_id uuid not null references assignments on delete cascade,
  student_id uuid not null references students on delete cascade, status text not null default 'submitted', late boolean default false, submitted_at timestamptz default now(),
  assigned_to uuid references auth.users, manual_review boolean default false, unique (assignment_id, student_id));
create table submission_files (id uuid primary key default extensions.gen_random_uuid(), submission_id uuid not null references submissions on delete cascade, org_id uuid not null, storage_path text not null, file_name text, mime_type text, size_bytes bigint);
create table extracted_answers (id uuid primary key default extensions.gen_random_uuid(), submission_id uuid not null references submissions on delete cascade, org_id uuid not null, question_id uuid references assignment_questions, text_value text, source text check (source in ('typed','ocr','manual')), confidence numeric, needs_review boolean default false);
create table ai_suggestions (id uuid primary key default extensions.gen_random_uuid(), submission_id uuid not null references submissions on delete cascade, org_id uuid not null, question_id uuid references assignment_questions, suggested_score numeric, explanation text, rubric_map jsonb, confidence numeric, flagged boolean default false, engine text, rejected boolean default false, created_at timestamptz default now());
create table approved_grades (id uuid primary key default extensions.gen_random_uuid(), submission_id uuid not null references submissions on delete cascade, org_id uuid not null, question_id uuid references assignment_questions, score numeric not null, comment text, criteria jsonb, graded_by uuid references auth.users, approved boolean not null default false, approved_by uuid references auth.users, approved_at timestamptz, published boolean not null default false, published_at timestamptz, unique (submission_id, question_id));
create table feedback (id uuid primary key default extensions.gen_random_uuid(), submission_id uuid not null references submissions on delete cascade, org_id uuid not null, general text, strengths text, weaknesses text, improvements text, corrections text, updated_by uuid references auth.users, updated_at timestamptz default now());
create table annotations (id uuid primary key default extensions.gen_random_uuid(), submission_id uuid not null references submissions on delete cascade, org_id uuid not null, question_id uuid references assignment_questions, body text not null, created_by uuid references auth.users, created_at timestamptz default now());
create table answer_groups (id uuid primary key default extensions.gen_random_uuid(), assignment_id uuid not null references assignments on delete cascade, org_id uuid not null, question_id uuid references assignment_questions, member_submission_ids uuid[] not null, exceptions uuid[] default '{}', common_feedback text, reviewed boolean default false, created_at timestamptz default now());
create table regrade_requests (id uuid primary key default extensions.gen_random_uuid(), org_id uuid not null, submission_id uuid not null references submissions on delete cascade, student_id uuid not null references students, question_id uuid references assignment_questions, kind text not null check (kind in ('regrade','clarification')), reason text not null, status text not null default 'open', decision text, response text, resolved_by uuid references auth.users, created_at timestamptz default now(), resolved_at timestamptz);
create table autograder_results (id uuid primary key default extensions.gen_random_uuid(), submission_id uuid not null references submissions on delete cascade, org_id uuid not null, test_case_id uuid references programming_test_cases, passed boolean, output text, time_ms int, run_at timestamptz default now());
create table gradebooks (id uuid primary key default extensions.gen_random_uuid(), org_id uuid not null, course_id uuid references courses on delete cascade, name text, created_at timestamptz default now());
create table analytics_records (id uuid primary key default extensions.gen_random_uuid(), org_id uuid not null, assignment_id uuid references assignments on delete cascade, metric text not null, value jsonb not null, computed_at timestamptz default now());
create table notifications (id uuid primary key default extensions.gen_random_uuid(), org_id uuid not null, user_id uuid references auth.users, title text not null, body text, read boolean default false, created_at timestamptz default now());
create table integrations (id uuid primary key default extensions.gen_random_uuid(), org_id uuid not null references organizations on delete cascade, platform text not null, base_url text, client_id text, deployment_id text, status text not null default 'none', last_test jsonb, unique (org_id, platform));
create table audit_logs (id uuid primary key default extensions.gen_random_uuid(), org_id uuid not null, actor_id uuid, action text not null, detail jsonb, created_at timestamptz not null default now());

-- Helpers ---------------------------------------------------------------------------------------
create or replace function app_role_in(o uuid) returns app_role language sql stable security definer set search_path = grader_ai, pg_temp as
$$ select role from memberships where org_id = o and user_id = auth.uid() and not disabled limit 1 $$;
create or replace function is_staff(o uuid) returns boolean language sql stable security definer set search_path = grader_ai, pg_temp as
$$ select coalesce(app_role_in(o) in ('org_admin','institution_admin','instructor','ta','examiner'), false) $$;
create or replace function is_approver(o uuid) returns boolean language sql stable security definer set search_path = grader_ai, pg_temp as
$$ select coalesce(app_role_in(o) in ('org_admin','institution_admin','instructor','examiner'), false) $$;
create or replace function my_student_id(o uuid) returns uuid language sql stable security definer set search_path = grader_ai, pg_temp as
$$ select id from students where org_id = o and user_id = auth.uid() limit 1 $$;

-- Row level security ----------------------------------------------------------------------------
do $$ declare t text; begin
  foreach t in array array['organizations','memberships','institutions','courses','students','course_enrollments','course_instructors','rubrics','rubric_criteria','rubric_history','assignments','assignment_questions','answer_keys','programming_assignments','programming_test_cases','submissions','submission_files','extracted_answers','ai_suggestions','approved_grades','feedback','annotations','answer_groups','regrade_requests','autograder_results','gradebooks','analytics_records','notifications','integrations','audit_logs','profiles']
  loop execute format('alter table %I enable row level security', t); end loop; end $$;

-- Staff: full read within their organization; writes limited to staff roles.
do $$ declare t text; begin
  foreach t in array array['institutions','courses','students','course_enrollments','course_instructors','rubrics','rubric_criteria','rubric_history','assignments','assignment_questions','answer_keys','programming_assignments','programming_test_cases','submissions','submission_files','extracted_answers','ai_suggestions','feedback','annotations','answer_groups','autograder_results','gradebooks','analytics_records']
  loop
    execute format('create policy "%1$s staff read" on %1$I for select using (is_staff(org_id))', t);
    execute format('create policy "%1$s staff write" on %1$I for all using (is_staff(org_id)) with check (is_staff(org_id))', t);
  end loop; end $$;

create policy "org members read org" on organizations for select using (app_role_in(id) is not null);
create policy "own membership" on memberships for select using (user_id = auth.uid() or is_staff(org_id));
create policy "admins manage memberships" on memberships for all using (app_role_in(org_id) in ('org_admin','institution_admin')) with check (app_role_in(org_id) in ('org_admin','institution_admin'));
create policy "own profile" on profiles for all using (id = auth.uid()) with check (id = auth.uid());

-- Students: only their own work, and only published grades. Answer keys and AI suggestions are never exposed.
create policy "student read enrolled courses" on courses for select using (exists (select 1 from course_enrollments e where e.course_id = courses.id and e.student_id = my_student_id(courses.org_id)));
create policy "student read published assignments" on assignments for select using (status = 'published' and exists (select 1 from course_enrollments e where e.course_id = assignments.course_id and e.student_id = my_student_id(assignments.org_id)));
create policy "student read questions" on assignment_questions for select using (exists (select 1 from assignments a where a.id = assignment_id and a.status = 'published' and exists (select 1 from course_enrollments e where e.course_id = a.course_id and e.student_id = my_student_id(a.org_id))));
create policy "student own submissions read" on submissions for select using (student_id = my_student_id(org_id));
create policy "student own submissions insert" on submissions for insert with check (student_id = my_student_id(org_id));
create policy "student own files" on submission_files for select using (exists (select 1 from submissions s where s.id = submission_id and s.student_id = my_student_id(s.org_id)));
create policy "student published grades" on approved_grades for select using (published and exists (select 1 from submissions s where s.id = submission_id and s.student_id = my_student_id(s.org_id)));
create policy "staff read grades" on approved_grades for select using (is_staff(org_id));
create policy "staff write grades" on approved_grades for insert with check (is_staff(org_id));
create policy "staff update grades" on approved_grades for update using (is_staff(org_id));
create policy "student published feedback" on feedback for select using (exists (select 1 from submissions s join approved_grades g on g.submission_id = s.id and g.published where s.id = submission_id and s.student_id = my_student_id(s.org_id)));
create policy "student own regrades read" on regrade_requests for select using (student_id = my_student_id(org_id));
create policy "student create regrade" on regrade_requests for insert with check (student_id = my_student_id(org_id));
create policy "staff regrades" on regrade_requests for all using (is_staff(org_id)) with check (is_staff(org_id));
create policy "own notifications" on notifications for select using (user_id = auth.uid() or (user_id is null and is_staff(org_id)));
create policy "admin integrations" on integrations for all using (app_role_in(org_id) in ('org_admin','institution_admin')) with check (app_role_in(org_id) in ('org_admin','institution_admin'));
create policy "admin audit read" on audit_logs for select using (app_role_in(org_id) in ('org_admin','institution_admin'));

-- Approval rule enforced in the database: nothing publishes before approval, and only approvers approve or publish.
create or replace function guard_grade() returns trigger language plpgsql security definer set search_path = grader_ai, pg_temp as $$
begin
  if new.published and not new.approved then raise exception 'Grades must be approved before publishing'; end if;
  if (new.approved is distinct from old.approved or new.published is distinct from old.published or (old.approved and new.score is distinct from old.score)) and not is_approver(new.org_id) then
    raise exception 'Only an instructor, examiner or administrator can approve, publish or change approved grades'; end if;
  insert into audit_logs(org_id, actor_id, action, detail) values (new.org_id, auth.uid(), 'grade.changed', jsonb_build_object('submission', new.submission_id, 'question', new.question_id, 'from', old.score, 'to', new.score, 'approved', new.approved, 'published', new.published));
  return new;
end $$;
create trigger approved_grades_guard before update on approved_grades for each row execute function guard_grade();

-- Storage: dedicated private bucket. The app serves files through server side checks using the service role; no public or anon storage policy is created.
insert into storage.buckets (id, name, public) values ('grader-ai-submissions', 'grader-ai-submissions', false) on conflict (id) do nothing;

-- Access: the browser never queries these tables directly. Server code uses the service role key and
-- enforces roles. Row level security above remains as a second layer for any authenticated client use.
revoke all on schema grader_ai from public, anon;
grant usage on schema grader_ai to authenticated, service_role;
grant all on all tables in schema grader_ai to service_role;
grant select, insert, update, delete on all tables in schema grader_ai to authenticated;
grant execute on all functions in schema grader_ai to authenticated, service_role;
alter default privileges in schema grader_ai grant all on tables to service_role;
commit;
