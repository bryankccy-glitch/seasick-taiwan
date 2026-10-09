"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Bot, ChevronDown, MessageCircleMore, RotateCcw, Send, Sparkles, Waves, X } from "lucide-react";
import { withBodyCondition, type OceanAssistantBodyCondition, type OceanAssistantBrief, type OceanAssistantContext, type OceanAssistantMessage } from "@/lib/ocean-assistant";
import type { Language } from "@/lib/ports";

export type AssistantLaunchRequest = {id:string;prompt:string;brief?:OceanAssistantBrief};

const questions={
  zh:["為什麼今天暈船風險高？","幫我比較不同出航時段","今天最需要注意什麼？","浪高和風速怎麼影響我？","我的身體狀況適合出海嗎？"],
  en:["Why is my seasickness risk high?","Compare the departure times","What matters most today?","How do waves and wind affect me?","Does my condition suit this trip?"],
};

const copy={
  zh:{title:"SeaSick AI 海洋助理",subtitle:"根據目前港口與風險分析",aiMode:"AI 增強",insightMode:"免費智慧解讀",placeholder:"詢問目前海況、時段或暈船風險…",send:"送出",reset:"重設對話",close:"關閉 AI 海洋助理",open:"AI 海洋助理",empty:"我會直接讀取你目前選擇的港口、海況、船型與風險，不必重新輸入。",loading:"正在整理海況與風險因素",error:"AI 海洋助理目前無法取得完整資料，請稍後再試。",condition:"補充今日身體狀況（選填）",sleep:"睡眠",diet:"飲食",fatigue:"疲勞",good:"充足",poor:"不足",balanced:"正常",emptyDiet:"空腹",heavy:"過量",low:"低",medium:"中",high:"高",disclaimer:"SeaSick AI 提供出航風險決策參考，實際航行仍應以船公司、港口及官方公告為準。",context:"目前判讀",unavailable:"海況資料尚未完整載入，仍可詢問一般解讀。"},
  en:{title:"SeaSick AI Ocean Assistant",subtitle:"Uses the current harbor and risk analysis",aiMode:"AI enhanced",insightMode:"Free smart insight",placeholder:"Ask about conditions, timing or motion risk…",send:"Send",reset:"Reset conversation",close:"Close AI ocean assistant",open:"AI Ocean Assistant",empty:"I can read your current harbor, marine forecast, vessel and risk, so you do not need to re-enter them.",loading:"Reading the conditions and risk factors",error:"The AI ocean assistant cannot access complete data right now. Please try again later.",condition:"Add today's body condition (optional)",sleep:"Sleep",diet:"Food",fatigue:"Fatigue",good:"Good",poor:"Poor",balanced:"Balanced",emptyDiet:"Empty stomach",heavy:"Heavy meal",low:"Low",medium:"Medium",high:"High",disclaimer:"SeaSick AI is decision support only. Follow shipping company, harbor and official notices for actual sailings.",context:"Current context",unavailable:"Marine data is still loading. You can still ask for general guidance."},
};

function InlineText({text}:{text:string}) {
  return <>{text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean).map((part,index)=>part.startsWith("**")&&part.endsWith("**")?<strong key={index}>{part.slice(2,-2)}</strong>:<span key={index}>{part}</span>)}</>;
}

function MessageText({content}:{content:string}) {
  return <div className="assistant-markdown">{content.split(/\n{2,}/).filter(Boolean).map((block,index)=>{
    const lines=block.split("\n").filter(Boolean);
    if(lines.every(line=>/^[-*]\s+/.test(line)))return <ul key={index}>{lines.map((line,item)=><li key={item}><InlineText text={line.replace(/^[-*]\s+/,"")}/></li>)}</ul>;
    if(lines.every(line=>/^\d+[.)]\s+/.test(line)))return <ol key={index}>{lines.map((line,item)=><li key={item}><InlineText text={line.replace(/^\d+[.)]\s+/,"")}/></li>)}</ol>;
    return <p key={index}>{lines.map((line,item)=><span key={item}><InlineText text={line}/>{item<lines.length-1&&<br/>}</span>)}</p>;
  })}</div>;
}

function ConditionChoice<T extends string>({label,value,options,onChange}:{label:string;value?:T;options:{value:T;label:string}[];onChange:(value?:T)=>void}) {
  return <div className="assistant-condition-row"><span>{label}</span><div>{options.map(option=><button type="button" key={option.value} aria-pressed={value===option.value} onClick={()=>onChange(value===option.value?undefined:option.value)}>{option.label}</button>)}</div></div>;
}

