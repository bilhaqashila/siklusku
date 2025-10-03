function toPositiveInteger(value, fallback = 0) {
  const numeric = Number.parseInt(value, 10);
  if (Number.isFinite(numeric) && numeric > 0) {
    return numeric;
  }
  return fallback;
}

function normalizeDateKey(value) {
  if (!value) {
    return null;
  }
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function countUniqueLogsInCurrentMonth(moodLogs = []) {
  const today = new Date();
  const targetPrefix = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
  const uniqueDates = new Set();

  moodLogs.forEach((log = {}) => {
    const dateKey = normalizeDateKey(log.date);
    if (!dateKey) {
      return;
    }
    if (dateKey.startsWith(targetPrefix)) {
      uniqueDates.add(dateKey);
    }
  });

  return uniqueDates.size;
}

function hasCompletedOnboarding(data = {}) {
  if (!data.onboardingCompleted) {
    return false;
  }
  const onboarding = data.onboardingData || {};
  const hasLastPeriodStart = Boolean(onboarding.lastPeriodStart);
  const hasCycleLength = toPositiveInteger(onboarding.cycleLength, 0) > 0;
  const hasPeriodLength = toPositiveInteger(onboarding.periodLength, 0) > 0;
  return hasLastPeriodStart && hasCycleLength && hasPeriodLength;
}

// Achievement definitions
export const ACHIEVEMENTS = [
  {
    id: "streak_7",
    title: "7-Day Streak",
    description: "Catat mood 7 hari berturut-turut.",
    condition: (data) => Number.isInteger(data.streak) && data.streak >= 7
  },
  {
    id: "streak_30",
    title: "30-Day Club",
    description: "Pertahankan streak selama 30 hari penuh.",
    condition: (data) => Number.isInteger(data.streak) && data.streak >= 30
  },
  {
    id: "cycle_predictor",
    title: "Cycle Predictor Pro",
    description: "Lengkapi data onboarding untuk bantu prediksi siklus.",
    condition: (data) => hasCompletedOnboarding(data)
  },
  {
    id: "monthly_mood_master",
    title: "Monthly Mood Master",
    description: "Catat minimal 20 hari mood dalam bulan ini.",
    condition: (data) => countUniqueLogsInCurrentMonth(data.moodLogs) >= 20
  }
];

/**
 * Calculate user achievements based on app data
 * @param {Object} data - App data including moodLogs, streak, consistency
 * @returns {Array} - Array of earned achievements
 */
export function calculateAchievements(data) {
  if (!data || !Array.isArray(data.moodLogs)) {
    return [];
  }

  return ACHIEVEMENTS.filter((achievement) => {
    try {
      return achievement.condition(data) === true;
    } catch (error) {
      console.error(`Error evaluating achievement ${achievement.id}:`, error);
      return false;
    }
  });
}