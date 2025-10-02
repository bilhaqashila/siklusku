"use client";

import { create } from "zustand";
import {
  STORAGE_KEYS,
  DEFAULT_VALUES,
  getLocalValue,
  setLocalValue
} from "@/lib/siklus/localStore";
import { calculateCycleSummary } from "@/lib/siklus/cycleMath";
import { normalizeMoodEntry } from "@/lib/siklus/mood";

const defaultOnboarding = DEFAULT_VALUES[STORAGE_KEYS.onboardingData];
const defaultGoals = DEFAULT_VALUES[STORAGE_KEYS.goals];

function sanitizeGoals(value) {
  if (!Array.isArray(value)) {
    return [];
  }
  const deduped = Array.from(new Set(value.map((item) => String(item))));
  return deduped.filter((item) => item.trim().length > 0);
}

function buildSummaryFromOnboarding(data) {
  if (!data) {
    return calculateCycleSummary();
  }
  const { lastPeriodStart, lastPeriodEnd } = data;
  if (!lastPeriodStart) {
    return calculateCycleSummary();
  }
  const periods = [{ start: lastPeriodStart, end: lastPeriodEnd }];
  return calculateCycleSummary(periods);
}

const useSiklusStore = create((set, get) => ({
  hydrated: false,
  onboardingCompleted: DEFAULT_VALUES[STORAGE_KEYS.onboardingCompleted],
  onboardingData: { ...defaultOnboarding },
  moodLogs: DEFAULT_VALUES[STORAGE_KEYS.moodLogs],
  goals: [...defaultGoals],
  cycleSummary: calculateCycleSummary(),
  activeView: "dashboard",
  loveLetterShown: DEFAULT_VALUES[STORAGE_KEYS.loveLetterShownOnce],

  hydrate: () => {
    if (get().hydrated) {
      return;
    }

    const onboardingCompleted = getLocalValue(STORAGE_KEYS.onboardingCompleted);
    const rawOnboardingData = getLocalValue(STORAGE_KEYS.onboardingData);
    const onboardingGoals = sanitizeGoals(rawOnboardingData.goals);
    const onboardingData = { ...rawOnboardingData, goals: onboardingGoals };

    const moodLogs = getLocalValue(STORAGE_KEYS.moodLogs).map((entry) => normalizeMoodEntry(entry));
    const storedGoals = sanitizeGoals(getLocalValue(STORAGE_KEYS.goals));
    const goals = storedGoals.length > 0 ? storedGoals : onboardingGoals;
    const cycleSummary = buildSummaryFromOnboarding(onboardingData);
    const loveLetterShown = getLocalValue(STORAGE_KEYS.loveLetterShownOnce);

    set({
      hydrated: true,
      onboardingCompleted,
      onboardingData,
      moodLogs,
      goals,
      cycleSummary,
      loveLetterShown
    });
  },

  setActiveView: (view) => set({ activeView: view }),

  setOnboardingCompleted: (completed) => {
    const normalized = Boolean(completed);
    setLocalValue(STORAGE_KEYS.onboardingCompleted, normalized);
    set({ onboardingCompleted: normalized });
  },

  updateOnboardingDraft: (partial) => {
    const current = get().onboardingData;
    const next = { ...current, ...partial };
    if (Object.prototype.hasOwnProperty.call(partial, "goals")) {
      next.goals = sanitizeGoals(partial.goals);
    }
    set({
      onboardingData: next,
      cycleSummary: buildSummaryFromOnboarding(next)
    });
  },

  commitOnboardingData: () => {
    const data = get().onboardingData;
    const goals = sanitizeGoals(data.goals);
    const normalizedData = { ...data, goals };

    setLocalValue(STORAGE_KEYS.onboardingData, normalizedData);
    setLocalValue(STORAGE_KEYS.goals, goals);

    set({
      onboardingData: normalizedData,
      cycleSummary: buildSummaryFromOnboarding(normalizedData),
      goals
    });
  },

  resetOnboardingData: () => {
    const defaults = { ...defaultOnboarding, goals: sanitizeGoals(defaultOnboarding.goals) };
    const defaultGoalList = sanitizeGoals(defaultGoals);

    setLocalValue(STORAGE_KEYS.onboardingData, defaults);
    setLocalValue(STORAGE_KEYS.goals, defaultGoalList);
    setLocalValue(STORAGE_KEYS.loveLetterShownOnce, false);

    set({
      onboardingData: defaults,
      cycleSummary: buildSummaryFromOnboarding(defaults),
      goals: defaultGoalList,
      loveLetterShown: false
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
  },

  setGoals: (nextGoals) => {
    const value = sanitizeGoals(nextGoals);
    setLocalValue(STORAGE_KEYS.goals, value);
    set({ goals: value });
  },

  markLoveLetterShown: () => {
    setLocalValue(STORAGE_KEYS.loveLetterShownOnce, true);
    set({ loveLetterShown: true });
  },

  resetLoveLetter: () => {
    setLocalValue(STORAGE_KEYS.loveLetterShownOnce, false);
    set({ loveLetterShown: false });
  }
}));

export default useSiklusStore;

