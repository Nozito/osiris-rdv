-- =======================================================
-- 004 — Ajout de quote_data JSONB sur la table leads
-- OSIRIS CRM — pricing configurator
-- =======================================================
alter table leads add column if not exists quote_data jsonb;

comment on column leads.quote_data is 'Données du configurateur de devis (LeadQuote) — calculées via calcQuote()';
