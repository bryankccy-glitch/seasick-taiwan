import type { Port } from "@/lib/ports";
import type { HarborForecast } from "./marine-forecast.ts";

export const WEIGHTS = [
  { id: "wave", zh: "示性波高", en: "Wave height", weight: 30 },
  { id: "period", zh: "敏感週期浪", en: "Sensitive wave period", weight: 18 },
  { id: "wind", zh: "海面風速", en: "Surface wind", weight: 12 },
  { id: "direction", zh: "風浪方向交互", en: "Wind-wave direction", weight: 7 },
  { id: "current", zh: "潮流與流速", en: "Current and tide", weight: 3 },
  { id: "uncertainty", zh: "資料不確定性", en: "Data uncertainty", weight: 5 },
  { id: "vessel", zh: "船型", en: "Vessel type", weight: 10 },
  { id: "personal", zh: "個人敏感度", en: "Personal sensitivity", weight: 10 },
  { id: "duration", zh: "曝露時間", en: "Exposure duration", weight: 5 },
] as const;

export type Boat = "small" | "medium" | "large";
export type Sensitivity = "low" | "medium" | "high";

export type RiskInput = {
  port: Port;
  boat: Boat;
  sensitivity: Sensitivity;
  duration: number;
  hourIndex: number;
  forecasts: Record<string, HarborForecast>;
  range: 24 | 72;
  activityAdjustment?: number;
};

const clamp = (value: number, min = 0, max = 1) => Math.max(min, Math.min(max, value));

export function calculateRisk(input: RiskInput) {
  const marine = input.forecasts[input.port.id]?.points[input.hourIndex * 3];
  if (!marine || input.hourIndex < 0 || input.hourIndex * 3 >= input.range) return null;
  const wave = clamp((marine.wave - .3) / 1.9);
  const period = Math.exp(-Math.pow((marine.period - 6) / 3, 2)) * wave;
  const wind = clamp((marine.wind - 3) / 12);
  const angle = marine.waveDirection !== null && marine.windDirection !== null ? Math.abs(((marine.waveDirection - marine.windDirection + 540) % 360) - 180) : null;
  const direction = angle === null ? 0 : angle / 180;
  const current = marine.current === null ? 0 : clamp((marine.current - .15) / 1.05);
  // The provider supplies no calibrated confidence. Exclude that factor.
  const uncertainty = 0;
  const vessel = input.boat === "small" ? .92 : input.boat === "large" ? .24 : .56;
  const personal = input.sensitivity === "high" ? .92 : input.sensitivity === "low" ? .18 : .56;
  const duration = clamp((input.duration - 30) / 210);
  const normalized: Record<string, number> = { wave, period, wind, direction, current, uncertainty, vessel, personal, duration };
  const contributions = WEIGHTS.filter(item => item.id !== "uncertainty" && (item.id !== "current" || marine.current !== null) && (item.id !== "direction" || angle !== null)).map((item) => ({
    ...item,
    value: normalized[item.id],
    points: normalized[item.id] * item.weight,
  }));
  const raw = contributions.reduce((sum, item) => sum + item.points, 0) + (input.activityAdjustment ?? 0);
  const totalWeight = contributions.reduce((sum,item)=>sum+item.weight,0);
  const score = Math.round(clamp(raw / totalWeight) * 100);
  return { score, marine, contributions: contributions.sort((a, b) => b.points - a.points) };
}

export function buildTimeline(input: Omit<RiskInput, "hourIndex">) {
  return Array.from({ length: input.range / 3 }, (_, hourIndex) => {
    const result = calculateRisk({ ...input, hourIndex });
    return result ? { index: hourIndex, ...result } : null;
  }).filter((reading): reading is NonNullable<typeof reading> => reading !== null);
}

export function riskLevel(score: number) {
  if (score < 30) return "low";
  if (score < 60) return "medium";
  if (score < 80) return "high";
  return "veryHigh";
}
