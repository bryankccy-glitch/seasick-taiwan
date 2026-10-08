import { readSession } from "@/lib/server/auth";
import { saveStoredState } from "@/lib/server/database";
import { noStoreJson, rateLimit, requestIsSameOrigin } from "@/lib/server/security";
import { userStateSchema } from "@/lib/server/user-state";
export const runtime = "nodejs";
export async function PUT(request:Request) {
  if (!requestIsSameOrigin(request)) return noStoreJson({ error:"請重新整理頁面後再試一次" }, { status:403 });
  if (!rateLimit(request,"state",120,60_000)) return noStoreJson({ error:"同步太頻繁，請稍後再試" }, { status:429 });
  const session = await readSession();
  if (!session) return noStoreJson({ error:"請先登入" }, { status:401 });
  try {
    const parsed = userStateSchema.safeParse(await request.json());
    if (!parsed.success) return noStoreJson({ error:"同步資料格式不正確" }, { status:400 });
    const updatedAt = await saveStoredState(session.id,parsed.data);
    return noStoreJson({ ok:true, updatedAt });
  } catch (error) {
    console.error("state sync failed", error instanceof Error ? error.message : "unknown");
    return noStoreJson({ error:"暫時無法同步紀錄" }, { status:500 });
  }
}
