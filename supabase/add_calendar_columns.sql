-- Migration: add Google Calendar OAuth columns to mentor_profiles
-- Run this in the Supabase SQL editor or via psql

alter table public.mentor_profiles
  add column if not exists onboarding_complete boolean not null default false,
  add column if not exists calendar_connected boolean not null default false,
  add column if not exists google_refresh_token text,
  add column if not exists google_access_token text,
  add column if not exists google_token_expiry timestamptz,
  add column if not exists google_calendar_id text;
