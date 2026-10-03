-- Skillonex Support: Run this in Supabase SQL Editor. Safe to run multiple times.

create extension if not exists "pgcrypto";

-- Clean drop of existing triggers, functions, and tables
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists handle_new_user cascade;
drop function if exists is_staff cascade;

drop table if exists ticket_events cascade;
drop table if exists tickets cascade;
drop sequence if exists ticket_seq cascade;
drop table if exists certificates cascade;
drop table if exists payments cascade;
drop table if exists enrollments cascade;
drop table if exists profiles cascade;
drop table if exists resources cascade;
drop table if exists internships cascade;
drop table if exists announcements cascade;
drop table if exists courses cascade;
drop table if exists departments cascade;

-- ---------- Reference data ----------
create table departments (
  id serial primary key,
  name text unique not null
);

create table courses (
  id serial primary key,
  title text not null,
  description text,
  instructor text,
  duration_weeks int default 8,
  schedule text default 'Mon / Wed / Fri, 6:00 PM'
);

create table announcements (
  id serial primary key,
  title text not null,
  body text,
  created_at timestamptz default now()
);

create table internships (
  id serial primary key,
  role text not null,
  company text not null,
  location text default 'Remote',
  apply_url text
);

create table resources (
  id serial primary key,
  course_id int references courses(id) on delete cascade,
  title text not null,
  url text
);

-- ---------- Users ----------
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  phone text,
  role text not null default 'student' check (role in ('student','staff','admin')),
  department_id int references departments(id),
  created_at timestamptz default now()
);

create table enrollments (
  id serial primary key,
  student_id uuid references profiles(id) on delete cascade,
  course_id int references courses(id),
  status text default 'active' check (status in ('active','pending','completed')),
  progress int default 0,
  attendance int default 0,
  enrolled_at timestamptz default now()
);

create table payments (
  id serial primary key,
  student_id uuid references profiles(id) on delete cascade,
  course_id int references courses(id),
  amount numeric(10,2) not null,
  status text default 'paid' check (status in ('paid','pending','failed','refunded')),
  paid_at timestamptz default now()
);

create table certificates (
  id serial primary key,
  student_id uuid references profiles(id) on delete cascade,
  course_id int references courses(id),
  issued_at timestamptz default now(),
  url text
);

-- ---------- Tickets ----------
create sequence ticket_seq start 1001;

create table tickets (
  id uuid primary key default gen_random_uuid(),
  ticket_no text unique not null default ('SKX-' || nextval('ticket_seq')),
  student_id uuid not null references profiles(id) on delete cascade,
  subject text,
  message text not null,
  category text default 'General',
  priority text default 'Medium' check (priority in ('High','Medium','Low')),
  sentiment text default 'Neutral',
  language text default 'English',
  department_id int references departments(id),
  assigned_to uuid references profiles(id),
  suggested_action text,
  ai_reply text,
  status text not null default 'New'
    check (status in ('New','Assigned','In Progress','Waiting','Resolved','Closed')),
  escalated boolean default false,
  duplicate_of uuid references tickets(id),
  sla_due_at timestamptz,
  rating int check (rating between 1 and 5),
  feedback text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  resolved_at timestamptz
);
create index if not exists idx_tickets_student on tickets (student_id);
create index if not exists idx_tickets_status_priority on tickets (status, priority);

create table ticket_events (
  id serial primary key,
  ticket_id uuid references tickets(id) on delete cascade,
  actor_id uuid references profiles(id),
  event_type text not null,       -- created | status | note | reply | escalated
  note text,
  created_at timestamptz default now()
);

-- ---------- Helpers ----------
create or replace function is_staff() returns boolean
language sql security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and role in ('staff','admin'));
$$;

-- Create profile on signup + demo data so every new student has a full dashboard.
create or replace function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, full_name, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)), new.email);

  insert into enrollments (student_id, course_id, status, progress, attendance)
  select new.id, id, 'active', 35 + (id * 10) % 50, 80 + (id * 3) % 15 from courses order by id limit 2;

  insert into payments (student_id, course_id, amount, status)
  select new.id, id, 4999, 'paid' from courses order by id limit 2;
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
for each row execute function handle_new_user();

-- ---------- Row Level Security ----------
alter table profiles enable row level security;
alter table enrollments enable row level security;
alter table payments enable row level security;
alter table certificates enable row level security;
alter table tickets enable row level security;
alter table ticket_events enable row level security;
alter table courses enable row level security;
alter table announcements enable row level security;
alter table internships enable row level security;
alter table resources enable row level security;
alter table departments enable row level security;

create policy "own profile" on profiles for select using (id = auth.uid() or is_staff());
create policy "own profile update" on profiles for update using (id = auth.uid());
create policy "own enrollments" on enrollments for select using (student_id = auth.uid() or is_staff());
create policy "own payments" on payments for select using (student_id = auth.uid() or is_staff());
create policy "own certificates" on certificates for select using (student_id = auth.uid() or is_staff());
create policy "own tickets" on tickets for select using (student_id = auth.uid() or is_staff());
create policy "own ticket events" on ticket_events for select using (
  is_staff() or exists (select 1 from tickets t where t.id = ticket_id and t.student_id = auth.uid())
);
create policy "read courses" on courses for select using (true);
create policy "read announcements" on announcements for select using (true);
create policy "read internships" on internships for select using (true);
create policy "read resources" on resources for select using (true);
create policy "read departments" on departments for select using (true);

-- ---------- Seed data ----------
insert into departments (name) values
  ('Accounts'), ('Admissions'), ('Academics'), ('Technical Support'),
  ('Certification'), ('Placement & Internships'), ('General Support');

insert into courses (title, description, instructor) values
  ('Data Analytics', 'SQL, Excel, Power BI and storytelling with data.', 'Meera Nair'),
  ('Full Stack Web Development', 'React, Node.js and databases, end to end.', 'Arjun Rao'),
  ('Machine Learning Foundations', 'Supervised learning, evaluation, and deployment basics.', 'Dr. Kavya S'),
  ('UI/UX Design', 'Research, wireframes, prototyping in Figma.', 'Nisha Paul');

insert into resources (course_id, title, url) values
  (1, 'SQL practice workbook', '#'), (1, 'Power BI starter files', '#'),
  (2, 'React cheat sheet', '#'), (3, 'ML notebooks', '#');

insert into announcements (title, body) values
  ('Weekend doubt-clearing session', 'Saturday 11 AM on the live class link.'),
  ('Certificates for September batch', 'Issued within 5 working days of course completion.');

insert into internships (role, company, location) values
  ('Data Analyst Intern', 'BrightMetrics', 'Remote'),
  ('Frontend Intern', 'PixelForge', 'Coimbatore'),
  ('ML Intern', 'Neurolane', 'Bengaluru');
