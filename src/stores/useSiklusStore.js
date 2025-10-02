"use client";

import { create } from "zustand";
import {
  STORAGE_KEYS,
  DEFAULT_VALUES,
  getLocalValue,
  setLocalValue,
  mergeLocalValue
} from "@/lib/siklus/localStore";
import { calculateCycleSummary } from "@/lib/siklus/cycleMath";
import { normalizeMoodEntry } from "@/lib/siklus/mood";

const defaultOnboarding = DEFAULT_VALUES[STORAGE_KEYS.onboardingData];

const useSiklusStore = create((set, get) => ({
  hydrated: false,
  onboardingCompleted: DEFAULT_VALUES[STORAGE_KEYS.onboardingCompleted],
  onboardingData: { ...defaultOnboarding },
  moodLogs: DEFAULT_VALUES[STORAGE_KEYS.moodLogs],
  cycleSummary: calculateCycleSummary(),
  activeView: "dashboard",

  hydrate: () => {
    if (get().hydrated) {
      return;
    }
    const onboardingCompleted = getLocalValue(STORAGE_KEYS.onboardingCompleted);
    const onboardingData = getLocalValue(STORAGE_KEYS.onboardingData);
    const moodLogs = getLocalValue(STORAGE_KEYS.moodLogs).map((entry) => normalizeMoodEntry(entry));
    const cycleSummary = calculateCycleSummary([
      {
        start: onboardingData.lastPeriodStart,
        end: onboardingData.lastPeriodEnd
      }
    ]);

    set({
      hydrated: true,
      onboardingCompleted,
      onboardingData,
      moodLogs,
      cycleSummary
    });
  },

  setActiveView: (view) => set({ activeView: view }),

  setOnboardingCompleted: (completed) => {
    setLocalValue(STORAGE_KEYS.onboardingCompleted, Boolean(completed));
    set({ onboardingCompleted: Boolean(completed) });
  },

  updateOnboardingData: (partial) => {
    const merged = mergeLocalValue(STORAGE_KEYS.onboardingData, partial);
    set({
      onboardingData: merged,
      cycleSummary: calculateCycleSummary([
        {
          start: merged.lastPeriodStart,
          end: merged.lastPeriodEnd
        }
      ])
    });
  },

  addMoodLog: (log) => {
    const normalized = normalizeMoodEntry(log);
    const existing = [...get().moodLogs, normalized];
    setLocalValue(STORAGE_KEYS.moodLogs, existing);
    set({ moodLogs: existing });
  },

  replaceMoodLogs: (logs) => {
    const normalized = logs.map((log) => normalizeMoodEntry(log));
    setLocalValue(STORAGE_KEYS.moodLogs, normalized);
    set({ moodLogs: normalized });
  }
}));

export default useSiklusStore;
