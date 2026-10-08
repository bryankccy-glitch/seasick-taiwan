import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { createSession } from "@/lib/server/auth";
import { createAccount } from "@/lib/server/database";
import { noStoreJson, normalizeUsername, passwordSchema, rateLimit, requestIsSameOrigin, usernameSchema } from "@/lib/server/security";
import { defaultUserState, userStateSchema } from "@/lib/server/user-state";
import { isUniqueConstraintError } from "@/lib/supabase-server-config";

export const runtime = "nodejs";
const registerSchema = z.object({ username:usernameSchema, password:passwordSchema, initialState:userStateSchema.optional() });

export async function POST(request:Request) {
  if (!requestIsSameOrigin(request)) return noStoreJson({ error:"請重新整理頁面後再試一次" }, { status:403 });
  if (!rateLimit(request,"register",6)) return noStoreJson({ error:"嘗試次數過多，請稍後再試" }, { status:429 });
  try {
    const parsed = registerSchema.safeParse(await request.json());
    if (!parsed.success) return noStoreJson({ error:parsed.error.issues[0]?.message ?? "資料格式不正確" }, { status:400 });
    const username = parsed.data.username.normalize("NFKC").trim().replace(/\s+/g," ");
    const loginKey = normalizeUsername(username);
    const passwordHash = await bcrypt.hash(parsed.data.password,12);
    const userId = randomUUID();
    const state = parsed.data.initialState ?? defaultUserState;
    try {
      await createAccount({ id:userId, username, loginKey, passwordHash, state });
    } catch (error) {
      if (isUniqueConstraintError(error)) return noStoreJson({ error:"這個名稱已有人使用，請換一個名稱或直接登入" }, { status:409 });
      throw error;
    }
    await createSession({ id:userId, username });
    return noStoreJson({ user:{ id:userId, username }, state }, { status:201 });
  } catch (error) {
    console.error("register failed", error instanceof Error ? error.message : "unknown");
    return noStoreJson({ error:"目前無法完成註冊，請稍後再試" }, { status:500 });
  }
}
