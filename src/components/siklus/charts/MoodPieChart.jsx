"use client";

import { useMemo } from "react";

const TAU = Math.PI * 2;

function buildArc(startAngle, endAngle, radius, center) {
  const startX = center + radius * Math.cos(startAngle);
  const startY = center + radius * Math.sin(startAngle);
  const endX = center + radius * Math.cos(endAngle);
  const endY = center + radius * Math.sin(endAngle);
  const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
  return `M ${center} ${center} L ${startX} ${startY} A ${radius} ${radius} 0 ${largeArc} 1 ${endX} ${endY} Z`;
}

export default function MoodPieChart({ data, size = 220, colors }) {
  const entries = useMemo(() => {
    if (!data) {
      return [];
    }
    const total = Object.values(data).reduce((sum, value) => sum + value, 0) || 1;
    let currentAngle = -Math.PI / 2;
    return Object.entries(data).map(([mood, value], index) => {
      const portion = value / total;
      const startAngle = currentAngle;
      const endAngle = currentAngle + portion * TAU;
      currentAngle = endAngle;
      return {
        mood,
        value,
        startAngle,
        endAngle,
        color:
          colors?.[mood] ||
          ["#f9a8d4", "#f97316", "#facc15", "#22c55e", "#3b82f6", "#8b5cf6", "#ec4899", "#14b8a6"][index % 8]
      };
    });
  }, [data, colors]);

  const radius = size / 2 - 10;

  return (
    <figure className="flex flex-col items-center gap-4" aria-label="Sebaran mood 30 hari terakhir">
      <svg
        width={size}
        height={size}
        role="img"
        aria-labelledby="mood-chart-title mood-chart-desc"
        className="drop-shadow-sm"
      >
        <title id="mood-chart-title">Mood distribution</title>
        <desc id="mood-chart-desc">
          Diagram lingkaran yang memperlihatkan frekuensi mood yang kamu catat.
        </desc>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="#fdf2f8" />
        {entries.map((entry) => (
          <path
            key={entry.mood}
            d={buildArc(entry.startAngle, entry.endAngle, radius, size / 2)}
            fill={entry.color}
          >
            <title>
              {entry.mood}: {entry.value}
            </title>
          </path>
        ))}
      </svg>
      <figcaption className="w-full text-center text-xs text-slate-500">
        Mood yang lebih sering dicatat akan terlihat lebih besar.
      </figcaption>
    </figure>
  );
}
