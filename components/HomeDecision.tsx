import { ArrowUpRight, Clock3 } from "lucide-react";
import { label, type Language, type Port } from "@/lib/ports";
import type { buildTimeline } from "@/lib/risk";
import { riskLevel } from "@/lib/risk";
type Reading=ReturnType<typeof buildTimeline>[number];
export function HomeDecision({port,reading,best,language,onOpen}:{port:Port;reading:Reading;best:Reading;language:Language;onOpen:()=>void}) {
  const zh=language==="zh"; const level=riskLevel(reading.score);
  const levelText=zh?{low:"低暈船風險",medium:"中等暈船風險",high:"高暈船風險",veryHigh:"很高暈船風險"}:{low:"Low motion risk",medium:"Moderate motion risk",high:"High motion risk",veryHigh:"Very high motion risk"};
  return <section className={`home-decision ${level}`} aria-label={zh?"所選港口海況摘要":"Selected harbor summary"}>
    <div className="decision-caption"><span>{zh?"所選港口 · 展示海況":"SELECTED HARBOR · DEMO"}</span><span>{reading.index>=6?"+1 ":""}{String(reading.marine.hour).padStart(2,"0")}:00</span></div>
    <div className="decision-overview"><h2>{label(port,language)}</h2><div className="decision-score"><strong>{reading.score}</strong><span>/ 100<small>{levelText[level]}</small></span></div></div>
    <div className="decision-measures"><span>{zh?"波高":"Wave"}<b>{reading.marine.wave.toFixed(1)} <small>m</small></b></span><span>{zh?"風速":"Wind"}<b>{reading.marine.wind.toFixed(1)} <small>m/s</small></b></span><span><Clock3 aria-hidden="true"/>{zh?"較平穩時段":"Calmer sample"}<b>{best.index>=6?"+1 ":""}{String(best.marine.hour).padStart(2,"0")}:00</b></span></div>
    <button onClick={onOpen}>{zh?"查看海況與時段":"View conditions and times"}<ArrowUpRight aria-hidden="true" size={17}/></button>
    <p>{zh?"相對暈船指數，非航行安全判定 · 非即時觀測":"Relative motion index, not navigation safety · Not live observations"}</p>
  </section>;
}
