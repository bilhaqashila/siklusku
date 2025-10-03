const DAILY_NUDGE_HOUR = 20;

function getTodayKey(now = new Date()) {
  if (!(now instanceof Date)) {
    return null;
  }
  if (Number.isNaN(now.getTime())) {
    return null;
  }
  return now.toISOString().slice(0, 10);
}

function hasMoodLogForDay(moodLogs = [], dayKey) {
  if (!dayKey) {
    return false;
  }
  if (!Array.isArray(moodLogs)) {
    return false;
  }
  return moodLogs.some((entry) => entry && entry.date === dayKey);
}

function shouldShowDailyMoodNudge({ now = new Date(), moodLogs = [], nudgesEnabled = true } = {}) {
  if (!nudgesEnabled) {
    return false;
  }
  if (!(now instanceof Date) || Number.isNaN(now.getTime())) {
    return false;
  }
  if (now.getHours() < DAILY_NUDGE_HOUR) {
    return false;
  }
  const dayKey = getTodayKey(now);
  if (!dayKey) {
    return false;
  }
  return !hasMoodLogForDay(moodLogs, dayKey);
}

export { DAILY_NUDGE_HOUR, getTodayKey, hasMoodLogForDay, shouldShowDailyMoodNudge };