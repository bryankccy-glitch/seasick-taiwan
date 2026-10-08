"use client";
import { Slider } from "@/components/ui/slider";
import type { Language } from "@/lib/ports";
import type { buildTimeline } from "@/lib/risk";
import { formatForecastTime } from "@/lib/marine-forecast";
export type MarineReading = ReturnType<typeof buildTimeline>[number];
export type ForecastRange = 24 | 72;
export function MarineTimeline({timeline,timeIndex,onTimeChange,range,onRangeChange,language}:{timeline:MarineReading[];timeIndex:number;onTimeChange:(index:number)=>void;range:ForecastRange;onRangeChange:(range:ForecastRange)=>void;language:Language}){
  const zh=language==="zh",active=timeline[timeIndex]??timeline[0];
  const best=timeline.reduce<MarineReading|undefined>((a,b)=>!a||b.score<a.score?b:a,undefined);
  const divisor=Math.max(1,timeline.length-1),maxScore=Math.max(1,...timeline.map(p=>p.score));
  return <section className="marine-timeline" aria-label={zh?"海況時間軸":"Marine timeline"}>
    <div className="panel-section-head"><h3>{zh?"海況趨勢":"Marine trend"}</h3><div className="forecast-ranges" role="group" aria-label={zh?"時間範圍":"Time range"}>{([24,72] as const).map(hours=><button key={hours} aria-pressed={range===hours} onClick={()=>onRangeChange(hours)}>{hours}h</button>)}</div></div>
    {active&&best?<>
      <p className="forecast-note">Open-Meteo · {range}h {zh?"模式預報 · 每 3 小時取一點 · 台灣時間":"model forecast · 3-hour samples · Taiwan time"}</p>
      <svg className="marine-trend-chart" viewBox="0 0 300 88" role="img" aria-label={zh?"各時點相對暈船風險":"Relative motion risk over time"}><line x1="8" x2="292" y1="77" y2="77" className="chart-baseline"/><polyline points={timeline.map((p,i)=>`${8+i/divisor*284},${76-p.score/maxScore*58}`).join(" ")}/>{timeline.map((p,i)=><circle key={p.marine.time} cx={8+i/divisor*284} cy={76-p.score/maxScore*58} r={i===timeIndex?4:2} className={p.index===best.index?"best-point":""}/>)}<line x1={8+timeIndex/divisor*284} x2={8+timeIndex/divisor*284} y1="8" y2="80" className="chart-cursor"/></svg>
      <Slider aria-label={zh?"選擇海況時間":"Select marine time"} aria-valuetext={`${formatForecastTime(active.marine.time,language)}, Risk ${active.score}`} min={0} max={timeline.length-1} step={1} value={[Math.min(timeIndex,timeline.length-1)]} onValueChange={v=>onTimeChange(v[0])}/>
      <div className="marine-time-ticks">{timeline.map((p,i)=><button key={p.marine.time} onClick={()=>onTimeChange(i)} aria-pressed={i===timeIndex} className={i===timeIndex?"active":""}><span>{String(p.marine.hour).padStart(2,"0")}:00</span><small>{formatForecastTime(p.marine.time,language).split(/[ ,]/)[0]}</small>{p.index===best.index&&<i aria-label={zh?"較平穩時點":"Calmer sample"}/>}</button>)}</div>
      <div className="panel-best"><span>{zh?"較平穩時點":"CALMER SAMPLE"}</span><strong>{formatForecastTime(best.marine.time,language)}</strong><small>Risk {best.score}</small></div>
    </>:<div className="forecast-empty" role="status">{zh?"目前無可用預報，不以模擬資料替代。":"No forecast available. No simulated fallback."}</div>}
  </section>;
}
