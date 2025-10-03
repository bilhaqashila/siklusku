/**
 * Streak and consistency calculation utilities for mood logs
 */

const MS_IN_DAY = 24 * 60 * 60 * 1000;

function toLocalDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDateString(value) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return null;
  }

  const [yearStr, monthStr, dayStr] = trimmed.split("-");
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);

  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
    return null;
  }

  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return null;
  }

  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }

  return date;
}

function extractLogDate(log) {
  if (!log) {
    return null;
  }

  if (log.date instanceof Date) {
    return toLocalDateString(log.date);
  }

  if (typeof log.date === "string") {
    const parsed = parseDateString(log.date);
    if (parsed) {
      return toLocalDateString(parsed);
    }
  }

  return null;
}

/**
 * Calculate the longest streak of consecutive days with mood logs up to today.
 * @param {Array} moodLogs - Array of mood log entries
 * @returns {number} - Longest streak count
 */
export function calculateStreak(moodLogs = []) {
  if (!Array.isArray(moodLogs) || moodLogs.length === 0) {
    return 0;
  }

  const todayString = toLocalDateString(new Date());

  const uniqueDates = Array.from(
    new Set(
      moodLogs
        .map((log) => extractLogDate(log))
        .filter((value) => Boolean(value))
    )
  ).filter((dateString) => dateString <= todayString);

  if (!uniqueDates.length) {
    return 0;
  }

  uniqueDates.sort();

  let longest = 1;
  let current = 0;
  let previousDate = null;

  uniqueDates.forEach((dateString) => {
    const parsed = parseDateString(dateString);
    if (!parsed) {
      return;
    }

    if (!previousDate) {
      current = 1;
    } else {
      const diffDays = Math.round((parsed - previousDate) / MS_IN_DAY);
      current = diffDays === 1 ? current + 1 : 1;
    }

    longest = Math.max(longest, current);
    previousDate = parsed;
  });

  return longest;
}

/**
 * Calculate consistency percentage based on logs in the last 30 days.
 * @param {Array} moodLogs - Array of mood log entries
 * @returns {number} - Consistency percentage (0-100)
 */
export function calculateConsistency(moodLogs = []) {
  if (!Array.isArray(moodLogs) || moodLogs.length === 0) {
    return 0;
  }

  const today = new Date();
  const windowStart = new Date(today);
  windowStart.setDate(windowStart.getDate() - 29); // Inclusive of today

  const todayString = toLocalDateString(today);
  const windowStartString = toLocalDateString(windowStart);

  const daysWithLogs = new Set();

  moodLogs.forEach((log) => {
    const dateString = extractLogDate(log);
    if (!dateString) {
      return;
    }

    if (dateString < windowStartString || dateString > todayString) {
      return;
    }

    daysWithLogs.add(dateString);
  });

  if (!daysWithLogs.size) {
    return 0;
  }

  const percentage = Math.round((daysWithLogs.size / 30) * 100);
  return Math.min(100, percentage);
}
