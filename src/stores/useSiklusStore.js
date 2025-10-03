"use client";

import { create } from "zustand";
import {
  STORAGE_KEYS,
  DEFAULT_VALUES,
  getLocalValue,
  setLocalValue
} from "@/lib/siklus/localStore";
import { calculateCycleSummary } from "@/lib/siklus/cycleMath";
import { normalizeMoodEntry, calculateMoodDistribution } from "@/lib/siklus/mood";
import { calculateStreak, calculateConsistency } from "@/lib/siklus/streak";
import { analyzeMoodPatternsByPhase } from "@/lib/siklus/moodPatterns";
import { calculateAchievements } from "@/lib/siklus/achievements";

const defaultOnboarding = DEFAULT_VALUES[STORAGE_KEYS.onboardingData];
const defaultGoals = DEFAULT_VALUES[STORAGE_KEYS.goals];
const MOOD_DISTRIBUTION_WINDOW_DAYS = 30;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function formatDateString(value) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function sanitizePeriodEntry(entry) {
  if (!entry) {
    return null;
  }
  const start = formatDateString(entry.start || entry.date);
  if (!start) {
    return null;
  }
  const sanitized = { start };
  const end = formatDateString(entry.end);
  if (end) {
    sanitized.end = end;
  }
  return sanitized;
}

function sanitizePeriodHistory(value) {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.map((entry) => sanitizePeriodEntry(entry)).filter(Boolean);
}

function sanitizeGoals(value) {
  if (!Array.isArray(value)) {
    return [];
  }
  const deduped = Array.from(new Set(value.map((item) => String(item))));
  return deduped.filter((item) => item.trim().length > 0);
}

function toPositiveInteger(value, fallback) {
  const numeric = Number.parseInt(value, 10);
  if (Number.isFinite(numeric) && numeric > 0) {
    return numeric;
  }
  return fallback;
}

function buildSummaryFromOnboarding(data) {
  const onboardingData = data || {};
  const {
    lastPeriodStart,
    lastPeriodEnd,
    cycleLength,
    periodLength,
    periodHistory
  } = onboardingData;

  const recordedPeriods = sanitizePeriodHistory(periodHistory);
  const normalizedLastStart = formatDateString(lastPeriodStart);
  const normalizedLastEnd = formatDateString(lastPeriodEnd);

  if (normalizedLastStart) {
    const existingIndex = recordedPeriods.findIndex((entry) => entry.start === normalizedLastStart);
    if (existingIndex >= 0) {
      if (normalizedLastEnd) {
        recordedPeriods[existingIndex] = {
          ...recordedPeriods[existingIndex],
          end: normalizedLastEnd
        };
      }
    } else {
      recordedPeriods.push({ start: normalizedLastStart, end: normalizedLastEnd || null });
    }
  }

  recordedPeriods.sort((a, b) => {
    const aTime = new Date(a.start).getTime();
    const bTime = new Date(b.start).getTime();
    return aTime - bTime;
  });

  const cycleLengthValue = toPositiveInteger(cycleLength, 0);
  const summaryInput = recordedPeriods.map((entry) => ({ ...entry }));

  if (summaryInput.length > 0 && cycleLengthValue > 0) {
    const latestStart = summaryInput[summaryInput.length - 1].start;
    const baseDate = formatDateString(latestStart);
    if (baseDate) {
      const parsed = new Date(baseDate);
      if (!Number.isNaN(parsed.getTime())) {
        parsed.setDate(parsed.getDate() + cycleLengthValue);
        const predictedStart = formatDateString(parsed);
        if (predictedStart && !summaryInput.some((entry) => entry.start === predictedStart)) {
          summaryInput.push({ start: predictedStart, predicted: true });
        }
      }
    }
  }

  const periodLengthValue = toPositiveInteger(periodLength, 0);

  const summaryPeriods = summaryInput.map((entry) => {
    if (entry.end) {
      return { start: entry.start, end: entry.end };
    }
    if (entry.predicted || periodLengthValue <= 0) {
      return { start: entry.start, end: entry.end };
    }
    const startDate = new Date(entry.start);
    if (Number.isNaN(startDate.getTime())) {
      return { start: entry.start, end: entry.end };
    }
    const endDate = new Date(startDate.getTime() + (periodLengthValue - 1) * MS_PER_DAY);
    return {
      start: entry.start,
      end: formatDateString(endDate)
    };
  });

  const summary = calculateCycleSummary(summaryPeriods);
  const averageCycleLength = cycleLengthValue || summary.averageCycleLength;
  const averagePeriodLength = periodLengthValue || summary.averagePeriodLength;

  return {
    ...summary,
    averageCycleLength,
    averagePeriodLength,
    lastPeriodStart: normalizedLastStart || null,
    lastPeriodEnd: normalizedLastEnd || null
  };
}

