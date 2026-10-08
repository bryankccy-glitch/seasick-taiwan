create table public.app_users (
  id uuid primary key default gen_random_uuid(), username text not null,
  username_key text generated always as (lower(btrim(username))) stored,
  password_hash text not null, created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(), last_login_at timestamptz,
  constraint app_users_username_length check (char_length(btrim(username)) between 2 and 32),
  constraint app_users_username_trimmed check (username = btrim(username)),
  constraint app_users_username_key_unique unique (username_key),
  constraint app_users_password_hash_length check (char_length(password_hash) between 40 and 200)
);
create table public.user_states (
  user_id uuid primary key references public.app_users(id) on delete cascade,
  favorites jsonb not null default '[]'::jsonb, trips jsonb not null default '[]'::jsonb,
  preferences jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  constraint user_states_favorites_array check (jsonb_typeof(favorites)='array'),
  constraint user_states_trips_array check (jsonb_typeof(trips)='array'),
  constraint user_states_preferences_object check (jsonb_typeof(preferences)='object')
);
create table public.user_usage_events (
  id bigint generated always as identity primary key, user_id uuid not null references public.app_users(id) on delete cascade,
  event_type text not null, metadata jsonb not null default '{}'::jsonb, occurred_at timestamptz not null default now(),
  constraint user_usage_events_type check (event_type in ('register','login_success','state_sync')),
  constraint user_usage_events_metadata_object check (jsonb_typeof(metadata)='object')
);
create index user_usage_events_user_time_idx on public.user_usage_events(user_id,occurred_at desc);
alter table public.app_users enable row level security; alter table public.user_states enable row level security; alter table public.user_usage_events enable row level security;
revoke all on table public.app_users from anon,authenticated; revoke all on table public.user_states from anon,authenticated; revoke all on table public.user_usage_events from anon,authenticated; revoke all on sequence public.user_usage_events_id_seq from anon,authenticated;
grant select,insert,update,delete on table public.app_users to service_role; grant select,insert,update,delete on table public.user_states to service_role; grant select,insert on table public.user_usage_events to service_role; grant usage,select on sequence public.user_usage_events_id_seq to service_role;
