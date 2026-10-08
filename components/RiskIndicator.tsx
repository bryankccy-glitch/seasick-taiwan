"use client";
import { useEffect, useRef } from "react";
import { riskLevel } from "@/lib/risk";
import type { Language } from "@/lib/ports";

/** Update text directly; never rerender React or the scene on animation frames. */
export function AnimatedValue({ value, decimals = 0 }: { value: number; decimals?: number }) {
  const element = useRef<HTMLSpanElement>(null);
  const current = useRef(value);
  useEffect(() => {
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    const from = current.current;
    const start = performance.now();
    function finish() {
      cancelAnimationFrame(frame);
      current.current = value;
      if (element.current) element.current.textContent = value.toFixed(decimals);
    }
    function tick(now: number) {
      const progress = Math.max(0, Math.min(1, (now - start) / 280));
      current.current = from + (value - from) * (1 - Math.pow(1 - progress, 3));
      if (element.current) element.current.textContent = current.current.toFixed(decimals);
      if (progress < 1) frame = requestAnimationFrame(tick);
    }
    if (motion.matches) finish(); else frame = requestAnimationFrame(tick);
    motion.addEventListener("change", finish);
    return () => { cancelAnimationFrame(frame); motion.removeEventListener("change", finish); };
  }, [value, decimals]);
  return <span ref={element} aria-label={value.toFixed(decimals)}>{value.toFixed(decimals)}</span>;
}

export function RiskIndicator({ score, language }: { score: number; language: Language }) {
  const level = riskLevel(score);
  const names = language === "zh" ? {low:"低",medium:"中",high:"高",veryHigh:"很高"} : {low:"LOW",medium:"MEDIUM",high:"HIGH",veryHigh:"VERY HIGH"};
  return <section className={`panel-risk ${level}`} aria-label={`SickSea Risk ${score}`}>
    <div><span>SICKSEA RISK</span><span className={`risk-badge ${level}`}>{names[level]}</span></div>
    <strong><AnimatedValue value={score}/><small>/ 100</small></strong>
    <div className="risk-meter" role="meter" aria-label="SickSea Risk" aria-valuemin={0} aria-valuemax={100} aria-valuenow={score}><i style={{width:`${score}%`}}/></div>
  </section>;
}
