"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { normalizeOceanConditions, type OceanConditions } from "@/lib/ocean-conditions";
import type { OceanScene } from "./ocean/ocean-scene";

export type OceanParticleHeroHandle = {
  setOceanConditions: (input: Partial<OceanConditions>) => void;
  transitionToPort: (input: OceanConditions, onComplete: () => void) => void;
  cancelTransition: () => void;
};

export const OceanParticleHero = forwardRef<OceanParticleHeroHandle, { conditions: OceanConditions }>(
  function OceanParticleHero({ conditions }, ref) {
    const hostRef = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<OceanScene | null>(null);
    const conditionsRef = useRef(conditions);
    const transitionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
      conditionsRef.current = conditions;
      sceneRef.current?.setOceanConditions(conditions);
    }, [conditions]);

    useImperativeHandle(ref, () => ({
      setOceanConditions(input) {
        conditionsRef.current = normalizeOceanConditions({ ...conditionsRef.current, ...input });
        sceneRef.current?.setOceanConditions(conditionsRef.current);
      },
      transitionToPort(input, onComplete) {
        if (transitionTimer.current) clearTimeout(transitionTimer.current);
        conditionsRef.current = input;
        sceneRef.current?.setOceanConditions(input);
        sceneRef.current?.setTransition(true);
        const duration = matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 700;
        transitionTimer.current = setTimeout(() => {
          transitionTimer.current = null;
          sceneRef.current?.setTransition(false);
          onComplete();
        }, duration);
      },
      cancelTransition() {
        if (transitionTimer.current) clearTimeout(transitionTimer.current);
        transitionTimer.current = null;
        sceneRef.current?.setTransition(false);
      },
    }), []);

    useEffect(() => {
      const host = hostRef.current;
      const surface = host?.parentElement;
      if (!host || !surface) return;
      let cancelled = false;
      // Load Three.js only while the home Hero is mounted, after hydration.
      void import("./ocean/ocean-scene").then(({ createOceanScene }) => {
        if (cancelled) return;
        try {
          sceneRef.current = createOceanScene(host, surface, conditionsRef.current);
        } catch {
          host.dataset.mode = "fallback";
        }
      }).catch(() => { if (!cancelled) host.dataset.mode = "fallback"; });
      return () => {
        cancelled = true;
        if (transitionTimer.current) clearTimeout(transitionTimer.current);
        transitionTimer.current = null;
        sceneRef.current?.dispose();
        sceneRef.current = null;
      };
    }, []);

    return <div ref={hostRef} className="ocean-particle-hero" aria-hidden="true" data-mode="fallback">
      <svg className="ocean-particle-fallback" viewBox="0 0 1200 640" preserveAspectRatio="none">
        {Array.from({ length: 18 }, (_, row) => {
          const y = 210 + row * 22;
          return <path key={row} d={`M-80 ${y} Q150 ${y - 54} 350 ${y + 5} T780 ${y - 8} T1280 ${y + 18}`}
            fill="none" stroke="currentColor" strokeWidth="1.2" strokeDasharray="1 8" opacity={.15 + row * .015} />;
        })}
      </svg>
    </div>;
  },
);
