-- Profiles table
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  role text not null default 'commercial' check (role in ('admin', 'commercial')),
  full_name text not null default '',
  email text not null default ''
);

-- Leads table
create table if not exists leads (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  commercial_id uuid references auth.users not null,
  status text not null default 'draft' check (status in ('draft', 'sent', 'signed', 'lost')),

  -- Client
  client_name text not null default '',
  client_email text not null default '',
  client_company text not null default '',
  client_phone text not null default '',

  -- Projet
  project_type text not null default '',
  project_description text not null default '',
  project_deadline text,

  -- Configuration
  selected_pages text[] not null default '{}',
  design_style text not null default 'template',
  brand_assets boolean not null default false,
  tech_options text[] not null default '{}',
  budget_range text not null default '',

  -- Pricing
  total_one_time integer not null default 0,
  total_monthly integer not null default 0,
  adjusted_price integer,

  -- Internal
  notes text not null default '',
  recommendation jsonb
);

-- Enable RLS
alter table profiles enable row level security;
alter table leads enable row level security;

-- Profiles policies
create policy "Users can view own profile"
  on profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

-- Leads policies
create policy "Commercials can view own leads, admins can view all"
  on leads for select using (
    auth.uid() = commercial_id
    or exists (
      select 1 from profiles where id = auth.uid() and role = 'admin'
    )
  );

create policy "Commercials can create leads"
  on leads for insert with check (auth.uid() = commercial_id);

create policy "Commercials can update own leads, admins can update all"
  on leads for update using (
    auth.uid() = commercial_id
    or exists (
      select 1 from profiles where id = auth.uid() and role = 'admin'
    )
  );

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  );
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace trigger leads_updated_at
  before update on leads
  for each row execute procedure public.set_updated_at();
