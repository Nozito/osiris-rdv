-- =======================================================
-- 002 — Table clients + clarification table utilisateurs
-- =======================================================

-- La table `profiles` est la table "utilisateurs + rôles".
-- Elle est déjà créée en 001. On s'assure qu'elle a bien
-- tous les champs nécessaires.
alter table profiles
  add column if not exists avatar_url text,
  add column if not exists phone text not null default '';

comment on table profiles is 'Utilisateurs de l''application avec leur rôle (admin | commercial)';
comment on column profiles.role is 'Rôle de l''utilisateur : admin voit tout, commercial voit ses propres leads';

-- =======================================================
-- Table clients
-- =======================================================
create table if not exists clients (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,

  -- Propriétaire du client (le commercial qui l'a créé)
  commercial_id uuid references auth.users not null,

  -- Informations du client
  name text not null default '',
  email text not null default '',
  company text not null default '',
  phone text not null default '',
  notes text not null default ''
);

comment on table clients is 'Clients / prospects — un client peut avoir plusieurs leads';

-- Index pour la recherche plein texte
create index if not exists clients_name_idx on clients using gin(to_tsvector('french', name || ' ' || company || ' ' || email));

-- updated_at trigger
create or replace trigger clients_updated_at
  before update on clients
  for each row execute procedure public.set_updated_at();

-- RLS
alter table clients enable row level security;

create policy "Commercials can view own clients, admins can view all"
  on clients for select using (
    auth.uid() = commercial_id
    or exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "Commercials can create clients"
  on clients for insert with check (auth.uid() = commercial_id);

create policy "Commercials can update own clients, admins can update all"
  on clients for update using (
    auth.uid() = commercial_id
    or exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admins can delete clients"
  on clients for delete using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- =======================================================
-- Ajout de client_id dans leads
-- =======================================================
alter table leads
  add column if not exists client_id uuid references clients;

comment on column leads.client_id is 'Lien vers la table clients — les anciens champs client_* sont conservés pour la rétro-compatibilité';

-- =======================================================
-- Migration des données : créer un enregistrement client
-- pour chaque lead existant qui a une adresse email
-- =======================================================
do $$
declare
  rec record;
  new_client_id uuid;
begin
  -- Pour chaque combinaison unique (email, commercial_id) dans leads
  for rec in
    select distinct on (client_email, commercial_id)
      id as lead_id,
      commercial_id,
      client_name,
      client_email,
      client_company,
      client_phone
    from leads
    where client_email <> ''
      and client_id is null
    order by client_email, commercial_id, created_at
  loop
    -- Créer le client
    insert into clients (commercial_id, name, email, company, phone)
    values (rec.commercial_id, rec.client_name, rec.client_email, rec.client_company, rec.client_phone)
    returning id into new_client_id;

    -- Lier tous les leads de ce client
    update leads
    set client_id = new_client_id
    where client_email = rec.client_email
      and commercial_id = rec.commercial_id
      and client_id is null;
  end loop;
end;
$$;
