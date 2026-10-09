import { test } from "node:test";
import assert from "node:assert/strict";
import { buildOceanAssistantContext, extractOpenAIText, withBodyCondition } from "../lib/ocean-assistant.ts";
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
