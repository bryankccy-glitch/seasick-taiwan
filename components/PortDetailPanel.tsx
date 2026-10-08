"use client";
import { Dialog as Primitive } from "radix-ui";
import { Star, X, ArrowUpRight } from "lucide-react";
import { areaLabel, countyLabel, label, type Language, type Port } from "@/lib/ports";
import { MarineTimeline, type ForecastRange, type MarineReading } from "./MarineTimeline";
import { formatForecastTime } from "@/lib/marine-forecast";
import { RiskIndicator } from "./RiskIndicator";

type Props = {
  open:boolean; onOpenChange:(open:boolean)=>void; port:Port; language:Language;
  timeline:MarineReading[]; timeIndex:number; onTimeChange:(index:number)=>void;
  range:ForecastRange; onRangeChange:(range:ForecastRange)=>void; saved:boolean;
  onFavorite:()=>void; onAnalyze:()=>void; loading:boolean; error:boolean; queriedAt:string|null; onRefresh:()=>void;
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
        <Primitive.Description id="port-panel-description" className="panel-source-label">{zh?"Open-Meteo 海域格點模式預報 · 非港內即時觀測":"Open-Meteo marine grid forecast · Not harbor observations"}</Primitive.Description>
        {selected ? <>
        <div className="panel-time"><span>{zh?"選中時點":"Selected sample"}</span><strong>{formatForecastTime(selected.marine.time,language)}</strong><button onClick={onFavorite} aria-pressed={saved}><Star size={15}/>{saved?(zh?"已收藏":"Saved"):(zh?"收藏":"Save")}</button></div>
        <RiskIndicator score={selected.score} language={language}/>
        <div className="panel-readings"><article><span>{zh?"示性波高":"Wave height"}</span><strong>{selected.marine.wave.toFixed(1)}<small> m</small></strong></article><article><span>{zh?"風速":"Wind speed"}</span><strong>{selected.marine.wind.toFixed(1)}<small> m/s</small></strong></article><article><span>{zh?"波浪週期":"Wave period"}</span><strong>{selected.marine.period.toFixed(1)}<small> sec</small></strong></article><article><span>{zh?"潮汐":"Tide"}</span><strong className="tide-value">{zh?"無資料":"Unavailable"}</strong></article></div>
        <MarineTimeline timeline={timeline} timeIndex={timeIndex} onTimeChange={onTimeChange} range={range} onRangeChange={onRangeChange} language={language}/>
        </> : <div className="forecast-empty" role="status">{props.loading?(zh?"載入海況預報…":"Loading forecast…"):props.error?(zh?"預報查詢失敗，請重試。":"Forecast request failed. Retry."):(zh?"此港口尚無完整預報資料。":"No complete forecast for this harbor.")}<button onClick={props.onRefresh}>{zh?"重新查詢":"Retry"}</button></div>}
        <p className="forecast-note">{props.queriedAt && `${zh?"查詢時間":"Queried"} ${formatForecastTime(props.queriedAt,language)}`}</p>
        <p className="missing-marine-data">{zh?"潮汐、海溫與天氣尚未接入；來源未提供預報信心百分比。":"Tides, sea temperature and weather are not connected; no forecast confidence percentage is supplied."}</p>
        {selected&&<p className="panel-guidance">{zh?(selected.score<30?"相對暈船風險較低；仍請確認官方海況與船班。":selected.score<60?"部分時段可能較晃，優先選較平穩時段。":"晃動風險較高，可考慮改期或較大型船。"):(selected.score<30?"Lower relative motion risk; check official conditions and sailings.":selected.score<60?"Some samples may feel bumpier. Prefer a calmer window.":"Higher motion risk. Consider another time or a larger boat.")}</p>}
        <button disabled={!selected} className="panel-analyze" onClick={onAnalyze}>{zh?"設定航程並分析":"Plan and analyze voyage"}<ArrowUpRight size={17}/></button>
        <small className="panel-footnote">{zh?"暈船分數不代表航行安全；出海請以官方公告與船長判斷為準。":"Motion risk is not navigation safety. Follow official notices and the captain’s judgment."}</small>
      </Primitive.Content>
    </Primitive.Portal>
  </Primitive.Root>;
}
