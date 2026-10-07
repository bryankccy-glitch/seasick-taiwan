import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizeOceanConditions, oceanConditionsFromMarine } from "../lib/ocean-conditions.ts";

test("future API values cannot send NaN, infinity, or unbounded values into GPU uniforms", () => {
  const conditions = normalizeOceanConditions({ waveHeight: NaN, waveSpeed: Infinity, turbulence: 20, windDirection: -405, riskLevel: -10 });
  assert.ok(Object.values(conditions).every(Number.isFinite));
  assert.equal(conditions.turbulence, 1);
  assert.equal(conditions.riskLevel, 0);
  assert.equal(conditions.windDirection, 315);
  assert.ok(conditions.waveHeight >= 0 && conditions.waveHeight <= 2.5);
  assert.ok(conditions.waveSpeed >= 0 && conditions.waveSpeed <= 1.2);
});

test("a completely calm or static scene is a valid condition", () => {
  const conditions = normalizeOceanConditions({ waveHeight: 0, waveSpeed: 0, turbulence: 0, windDirection: 360, riskLevel: 0 });
  assert.deepEqual(Object.values(conditions), [0, 0, 0, 0, 0]);
});

test("rougher marine readings produce stronger but still bounded visual conditions", () => {
  const calm = oceanConditionsFromMarine(.5, 3, 20);
  const rough = oceanConditionsFromMarine(2, 12, 80);
  assert.ok(rough.waveHeight > calm.waveHeight);
  assert.ok(rough.waveSpeed > calm.waveSpeed);
  assert.ok(rough.turbulence > calm.turbulence);
  const extreme = oceanConditionsFromMarine(100, 100, 500);
  assert.equal(extreme.waveHeight, 2.5);
  assert.equal(extreme.waveSpeed, 1.2);
  assert.equal(extreme.riskLevel, 100);
});
