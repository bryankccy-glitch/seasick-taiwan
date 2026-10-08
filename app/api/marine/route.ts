import { NextResponse } from "next/server";
import { MAP_HARBORS } from "@/lib/taiwan-map";
import { mergeForecast, type ForecastResponse } from "@/lib/marine-forecast";

export const dynamic = "force-dynamic";
async function fetchProvider(endpoint: string, hourly: string, extra: Record<string,string> = {}) {
  const url = new URL(endpoint);
  Object.entries({latitude:MAP_HARBORS.map(p=>p.lat).join(","),longitude:MAP_HARBORS.map(p=>p.lon).join(","),
    hourly,forecast_days:"4",timeformat:"unixtime",timezone:"Asia/Taipei",...extra}).forEach(([key,value])=>url.searchParams.set(key,value));
  const response = await fetch(url, {next:{revalidate:600},signal:AbortSignal.timeout(15000)});
  if (!response.ok) throw new Error("Forecast provider unavailable");
  const data: unknown = await response.json();
  if (!Array.isArray(data) || data.length !== MAP_HARBORS.length) throw new Error("Unexpected forecast locations");
  return data;
}
export async function GET() {
  try {
    const [marine,weather] = await Promise.all([
      fetchProvider("https://marine-api.open-meteo.com/v1/marine","wave_height,wave_period,wave_direction,ocean_current_velocity",{cell_selection:"sea"}),
      fetchProvider("https://api.open-meteo.com/v1/forecast","wind_speed_10m,wind_direction_10m",{wind_speed_unit:"ms",cell_selection:"sea"}),
    ]);
    const now = Date.now();
    const result: ForecastResponse = {queriedAt:new Date(now).toISOString(),source:"Open-Meteo",forecasts:{},unavailable:[]};
    MAP_HARBORS.forEach((port,index)=>{
      try {
        const forecast = mergeForecast(marine[index],weather[index],now);
        if (forecast) result.forecasts[port.id] = forecast;
        else result.unavailable.push(port.id);
      } catch { result.unavailable.push(port.id); }
    });
    if (!Object.keys(result.forecasts).length) throw new Error("No complete forecast available");
    return NextResponse.json(result,{headers:{"Cache-Control":"no-store"}});
  } catch {
    return NextResponse.json({error:"海況預報暫時無法取得，請稍後重試。"},{status:502,headers:{"Cache-Control":"no-store"}});
  }
}
