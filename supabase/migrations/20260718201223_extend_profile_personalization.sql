alter table public.profiles
  add column if not exists career text check (
    career is null or char_length(career) between 1 and 160
  ),
  add column if not exists profile_facts jsonb not null default '{}'::jsonb check (
    jsonb_typeof(profile_facts) = 'object'
  ),
  add column if not exists goal text not null default 'undecided' check (
    goal in (
      'scholarship',
      'study_abroad',
      'employability',
      'english',
      'research',
      'custom',
      'undecided'
    )
  ),
  add column if not exists goal_note text check (
    goal_note is null or char_length(goal_note) <= 420
  ),
  add column if not exists profile_refined boolean not null default false,
  add column if not exists academic_setup_complete boolean not null default false;

