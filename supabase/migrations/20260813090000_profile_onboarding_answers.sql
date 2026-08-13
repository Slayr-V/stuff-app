-- Adds the onboarding quiz answers to profiles, captured by the
-- onboarding flow (app/onboarding/index.tsx) once a real session exists
-- to attach them to. Both columns are nullable — a user who signs in via
-- the welcome screen's "I already have an account" shortcut never takes
-- the quiz, and simply never gets a value here rather than a fake one.
alter table public.profiles
  add column if not exists onboarding_answers jsonb,
  add column if not exists onboarding_completed_at timestamptz;
