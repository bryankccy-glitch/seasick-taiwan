/** Provider values only: never fill missing hours or invent marine readings. */
export type MarinePoint = { time:string; hour:number; wave:number; period:number; wind:number; current:number|null; waveDirection:number|null; windDirection:number|null };
export type HarborForecast = {points:MarinePoint[]; marineGrid:{latitude:number;longitude:number}; windGrid:{latitude:number;longitude:number}};
export type ForecastResponse = {queriedAt:string;source:"Open-Meteo";forecasts:Record<string,HarborForecast>;unavailable:string[]};
type ProviderData = {latitude:number;longitude:number;hourly_units:Record<string,string>;hourly:Record<string,unknown[]>};
function provider(value:unknown):ProviderData {
  if (!value || typeof value!=="object") throw new Error("Invalid forecast");
  const d=value as ProviderData;
  if (!Number.isFinite(d.latitude)||!Number.isFinite(d.longitude)||!d.hourly_units||!Array.isArray(d.hourly?.time)) throw new Error("Invalid forecast");
  return d;
}
function numberAt(d:ProviderData,key:string,i:number):number|null {const n=d.hourly[key]?.[i];return typeof n==="number"&&Number.isFinite(n)?n:null;}
export function mergeForecast(marineValue:unknown,weatherValue:unknown,now:number):HarborForecast|null {
  const m=provider(marineValue),w=provider(weatherValue);
  if(m.hourly_units.wave_height!=="m"||m.hourly_units.wave_period!=="s"||w.hourly_units.wind_speed_10m!=="m/s") throw new Error("Unexpected forecast units");
  const start=Math.floor(now/3600000)*3600, winds=new Map(w.hourly.time.map((t,i)=>[t,i]));
  const points:MarinePoint[]=[];
  for(let i=0;i<m.hourly.time.length;i++){
    const t=m.hourly.time[i];if(typeof t!=="number"||!Number.isFinite(t)||t<start||t>=start+72*3600)continue;
    const j=winds.get(t);if(j===undefined)continue;
    const wave=numberAt(m,"wave_height",i),period=numberAt(m,"wave_period",i),wind=numberAt(w,"wind_speed_10m",j);
    if(wave===null||period===null||wind===null||wave<0||period<=0||wind<0)continue;
    let current=numberAt(m,"ocean_current_velocity",i);
    if(current!==null){const unit=m.hourly_units.ocean_current_velocity;if(unit==="km/h")current/=3.6;else if(unit!=="m/s")current=null;if(current!==null&&current<0)current=null;}
    points.push({time:new Date(t*1000).toISOString(),hour:new Date(t*1000+8*3600000).getUTCHours(),wave,period,wind,current,waveDirection:numberAt(m,"wave_direction",i),windDirection:numberAt(w,"wind_direction_10m",j)});
  }
  points.sort((a,b)=>a.time.localeCompare(b.time));
  if(points.length!==72||points.some((p,i)=>Date.parse(p.time)!==(start+i*3600)*1000))return null;
  return {points,marineGrid:{latitude:m.latitude,longitude:m.longitude},windGrid:{latitude:w.latitude,longitude:w.longitude}};
}
export function formatForecastTime(time:string,language:"zh"|"en"="zh") {return new Intl.DateTimeFormat(language==="zh"?"zh-TW":"en-GB",{timeZone:"Asia/Taipei",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hourCycle:"h23"}).format(new Date(time));}
