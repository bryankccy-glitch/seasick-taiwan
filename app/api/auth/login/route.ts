import bcrypt from "bcryptjs";
import { z } from "zod";
import { createSession } from "@/lib/server/auth";
import { findAccountByUsernameKey, readStoredState, recordSuccessfulLogin } from "@/lib/server/database";
import { noStoreJson, normalizeUsername, passwordSchema, rateLimit, requestIsSameOrigin, usernameSchema } from "@/lib/server/security";
import { defaultUserState, userStateSchema } from "@/lib/server/user-state";

export const runtime = "nodejs";
const loginSchema = z.object({ username:usernameSchema, password:passwordSchema });

export async function POST(request:Request) {
  if (!requestIsSameOrigin(request)) return noStoreJson({ error:"請重新整理頁面後再試一次" }, { status:403 });
  if (!rateLimit(request,"login",10)) return noStoreJson({ error:"嘗試次數過多，請稍後再試" }, { status:429 });
  try {
    const parsed = loginSchema.safeParse(await request.json());
    if (!parsed.success) return noStoreJson({ error:"名稱或密碼不正確" }, { status:400 });
    const user = await findAccountByUsernameKey(normalizeUsername(parsed.data.username));
    const valid = user ? await bcrypt.compare(parsed.data.password,user.password_hash) : false;
    if (!user || !valid) return noStoreJson({ error:"名稱或密碼不正確" }, { status:401 });
    const raw = (await readStoredState(user.id)) ?? defaultUserState;
    const result = userStateSchema.safeParse(raw);
    const state = result.success ? result.data : defaultUserState;
    await recordSuccessfulLogin(user.id);
    await createSession({ id:user.id, username:user.username });
    return noStoreJson({ user:{ id:user.id, username:user.username }, state });
  } catch (error) {
    console.error("login failed", error instanceof Error ? error.message : "unknown");
    return noStoreJson({ error:"目前無法登入，請稍後再試" }, { status:500 });
  }
}
