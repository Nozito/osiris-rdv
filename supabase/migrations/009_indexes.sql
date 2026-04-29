-- Indexes manquants identifiés lors de l'audit (toutes les requêtes du dashboard)
create index if not exists leads_commercial_id_idx on leads(commercial_id);
create index if not exists leads_status_idx        on leads(status);
create index if not exists leads_updated_at_idx    on leads(updated_at desc);
create index if not exists leads_client_id_idx     on leads(client_id);
create index if not exists clients_commercial_id_idx on clients(commercial_id);
