import type { OceanAssistantContext } from "@/lib/ocean-assistant";

type TimelinePoint=OceanAssistantContext["timeline"][number];
const levels={low:"低",medium:"中",high:"高",veryHigh:"很高"} as const;

function hourInTaiwan(time:string){
  return Number(new Intl.DateTimeFormat("en-GB",{timeZone:"Asia/Taipei",hour:"2-digit",hourCycle:"h23"}).format(new Date(time)));
}

function hoursInQuestion(question:string){
  return [...question.matchAll(/(?:上午|下午|早上|晚上)?\s*(\d{1,2})(?:\s*[:：]\s*00|\s*[點時])/g)].map(match=>{
    let hour=Number(match[1]);
    if((match[0].includes("下午")||match[0].includes("晚上"))&&hour<12)hour+=12;
    if(match[0].includes("上午")&&hour===12)hour=0;
    return hour;
  }).filter(hour=>hour>=0&&hour<=23);
}

function pointLine(point:TimelinePoint,zh:boolean){
  return zh
    ? `${point.label}：風險 ${point.score}/100（${levels[point.level]}）、浪高 ${point.waveHeightM.toFixed(1)} m、週期 ${point.wavePeriodSec.toFixed(1)} 秒、風速 ${point.windSpeedMs.toFixed(1)} m/s`
    : `${point.label}: risk ${point.score}/100 (${point.level}), wave ${point.waveHeightM.toFixed(1)} m, period ${point.wavePeriodSec.toFixed(1)} s, wind ${point.windSpeedMs.toFixed(1)} m/s`;
}

function compareTimes(context:OceanAssistantContext,question:string,zh:boolean){
  const requested=hoursInQuestion(question).slice(0,2).map(hour=>context.timeline.find(point=>hourInTaiwan(point.time)===hour)).filter(Boolean) as TimelinePoint[];
  const selected=[context.departure?.time,context.bestDeparture?.time].map(time=>context.timeline.find(point=>point.time===time)).filter(Boolean) as TimelinePoint[];
  const points=requested.length===2?requested:selected.length===2?selected:[...context.timeline].sort((a,b)=>a.score-b.score).slice(0,2);
  if(points.length<2)return zh?"目前沒有取得兩個可比較時段的完整海況資料。":"Two complete forecast points are not available for comparison.";
  const [a,b]=points;
  const best=a.score<=b.score?a:b;
  const difference=Math.abs(a.score-b.score);
  return zh
    ? `**${best.label}相對較適合。**\n\n- ${pointLine(a,true)}\n- ${pointLine(b,true)}\n\n兩個時段的風險相差 ${difference} 分。系統同時比較浪高、週期與風速；潮汐資料目前未接入，因此沒有納入判讀。`
    : `**${best.label} is relatively more suitable.**\n\n- ${pointLine(a,false)}\n- ${pointLine(b,false)}\n\nThe risk scores differ by ${difference} points. Wave height, period and wind were compared together. Tide data is unavailable and was not used.`;
}

function seaLogNote(context:OceanAssistantContext,zh:boolean){
  if(!context.seaLog.some(item=>item.actualExperience==="severe"&&item.predictedScore<60))return "";
  return zh
    ? "\n\n**個人紀錄提醒**\n你的 Sea Log 曾在中低預測分數下出現明顯不適，這次建議採取更保守的選擇。"
    : "\n\n**Personal log reminder**\nYour Sea Log includes significant discomfort at a lower predicted score, so a more conservative choice is sensible.";
}

function explainRisk(context:OceanAssistantContext,zh:boolean){
  if(!context.risk||!context.ocean)return zh?"目前海況或風險資料尚未完整載入。":"The marine or risk data is not fully loaded yet.";
  const factors=context.risk.topFactors.slice(0,3);
  const c=context.userCondition;
  const body=[c.sleep==="insufficient"?(zh?"睡眠不足":"insufficient sleep"):null,c.diet==="empty"?(zh?"空腹":"empty stomach"):c.diet==="heavy"?(zh?"飲食過量":"heavy meal"):null,c.fatigue==="high"?(zh?"疲勞程度高":"high fatigue"):null].filter(Boolean);
  const sensitivity=zh?(c.motionSicknessSensitivity==="high"?"高":c.motionSicknessSensitivity==="medium"?"中":"低"):c.motionSicknessSensitivity;
  return zh
    ? `**目前風險：${levels[context.risk.level]}（${context.risk.score}/100）**\n\n**主要原因**\n${factors.map((factor,index)=>`${index+1}. ${factor.label}：+${factor.points.toFixed(1)} 分`).join("\n")}\n\n目前浪高 ${context.ocean.waveHeightM.toFixed(1)} m、週期 ${context.ocean.wavePeriodSec.toFixed(1)} 秒、風速 ${context.ocean.windSpeedMs.toFixed(1)} m/s，搭配 ${context.trip.durationMinutes} 分鐘航程與${sensitivity}敏感度${body.length?`；另外需注意${body.join("、")}`:""}。這是相對風險判讀，不是醫療診斷。${seaLogNote(context,true)}`
    : `**Current risk: ${context.risk.level} (${context.risk.score}/100)**\n\n**Main factors**\n${factors.map((factor,index)=>`${index+1}. ${factor.label}: +${factor.points.toFixed(1)} points`).join("\n")}\n\nCurrent conditions are ${context.ocean.waveHeightM.toFixed(1)} m waves, a ${context.ocean.wavePeriodSec.toFixed(1)} s period and ${context.ocean.windSpeedMs.toFixed(1)} m/s wind, combined with a ${context.trip.durationMinutes}-minute trip and ${sensitivity} sensitivity${body.length?`; also note ${body.join(", ")}`:""}. This is relative decision support, not a diagnosis.${seaLogNote(context,false)}`;
}

