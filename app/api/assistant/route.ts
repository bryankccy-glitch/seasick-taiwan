import { z } from "zod";
import { noStoreJson, rateLimit, requestIsSameOrigin } from "@/lib/server/security";
import { requestOceanAssistant } from "@/lib/server/ocean-assistant";

export const runtime="nodejs";

const finite=z.number().finite();
const level=z.enum(["low","medium","high","veryHigh"]);
const messageSchema=z.object({role:z.enum(["user","assistant"]),content:z.string().trim().min(1).max(1_200)}).strict();
const contextSchema=z.object({
  language:z.enum(["zh","en"]),
  harbor:z.object({id:z.string().max(64),name:z.string().max(80),county:z.string().max(80),seaArea:z.string().max(120),availableRoutes:z.array(z.string().max(120)).max(8)}).strict(),
  activity:z.object({id:z.string().max(40),name:z.string().max(80)}).strict(),
  departure:z.object({time:z.string().datetime(),label:z.string().max(80)}).strict().optional(),
  ocean:z.object({waveHeightM:finite.min(0).max(30),wavePeriodSec:finite.gt(0).max(60),windSpeedMs:finite.min(0).max(100),windDirectionDeg:finite.min(0).max(360).optional(),waveDirectionDeg:finite.min(0).max(360).optional(),currentSpeedMs:finite.min(0).max(15).optional()}).strict().optional(),
  trip:z.object({vesselType:z.enum(["small","medium","large"]),durationMinutes:z.number().int().min(1).max(1_440)}).strict(),
  userCondition:z.object({motionSicknessSensitivity:z.enum(["low","medium","high"]),sleep:z.enum(["good","insufficient"]).optional(),diet:z.enum(["balanced","empty","heavy"]).optional(),fatigue:z.enum(["low","medium","high"]).optional()}).strict(),
  risk:z.object({score:z.number().int().min(0).max(100),level,topFactors:z.array(z.object({id:z.string().max(40),label:z.string().max(80),points:finite.min(0).max(100)}).strict()).max(9)}).strict().optional(),
  bestDeparture:z.object({time:z.string().datetime(),label:z.string().max(80),score:z.number().int().min(0).max(100),level}).strict().optional(),
  timeline:z.array(z.object({time:z.string().datetime(),label:z.string().max(80),score:z.number().int().min(0).max(100),level,waveHeightM:finite.min(0).max(30),wavePeriodSec:finite.gt(0).max(60),windSpeedMs:finite.min(0).max(100)}).strict()).max(24),
  seaLog:z.array(z.object({date:z.string().max(40),harbor:z.string().max(80),activity:z.string().max(80),predictedScore:z.number().int().min(0).max(100),actualExperience:z.enum(["none","mild","severe"])}).strict()).max(6),
  oceanBrief:z.object({title:z.string().max(160),detail:z.string().max(500)}).strict().optional(),
  source:z.object({provider:z.literal("Open-Meteo"),queriedAt:z.string().datetime().optional(),scope:z.string().max(180)}).strict(),
  unavailable:z.array(z.string().max(80)).max(12),
}).strict();
const bodySchema=z.object({messages:z.array(messageSchema).min(1).max(10),context:contextSchema}).strict();

export async function POST(request:Request) {
  if(!requestIsSameOrigin(request))return noStoreJson({error:"請重新整理頁面後再試一次",code:"invalid_origin"},{status:403});
  if(!rateLimit(request,"ocean-assistant",12))return noStoreJson({error:"詢問次數較多，請稍後再試。",code:"rate_limited"},{status:429});
  try {
    const parsed=bodySchema.safeParse(await request.json());
    if(!parsed.success)return noStoreJson({error:"AI 海洋助理收到的資料格式不完整，請重新整理後再試。",code:"invalid_request"},{status:400});
    const result=await requestOceanAssistant({context:parsed.data.context,language:parsed.data.context.language,messages:parsed.data.messages});
    if(!result.ok){
      const notConfigured=result.code==="not_configured";
      return noStoreJson({error:notConfigured?"AI 海洋助理尚未完成服務設定；其他海況功能仍可正常使用。":"AI 海洋助理目前無法取得完整資料，請稍後再試。",code:result.code},{status:notConfigured?503:502});
    }
    return noStoreJson({message:result.text});
  } catch(error) {
    console.error("ocean assistant route failed",{name:error instanceof Error?error.name:"unknown"});
    return noStoreJson({error:"AI 海洋助理目前無法取得完整資料，請稍後再試。",code:"internal_error"},{status:500});
  }
}
