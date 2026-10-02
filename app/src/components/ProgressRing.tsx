"use client";

import { useEffect, useState } from "react";

export default function ProgressRing({
  percent,
  size = 64,
  stroke = 6,
  track = "rgba(244,241,232,0.10)",
  bar = "#DFAF5E",
}: {
  percent: number;
  size?: number;
  stroke?: number;
  track?: string;
  bar?: string;
}) {
  const [p, setP] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setP(Math.min(100, Math.max(0, percent))), 120);
    return () => clearTimeout(t);
  }, [percent]);

  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} stroke={track} strokeWidth={stroke} fill="none" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke={bar}
        strokeWidth={stroke}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c - (c * p) / 100}
        className="ring-anim"
      />
    </svg>
  );
}
