import { clearSession } from "@/lib/server/auth";
import { noStoreJson, requestIsSameOrigin } from "@/lib/server/security";
export const runtime = "nodejs";
export async function POST(request:Request) {
  if (!requestIsSameOrigin(request)) return noStoreJson({ error:"請重新整理頁面後再試一次" }, { status:403 });
  await clearSession();
  return noStoreJson({ ok:true });
}
