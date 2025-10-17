'use client';

import { create } from 'zustand';
import { STORAGE_KEYS, DEFAULT_VALUES, getLocalValue, setLocalValue } from '@/lib/siklus/localStore';
import { calculateCycleSummary } from '@/lib/siklus/cycleMath';
// ⛔ removed: import { normalizeMoodEntry, calculateMoodDistribution } from "@/lib/siklus/mood";
import { calculateStreak, calculateConsistency } from '@/lib/siklus/streak';
import { analyzeMoodPatternsByPhase } from '@/lib/siklus/moodPatterns';
import { calculateAchievements } from '@/lib/siklus/achievements';

/* =========================
   Local mood helpers (replacing mood.js)
   ========================= */
const KNOWN_MOODS = ['happy', 'sad', 'angry', 'anxious', 'normal'];

function normalizeDateYYYYMMDD(value) {
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function normalizeMoodKey(mood) {
  if (!mood || typeof mood !== 'string') return null;
  const key = mood.trim().toLowerCase();
  return KNOWN_MOODS.includes(key) ? key : null;
}

/** Replacement for normalizeMoodEntry from mood.js */
function normalizeMoodEntry(entry = {}) {
  const date = normalizeDateYYYYMMDD(entry.date || new Date());
  const moodKey = normalizeMoodKey(entry.mood) ?? 'normal';
  const note = typeof entry.note === 'string' ? entry.note.trim() : '';
  return {
    ...entry,
    date,
    mood: moodKey,
    note,
  };
}

/**
 * Replacement for calculateMoodDistribution from mood.js
 * Counts mood frequencies within a moving window (default 30 days) using `date` field of entries.
 */
function calculateMoodDistribution(moodLogs = [], { days = 30 } = {}) {
  if (!Array.isArray(moodLogs) || moodLogs.length === 0) return {};
  const now = new Date();
  const windowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  windowStart.setDate(windowStart.getDate() - (Number.isFinite(days) ? days : 30) + 1); // inclusive window

  const counts = {};
  for (const raw of moodLogs) {
    const e = normalizeMoodEntry(raw);
    if (!e.date) continue;
    const d = new Date(e.date + 'T00:00:00');
    if (d >= windowStart && d <= now) {
      counts[e.mood] = (counts[e.mood] || 0) + 1;
    }
  }
  return counts;
}
/* ========================= */

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
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function sanitizePeriodEntry(entry) {
  if (!entry) return null;

  // local clamp to avoid order issues with other helpers
  const clampPainValue = (p) => {
    const n = Number.parseInt(p, 10);
    if (!Number.isFinite(n)) return null;
    return Math.min(10, Math.max(1, n));
  };

  const start = formatDateString(entry.start || entry.date);
  if (!start) return null;

  const sanitized = { start };
  const end = formatDateString(entry.end);
  if (end) sanitized.end = end;

  // ✅ preserve painScale if provided
  const pain = clampPainValue(entry.painScale);
  if (pain) sanitized.painScale = pain;

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
  const { lastPeriodStart, lastPeriodEnd, cycleLength, periodLength, periodHistory } = onboardingData;

  const recordedPeriods = sanitizePeriodHistory(periodHistory);
  const normalizedLastStart = formatDateString(lastPeriodStart);
  const normalizedLastEnd = formatDateString(lastPeriodEnd);

  if (normalizedLastStart) {
    const existingIndex = recordedPeriods.findIndex((entry) => entry.start === normalizedLastStart);
    if (existingIndex >= 0) {
      if (normalizedLastEnd) {
        recordedPeriods[existingIndex] = {
          ...recordedPeriods[existingIndex],
          end: normalizedLastEnd,
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
      return { start: entry.start, end: entry.end, predicted: Boolean(entry.predicted) };
    }
    if (entry.predicted || periodLengthValue <= 0) {
      return { start: entry.start, end: entry.end, predicted: Boolean(entry.predicted) };
    }
    const startDate = new Date(entry.start);
    if (Number.isNaN(startDate.getTime())) {
      return { start: entry.start, end: entry.end, predicted: Boolean(entry.predicted) };
    }
    const endDate = new Date(startDate.getTime() + (periodLengthValue - 1) * MS_PER_DAY);
    return {
      start: entry.start,
      end: formatDateString(endDate),
      predicted: Boolean(entry.predicted),
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
    lastPeriodEnd: normalizedLastEnd || null,
  };
}

/* ======= NEW HELPERS (addPeriod support) ======= */
function isFutureISO(iso) {
  if (!iso) return false;
  const d = new Date(iso + 'T00:00:00');
  const today = new Date();
  const td = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return d.getTime() > td.getTime();
}

function datesOverlap(aStart, aEnd, bStart, bEnd) {
  const aS = new Date(aStart).getTime();
  const aE = new Date((aEnd || aStart) + 'T00:00:00').getTime();
  const bS = new Date(bStart).getTime();
  const bE = new Date((bEnd || bStart) + 'T00:00:00').getTime();
  return aS <= bE && bS <= aE;
}

function sortByStartAsc(list) {
  return [...list].sort((x, y) => new Date(x.start) - new Date(y.start));
}

function clampPain(p) {
  const n = Number.parseInt(p, 10);
  if (!Number.isFinite(n)) return null;
  return Math.min(10, Math.max(1, n));
}
/* ======= /NEW HELPERS ======= */

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
  activeView: 'dashboard',
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
      onboardingData,
    });

    // Load daily logs
    const dailyLogs = (() => {
      try {
        const saved = localStorage.getItem('risa:dailyLogs');
        return saved ? JSON.parse(saved) : [];
      } catch {
        return [];
      }
    })();

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
      achievements,
      dailyLogs: Array.isArray(dailyLogs) ? dailyLogs : [],
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
        onboardingData: state.onboardingData,
      });
      return { onboardingCompleted: normalized, achievements };
    });
  },

  updateOnboardingDraft: (partial) => {
    const current = get().onboardingData;
    const next = { ...current, ...partial };
    if (Object.prototype.hasOwnProperty.call(partial, 'goals')) {
      next.goals = sanitizeGoals(partial.goals);
    }
    set({
      onboardingData: next,
      cycleSummary: buildSummaryFromOnboarding(next),
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
      onboardingData: normalizedData,
    });

    set({
      onboardingData: normalizedData,
      cycleSummary,
      goals,
      achievements,
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
        onboardingData: defaults,
      });

      return {
        onboardingData: defaults,
        cycleSummary,
        goals: defaultGoalList,
        loveLetterShown: false,
        achievements,
      };
    });
  },

  /* ======= NEW ACTION: addPeriod (drop-in replacement) ======= */
  /**
   * Add a new period entry and recalculate summaries.
   * @param {{start:string, end?:string|null, painScale?:number}} payload
   * Throws Error with message for validation failures.
   */
  addPeriod: (payload) => {
    const { start, end = null, painScale = null } = payload || {};
    const sISO = formatDateString(start);
    const eISO = end ? formatDateString(end) : null;

    // ---- Validation
    if (!sISO) throw new Error('Tanggal mulai diperlukan.');
    if (isFutureISO(sISO)) throw new Error('Tanggal mulai tidak boleh di masa depan.');
    if (eISO) {
      if (isFutureISO(eISO)) throw new Error('Tanggal selesai tidak boleh di masa depan.');
      if (new Date(eISO) < new Date(sISO)) {
        throw new Error('Tanggal selesai tidak boleh sebelum tanggal mulai.');
      }
    }

    const state = get();
    const current = state.onboardingData || {};
    const existing = sanitizePeriodHistory(current.periodHistory);

    // Duplicate start date?
    if (existing.some((it) => it.start === sISO)) {
      throw new Error('Sudah ada catatan dengan tanggal mulai tersebut.');
    }

    // Overlap check (treat open-end as 1-day)
    for (const it of existing) {
      if (datesOverlap(sISO, eISO, it.start, it.end || it.start)) {
        throw new Error('Rentang tanggal tumpang tindih dengan catatan lain.');
      }
    }

    // Build new entry
    const entry = { start: sISO, end: eISO || null };
    const pain = clampPain(painScale);
    if (pain) entry.painScale = pain;

    const nextHistory = sortByStartAsc([...existing, entry]);

    const nextOnboarding = {
      ...current,
      periodHistory: nextHistory,
      lastPeriodStart: sISO,
      lastPeriodEnd: eISO,
    };

    // Persist onboarding data
    setLocalValue(STORAGE_KEYS.onboardingData, nextOnboarding);

    // Base summary from helper
    const baseSummary = buildSummaryFromOnboarding(nextOnboarding);

    // ===== Recalculate averages from real history (if possible)
    let averageCycleLength = baseSummary.averageCycleLength;
    let averagePeriodLength = baseSummary.averagePeriodLength;

    if (nextOnboarding.periodHistory?.length >= 2) {
      const entries = nextOnboarding.periodHistory
        .filter((p) => p.start)
        .map((p) => ({
          start: new Date(p.start + 'T00:00:00'),
          end: p.end ? new Date(p.end + 'T00:00:00') : null,
        }))
        .sort((a, b) => a.start - b.start);

      // Cycle lengths = gaps between starts
      const cycleLens = [];
      for (let i = 1; i < entries.length; i++) {
        const days = Math.round((entries[i].start - entries[i - 1].start) / MS_PER_DAY);
        // guard against noise: typical cycle ~ 15..60
        if (days >= 15 && days <= 60) cycleLens.push(days);
      }
      if (cycleLens.length) {
        averageCycleLength = Math.round(cycleLens.reduce((a, b) => a + b, 0) / cycleLens.length);
      }

      // Period lengths = (end - start) + 1
      const periodLens = entries.map((e) => (e.end ? Math.round((e.end - e.start) / MS_PER_DAY) + 1 : null)).filter((v) => Number.isFinite(v) && v > 0 && v <= 15); // guard typical duration
      if (periodLens.length) {
        averagePeriodLength = Math.round(periodLens.reduce((a, b) => a + b, 0) / periodLens.length);
      }
    }

    const cycleSummary = {
      ...baseSummary,
      averageCycleLength,
      averagePeriodLength,
    };

    // ===== Mark onboarded (so UI never gates again)
    setLocalValue(STORAGE_KEYS.onboardingCompleted, true);

    // ===== Aggregate pain for future charts — last 12 months
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const painPointsLast12M = nextHistory.filter((it) => it.painScale && new Date(it.start) >= twelveMonthsAgo).map((it) => ({ date: it.start, pain: it.painScale }));

    const painMonthlyLast12M = painPointsLast12M.reduce((acc, p) => {
      const d = new Date(p.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      acc[key] = acc[key] || { month: key, total: 0, count: 0 };
      acc[key].total += p.pain;
      acc[key].count += 1;
      return acc;
    }, {});
    const painMonthlyArr = Object.values(painMonthlyLast12M)
      .map((x) => ({ month: x.month, avgPain: Math.round((x.total / x.count) * 10) / 10 }))
      .sort((a, b) => (a.month < b.month ? -1 : 1));

    const achievements = calculateAchievements({
      moodLogs: state.moodLogs,
      streak: state.streak,
      consistency: state.consistency,
      cycleSummary,
      onboardingCompleted: true, // reflect the flag for achievement logic
      onboardingData: nextOnboarding,
    });

    // ===== Commit to store
    set({
      onboardingData: nextOnboarding,
      cycleSummary,
      achievements,
      painPointsLast12M: painPointsLast12M,
      painMonthlyLast12M: painMonthlyArr,
      onboardingCompleted: true,
    });
  },
  /* ======= /NEW ACTION ======= */

  /* ======= FIXED: addMoodLog ======= */
  addMoodLog: (log) => {
    const normalized = normalizeMoodEntry(log);
    const state = get();
    const todayKey = normalized.date;

    // ---- Overwrite existing mood for the same date ----
    const existing = Array.isArray(state.moodLogs) ? state.moodLogs : [];
    const filtered = existing.filter((entry) => entry.date !== todayKey);
    const moodLogs = [...filtered, normalized];

    // Persist
    setLocalValue(STORAGE_KEYS.moodLogs, moodLogs);

    // Recalculate derived stats
    const streak = calculateStreak(moodLogs);
    setLocalValue(STORAGE_KEYS.streak, streak);
    const consistency = calculateConsistency(moodLogs);
    const moodDistribution = calculateMoodDistribution(moodLogs, {
      days: MOOD_DISTRIBUTION_WINDOW_DAYS,
    });
    const moodPatterns = analyzeMoodPatternsByPhase(moodLogs, state.cycleSummary);
    const achievements = calculateAchievements({
      moodLogs,
      streak,
      consistency,
      cycleSummary: state.cycleSummary,
      onboardingCompleted: state.onboardingCompleted,
      onboardingData: state.onboardingData,
    });

    set({
      moodLogs,
      streak,
      consistency,
      moodDistribution,
      moodPatterns,
      achievements,
    });
  },
  /* ======= /FIXED ======= */

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
      onboardingData: stateSnapshot.onboardingData,
    });

    set({
      moodLogs: normalized,
      streak,
      consistency,
      moodDistribution,
      moodPatterns,
      achievements,
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
  },

  // Daily tracking functionality
  dailyLogs: [],

  addDailyLog: (logData) => {
    const state = get();
    const existingIndex = state.dailyLogs.findIndex((log) => log.date === logData.date);

    let updatedLogs;
    if (existingIndex >= 0) {
      // Update existing log
      updatedLogs = [...state.dailyLogs];
      updatedLogs[existingIndex] = { ...updatedLogs[existingIndex], ...logData };
    } else {
      // Add new log
      updatedLogs = [...state.dailyLogs, logData];
    }

    // Sort by date (newest first)
    updatedLogs.sort((a, b) => new Date(b.date) - new Date(a.date));

    try {
      localStorage.setItem('risa:dailyLogs', JSON.stringify(updatedLogs));
    } catch (error) {
      console.warn('Failed to save daily logs:', error);
    }

    set({ dailyLogs: updatedLogs });
  },

  loadDailyLogs: () => {
    try {
      const saved = localStorage.getItem('risa:dailyLogs');
      if (saved) {
        const logs = JSON.parse(saved);
        set({ dailyLogs: Array.isArray(logs) ? logs : [] });
      }
    } catch (error) {
      console.warn('Failed to load daily logs:', error);
      set({ dailyLogs: [] });
    }
  },
}));

export default useSiklusStore;
