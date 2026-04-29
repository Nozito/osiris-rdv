-- OSIRIS CRM — liens de devis signables
-- Migration 007 : table quote_tokens avec RLS

create extension if not exists pgcrypto schema extensions;

create table if not exists quote_tokens (
  id               uuid default gen_random_uuid() primary key,
  lead_id          uuid references leads not null,
  token            text unique not null default encode(extensions.gen_random_bytes(32), 'hex'),
  expires_at       timestamptz not null default now() + interval '30 days',
  opened_at        timestamptz,
  signed_at        timestamptz,
  signed_by_name   text,
  modification_request text,
  created_at       timestamptz default now()
);

alter table quote_tokens enable row level security;

-- Lecture publique par token (sans auth)
create policy "Public read by token"
  on quote_tokens for select
  using (true);

-- Insertion par utilisateurs connectés uniquement
create policy "App can insert"
  on quote_tokens for insert
  with check (auth.uid() is not null);

-- Mise à jour publique (opened_at, signed_at, modification_request)
create policy "App can update open/sign"
  on quote_tokens for update
  using (true);
