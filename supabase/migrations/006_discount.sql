-- OSIRIS CRM — champs remise/négociation sur les leads
-- Migration 006 : discount_percent, discount_reason, discount_conditions, validation admin

alter table leads
  add column if not exists discount_percent    numeric(5,2) default 0
    check (discount_percent >= 0 and discount_percent <= 100),
  add column if not exists discount_reason     text not null default '',
  add column if not exists discount_conditions text not null default '',
  add column if not exists discount_validated_at  timestamptz,
  add column if not exists discount_validated_by  uuid references auth.users;

-- Ajout du statut pending_approval au CHECK constraint sur status
-- On supprime l'ancien constraint et on le recrée avec la nouvelle valeur
alter table leads drop constraint if exists leads_status_check;
alter table leads add constraint leads_status_check
  check (status in ('draft', 'sent', 'signed', 'lost', 'pending_approval'));
