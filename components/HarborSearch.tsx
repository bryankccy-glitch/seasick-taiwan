"use client";
import { useId, useMemo, useState } from "react";
import { ChevronRight, MapPin, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { areaLabel, label, type Language, type Port } from "@/lib/ports";
import { buildTimeline, riskLevel, type RiskInput } from "@/lib/risk";

type Props = {language:Language;query:string;setQuery:(value:string)=>void;open:boolean;setOpen:(value:boolean)=>void;results:Port[];onSelect:(id:string)=>void;placeholder:string;riskInput:Omit<RiskInput,"port"|"hourIndex">;timeIndex:number;suggestions?:boolean};
export function HarborSearch({language,query,setQuery,open,setOpen,results,onSelect,placeholder,riskInput,timeIndex,suggestions=true}:Props) {
  const id=useId(); const [active,setActive]=useState(-1); const zh=language==="zh";
  const expanded=suggestions&&open;
  const readings=useMemo(()=>results.map(port=>{const timeline=buildTimeline({port,...riskInput});return {port,current:timeline[timeIndex],best:timeline.reduce((a,b)=>b.score<a.score?b:a,timeline[0])};}),[results,riskInput,timeIndex]);
  function select(index:number){if(results[index])onSelect(results[index].id);setOpen(false);setActive(-1);}
  return <div className="app-search" role="search" onBlur={event=>{if(!event.currentTarget.contains(event.relatedTarget as Node|null)){setOpen(false);setActive(-1);}}}>
    <Search aria-hidden="true"/>
    <Input role={suggestions?"combobox":undefined} aria-label={zh?"搜尋港口、海域或航線":"Search harbor, sea area or route"} aria-autocomplete={suggestions?"list":undefined} aria-expanded={suggestions?expanded:undefined} aria-controls={expanded?`${id}-results`:undefined} aria-activedescendant={expanded&&active>=0&&results[active]?`${id}-${results[active].id}`:undefined} autoComplete="off" placeholder={placeholder} value={query} onFocus={()=>setOpen(true)} onChange={event=>{setQuery(event.target.value);setActive(-1);setOpen(true);}} onKeyDown={event=>{
      if(event.key==="Escape"){setOpen(false);setActive(-1);}
      if(!suggestions)return;
      if(event.key==="ArrowDown"||event.key==="ArrowUp"){event.preventDefault();setOpen(true);const next=event.key==="ArrowDown"?active+1:active<0?results.length-1:active-1;setActive(results.length?Math.max(0,Math.min(results.length-1,next)):-1);}
      if(event.key==="Enter"&&expanded&&results.length){event.preventDefault();select(active>=0?active:0);}
    }}/>
    {query&&<button type="button" aria-label={zh?"清除搜尋":"Clear search"} className="clear-search" onClick={()=>{setQuery("");setActive(-1);}}><X/></button>}
    {expanded&&<div className="search-results" id={`${id}-results`} role="listbox" aria-label={zh?"符合的港口":"Matching harbors"}>
      {readings.length?readings.map(({port,current,best},index)=><button type="button" role="option" tabIndex={-1} aria-selected={active===index} id={`${id}-${port.id}`} key={port.id} onPointerDown={event=>event.preventDefault()} onClick={()=>select(index)}>
        <MapPin aria-hidden="true"/><span><strong>{label(port,language)}</strong><small>{areaLabel(port,language)}</small></span><div className="search-metrics"><b className={riskLevel(current.score)}>Risk {current.score} / 100 · {zh?({low:"低",medium:"中",high:"高",veryHigh:"很高"}[riskLevel(current.score)]):riskLevel(current.score).toUpperCase()}</b><small>{zh?"波高":"Wave"} {current.marine.wave.toFixed(1)} m · {zh?"最佳":"Best"} {best.index>=6?"+1 ":""}{String(best.marine.hour).padStart(2,"0")}:00</small></div><ChevronRight aria-hidden="true"/>
      </button>):<p role="status">{zh?"找不到港口，試試其他名稱或海域。":"No matching harbor. Try another name or sea area."}</p>}
    </div>}
  </div>;
}
