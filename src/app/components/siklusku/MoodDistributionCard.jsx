'use client';

import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import useSiklusStore from '../../store/useSiklusStore';

const MoodPieChart = dynamic(() => import('./charts/MoodPieChart'), {
  ssr: false,
  loading: () => (
    <div className="flex h-48 w-full items-center justify-center rounded-2xl border border-dashed border-pink-200 bg-white/80 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-400">Memuat grafik mood...</div>
  ),
});

/** Canonical mood labels + chart colors (hex) */
const MOOD_LABELS = {
  happy: { label: 'Senang', color: '#facc15' }, // yellow-400
  sad: { label: 'Sedih', color: '#60a5fa' }, // blue-400
  angry: { label: 'Kesal', color: '#f87171' }, // red-400
  anxious: { label: 'Cemas', color: '#a78bfa' }, // violet-400
  normal: { label: 'Biasa aja', color: '#94a3b8' }, // slate-400
};

const DAYS_WINDOW = 30;

function inLastNDays(iso, n = DAYS_WINDOW) {
  if (!iso) return false;
  const d = new Date(iso + 'T00:00:00');
  if (Number.isNaN(d.getTime())) return false;
  const today = new Date();
  const cutoff = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  cutoff.setDate(cutoff.getDate() - n);
  return d >= cutoff && d <= today;
}

export default function MoodDistributionCard() {
  const dailyLogs = useSiklusStore((s) => s.dailyLogs || []);

  // Aggregate counts from the last 30 days of dailyLogs
  const { counts, legendEntries, chartData, hasData } = useMemo(() => {
    const counts = Object.create(null);

    for (const log of dailyLogs) {
      if (!log?.mood) continue;
      if (!MOOD_LABELS[log.mood]) continue;
      if (!inLastNDays(log.date, DAYS_WINDOW)) continue;
      counts[log.mood] = (counts[log.mood] || 0) + 1;
    }

    const legendEntries = Object.entries(MOOD_LABELS)
      .map(([mood, meta]) => ({
        mood,
        label: meta.label,
        color: meta.color,
        count: counts[mood] || 0,
      }))
      .filter((e) => e.count > 0)
      .sort((a, b) => b.count - a.count);

    const chartData = legendEntries.reduce((acc, e) => {
      acc[e.mood] = e.count;
      return acc;
    }, {});

    return { counts, legendEntries, chartData, hasData: legendEntries.length > 0 };
  }, [dailyLogs]);

  const colorMap = useMemo(() => {
    const m = {};
    for (const [key, v] of Object.entries(MOOD_LABELS)) m[key] = v.color;
    return m;
  }, []);

  return (
    <div className="rounded-3xl border border-pink-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Mood bulananmu</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Ini sebaran perasaanmu dalam {DAYS_WINDOW} hari terakhir</p>
        </div>

        {hasData ? (
          <div className="flex flex-col items-center">
            <MoodPieChart data={chartData} size={220} colors={colorMap} />

            <div className="mt-4 grid w-full grid-cols-2 gap-2">
              {legendEntries.map((entry) => (
                <div key={entry.mood} className="flex items-center gap-2 rounded-lg bg-slate-50 p-2 dark:bg-slate-800">
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: entry.color }} />
                  <span className="text-sm font-medium">{entry.label}</span>
                  <span className="ml-auto text-xs text-slate-500">{entry.count}x</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <p className="text-slate-500 dark:text-slate-400">Belum ada catatan mood dalam {DAYS_WINDOW} hari terakhir.</p>
          </div>
        )}
      </div>
    </div>
  );
}
