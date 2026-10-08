import assert from "node:assert/strict";
import test from "node:test";
import { normalizeUsername, passwordSchema, usernameSchema } from "../lib/auth-validation.ts";

test("username normalization prevents case, spacing, and full-width duplicates",()=>{
  assert.equal(normalizeUsername("  SeaSick   ＴＡＩＷＡＮ  "),"seasick taiwan");
  assert.equal(normalizeUsername("使用者Ａ"),normalizeUsername("使用者A"));
});
test("username validation accepts normal names and rejects unsafe characters",()=>{
  assert.equal(usernameSchema.safeParse("海風旅人").success,true);
  assert.equal(usernameSchema.safeParse("A").success,false);
  assert.equal(usernameSchema.safeParse("<script>").success,false);
  assert.equal(usernameSchema.safeParse(`sea${String.fromCharCode(0)}sick`).success,false);
});
test("password validation enforces the bcrypt-safe length boundary",()=>{
  assert.equal(passwordSchema.safeParse("1234567").success,false);
  assert.equal(passwordSchema.safeParse("12345678").success,true);
  assert.equal(passwordSchema.safeParse("x".repeat(72)).success,true);
  assert.equal(passwordSchema.safeParse("x".repeat(73)).success,false);
});
