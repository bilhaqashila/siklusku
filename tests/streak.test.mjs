import test from "node:test";
import assert from "node:assert";

import {
  calculateStreak,
  calculateConsistency
} from "../src/lib/siklus/streak.js";

function formatRelativeDay(daysFromToday) {
  const base = new Date();
  base.setHours(12, 0, 0, 0);
  base.setDate(base.getDate() - daysFromToday);
  const year = base.getFullYear();
  const month = String(base.getMonth() + 1).padStart(2, "0");
  const day = String(base.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

test("calculateStreak returns 0 when no logs", () => {
  assert.strictEqual(calculateStreak([]), 0);
});

test("calculateStreak counts longest consecutive run regardless of order", () => {
  const logs = [
    { date: formatRelativeDay(0) },
    { date: formatRelativeDay(2) },
    { date: formatRelativeDay(1) },
    { date: formatRelativeDay(3) }
  ];

  assert.strictEqual(calculateStreak(logs), 4);
});

test("calculateStreak ignores duplicate entries and future dates", () => {
  const logs = [
    { date: formatRelativeDay(0) },
    { date: formatRelativeDay(0) },
    { date: formatRelativeDay(1) },
    { date: formatRelativeDay(-1) }
  ];

  assert.strictEqual(calculateStreak(logs), 2);
});

test("calculateStreak returns historical longest streak when current streak is shorter", () => {
  const logs = [
    { date: formatRelativeDay(6) },
    { date: formatRelativeDay(7) },
    { date: formatRelativeDay(8) },
    { date: formatRelativeDay(9) },
    { date: formatRelativeDay(10) },
    { date: formatRelativeDay(0) }
  ];

  assert.strictEqual(calculateStreak(logs), 5);
});

test("calculateConsistency returns 0 for empty input", () => {
  assert.strictEqual(calculateConsistency([]), 0);
});

test("calculateConsistency counts unique log days within 30-day window", () => {
  const logs = Array.from({ length: 15 }, (_, index) => ({
    date: formatRelativeDay(index)
  }));

  assert.strictEqual(calculateConsistency(logs), 50);
});

test("calculateConsistency clamps values to 100 and ignores old entries", () => {
  const recentLogs = Array.from({ length: 30 }, (_, index) => ({
    date: formatRelativeDay(index)
  }));
  const oldLogs = [
    { date: formatRelativeDay(60) },
    { date: formatRelativeDay(61) }
  ];

  assert.strictEqual(calculateConsistency([...recentLogs, ...oldLogs]), 100);
});

test("calculateConsistency deduplicates multiple logs on the same day", () => {
  const logs = [
    { date: formatRelativeDay(0) },
    { date: formatRelativeDay(0) },
    { date: formatRelativeDay(3) },
    { date: formatRelativeDay(3) }
  ];

  assert.strictEqual(calculateConsistency(logs), Math.round((2 / 30) * 100));
});
