-- Galaxy Class Database Schema
-- Run this in Supabase SQL Editor

-- Profiles: extend Supabase Auth with username, role, name
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  role text not null default 'member' check (role in ('member','admin','main_admin')),
  name text not null,
  email text unique not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Admins can view all profiles"
  on public.profiles for select
  using (auth.uid() in (select id from public.profiles where role in ('admin','main_admin')));

-- Announcements
create table if not exists public.announcements (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  content text not null,
  author text not null,
  category text default 'General',
  is_pinned boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.announcements enable row level security;

create policy "Anyone can view announcements"
  on public.announcements for select
  using (true);

create policy "Admins can insert announcements"
  on public.announcements for insert
  with check (auth.uid() in (select id from public.profiles where role in ('admin','main_admin')));

create policy "Admins can update announcements"
  on public.announcements for update
  using (auth.uid() in (select id from public.profiles where role in ('admin','main_admin')));

create policy "Admins can delete announcements"
  on public.announcements for delete
  using (auth.uid() in (select id from public.profiles where role in ('admin','main_admin')));

-- Schedule
create table if not exists public.schedule (
  id uuid default gen_random_uuid() primary key,
  day text not null,
  time_start text not null,
  time_end text not null,
  subject text not null,
  teacher text not null,
  room text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.schedule enable row level security;

create policy "Anyone can view schedule"
  on public.schedule for select
  using (true);

create policy "Admins can manage schedule"
  on public.schedule for all
  using (auth.uid() in (select id from public.profiles where role in ('admin','main_admin')));

-- Events
create table if not exists public.events (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text not null,
  event_date text not null,
  event_time text,
  location text,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.events enable row level security;

create policy "Anyone can view events"
  on public.events for select
  using (true);

create policy "Admins can manage events"
  on public.events for all
  using (auth.uid() in (select id from public.profiles where role in ('admin','main_admin')));

-- Gallery
create table if not exists public.gallery (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  image_url text not null,
  category text default 'General',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.gallery enable row level security;

create policy "Anyone can view gallery"
  on public.gallery for select
  using (true);

create policy "Admins can manage gallery"
  on public.gallery for all
  using (auth.uid() in (select id from public.profiles where role in ('admin','main_admin')));

-- Achievements
create table if not exists public.achievements (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text not null,
  category text default 'General',
  achieved_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.achievements enable row level security;

create policy "Anyone can view achievements"
  on public.achievements for select
  using (true);

create policy "Admins can manage achievements"
  on public.achievements for all
  using (auth.uid() in (select id from public.profiles where role in ('admin','main_admin')));

-- Voting
create table if not exists public.votings (
  id uuid default gen_random_uuid() primary key,
  question text not null,
  options jsonb not null,
  start_date text not null,
  end_date text not null,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.voting_votes (
  id uuid default gen_random_uuid() primary key,
  voting_id uuid references public.votings(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  option_index int not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(voting_id, user_id)
);

alter table public.votings enable row level security;
alter table public.voting_votes enable row level security;

create policy "Anyone can view active votings"
  on public.votings for select
  using (true);

create policy "Authenticated users can vote"
  on public.voting_votes for insert
  with check (auth.uid() = user_id);

create policy "Users can view their own votes"
  on public.voting_votes for select
  using (auth.uid() = user_id);

create policy "Admins can manage votings"
  on public.votings for all
  using (auth.uid() in (select id from public.profiles where role in ('admin','main_admin')));

-- Attendance
create table if not exists public.attendance (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  date text not null,
  status text not null check (status in ('present','late','excused','absent')),
  note text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, date)
);

alter table public.attendance enable row level security;

create policy "Users can view their own attendance"
  on public.attendance for select
  using (auth.uid() = user_id);

create policy "Admins can view all attendance"
  on public.attendance for select
  using (auth.uid() in (select id from public.profiles where role in ('admin','main_admin')));

create policy "Admins can manage attendance"
  on public.attendance for all
  using (auth.uid() in (select id from public.profiles where role in ('admin','main_admin')));

-- Poetry / Words
create table if not exists public.poetry (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  content text not null,
  author_name text not null,
  category text default 'Words',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.poetry enable row level security;

create policy "Anyone can view poetry"
  on public.poetry for select
  using (true);

create policy "Authenticated users can create poetry"
  on public.poetry for insert
  with check (auth.role() = 'authenticated');

create policy "Admins can manage poetry"
  on public.poetry for all
  using (auth.uid() in (select id from public.profiles where role in ('admin','main_admin')));

-- Chat Messages
create table if not exists public.chat_messages (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  username text not null,
  message text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.chat_messages enable row level security;

create policy "Anyone can view chat messages"
  on public.chat_messages for select
  using (true);

create policy "Authenticated users can send messages"
  on public.chat_messages for insert
  with check (auth.uid() = user_id);

-- Class Cash
create table if not exists public.class_cash (
  id uuid default gen_random_uuid() primary key,
  type text not null check (type in ('income','expense')),
  amount numeric not null,
  description text not null,
  created_by uuid references auth.users(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.class_cash enable row level security;

create policy "Anyone can view class cash"
  on public.class_cash for select
  using (true);

create policy "Admins can manage class cash"
  on public.class_cash for all
  using (auth.uid() in (select id from public.profiles where role in ('admin','main_admin')));

-- Picket Schedule
create table if not exists public.picket_schedule (
  id uuid default gen_random_uuid() primary key,
  date text not null,
  group_name text not null,
  members jsonb not null,
  status text default 'scheduled',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.picket_schedule enable row level security;

create policy "Anyone can view picket schedule"
  on public.picket_schedule for select
  using (true);

create policy "Admins can manage picket schedule"
  on public.picket_schedule for all
  using (auth.uid() in (select id from public.profiles where role in ('admin','main_admin')));

-- Storage buckets (run after creating tables)
-- insert into storage.buckets (id, name, public) values ('gallery', 'gallery', true);
-- insert into storage.buckets (id, name, public) values ('projects', 'projects', true);
