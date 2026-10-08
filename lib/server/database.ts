import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseServerConfig } from "@/lib/supabase-server-config";
import type { UserStatePayload } from "@/lib/server/user-state";

type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];
type Database = {
  public: {
    Tables: {
      app_users: {
        Row: { id:string; username:string; login_key:string; password_hash:string; created_at:string; updated_at:string; last_login_at:string|null };
        Insert: never; Update: never; Relationships: [];
      };
      user_states: {
        Row: { user_id:string; favorites:Json; trips:Json; preferences:Json; created_at:string; updated_at:string };
        Insert: never; Update: never; Relationships: [];
      };
      user_usage_events: {
        Row: { id:number; user_id:string; event_type:string; metadata:Json; occurred_at:string };
        Insert: never; Update: never; Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      register_app_user: {
        Args: { p_user_id:string; p_username:string; p_login_key:string; p_password_hash:string; p_favorites:Json; p_trips:Json; p_preferences:Json };
        Returns: undefined;
      };
      record_app_login: { Args: { p_user_id:string }; Returns: undefined };
      save_app_user_state: { Args: { p_user_id:string; p_favorites:Json; p_trips:Json; p_preferences:Json }; Returns: string };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type AccountRow = { id:string; username:string; password_hash:string };
export type StoredStateRow = { favorites:unknown; trips:unknown; preferences:unknown };
let adminClient: SupabaseClient<Database> | null = null;

function getAdminClient() {
  if (!adminClient) {
    const { url, secretKey } = getSupabaseServerConfig();
    adminClient = createClient<Database>(url, secretKey, {
      auth: { persistSession:false, autoRefreshToken:false, detectSessionInUrl:false },
      global: { headers: { "X-Client-Info":"seasick-taiwan-server" } },
    });
  }
  return adminClient;
}

function throwIfError(error: { message:string; code?:string } | null) {
  if (!error) return;
  const databaseError = new Error("Supabase database request failed") as Error & { code?:string };
  databaseError.code = error.code;
  throw databaseError;
}

function stateArgs(state: UserStatePayload) {
  return { p_favorites:state.favorites as Json, p_trips:state.trips as Json, p_preferences:state.preferences as Json };
}

export async function createAccount(input:{ id:string; username:string; loginKey:string; passwordHash:string; state:UserStatePayload }) {
  const { error } = await getAdminClient().rpc("register_app_user", {
    p_user_id:input.id, p_username:input.username, p_login_key:input.loginKey, p_password_hash:input.passwordHash, ...stateArgs(input.state),
  });
  throwIfError(error);
}

export async function findAccountByUsernameKey(loginKey:string):Promise<AccountRow|null> {
  const { data, error } = await getAdminClient().from("app_users").select("id, username, password_hash").eq("login_key", loginKey).maybeSingle();
  throwIfError(error);
  return data;
}

export async function findAccountById(id:string):Promise<Pick<AccountRow,"id"|"username">|null> {
  const { data, error } = await getAdminClient().from("app_users").select("id, username").eq("id", id).maybeSingle();
  throwIfError(error);
  return data;
}

export async function readStoredState(userId:string):Promise<StoredStateRow|null> {
  const { data, error } = await getAdminClient().from("user_states").select("favorites, trips, preferences").eq("user_id", userId).maybeSingle();
  throwIfError(error);
  return data;
}

export async function recordSuccessfulLogin(userId:string) {
  const { error } = await getAdminClient().rpc("record_app_login", { p_user_id:userId });
  throwIfError(error);
}

export async function saveStoredState(userId:string,state:UserStatePayload) {
  const { data, error } = await getAdminClient().rpc("save_app_user_state", { p_user_id:userId, ...stateArgs(state) });
  throwIfError(error);
  return data;
}
