-- OSIRIS CRM — inscription sur invitation uniquement
-- Migration 005 : table invited_emails + trigger bloquant les comptes non invités

create table if not exists invited_emails (
  id         uuid default gen_random_uuid() primary key,
  email      text unique not null,
  invited_by uuid references auth.users,
  created_at timestamptz default now()
);

-- RLS : seul un admin peut lire/écrire les invitations
alter table invited_emails enable row level security;

create policy "Admins can manage invited_emails"
  on invited_emails
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  );

-- Trigger : bloque la création d'un compte si l'email n'est pas dans invited_emails
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  -- Vérifier l'invitation
  if not exists (
    select 1 from public.invited_emails
    where lower(email) = lower(new.email)
  ) then
    raise exception 'Email non autorisé. Contactez un administrateur pour obtenir une invitation.';
  end if;

  -- Créer le profil
  insert into public.profiles (id, role, full_name, email, phone, avatar_url)
  values (
    new.id,
    'commercial',
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.email,
    coalesce(new.raw_user_meta_data->>'phone', ''),
    null
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

-- S'assurer que le trigger existe (recréer si nécessaire)
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();
