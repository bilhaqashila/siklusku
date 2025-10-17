"use client";

import { useMemo } from "react";

export default function CycleTrendChart({ points = [], width = 320, height = 200 }) {
  const computed = useMemo(() => {
    if (!points.length) {
      return {
        path: "",
        xLabels: [],
        yTicks: []
      };
    }
    const values = points.map((point) => point.value);
    const minValue = Math.min(...values) - 1;
    const maxValue = Math.max(...values) + 1;
    const tickCount = 4;
    const yTicks = Array.from({ length: tickCount }, (_, index) => {
      const ratio = index / (tickCount - 1);
      return Math.round(minValue + (maxValue - minValue) * (1 - ratio));
    });
    const plotWidth = width - 60;
    const plotHeight = height - 40;
    const path = points
      .map((point, index) => {
        const x = 40 + (plotWidth / Math.max(points.length - 1, 1)) * index;
        const yRatio = (point.value - minValue) / (maxValue - minValue || 1);
        const y = 10 + plotHeight * (1 - yRatio);
        return `${index === 0 ? "M" : "L"} ${x} ${y}`;
      })
      .join(" ");

    return {
      path,
      yTicks,
      plotWidth,
      plotHeight,
      minValue,
      maxValue
    };
  }, [points, width, height]);

  return (
    <figure className="w-full" aria-label="Tren panjang siklus bulanan">
      <svg width={width} height={height} role="img">
        <title>Tren panjang siklus</title>
        <desc>Grafik garis yang menampilkan perubahan panjang siklus haid per bulan.</desc>
        <rect
          x="40"
          y="10"
          width={computed.plotWidth || width - 60}
          height={computed.plotHeight || height - 40}
          fill="#fff7fb"
          stroke="#fce7f3"
        />
        {computed.yTicks.map((tick, index) => {
          const ratio = (tick - computed.minValue) / ((computed.maxValue - computed.minValue) || 1);
          const y = 10 + (computed.plotHeight || height - 40) * (1 - ratio);
          return (
            <g key={`tick-${tick}-${index}`}>
              <line x1="40" x2={width - 20} y1={y} y2={y} stroke="#fce7f3" strokeDasharray="4 4" />
              <text x="32" y={y + 4} textAnchor="end" fontSize="10" fill="#64748b">
                {tick}
              </text>
            </g>
          );
        })}
        <path d={computed.path} fill="none" stroke="#ec4899" strokeWidth="2.5" strokeLinecap="round" />
        {points.map((point, index) => {
          const x = 40 + (computed.plotWidth || width - 60) / Math.max(points.length - 1, 1) * index;
          const ratio = (point.value - computed.minValue) / ((computed.maxValue - computed.minValue) || 1);
          const y = 10 + (computed.plotHeight || height - 40) * (1 - ratio);
          return (
            <g key={`${point.label}-${index}`}>
              <circle cx={x} cy={y} r="4" fill="#ec4899">
                <title>
                  {point.label}: {point.value} hari
                </title>
              </circle>
            </g>
          );
        })}
        {points.map((point, index) => {
          const x = 40 + (computed.plotWidth || width - 60) / Math.max(points.length - 1, 1) * index;
          return (
            <text key={`${point.label}-label-${index}`} x={x} y={height - 5} textAnchor="middle" fontSize="10" fill="#64748b">
              {point.label}
            </text>
          );
        })}
      </svg>
      <figcaption className="mt-2 text-xs text-slate-500">
        Garis menunjukkan bagaimana panjang siklusmu berubah dari waktu ke waktu.
      </figcaption>
    </figure>
  );
}