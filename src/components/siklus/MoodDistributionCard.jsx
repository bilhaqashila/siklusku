"use client";

import { useMemo } from "react";
import useSiklusStore from "@/stores/useSiklusStore";
import MoodPieChart from "./charts/MoodPieChart";
import { MOOD_OPTIONS } from "./MoodLogger";

export default function MoodDistributionCard() {
  const moodDistribution = useSiklusStore((state) => state.moodDistribution);

  const legendEntries = useMemo(() => {
    return MOOD_OPTIONS
      .map((option) => ({
        mood: option.mood,
        label: option.label,
        color: option.chartColor,
        count: moodDistribution?.[option.mood] ?? 0
      }))
      .filter((entry) => entry.count > 0)
      .sort((a, b) => b.count - a.count);
  }, [moodDistribution]);

  const chartData = useMemo(() => {
    if (!legendEntries.length) {
      return {};
    }
    return legendEntries.reduce((acc, entry) => {
      acc[entry.mood] = entry.count;
      return acc;
    }, {});
  }, [legendEntries]);

  const hasData = legendEntries.length > 0;

  return (
    <div className="rounded-3xl border border-pink-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
            Distribusi Mood
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Sebaran mood kamu dalam 30 hari terakhir
          </p>
        </div>

        {hasData ? (
          <div className="flex flex-col items-center">
            <MoodPieChart data={chartData} size={220} />

            <div className="mt-4 grid w-full grid-cols-2 gap-2">
              {legendEntries.map((entry) => (
                <div
                  key={entry.mood}
                  className="flex items-center gap-2 rounded-lg bg-slate-50 p-2 dark:bg-slate-800"
                >
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-sm font-medium">{entry.label}</span>
                  <span className="ml-auto text-xs text-slate-500">{entry.count}x</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <div className="mb-4 text-4xl">dY"S</div>
            <p className="text-slate-500 dark:text-slate-400">
              Belum ada catatan mood. Catat mood harianmu untuk melihat distribusi.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

