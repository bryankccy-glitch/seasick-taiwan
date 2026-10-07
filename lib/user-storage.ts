export type Trip = { id:string; portId:string; date:string; score:number; actual:number; activity:string };
type StorageReader = Pick<Storage, "getItem">;
export function readStored<T>(storage:StorageReader,key:string,fallback:T,validate:(value:unknown)=>value is T):{value:T;issue:boolean} {
  try {
    const raw=storage.getItem(key);
    if(raw===null)return {value:fallback,issue:false};
    const value:unknown=JSON.parse(raw);
    return validate(value)?{value,issue:false}:{value:fallback,issue:true};
  } catch { return {value:fallback,issue:true}; }
}
export function validFavorites(value:unknown,portIds:readonly string[]):value is string[] {
  return Array.isArray(value)&&value.every(id=>typeof id==="string"&&portIds.includes(id));
}
export function validTrips(value:unknown,portIds:readonly string[],activityIds:readonly string[]):value is Trip[] {
  return Array.isArray(value)&&value.every(trip=>trip&&typeof trip==="object"&&typeof trip.id==="string"&&typeof trip.date==="string"&&portIds.includes(trip.portId)&&activityIds.includes(trip.activity)&&Number.isFinite(trip.score)&&trip.score>=0&&trip.score<=100&&[0,1,2].includes(trip.actual));
}
export function writeStored(storage:Pick<Storage,"setItem">,key:string,value:string):boolean {
  try {storage.setItem(key,value);return true;} catch {return false;}
}
