import type { Language, Port } from "@/lib/ports";
import type { Trip } from "@/lib/user-storage";

export type OceanAssistantMessage = {
  id:string;
  role:"user"|"assistant";
  content:string;
};

export type OceanAssistantBodyCondition = {
  sleep?:"good"|"insufficient";
  diet?:"balanced"|"empty"|"heavy";
  fatigue?:"low"|"medium"|"high";
};

export type OceanAssistantBrief = {
  title:string;
  detail:string;
};

export type OceanAssistantContext = {
  language:Language;
  harbor:{id:string;name:string;county:string;seaArea:string;availableRoutes:string[]};
  activity:{id:string;name:string};
  departure?:{time:string;label:string};
  ocean?:{
    waveHeightM:number;
    wavePeriodSec:number;
    windSpeedMs:number;
    windDirectionDeg?:number;
    waveDirectionDeg?:number;
    currentSpeedMs?:number;
  };
  trip:{vesselType:"small"|"medium"|"large";durationMinutes:number};
  userCondition:{motionSicknessSensitivity:"low"|"medium"|"high"}&OceanAssistantBodyCondition;
  risk?:{score:number;level:"low"|"medium"|"high"|"veryHigh";topFactors:{id:string;label:string;points:number}[]};
  bestDeparture?:{time:string;label:string;score:number;level:"low"|"medium"|"high"|"veryHigh"};
  timeline:{time:string;label:string;score:number;level:"low"|"medium"|"high"|"veryHigh";waveHeightM:number;wavePeriodSec:number;windSpeedMs:number}[];
  seaLog:{date:string;harbor:string;activity:string;predictedScore:number;actualExperience:"none"|"mild"|"severe"}[];
  oceanBrief?:OceanAssistantBrief;
  source:{provider:"Open-Meteo";queriedAt?:string;scope:string};
  unavailable:string[];
};

type Reading = {
  score:number;
  marine:{time:string;wave:number;period:number;wind:number;current:number|null;waveDirection:number|null;windDirection:number|null};
  contributions:{id:string;zh:string;en:string;points:number}[];
};

type TimelineReading = Reading&{index:number};

