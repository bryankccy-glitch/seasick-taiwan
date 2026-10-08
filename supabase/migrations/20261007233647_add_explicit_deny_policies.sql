create policy deny_client_access_to_app_users on public.app_users for all to anon,authenticated using(false) with check(false);
create policy deny_client_access_to_user_states on public.user_states for all to anon,authenticated using(false) with check(false);
create policy deny_client_access_to_user_usage_events on public.user_usage_events for all to anon,authenticated using(false) with check(false);
