"use client";
import { memo, useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
type Metric="risk"|"wave"|"wind";
const ResultRiskChart=memo(function ResultRiskChart({data,language}:{data:{time:string;risk:number;wave:number;wind:number;language?:"zh"|"en"}[];language?:"zh"|"en"}) {
  const [metric,setMetric]=useState<Metric>("risk");
  const locale=language??data[0]?.language??"zh";
  const meta={risk:{label:locale==="zh"?"暈船風險":"Risk",unit:"/100",max:100,color:"var(--chart-accent,#5ce4d4)"},wave:{label:locale==="zh"?"浪高":"Wave",unit:"m",max:"auto" as const,color:"#58aee8"},wind:{label:locale==="zh"?"風速":"Wind",unit:"m/s",max:"auto" as const,color:"#e8c76a"}}[metric];
  return <div className="result-chart"><div className="chart-metric-tabs" role="group" aria-label={locale==="zh"?"圖表指標":"Chart metric"}>{(["risk","wave","wind"] as Metric[]).map(item=><button type="button" key={item} className={metric===item?"active":""} aria-pressed={metric===item} onClick={()=>setMetric(item)}>{item==="risk"?(locale==="zh"?"風險":"Risk"):item==="wave"?(locale==="zh"?"浪高":"Wave"):(locale==="zh"?"風速":"Wind")}</button>)}</div><ResponsiveContainer width="100%" height={250}><AreaChart data={data}><defs><linearGradient id="riskFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={meta.color} stopOpacity=".42"/><stop offset="100%" stopColor={meta.color} stopOpacity="0"/></linearGradient></defs><CartesianGrid stroke="var(--chart-grid,rgba(150,220,220,.08))" vertical={false}/><XAxis dataKey="time" stroke="var(--chart-label,#789ca4)" tickLine={false} axisLine={false}/><YAxis hide domain={[0,meta.max]}/><Tooltip formatter={(value)=>[`${Number(value).toFixed(metric==="risk"?0:1)} ${meta.unit}`,meta.label]} contentStyle={{background:"var(--chart-surface,#092936)",color:"var(--foreground)",border:"1px solid var(--border)",borderRadius:14}}/><Area type="monotone" dataKey={metric} name={meta.label} stroke={meta.color} strokeWidth={3} fill="url(#riskFill)" animationDuration={450}/></AreaChart></ResponsiveContainer></div>;
});
export default ResultRiskChart;
