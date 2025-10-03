import React from "react";
import useSiklusStore from "@/stores/useSiklusStore";
import { MOOD_OPTIONS } from "./MoodLogger";
import { CYCLE_PHASES, PHASE_NAMES } from "@/lib/siklus/moodPatterns";

const PHASE_ORDER = [
  CYCLE_PHASES.MENSTRUATION,
  CYCLE_PHASES.FOLLICULAR,
  CYCLE_PHASES.OVULATION,
  CYCLE_PHASES.LUTEAL
];

const MOOD_LOOKUP = MOOD_OPTIONS.reduce((acc, option) => {
  acc[option.mood] = option;
  return acc;
}, {});

export default function MoodPatternCard() {
  const moodPatterns = useSiklusStore((state) => state.moodPatterns);
  const hasData = moodPatterns.hasData;

  if (!hasData) {
    return (
      <div className="rounded-3xl border border-pink-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Pola Suasana Hati</h3>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Catat suasana hatimu secara rutin untuk melihat pola berdasarkan fase siklus.
        </p>
      </div>
    );
  }

  function renderPhaseSummary(phase) {
    const summary = moodPatterns.summary?.[phase];
    const totalEntries = summary?.total || 0;
    const topMoodKey = summary?.topMood;
    const topMoodOption = topMoodKey ? MOOD_LOOKUP[topMoodKey] : null;
    const secondaryMoods = summary?.moodCounts?.slice(1, 3) || [];

    return (
      <div
        key={phase}
        className="rounded-2xl border border-slate-100 bg-white/60 p-4 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900/60"
      >
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            {PHASE_NAMES[phase]}
          </p>
          <span className="text-xs text-slate-400 dark:text-slate-500">
            {totalEntries} catatan
          </span>
        </div>

        {topMoodOption ? (
          <div className="mt-3 flex items-center gap-3">
            <span className="text-2xl" role="img" aria-hidden="true">
              {topMoodOption.emoji}
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                {topMoodOption.label}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {summary.topCount}x / {summary.topPercentage}%
              </p>
            </div>
          </div>
        ) : (
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
            Belum ada mood dominan pada fase ini.
          </p>
        )}

        {secondaryMoods.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {secondaryMoods.map((item) => {
              const option = MOOD_LOOKUP[item.mood];
              const label = option ? option.label : item.mood;
              return (
                <span
                  key={item.mood}
                  className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600 dark:bg-slate-800/70 dark:text-slate-300"
                >
                  <span aria-hidden="true">{option?.emoji}</span>
                  <span>{label}</span>
                  <span className="text-slate-400 dark:text-slate-500">{item.count}x</span>
                </span>
              );
            })}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-pink-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Pola Suasana Hati</h3>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Mood yang paling sering kamu rasakan pada setiap fase siklus.
      </p>

      <div className="mt-4 grid gap-3">
        {PHASE_ORDER.map(renderPhaseSummary)}
      </div>
    </div>
  );
}

