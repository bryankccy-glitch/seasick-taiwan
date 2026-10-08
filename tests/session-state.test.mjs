import { test } from "node:test";
import assert from "node:assert/strict";
import { createNewAccountState, createVisitorState, shouldPersistLocally, shouldSyncToCloud } from "../lib/session-state.ts";

test("new accounts start with empty saved harbors and voyage history",()=>{
  assert.deepEqual(createNewAccountState("zh"),{favorites:[],trips:[],preferences:{language:"zh",lastPort:"keelung"}});
});

test("visitor sessions start empty and never persist locally or sync to Supabase",()=>{
  assert.deepEqual(createVisitorState("en"),{favorites:[],trips:[],preferences:{language:"en",lastPort:"keelung"}});
  assert.equal(shouldPersistLocally("visitor"),false);
  assert.equal(shouldSyncToCloud("visitor"),false);
  assert.equal(shouldSyncToCloud("authenticated"),true);
});
