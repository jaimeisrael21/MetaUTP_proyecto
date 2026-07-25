alter table public.profiles
  add column if not exists academic_period text not null default '2026-1',
  add column if not exists academic_metrics jsonb not null default '{}'::jsonb,
  add column if not exists data_provenance jsonb not null default '{}'::jsonb,
  add column if not exists context_configured boolean not null default false;

alter table public.profiles
  drop constraint if exists profiles_academic_metrics_object,
  add constraint profiles_academic_metrics_object
    check (jsonb_typeof(academic_metrics) = 'object'),
  drop constraint if exists profiles_data_provenance_object,
  add constraint profiles_data_provenance_object
    check (jsonb_typeof(data_provenance) = 'object'),
  drop constraint if exists profiles_academic_period_format,
  add constraint profiles_academic_period_format
    check (academic_period ~ '^[0-9]{4}-[12]$');

alter table public.courses
  add column if not exists period text not null default 'current',
  add column if not exists weekly_hours numeric(5,2) not null default 0,
  add column if not exists source text not null default 'manual';

alter table public.courses
  drop constraint if exists courses_period_valid,
  add constraint courses_period_valid
    check (period in ('current', 'previous', 'historical')),
  drop constraint if exists courses_weekly_hours_valid,
  add constraint courses_weekly_hours_valid
    check (weekly_hours >= 0 and weekly_hours <= 80),
  drop constraint if exists courses_source_valid,
  add constraint courses_source_valid
    check (source in ('manual', 'ocr', 'demo', 'institutional'));

comment on column public.profiles.academic_metrics is
  'Student-confirmed academic metrics. JSON keys preserve the distinction between current, prior, cumulative, credits and weekly hours.';
comment on column public.profiles.data_provenance is
  'Declared origin of academic data. OCR means extracted and confirmed by the student, not officially validated by UTP.';
comment on column public.profiles.context_configured is
  'True only after the student deliberately reviews the optional contextual opportunities section.';
