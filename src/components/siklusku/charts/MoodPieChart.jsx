'use client';

import { useMemo } from 'react';

const TAU = Math.PI * 2;
const EPS = 1e-6;

// Default colors if none are provided via `colors` prop
const DEFAULT_COLORS = {
  happy: '#facc15', // yellow-400
  sad: '#60a5fa', // blue-400
  angry: '#f87171', // red-400
  anxious: '#a78bfa', // violet-400
  normal: '#94a3b8', // slate-400
};

function buildArc(startAngle, endAngle, radius, center) {
  const startX = center + radius * Math.cos(startAngle);
  const startY = center + radius * Math.sin(startAngle);
  const endX = center + radius * Math.cos(endAngle);
  const endY = center + radius * Math.sin(endAngle);
  const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
  return `M ${center} ${center} L ${startX} ${startY} A ${radius} ${radius} 0 ${largeArc} 1 ${endX} ${endY} Z`;
}

/**
 * Props:
 *  - data: { [mood: string]: number }
 *  - size?: number (px)
 *  - colors?: { [mood: string]: string } // hex colors
 */
export default function MoodPieChart({ data, size = 220, colors }) {
  const { entries, total, singleSlice } = useMemo(() => {
    if (!data) return { entries: [], total: 0, singleSlice: false };

    const pairs = Object.entries(data).filter(([, v]) => v > 0);
    const total = pairs.reduce((s, [, v]) => s + v, 0);

    let currentAngle = -Math.PI / 2;
    const palette = { ...DEFAULT_COLORS, ...(colors || {}) };

    const items = pairs.map(([mood, value], i) => {
      const portion = total > 0 ? value / total : 0;
      const startAngle = currentAngle;
      const delta = portion * TAU;
      const endAngle = currentAngle + delta;
      currentAngle = endAngle;

      const fallback = ['#fde2e4', '#bee1e6', '#cdeac0', '#ffdfba', '#e7c6ff', '#bde0fe', '#ffd6a5', '#b9fbc0'][i % 8];
      const color = palette[mood] || fallback;

      return { mood, value, startAngle, endAngle, color, portion };
    });

    return {
      entries: items,
      total,
      singleSlice: items.length === 1 && Math.abs(items[0].portion - 1) < EPS,
    };
  }, [data, colors]);

  const center = size / 2;
  const radius = center - 10;

  return (
    <figure className="flex flex-col items-center gap-4" aria-label="Sebaran mood 30 hari terakhir">
      <svg width={size} height={size} role="img" aria-labelledby="mood-chart-title mood-chart-desc" className="drop-shadow-sm">
        <title id="mood-chart-title">Sebaran Mood</title>
        <desc id="mood-chart-desc">Diagram lingkaran yang memperlihatkan frekuensi mood yang kamu catat.</desc>

        {/* Background ring */}
        <circle cx={center} cy={center} r={radius} fill="#fdf2f8" />

        {/* Single slice = full circle fill */}
        {singleSlice ? (
          <circle cx={center} cy={center} r={radius} fill={entries[0].color}>
            <title>
              {entries[0].mood}: {entries[0].value} dari {total}
            </title>
          </circle>
        ) : (
          entries.map((e) => (
            <path key={e.mood} d={buildArc(e.startAngle, e.endAngle, radius, center)} fill={e.color}>
              <title>
                {e.mood}: {e.value} dari {total}
              </title>
            </path>
          ))
        )}
      </svg>

      <figcaption className="w-full text-center text-xs text-slate-500">Mood yang lebih sering kamu catat akan terlihat lebih besar.</figcaption>
    </figure>
  );
}
