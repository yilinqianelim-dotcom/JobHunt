-- JobHunting 云同步建表脚本（在 Supabase 控制台 SQL Editor 里整段粘贴运行一次）

-- ① 用户数据表：每个用户一行，存全部记录的 JSON 快照
create table if not exists public.user_data (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.user_data enable row level security;
create policy "users manage own data" on public.user_data
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ② 反馈表：任何人可提交，只有你能在后台看
create table if not exists public.feedback (
  id bigint generated always as identity primary key,
  user_id uuid,
  content text not null,
  contact text,
  ua text,
  created_at timestamptz not null default now()
);
alter table public.feedback enable row level security;
create policy "anyone can submit feedback" on public.feedback
  for insert to anon, authenticated
  with check (true);

-- ③ 报错日志表：前端自动上报，只有你能在后台看
create table if not exists public.error_logs (
  id bigint generated always as identity primary key,
  user_id uuid,
  message text,
  stack text,
  ua text,
  url text,
  created_at timestamptz not null default now()
);
alter table public.error_logs enable row level security;
create policy "anyone can report errors" on public.error_logs
  for insert to anon, authenticated
  with check (true);
