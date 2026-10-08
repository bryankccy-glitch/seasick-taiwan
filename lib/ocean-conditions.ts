/** Visual conditions, not a second risk model. windDirection is in degrees. */
export type OceanConditions = {
  waveHeight: number;
  waveSpeed: number;
  turbulence: number;
  windDirection: number;
  riskLevel: number;
};

export const DEFAULT_OCEAN_CONDITIONS: OceanConditions = {
  waveHeight: 0.7,
  waveSpeed: 0.4,
  turbulence: 0.2,
  windDirection: 45,
  riskLevel: 31,
};

const finite = (value: number, fallback: number, min: number, max: number) =>
  Number.isFinite(value) ? Math.max(min, Math.min(max, value)) : fallback;

export function normalizeOceanConditions(input: Partial<OceanConditions>): OceanConditions {
  const base = DEFAULT_OCEAN_CONDITIONS;
  const direction = Number.isFinite(input.windDirection) ? input.windDirection! : base.windDirection;
  return {
    waveHeight: finite(input.waveHeight ?? base.waveHeight, base.waveHeight, 0, 2.5),
    waveSpeed: finite(input.waveSpeed ?? base.waveSpeed, base.waveSpeed, 0, 1.2),
    turbulence: finite(input.turbulence ?? base.turbulence, base.turbulence, 0, 1),
    windDirection: ((direction % 360) + 360) % 360,
    riskLevel: finite(input.riskLevel ?? base.riskLevel, base.riskLevel, 0, 100),
  };
}

export function oceanConditionsFromMarine(wave: number, wind: number, score: number, windDirection?: number): OceanConditions {
  return normalizeOceanConditions({
    waveHeight: wave * (0.55 + Math.max(0, Math.min(100, score)) / 100),
    waveSpeed: 0.16 + wind * 0.022 + score * 0.003,
    turbulence: 0.035 + Math.pow(score / 100, 1.5) * 0.75,
    // The demo data has no measured wind direction. Keep this visual default.
    windDirection: windDirection ?? 45,
    riskLevel: score,
  });
}