function recommendTime(context:OceanAssistantContext,zh:boolean){
  const best=context.bestDeparture;
  if(!best)return zh?"目前沒有足夠的預報時段可以選出最佳時間。":"There are not enough forecast points to choose a best time.";
  const point=context.timeline.find(item=>item.time===best.time);
  return zh
    ? `**目前相對推薦 ${best.label}。**\n\n風險 ${best.score}/100（${levels[best.level]}）${point?`，浪高 ${point.waveHeightM.toFixed(1)} m、風速 ${point.windSpeedMs.toFixed(1)} m/s`:""}。這是目前預報範圍內相對平穩的選擇，不代表保證不會暈船，也不能取代船公司或官方公告。`
    : `**The relatively preferred window is ${best.label}.**\n\nRisk is ${best.score}/100 (${best.level})${point?`, with ${point.waveHeightM.toFixed(1)} m waves and ${point.windSpeedMs.toFixed(1)} m/s wind`:""}. It is the calmer available option, not a guarantee or a replacement for official sailing notices.`;
}

function explainBody(context:OceanAssistantContext,zh:boolean){
  const c=context.userCondition;
  const known=[c.sleep&&`${zh?"睡眠":"Sleep"}: ${c.sleep}`,c.diet&&`${zh?"飲食":"Food"}: ${c.diet}`,c.fatigue&&`${zh?"疲勞":"Fatigue"}: ${c.fatigue}`].filter(Boolean);
  if(!known.length)return zh?"目前沒有取得睡眠、飲食與疲勞狀況。請先在上方補充，我才能納入判讀。":"Sleep, food and fatigue details are not available. Add them above to include them in the assessment.";
  const caution=c.sleep==="insufficient"||c.diet==="empty"||c.diet==="heavy"||c.fatigue==="high";
  return zh
    ? `目前已知：${known.join("、")}。${caution?"這些狀況可能降低你對船體晃動的耐受度，建議選擇較低風險時段並採取較保守決策。":"目前沒有看到明顯加重因素，但仍需搭配海況、船型和航程判斷。"}這不是醫療診斷。`
    : `Known conditions: ${known.join(", ")}. ${caution?"These may reduce tolerance to vessel motion, so prefer a lower-risk window and make a conservative choice.":"No obvious aggravating factor is present, but marine conditions, vessel and duration still matter."} This is not a medical diagnosis.`;
}

export function buildFreeOceanInsight(context:OceanAssistantContext,question:string){
  const zh=context.language==="zh";
  const q=question.toLowerCase();
  if(/比較|哪個|時段|compare|versus|\bvs\b/.test(q))return compareTimes(context,question,zh);
  if(/最好|推薦|適合.*時間|best|recommend|when/.test(q))return recommendTime(context,zh);
  if(/身體|睡|疲勞|空腹|飲食|body|sleep|fatigue|food/.test(q))return explainBody(context,zh);
  if(/浪|風速|週期|wave|wind|period/.test(q)&&context.ocean)return zh
    ? `目前浪高 ${context.ocean.waveHeightM.toFixed(1)} m、週期 ${context.ocean.wavePeriodSec.toFixed(1)} 秒、風速 ${context.ocean.windSpeedMs.toFixed(1)} m/s。浪高影響晃動幅度，週期影響晃動節奏，風會影響海面凌亂程度；系統會把三者與船型、航程和個人敏感度一起計算，而不是只看單一數值。`
    : `Current conditions are ${context.ocean.waveHeightM.toFixed(1)} m waves, a ${context.ocean.wavePeriodSec.toFixed(1)} s period and ${context.ocean.windSpeedMs.toFixed(1)} m/s wind. The score combines these with vessel, duration and sensitivity rather than relying on one reading.`;
  return explainRisk(context,zh);
}