export function buildOceanAssistantContext(input:{
  language:Language;
  port:Port;
  activity:{id:string;zh:string;en:string};
  boat:"small"|"medium"|"large";
  sensitivity:"low"|"medium"|"high";
  duration:number;
  selected?:Reading;
  best?:Reading;
  timeline:TimelineReading[];
  timeLabel?:string;
  bestLabel?:string;
  trips:Trip[];
  activityLabels:Record<string,{zh:string;en:string}>;
  portLabels:Record<string,{zh:string;en:string}>;
  queriedAt?:string;
  bodyCondition?:OceanAssistantBodyCondition;
  oceanBrief?:OceanAssistantBrief;
}):OceanAssistantContext {
  const {language,port,selected,best}=input;
  const local=(zh:string,en:string)=>language==="zh"?zh:en;
  const levelFor=(score:number):"low"|"medium"|"high"|"veryHigh"=>score<30?"low":score<60?"medium":score<80?"high":"veryHigh";
  const unavailable=[local("潮汐","tide"),local("天氣狀況","weather conditions"),local("已選航線","selected route")];
  if(!input.bodyCondition?.sleep)unavailable.push(local("睡眠狀況","sleep condition"));
  if(!input.bodyCondition?.diet)unavailable.push(local("飲食狀況","diet condition"));
  if(!input.bodyCondition?.fatigue)unavailable.push(local("疲勞程度","fatigue level"));
  if(!selected)unavailable.push(local("目前時段海況與風險","current marine reading and risk"));
  return {
    language,
    harbor:{
      id:port.id,
      name:local(port.zh,port.en),
      county:local(port.countyZh,port.countyEn),
      seaArea:local(port.areaZh,port.areaEn),
      availableRoutes:language==="zh"?port.routesZh:port.routesEn,
    },
    activity:{id:input.activity.id,name:local(input.activity.zh,input.activity.en)},
    ...(selected&&input.timeLabel?{departure:{time:selected.marine.time,label:input.timeLabel}}:{}),
    ...(selected?{ocean:{
      waveHeightM:selected.marine.wave,
      wavePeriodSec:selected.marine.period,
      windSpeedMs:selected.marine.wind,
      ...(selected.marine.windDirection===null?{}:{windDirectionDeg:selected.marine.windDirection}),
      ...(selected.marine.waveDirection===null?{}:{waveDirectionDeg:selected.marine.waveDirection}),
      ...(selected.marine.current===null?{}:{currentSpeedMs:selected.marine.current}),
    }}:{}),
    trip:{vesselType:input.boat,durationMinutes:input.duration},
    userCondition:{motionSicknessSensitivity:input.sensitivity,...input.bodyCondition},
    ...(selected?{risk:{score:selected.score,level:levelFor(selected.score),topFactors:selected.contributions.slice(0,5).map(item=>({id:item.id,label:local(item.zh,item.en),points:Number(item.points.toFixed(1))}))}}:{}),
    ...(best&&input.bestLabel?{bestDeparture:{time:best.marine.time,label:input.bestLabel,score:best.score,level:levelFor(best.score)}}:{}),
    timeline:input.timeline.map(item=>({time:item.marine.time,label:new Intl.DateTimeFormat(language==="zh"?"zh-TW":"en-GB",{timeZone:"Asia/Taipei",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hourCycle:"h23"}).format(new Date(item.marine.time)),score:item.score,level:levelFor(item.score),waveHeightM:item.marine.wave,wavePeriodSec:item.marine.period,windSpeedMs:item.marine.wind})),
    seaLog:input.trips.slice(0,6).map(trip=>({
      date:trip.date,
      harbor:input.portLabels[trip.portId]?.[language]??trip.portId,
      activity:input.activityLabels[trip.activity]?.[language]??trip.activity,
      predictedScore:trip.score,
      actualExperience:trip.actual===0?"none":trip.actual===1?"mild":"severe",
    })),
    ...(input.oceanBrief?{oceanBrief:input.oceanBrief}:{}),
    source:{provider:"Open-Meteo",...(input.queriedAt?{queriedAt:input.queriedAt}:{}),scope:local("海域格點模式預報，非港內即時觀測","Marine grid model forecast, not live harbor observation")},
    unavailable,
  };
}

export function withBodyCondition(context:OceanAssistantContext,condition:OceanAssistantBodyCondition):OceanAssistantContext {
  const labels:Record<keyof OceanAssistantBodyCondition,{zh:string;en:string}>={sleep:{zh:"睡眠狀況",en:"sleep condition"},diet:{zh:"飲食狀況",en:"diet condition"},fatigue:{zh:"疲勞程度",en:"fatigue level"}};
  const provided=new Set((Object.keys(condition) as (keyof OceanAssistantBodyCondition)[]).filter(key=>condition[key]).map(key=>labels[key][context.language]));
  return {...context,userCondition:{...context.userCondition,...condition},unavailable:context.unavailable.filter(item=>!provided.has(item))};
}

export function extractOpenAIText(value:unknown):string|null {
  if(!value||typeof value!=="object")return null;
  const output=(value as{output?:unknown}).output;
  if(!Array.isArray(output))return null;
  const parts:string[]=[];
  for(const item of output){
    if(!item||typeof item!=="object"||!Array.isArray((item as{content?:unknown}).content))continue;
    for(const content of (item as{content:unknown[]}).content){
      if(content&&typeof content==="object"&&(content as{type?:unknown}).type==="output_text"&&typeof (content as{text?:unknown}).text==="string")parts.push((content as{text:string}).text);
    }
  }
  const text=parts.join("\n").trim();
  return text||null;
}
