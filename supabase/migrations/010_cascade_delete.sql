-- OSIRIS CRM — Migration 010
-- Fix: quote_tokens.lead_id FK manquait ON DELETE CASCADE
-- Résultat : supprimer un lead supprime automatiquement ses tokens

alter table quote_tokens
  drop constraint if exists quote_tokens_lead_id_fkey;

alter table quote_tokens
  add constraint quote_tokens_lead_id_fkey
  foreign key (lead_id)
  references leads (id)
  on delete cascade;
