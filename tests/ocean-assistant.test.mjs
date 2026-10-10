import { test } from "node:test";
import assert from "node:assert/strict";
import { buildOceanAssistantContext, extractOpenAIText, withBodyCondition } from "../lib/ocean-assistant.ts";
import { buildFreeOceanInsight } from "../lib/ocean-assistant-fallback.ts";
import { ports } from "../lib/ports.ts";

const reading={
  score:72,
  marine:{time:"2026-10-09T06:00:00.000Z",wave:1.6,period:7.2,wind:5.5,current:null,waveDirection:45,windDirection:80},
  contributions:[{id:"wave",zh:"示性波高",en:"Wave height",points:21.5},{id:"personal",zh:"個人敏感度",en:"Personal sensitivity",points:9.2}],
};

function context() {
  return buildOceanAssistantContext({
    language:"zh",port:ports.find(port=>port.id==="hualien"),activity:{id:"whale",zh:"賞鯨",en:"Whale watching"},boat:"medium",sensitivity:"high",duration:120,
    selected:reading,best:{...reading,score:54,marine:{...reading.marine,time:"2026-10-09T00:00:00.000Z",wave:1.1,wind:3.2}},timeline:[{index:0,...reading}],timeLabel:"10/09 14:00",bestLabel:"10/09 08:00",
    trips:[{id:"1",portId:"hualien",date:"2026/10/08",score:55,actual:2,activity:"whale"}],activityLabels:{whale:{zh:"賞鯨",en:"Whale watching"}},portLabels:{hualien:{zh:"花蓮港",en:"Hualien Harbor"}},queriedAt:"2026-10-09T01:00:00.000Z",
  });
}

test("assistant context uses live risk data and never invents unavailable marine fields",()=>{
  const value=context();
  assert.equal(value.harbor.name,"花蓮港");
  assert.equal(value.ocean.waveHeightM,1.6);
  assert.equal(value.risk.score,72);
  assert.equal(value.bestDeparture.score,54);
  assert.equal("tide" in value.ocean,false);
  assert.equal("weather" in value,false);
  assert.deepEqual(value.seaLog,[{date:"2026/10/08",harbor:"花蓮港",activity:"賞鯨",predictedScore:55,actualExperience:"severe"}]);
  assert.ok(value.unavailable.includes("潮汐"));
  assert.ok(value.unavailable.includes("已選航線"));
});

test("optional body condition is added only after the user supplies it",()=>{
  const initial=context();
  assert.equal(initial.userCondition.sleep,undefined);
  const updated=withBodyCondition(initial,{sleep:"insufficient",fatigue:"high"});
  assert.equal(updated.userCondition.sleep,"insufficient");
  assert.equal(updated.userCondition.fatigue,"high");
  assert.equal(updated.unavailable.includes("睡眠狀況"),false);
  assert.ok(updated.unavailable.includes("飲食狀況"));
});

test("OpenAI response extraction accepts output text and rejects empty payloads",()=>{
  assert.equal(extractOpenAIText({output:[{type:"message",content:[{type:"output_text",text:"目前風險較高。"}]}]}),"目前風險較高。");
  assert.equal(extractOpenAIText({output:[]}),null);
  assert.equal(extractOpenAIText(null),null);
});

test("free insight explains real risk factors without inventing tide data",()=>{
  const answer=buildFreeOceanInsight(context(),"為什麼今天暈船風險高？");
  assert.match(answer,/花蓮港/);
  assert.match(answer,/72\/100/);
  assert.match(answer,/浪高|示性波高/);
  assert.doesNotMatch(answer,/潮高|滿潮|乾潮/);
});

test("free insight identifies the selected harbor and changes with harbor context",()=>{
  const hualien=context();
  const keelung={...hualien,harbor:{id:"keelung",name:"基隆港",county:"基隆市",seaArea:"基隆港外海",availableRoutes:["基隆嶼航線"]},ocean:{...hualien.ocean,waveHeightM:.8,windSpeedMs:3.1},risk:{...hualien.risk,score:46,level:"medium"}};
  const hualienAnswer=buildFreeOceanInsight(hualien,"為什麼今天暈船風險高？");
  const keelungAnswer=buildFreeOceanInsight(keelung,"為什麼今天暈船風險高？");
  assert.match(hualienAnswer,/花蓮港（花蓮賞鯨近海）/);
  assert.match(keelungAnswer,/基隆港（基隆港外海）/);
  assert.match(keelungAnswer,/46\/100/);
  assert.notEqual(hualienAnswer,keelungAnswer);
});

test("free insight compares supplied forecast points and chooses the lower score",()=>{
  const value=context();
  value.timeline=[
    {...value.timeline[0],time:"2026-10-09T02:00:00.000Z",label:"10/09 10:00",score:44,waveHeightM:1.1,windSpeedMs:3.1},
    {...value.timeline[0],time:"2026-10-09T06:00:00.000Z",label:"10/09 14:00",score:72,waveHeightM:1.6,windSpeedMs:5.5},
  ];
  const answer=buildFreeOceanInsight(value,"上午 10 點和下午 2 點哪個比較適合？");
  assert.match(answer,/10\/09 10:00相對較適合/);
  assert.match(answer,/相差 28 分/);
  assert.match(answer,/潮汐資料目前未接入/);
});

test("free insight uses optional body state and remains non-diagnostic",()=>{
  const value=withBodyCondition(context(),{sleep:"insufficient",fatigue:"high"});
  const answer=buildFreeOceanInsight(value,"我的身體狀況適合出海嗎？");
  assert.match(answer,/睡眠: insufficient/);
  assert.match(answer,/不是醫療診斷/);
});
