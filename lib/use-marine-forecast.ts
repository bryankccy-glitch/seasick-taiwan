"use client";
import { useCallback,useEffect,useRef,useState } from "react";
import type { ForecastResponse } from "./marine-forecast";
export function useMarineForecast(){
  const [data,setData]=useState<ForecastResponse|null>(null),[loading,setLoading]=useState(true),[error,setError]=useState(false),[lastUpdated,setLastUpdated]=useState<Date|null>(null);
  const controller=useRef<AbortController|null>(null);
  const refresh=useCallback(async()=>{
    controller.current?.abort();const request=new AbortController();controller.current=request;setLoading(true);
    try{const r=await fetch("/api/marine",{cache:"no-store",signal:request.signal});if(!r.ok)throw new Error("Forecast unavailable");const p:ForecastResponse=await r.json();if(p.source!=="Open-Meteo"||!p.forecasts||!p.queriedAt)throw new Error("Invalid forecast");if(request.signal.aborted)return;setData(p);setLastUpdated(new Date(p.queriedAt));setError(false);}
    catch{if(request.signal.aborted)return;setData(null);setLastUpdated(null);setError(true);}
    finally{if(!request.signal.aborted)setLoading(false);}
  },[]);
  useEffect(()=>{const timer=window.setTimeout(()=>void refresh(),0),interval=window.setInterval(()=>void refresh(),600000);const online=()=>void refresh();const visible=()=>{if(document.visibilityState==="visible")void refresh();};window.addEventListener("online",online);document.addEventListener("visibilitychange",visible);return()=>{window.clearTimeout(timer);window.clearInterval(interval);window.removeEventListener("online",online);document.removeEventListener("visibilitychange",visible);controller.current?.abort();};},[refresh]);
  return {data,loading,error,lastUpdated,refresh};
}
