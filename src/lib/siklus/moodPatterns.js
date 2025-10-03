/**
 * Utility functions for analyzing mood patterns by menstrual cycle phase
 */

import { KNOWN_MOODS } from "./mood.js";

// Define cycle phases
export const CYCLE_PHASES = {
  MENSTRUATION: "menstruation",
  FOLLICULAR: "follicular",
  OVULATION: "ovulation",
  LUTEAL: "luteal"
};

const PHASE_LIST = Object.values(CYCLE_PHASES);

// Phase names in Indonesian
export const PHASE_NAMES = {
  [CYCLE_PHASES.MENSTRUATION]: "Menstruasi",
  [CYCLE_PHASES.FOLLICULAR]: "Folikuler",
  [CYCLE_PHASES.OVULATION]: "Ovulasi",
  [CYCLE_PHASES.LUTEAL]: "Luteal"
};

function toPositiveInteger(value, fallback) {
  const numeric = Number.parseInt(value, 10);
  if (Number.isFinite(numeric) && numeric > 0) {
    return numeric;
  }
  return fallback;
}

function createMoodAccumulator() {
  return PHASE_LIST.reduce((acc, phase) => {
    acc[phase] = KNOWN_MOODS.reduce((moodAcc, mood) => {
      moodAcc[mood] = 0;
      return moodAcc;
    }, {});
    return acc;
  }, {});
}

function createTopMoodMap(defaultValue = null) {
  return PHASE_LIST.reduce((acc, phase) => {
    acc[phase] = defaultValue;
    return acc;
  }, {});
}

function createSummaryMap() {
  return PHASE_LIST.reduce((acc, phase) => {
    acc[phase] = {
      total: 0,
      topMood: null,
      topCount: 0,
      topPercentage: 0,
      moodCounts: []
    };
    return acc;
  }, {});
}

/**
 * Determine the cycle phase for a given day in the cycle
 * @param {number} dayInCycle - Current day in the cycle (1-based)
 * @param {number} cycleLength - Total cycle length in days
 * @param {number} periodLength - Period length in days
 * @returns {string} - Phase name
 */
export function determineCyclePhase(dayInCycle, cycleLength = 28, periodLength = 5) {
  const normalizedCycleLength = toPositiveInteger(cycleLength, 28);
  const normalizedPeriodLength = Math.min(
    normalizedCycleLength,
    Math.max(1, toPositiveInteger(periodLength, 5))
  );

  if (!dayInCycle) {
    return CYCLE_PHASES.MENSTRUATION;
  }

  const day = ((Math.round(dayInCycle) - 1 + normalizedCycleLength) % normalizedCycleLength) + 1;

  if (day <= normalizedPeriodLength) {
    return CYCLE_PHASES.MENSTRUATION;
  }

  const ovulationDay = Math.min(normalizedCycleLength - 1, Math.max(normalizedPeriodLength + 1, normalizedCycleLength - 14));
  const ovulationEnd = Math.min(normalizedCycleLength, ovulationDay + 1);

  if (day >= ovulationDay && day <= ovulationEnd) {
    return CYCLE_PHASES.OVULATION;
  }

  if (day < ovulationDay) {
    return CYCLE_PHASES.FOLLICULAR;
  }

  return CYCLE_PHASES.LUTEAL;
}

/**
 * Calculate the day in cycle for a given date
 * @param {string} date - Date in YYYY-MM-DD format
 * @param {string} cycleStartDate - Cycle start date in YYYY-MM-DD format
 * @param {number} cycleLength - Cycle length in days
 * @returns {number} - Day in cycle (1-based)
 */
export function calculateDayInCycle(date, cycleStartDate, cycleLength = 28) {
  const normalizedCycleLength = toPositiveInteger(cycleLength, 28);
  const dateObj = new Date(date);
  const cycleStartObj = new Date(cycleStartDate);

  if (Number.isNaN(dateObj.getTime()) || Number.isNaN(cycleStartObj.getTime())) {
    return 1;
  }

  // Calculate days difference
  const diffTime = dateObj.getTime() - cycleStartObj.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to make it 1-based

  // Handle dates before cycle start
  if (diffDays <= 0) {
    const normalized = ((diffDays % normalizedCycleLength) + normalizedCycleLength) % normalizedCycleLength;
    return normalized === 0 ? normalizedCycleLength : normalized;
  }

  // Handle dates within or after first cycle
  return ((diffDays - 1) % normalizedCycleLength) + 1;
}

/**
 * Analyze mood patterns by phase
 * @param {Array} moodLogs - Array of mood log entries
 * @param {Object} cycleSummary - Cycle summary data
 * @returns {Object} - Mood patterns by phase
 */
export function analyzeMoodPatternsByPhase(moodLogs = [], cycleSummary = {}) {
  const byPhase = createMoodAccumulator();
  const topMoodByPhase = createTopMoodMap();
  const summary = createSummaryMap();

  const lastPeriodStart = cycleSummary?.lastPeriodStart;
  const averageCycleLength = toPositiveInteger(cycleSummary?.averageCycleLength, 28);
  const averagePeriodLength = toPositiveInteger(cycleSummary?.averagePeriodLength, 5);

  if (!moodLogs.length || !lastPeriodStart) {
    return {
      byPhase,
      topMoodByPhase,
      summary,
      hasData: false
    };
  }

  moodLogs.forEach((log = {}) => {
    const moodKey = log.mood;
    if (!KNOWN_MOODS.includes(moodKey)) {
      return;
    }

    const dayInCycle = calculateDayInCycle(log.date, lastPeriodStart, averageCycleLength);
    const phase = determineCyclePhase(dayInCycle, averageCycleLength, averagePeriodLength);

    if (!byPhase[phase]) {
      return;
    }

    byPhase[phase][moodKey] += 1;
  });

  let hasData = false;

  PHASE_LIST.forEach((phase) => {
    const moodCounts = byPhase[phase];
    const entries = Object.entries(moodCounts)
      .filter(([, count]) => count > 0)
      .sort((a, b) => {
        if (b[1] === a[1]) {
          return a[0].localeCompare(b[0]);
        }
        return b[1] - a[1];
      });

    const total = entries.reduce((totalCount, [, count]) => totalCount + count, 0);
    const topEntry = entries[0] || null;

    const detailedCounts = entries.map(([mood, count]) => ({
      mood,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0
    }));

    summary[phase] = {
      total,
      topMood: topEntry ? topEntry[0] : null,
      topCount: topEntry ? topEntry[1] : 0,
      topPercentage: topEntry && total > 0 ? Math.round((topEntry[1] / total) * 100) : 0,
      moodCounts: detailedCounts
    };

    topMoodByPhase[phase] = summary[phase].topMood;

    if (total > 0) {
      hasData = true;
    }
  });

  return {
    byPhase,
    topMoodByPhase,
    summary,
    hasData
  };
}

