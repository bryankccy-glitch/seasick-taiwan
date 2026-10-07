"use client";
import { Slider } from "@/components/ui/slider";
import type { Language } from "@/lib/ports";
import type { buildTimeline } from "@/lib/risk";

export type MarineReading = ReturnType<typeof buildTimeline>[number];
export type ForecastRange = 24 | 72;
export function MarineTimeline({ timeline, timeIndex, onTimeChange, range, onRangeChange, language }: {
  timeline: MarineReading[]; timeIndex: number; onTimeChange: (index:number)=>void;
  range: ForecastRange; onRangeChange:(range:ForecastRange)=>void; language:Language;
}) {
  const zh = language === "zh";
  const best = timeline.reduce((a,b)=>b.score<a.score?b:a,timeline[0]);
  const maxScore = Math.max(1,...timeline.map(item=>item.score));
  const coordinates = timeline.map((item,index)=>`${8+index/(timeline.length-1)*284},${76-item.score/maxScore*58}`).join(" ");
  const active = timeline[timeIndex];
  return <section className="marine-timeline" aria-label={zh?"海況時間軸":"Marine timeline"}>
    <div className="panel-section-head"><h3>{zh?"海況趨勢":"Marine trend"}</h3><div className="forecast-ranges" role="group" aria-label={zh?"時間範圍":"Time range"}>{([24,72] as const).map(hours=><button key={hours} aria-pressed={range===hours} onClick={()=>onRangeChange(hours)}>{hours}h</button>)}</div></div>
    {range===72?<div className="forecast-empty" role="status"><strong>{zh?"尚無 72 小時資料":"72-hour data unavailable"}</strong><p>{zh?"目前展示來源只提供 8 個三小時時點，未提供後續兩天預報。":"The demo source has eight three-hour samples and no forecasts for the next two days."}</p><button onClick={()=>onRangeChange(24)}>{zh?"查看 24h 展示時序":"View 24h demo series"}</button></div>:<>
      <p className="forecast-note">{zh?"24h 展示時序 · 06:00 起，每 3 小時一點":"24h demo series · 3-hour steps from 06:00"}</p>
      <svg className="marine-trend-chart" viewBox="0 0 300 88" role="img" aria-label={zh?"各時點相對暈船風險":"Relative seasickness risk over time"}>
        <line x1="8" x2="292" y1="77" y2="77" className="chart-baseline"/>
        <polyline points={coordinates}/>
        {timeline.map((item,index)=><circle key={item.index} cx={8+index/(timeline.length-1)*284} cy={76-item.score/maxScore*58} r={index===timeIndex?4:2} className={item.index===best.index?"best-point":""}/>)}
        <line x1={8+timeIndex/(timeline.length-1)*284} x2={8+timeIndex/(timeline.length-1)*284} y1="8" y2="80" className="chart-cursor"/>
      </svg>
      <Slider aria-label={zh?"選擇海況時間":"Select marine time"} aria-valuetext={`${timeIndex>=6?(zh?"翌日 ":"Next day "):""}${String(active.marine.hour).padStart(2,"0")}:00, Risk ${active.score}`} min={0} max={timeline.length-1} step={1} value={[timeIndex]} onValueChange={values=>onTimeChange(values[0])}/>
      <div className="marine-time-ticks">{timeline.map((item,index)=><button key={item.index} onClick={()=>onTimeChange(index)} aria-pressed={index===timeIndex} className={index===timeIndex?"active":""}><span>{String(item.marine.hour).padStart(2,"0")}:00</span><small>{index>=6?(zh?"翌日":"+1 day"):" "}</small>{item.index===best.index&&<i aria-label={zh?"最佳時段":"Best window"}/>}</button>)}</div>
      <div className="panel-best"><span>BEST WINDOW</span><strong>{best.index>=6?(zh?"翌日 ":"Next day "):""}{String(best.marine.hour).padStart(2,"0")}:00–{String((best.marine.hour+3)%24).padStart(2,"0")}:00</strong><small>Risk {best.score}</small></div>
    </>}
  </section>;
}
