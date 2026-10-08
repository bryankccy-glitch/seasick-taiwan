import assert from "node:assert/strict";
import test from "node:test";
import { getSupabaseServerConfig, isUniqueConstraintError } from "../lib/supabase-server-config.ts";

test("Supabase server config accepts only an HTTPS URL and a server secret",()=>{
  assert.deepEqual(getSupabaseServerConfig({SUPABASE_URL:"https://example.supabase.co/path",SUPABASE_SECRET_KEY:"sb_secret_test-value"}),{url:"https://example.supabase.co",secretKey:"sb_secret_test-value"});
});
test("Supabase server config rejects publishable keys and insecure URLs",()=>{
  assert.throws(()=>getSupabaseServerConfig({SUPABASE_URL:"https://example.supabase.co",SUPABASE_SECRET_KEY:"sb_publishable_not-server-only"}),/server-only Supabase secret key/);
  assert.throws(()=>getSupabaseServerConfig({SUPABASE_URL:"http://example.supabase.co",SUPABASE_SECRET_KEY:"sb_secret_test-value"}),/must use HTTPS/);
});
test("duplicate username errors are identified by the PostgreSQL unique code",()=>{
  assert.equal(isUniqueConstraintError({code:"23505",message:"duplicate"}),true);
  assert.equal(isUniqueConstraintError({code:"23503",message:"foreign key"}),false);
  assert.equal(isUniqueConstraintError(new Error("duplicate")),false);
});
