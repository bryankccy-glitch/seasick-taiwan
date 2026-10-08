"use client";
import { Dialog as Primitive } from "radix-ui";
import { Star, X, ArrowUpRight } from "lucide-react";
import { areaLabel, countyLabel, label, type Language, type Port } from "@/lib/ports";
import { MarineTimeline, type ForecastRange, type MarineReading } from "./MarineTimeline";
import { AnimatedValue, RiskIndicator } from "./RiskIndicator";

type Props = {
  open:boolean; onOpenChange:(open:boolean)=>void; port:Port; language:Language;
  timeline:MarineReading[]; timeIndex:number; onTimeChange:(index:number)=>void;
  range:ForecastRange; onRangeChange:(range:ForecastRange)=>void; saved:boolean;
  onFavorite:()=>void; onAnalyze:()=>void;
};
export function PortDetailPanel(props:Props) {
  const {open,onOpenChange,port,language,timeline,timeIndex,onTimeChange,range,onRangeChange,saved,onFavorite,onAnalyze}=props;
  const zh=language==="zh";
  const selected=timeline[timeIndex];
  return <Primitive.Root open={open} onOpenChange={onOpenChange} modal={false}>
    <Primitive.Portal>
      <Primitive.Content className="port-detail-panel" aria-describedby="port-panel-description" onInteractOutside={event=>event.preventDefault()}>
        <div className="sheet-handle" aria-hidden="true"/>
        <div className="panel-heading"><div><p>{countyLabel(port,language)} · {areaLabel(port,language)}</p><Primitive.Title>{label(port,language)}</Primitive.Title></div><Primitive.Close aria-label={zh?"關閉港口詳情":"Close harbor details"}><X size={20}/></Primitive.Close></div>
        <Primitive.Description id="port-panel-description" className="panel-source-label">{zh?"展示資料 · 非即時觀測":"Demo data · Not live observations"}</Primitive.Description>
        <div className="panel-time"><span>{zh?"選中時點":"Selected sample"}</span><strong>{timeIndex>=6?(zh?"翌日 ":"Next day "):""}{String(selected.marine.hour).padStart(2,"0")}:00</strong><button onClick={onFavorite} aria-pressed={saved}><Star size={15}/>{saved?(zh?"已收藏":"Saved"):(zh?"收藏":"Save")}</button></div>
        <RiskIndicator score={selected.score} language={language}/>
        <div className="panel-readings"><article><span>{zh?"示性波高":"Wave height"}</span><strong><AnimatedValue value={selected.marine.wave} decimals={1}/><small> m</small></strong></article><article><span>{zh?"風速":"Wind speed"}</span><strong><AnimatedValue value={selected.marine.wind} decimals={1}/><small> m/s</small></strong></article><article><span>{zh?"波浪週期":"Wave period"}</span><strong><AnimatedValue value={selected.marine.period} decimals={1}/><small> sec</small></strong></article><article><span>{zh?"潮汐":"Tide"}</span><strong className="tide-value">{zh?port.tideZh:port.tideEn}</strong></article></div>
        <MarineTimeline timeline={timeline} timeIndex={timeIndex} onTimeChange={onTimeChange} range={range} onRangeChange={onRangeChange} language={language}/>
        <p className="missing-marine-data">{zh?"資料來源尚未提供風向、海溫與天氣。":"Wind direction, sea temperature and weather are not provided by this source."}</p>
        <p className="panel-guidance">{zh?(selected.score<30?"相對暈船風險較低；仍請確認官方海況與船班。":selected.score<60?"部分時段可能較晃，優先選較平穩時段。":"晃動風險較高，可考慮改期或較大型船。"):(selected.score<30?"Lower relative motion risk; check official conditions and sailings.":selected.score<60?"Some samples may feel bumpier. Prefer a calmer window.":"Higher motion risk. Consider another time or a larger boat.")}</p>
        <button className="panel-analyze" onClick={onAnalyze}>{zh?"設定航程並分析":"Plan and analyze voyage"}<ArrowUpRight size={17}/></button>
        <small className="panel-footnote">{zh?"暈船分數不代表航行安全；出海請以官方公告與船長判斷為準。":"Motion risk is not navigation safety. Follow official notices and the captain’s judgment."}</small>
      </Primitive.Content>
    </Primitive.Portal>
  </Primitive.Root>;
}
