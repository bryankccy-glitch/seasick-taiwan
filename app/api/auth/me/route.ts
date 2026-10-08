import { readSession } from "@/lib/server/auth";
import { findAccountById, readStoredState } from "@/lib/server/database";
import { noStoreJson } from "@/lib/server/security";
import { defaultUserState, userStateSchema } from "@/lib/server/user-state";
export const runtime = "nodejs";
export async function GET() {
  try {
    const session = await readSession();
    if (!session) return noStoreJson({ user:null }, { status:401 });
    const user = await findAccountById(session.id);
    if (!user) return noStoreJson({ user:null }, { status:401 });
    const raw = (await readStoredState(user.id)) ?? defaultUserState;
    const result = userStateSchema.safeParse(raw);
    return noStoreJson({ user, state:result.success ? result.data : defaultUserState });
  } catch (error) {
    console.error("session lookup failed", error instanceof Error ? error.message : "unknown");
    return noStoreJson({ user:null, error:"服務暫時無法使用" }, { status:503 });
  }
}
