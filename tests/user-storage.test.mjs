import { test } from "node:test";
import assert from "node:assert/strict";
import { readStored, validFavorites, validTrips, writeStored } from "../lib/user-storage.ts";
const ids=["keelung","wushi"], activities=["whale","ferry"];
const check=value=>validFavorites(value,ids);
test("malformed or unavailable storage does not crash initialization or overwrite original data",()=>{
  const storage={getItem:()=>"{broken",setItem:()=>assert.fail("must not overwrite")};
  assert.deepEqual(readStored(storage,"favorites",[],check),{value:[],issue:true});
  assert.deepEqual(readStored({getItem:()=>{throw new Error("blocked")}},"favorites",[],check),{value:[],issue:true});
});
test("empty favorites survive reload while unknown IDs and wrong shapes are rejected",()=>{
  assert.deepEqual(readStored({getItem:()=>"[]"},"favorites",["keelung"],check),{value:[],issue:false});
  assert.equal(check(["removed-port"]),false);assert.equal(check({id:"keelung"}),false);
  assert.equal(check(["keelung","wushi"]),true);
});
test("stored voyage logs must reference existing ports and activities with valid finite readings",()=>{
  const trip={id:"1",portId:"keelung",activity:"whale",date:"2026/10/7",score:34,actual:1};
  assert.equal(validTrips([trip],ids,activities),true);
  for(const invalid of [{...trip,portId:"unknown"},{...trip,activity:"unknown"},{...trip,score:NaN},{...trip,score:101},{...trip,actual:8},null])assert.equal(validTrips([invalid],ids,activities),false);
});
test("failed writes return failure and successful writes retain the original key format",()=>{
  assert.equal(writeStored({setItem:()=>{throw new Error("quota")}},"seasick-favorites","[]"),false);
  let result;
  assert.equal(writeStored({setItem:(key,value)=>{result=[key,value]}},"seasick-favorites","[]"),true);
  assert.deepEqual(result,["seasick-favorites","[]"]);
});
