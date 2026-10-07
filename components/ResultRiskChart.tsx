"use client";
import { memo } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
const ResultRiskChart=memo(function ResultRiskChart({data}:{data:{time:string;risk:number}[]}) {
  return <ResponsiveContainer width="100%" height={280}><AreaChart data={data}><defs><linearGradient id="riskFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#5ce4d4" stopOpacity=".42"/><stop offset="100%" stopColor="#5ce4d4" stopOpacity="0"/></linearGradient></defs><CartesianGrid stroke="rgba(150,220,220,.08)" vertical={false}/><XAxis dataKey="time" stroke="#789ca4" tickLine={false} axisLine={false}/><YAxis hide domain={[0,100]}/><Tooltip contentStyle={{background:"#092936",border:"1px solid rgba(110,225,213,.2)",borderRadius:14}}/><Area type="monotone" dataKey="risk" stroke="#5ce4d4" strokeWidth={3} fill="url(#riskFill)"/></AreaChart></ResponsiveContainer>;
});
export default ResultRiskChart;
