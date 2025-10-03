import test from "node:test";
import assert from "node:assert";

import { calculateAchievements } from "../src/lib/siklus/achievements.js";

function createBaseData(overrides = {}) {
  return {
    moodLogs: [],
    streak: 0,
    consistency: 0,
    cycleSummary: {},
    onboardingCompleted: false,
    onboardingData: {},
    ...overrides
  };
}

test("calculateAchievements returns empty array when data missing", () => {
  const achievements = calculateAchievements(createBaseData());
  assert.deepStrictEqual(achievements.map((item) => item.id), []);
});

test("calculateAchievements unlocks streak achievements at thresholds", () => {
  const sevenDay = calculateAchievements(createBaseData({ streak: 7 }));
  assert.ok(sevenDay.some((item) => item.id === "streak_7"));
  assert.ok(!sevenDay.some((item) => item.id === "streak_30"));

  const thirtyDay = calculateAchievements(createBaseData({ streak: 30 }));
  assert.ok(thirtyDay.some((item) => item.id === "streak_30"));
});

test("calculateAchievements unlocks Cycle Predictor Pro when onboarding complete", () => {
  const incomplete = calculateAchievements(
    createBaseData({ onboardingCompleted: true, onboardingData: { cycleLength: 28 } })
  );
  assert.ok(!incomplete.some((item) => item.id === "cycle_predictor"));

  const complete = calculateAchievements(
    createBaseData({
      onboardingCompleted: true,
      onboardingData: {
        lastPeriodStart: "2025-01-10",
        cycleLength: 28,
        periodLength: 5
      }
    })
  );
  assert.ok(complete.some((item) => item.id === "cycle_predictor"));
});

test("calculateAchievements unlocks Monthly Mood Master for 20 unique days this month", () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  function formatDate(day) {
    const date = new Date(year, month, day);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  const nineteenLogs = Array.from({ length: 19 }, (_, index) => ({
    date: formatDate(index + 1),
    mood: "happy"
  }));

  const almost = calculateAchievements(createBaseData({ moodLogs: nineteenLogs }));
  assert.ok(!almost.some((item) => item.id === "monthly_mood_master"));

  const twentyLogs = Array.from({ length: 20 }, (_, index) => ({
    date: formatDate(index + 1),
    mood: "happy"
  }));

  const unlocked = calculateAchievements(createBaseData({ moodLogs: twentyLogs }));
  assert.ok(unlocked.some((item) => item.id === "monthly_mood_master"));
});
