-- OSIRIS CRM — champs date RDV sur les leads
-- Migration 008 : rdv_date + rdv_notes

alter table leads
  add column if not exists rdv_date  timestamptz,
  add column if not exists rdv_notes text not null default '';