export function OceanAssistant({context,language,launchRequest}:{context:OceanAssistantContext;language:Language;launchRequest?:AssistantLaunchRequest|null}) {
  const c=copy[language];
  const [open,setOpen]=useState(false);
  const [input,setInput]=useState("");
  const [messages,setMessages]=useState<OceanAssistantMessage[]>([]);
  const [bodyCondition,setBodyCondition]=useState<OceanAssistantBodyCondition>({});
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  const [responseMode,setResponseMode]=useState<"ai"|"insight"|null>(null);
  const [activeBrief,setActiveBrief]=useState<OceanAssistantBrief|undefined>();
  const abortRef=useRef<AbortController|null>(null);
  const handledRequest=useRef<string|null>(null);
  const scrollRef=useRef<HTMLDivElement>(null);

  useEffect(()=>()=>abortRef.current?.abort(),[]);
  useEffect(()=>{scrollRef.current?.scrollTo({top:scrollRef.current.scrollHeight,behavior:"smooth"})},[messages,busy]);

  const sendQuestion=useCallback(async(question:string,brief?:OceanAssistantBrief)=>{
    const content=question.trim();
    if(!content||busy)return;
    const userMessage:OceanAssistantMessage={id:crypto.randomUUID(),role:"user",content};
    const nextMessages=[...messages,userMessage].slice(-10);
    const requestContext=withBodyCondition({...context,...(brief?{oceanBrief:brief}:activeBrief?{oceanBrief:activeBrief}:{})},bodyCondition);
    setMessages(nextMessages);setInput("");setError("");setBusy(true);
    abortRef.current?.abort();const controller=new AbortController();abortRef.current=controller;
    try {
      const response=await fetch("/api/assistant",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({messages:nextMessages.map(({role,content})=>({role,content})),context:requestContext}),signal:controller.signal});
      const payload=await response.json() as {message?:string;error?:string;code?:string;mode?:"ai"|"insight"};
      if(!response.ok||!payload.message){setError(payload.error||c.error);return;}
      setResponseMode(payload.mode??"ai");
      setMessages(current=>[...current,{id:crypto.randomUUID(),role:"assistant",content:payload.message!}]);
    } catch(requestError) {
      if(requestError instanceof Error&&requestError.name==="AbortError")return;
      setError(c.error);
    } finally {
      if(abortRef.current===controller){abortRef.current=null;setBusy(false);}
    }
  },[activeBrief,bodyCondition,busy,c.error,context,messages]);

  useEffect(()=>{
    if(!launchRequest||handledRequest.current===launchRequest.id)return;
    handledRequest.current=launchRequest.id;setOpen(true);setActiveBrief(launchRequest.brief);
    void sendQuestion(launchRequest.prompt,launchRequest.brief);
  },[launchRequest,sendQuestion]);

  function reset(){abortRef.current?.abort();abortRef.current=null;setMessages([]);setInput("");setError("");setBusy(false);setActiveBrief(undefined);setResponseMode(null);}
  const riskSummary=context.risk?`${context.risk.score}/100 · ${context.risk.level}`:c.unavailable;
  return <>
    <button type="button" className={`assistant-launch${open?" is-open":""}`} onClick={()=>setOpen(!open)} aria-expanded={open} aria-controls="ocean-assistant-panel"><span><Sparkles/></span><b>{c.open}</b></button>
    {open&&<aside id="ocean-assistant-panel" className="assistant-panel" aria-label={c.title}>
      <header className="assistant-header"><div className="assistant-avatar"><Waves/><i/></div><div><strong>{c.title}</strong><span>{c.subtitle}{responseMode&&<em className={`assistant-mode ${responseMode}`}>{responseMode==="ai"?c.aiMode:c.insightMode}</em>}</span></div><button type="button" onClick={reset} aria-label={c.reset} title={c.reset}><RotateCcw/></button><button type="button" onClick={()=>setOpen(false)} aria-label={c.close}><X/></button></header>
      <div className="assistant-context"><span>{c.context}</span><strong>{context.harbor.name}</strong><b>{riskSummary}</b></div>
      <details className="assistant-condition"><summary>{c.condition}<ChevronDown/></summary><div className="assistant-condition-grid">
        <ConditionChoice label={c.sleep} value={bodyCondition.sleep} options={[{value:"good",label:c.good},{value:"insufficient",label:c.poor}]} onChange={sleep=>setBodyCondition(value=>({...value,sleep}))}/>
        <ConditionChoice label={c.diet} value={bodyCondition.diet} options={[{value:"balanced",label:c.balanced},{value:"empty",label:c.emptyDiet},{value:"heavy",label:c.heavy}]} onChange={diet=>setBodyCondition(value=>({...value,diet}))}/>
        <ConditionChoice label={c.fatigue} value={bodyCondition.fatigue} options={[{value:"low",label:c.low},{value:"medium",label:c.medium},{value:"high",label:c.high}]} onChange={fatigue=>setBodyCondition(value=>({...value,fatigue}))}/>
      </div></details>
      <div className="assistant-messages" ref={scrollRef} aria-live="polite">
        {!messages.length&&!busy&&<div className="assistant-empty"><Bot/><p>{c.empty}</p><div>{questions[language].map(question=><button type="button" key={question} onClick={()=>void sendQuestion(question)}>{question}</button>)}</div></div>}
        {messages.map(message=><article key={message.id} className={`assistant-message ${message.role}`}><span>{message.role==="assistant"?<Waves/>:<MessageCircleMore/>}</span><div><b>{message.role==="assistant"?"SeaSick AI":language==="zh"?"你":"You"}</b><MessageText content={message.content}/></div></article>)}
        {busy&&<div className="assistant-thinking" role="status"><span><i/><i/><i/></span>{c.loading}</div>}
        {error&&<p className="assistant-error" role="alert">{error}</p>}
      </div>
      {!!messages.length&&<div className="assistant-quick">{questions[language].slice(0,3).map(question=><button type="button" key={question} onClick={()=>void sendQuestion(question)} disabled={busy}>{question}</button>)}</div>}
      <form className="assistant-composer" onSubmit={event=>{event.preventDefault();void sendQuestion(input)}}><textarea value={input} onChange={event=>setInput(event.target.value)} onKeyDown={event=>{if(event.key==="Enter"&&!event.shiftKey){event.preventDefault();void sendQuestion(input)}}} maxLength={800} rows={2} placeholder={c.placeholder}/><button type="submit" disabled={busy||!input.trim()} aria-label={c.send}><Send/></button></form>
      <footer>{c.disclaimer}</footer>
    </aside>}
  </>;
}
