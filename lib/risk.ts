import type { Port } from "@/lib/ports";

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
  activityAdjustment?: number;
};

const clamp = (value: number, min = 0, max = 1) => Math.max(min, Math.min(max, value));

export function marineAt(port: Port, hourIndex: number) {
  // The interactive comfort timeline runs from 06:00 in three-hour steps.
  // Keeping the model clock aligned with the visible chips prevents the
  // selected departure time and the calculated marine snapshot from drifting.
  const hour = (6 + hourIndex * 3) % 24;
  // A restrained diurnal curve makes the demo decision useful: dawn can retain
  // residual swell, 09:00 is often calmer, and afternoon wind-wave build peaks
  // near 15:00 before easing. Port baselines still determine local severity.
  const diurnalCurve = [.62, .52, .88, 1.34, 1.12, .84, .68, .58];
  const build = diurnalCurve[hourIndex] ?? .8;
  const pulse = Math.sin((hourIndex + port.x / 17) * 1.17);
  return {
    hour,
    wave: Math.max(.25, port.wave * build + pulse * .08),
    period: Math.max(3.6, port.period + Math.cos(hourIndex * .83 + port.y / 20) * .48),
    wind: Math.max(1.2, port.wind * (.52 + build * .42) + Math.max(0, build - .52) * 4.2 + pulse * .4),
    current: Math.max(.1, port.current + Math.cos(hourIndex * .71) * .12),
  };
}

export function calculateRisk(input: RiskInput) {
  const marine = marineAt(input.port, input.hourIndex);
  const wave = clamp((marine.wave - .3) / 1.9);
  const period = Math.exp(-Math.pow((marine.period - 6) / 3, 2)) * wave;
  const wind = clamp((marine.wind - 3) / 12);
  const direction = clamp(input.port.directionRisk);
  const current = clamp((marine.current - .15) / 1.05);
  const uncertainty = clamp(1 - input.port.confidence / 100);
  const vessel = input.boat === "small" ? .92 : input.boat === "large" ? .24 : .56;
  const personal = input.sensitivity === "high" ? .92 : input.sensitivity === "low" ? .18 : .56;
  const duration = clamp((input.duration - 30) / 210);
  const normalized: Record<string, number> = { wave, period, wind, direction, current, uncertainty, vessel, personal, duration };
  const contributions = WEIGHTS.map((item) => ({
    ...item,
    value: normalized[item.id],
    points: normalized[item.id] * item.weight,
  }));
  const raw = contributions.reduce((sum, item) => sum + item.points, 0) + (input.activityAdjustment ?? 0);
  const score = Math.round(clamp(raw / 100) * 100);
  return { score, marine, contributions: contributions.sort((a, b) => b.points - a.points) };
}

export function buildTimeline(input: Omit<RiskInput, "hourIndex">) {
  return Array.from({ length: 8 }, (_, hourIndex) => ({
    index: hourIndex,
    ...calculateRisk({ ...input, hourIndex }),
  }));
}

export function riskLevel(score: number) {
  if (score < 30) return "low";
  if (score < 60) return "medium";
  if (score < 80) return "high";
  return "veryHigh";
}