function createEmptyMoodPatterns() {
  return analyzeMoodPatternsByPhase([], {});
}
const useSiklusStore = create((set, get) => ({
  hydrated: false,
  onboardingCompleted: DEFAULT_VALUES[STORAGE_KEYS.onboardingCompleted],
  onboardingData: { ...defaultOnboarding },
  moodLogs: DEFAULT_VALUES[STORAGE_KEYS.moodLogs],
  goals: [...defaultGoals],
  cycleSummary: buildSummaryFromOnboarding(defaultOnboarding),
  activeView: "dashboard",
  loveLetterShown: DEFAULT_VALUES[STORAGE_KEYS.loveLetterShownOnce],
  streak: 0,
  consistency: 0,
  moodDistribution: calculateMoodDistribution([], { days: MOOD_DISTRIBUTION_WINDOW_DAYS }),
  moodPatterns: createEmptyMoodPatterns(),
  achievements: [],

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
    
    // Calculate streak, consistency, and mood distribution
    const streak = calculateStreak(moodLogs);
    setLocalValue(STORAGE_KEYS.streak, streak);
    const consistency = calculateConsistency(moodLogs);
    const moodDistribution = calculateMoodDistribution(moodLogs, { days: MOOD_DISTRIBUTION_WINDOW_DAYS });
    const moodPatterns = analyzeMoodPatternsByPhase(moodLogs, cycleSummary);
    const achievements = calculateAchievements({
      moodLogs,
      streak,
      consistency,
      cycleSummary,
      onboardingCompleted,
      onboardingData
    });

    set({
      hydrated: true,
      onboardingCompleted,
      onboardingData,
      moodLogs,
      goals,
      cycleSummary,
      loveLetterShown,
      streak,
      consistency,
      moodDistribution,
      moodPatterns,
      achievements
    });
  },

  setActiveView: (view) => set({ activeView: view }),

  setOnboardingCompleted: (completed) => {
    const normalized = Boolean(completed);
    setLocalValue(STORAGE_KEYS.onboardingCompleted, normalized);
    set((state) => {
      const achievements = calculateAchievements({
        moodLogs: state.moodLogs,
        streak: state.streak,
        consistency: state.consistency,
        cycleSummary: state.cycleSummary,
        onboardingCompleted: normalized,
        onboardingData: state.onboardingData
      });
      return { onboardingCompleted: normalized, achievements };
    });
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
    const stateSnapshot = get();
    const goals = sanitizeGoals(stateSnapshot.onboardingData.goals);
    const normalizedData = { ...stateSnapshot.onboardingData, goals };

    setLocalValue(STORAGE_KEYS.onboardingData, normalizedData);
    setLocalValue(STORAGE_KEYS.goals, goals);

    const cycleSummary = buildSummaryFromOnboarding(normalizedData);
    const achievements = calculateAchievements({
      moodLogs: stateSnapshot.moodLogs,
      streak: stateSnapshot.streak,
      consistency: stateSnapshot.consistency,
      cycleSummary,
      onboardingCompleted: stateSnapshot.onboardingCompleted,
      onboardingData: normalizedData
    });

    set({
      onboardingData: normalizedData,
      cycleSummary,
      goals,
      achievements
    });
  },

  resetOnboardingData: () => {
    const defaults = { ...defaultOnboarding, goals: sanitizeGoals(defaultOnboarding.goals) };
    const defaultGoalList = sanitizeGoals(defaultGoals);

    setLocalValue(STORAGE_KEYS.onboardingData, defaults);
    setLocalValue(STORAGE_KEYS.goals, defaultGoalList);
    setLocalValue(STORAGE_KEYS.loveLetterShownOnce, false);

    set((state) => {
      const cycleSummary = buildSummaryFromOnboarding(defaults);
      const achievements = calculateAchievements({
        moodLogs: state.moodLogs,
        streak: state.streak,
        consistency: state.consistency,
        cycleSummary,
        onboardingCompleted: state.onboardingCompleted,
        onboardingData: defaults
      });

      return {
        onboardingData: defaults,
        cycleSummary,
        goals: defaultGoalList,
        loveLetterShown: false,
        achievements
      };
    });
  },

  addMoodLog: (log) => {
    const normalized = normalizeMoodEntry(log);
    const stateSnapshot = get();
    const moodLogs = [...stateSnapshot.moodLogs, normalized];
    setLocalValue(STORAGE_KEYS.moodLogs, moodLogs);

    // Recalculate streak, consistency, and mood distribution
    const streak = calculateStreak(moodLogs);
    setLocalValue(STORAGE_KEYS.streak, streak);
    const consistency = calculateConsistency(moodLogs);
    const moodDistribution = calculateMoodDistribution(moodLogs, { days: MOOD_DISTRIBUTION_WINDOW_DAYS });
    const moodPatterns = analyzeMoodPatternsByPhase(moodLogs, stateSnapshot.cycleSummary);
    const achievements = calculateAchievements({
      moodLogs,
      streak,
      consistency,
      cycleSummary: stateSnapshot.cycleSummary,
      onboardingCompleted: stateSnapshot.onboardingCompleted,
      onboardingData: stateSnapshot.onboardingData
    });

    set({
      moodLogs,
      streak,
      consistency,
      moodDistribution,
      moodPatterns,
      achievements
    });
  },

  replaceMoodLogs: (logs) => {
    const normalized = logs.map((log) => normalizeMoodEntry(log));
    setLocalValue(STORAGE_KEYS.moodLogs, normalized);

    // Recalculate streak, consistency, and mood distribution
    const streak = calculateStreak(normalized);
    setLocalValue(STORAGE_KEYS.streak, streak);
    const consistency = calculateConsistency(normalized);
    const moodDistribution = calculateMoodDistribution(normalized, { days: MOOD_DISTRIBUTION_WINDOW_DAYS });

    const stateSnapshot = get();
    const moodPatterns = analyzeMoodPatternsByPhase(normalized, stateSnapshot.cycleSummary);
    const achievements = calculateAchievements({
      moodLogs: normalized,
      streak,
      consistency,
      cycleSummary: stateSnapshot.cycleSummary,
      onboardingCompleted: stateSnapshot.onboardingCompleted,
      onboardingData: stateSnapshot.onboardingData
    });

    set({
      moodLogs: normalized,
      streak,
      consistency,
      moodDistribution,
      moodPatterns,
      achievements
    });
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




















