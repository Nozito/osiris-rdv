-- =======================================================
-- 003 — Policies DELETE manquantes + corrections RLS
-- =======================================================

-- Leads : les commerciaux peuvent supprimer LEURS brouillons,
--         les admins peuvent supprimer n'importe quel lead.
create policy "Commercials can delete own leads, admins can delete all"
  on leads for delete using (
    auth.uid() = commercial_id
    or exists (
      select 1 from profiles where id = auth.uid() and role = 'admin'
    )
  );

-- Clients : les commerciaux peuvent supprimer leurs propres clients
--           (on élargit la policy admin-only existante)
drop policy if exists "Admins can delete clients" on clients;

create policy "Commercials can delete own clients, admins can delete all"
  on clients for delete using (
    auth.uid() = commercial_id
    or exists (
      select 1 from profiles where id = auth.uid() and role = 'admin'
    )
  );
