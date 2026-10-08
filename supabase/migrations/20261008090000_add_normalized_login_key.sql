alter table public.app_users add column login_key text;
update public.app_users set login_key=lower(btrim(username));
alter table public.app_users alter column login_key set not null;
alter table public.app_users add constraint app_users_login_key_unique unique(login_key);

drop function public.register_app_user(uuid,text,text,jsonb,jsonb,jsonb);
create function public.register_app_user(p_user_id uuid,p_username text,p_login_key text,p_password_hash text,p_favorites jsonb,p_trips jsonb,p_preferences jsonb) returns void language plpgsql security invoker set search_path='' as $$
begin insert into public.app_users(id,username,login_key,password_hash) values(p_user_id,p_username,p_login_key,p_password_hash); insert into public.user_states(user_id,favorites,trips,preferences) values(p_user_id,p_favorites,p_trips,p_preferences); insert into public.user_usage_events(user_id,event_type) values(p_user_id,'register'); end; $$;
revoke all on function public.register_app_user(uuid,text,text,text,jsonb,jsonb,jsonb) from public,anon,authenticated;
grant execute on function public.register_app_user(uuid,text,text,text,jsonb,jsonb,jsonb) to service_role;
