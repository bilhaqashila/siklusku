import test from "node:test";
import assert from "node:assert";

import {
  analyzeMoodPatternsByPhase,
  CYCLE_PHASES
} from "../src/lib/siklus/moodPatterns.js";

const BASE_SUMMARY = {
  averageCycleLength: 28,
  averagePeriodLength: 5,
  lastPeriodStart: "2025-01-01"
};

test("analyzeMoodPatternsByPhase returns empty structure when missing data", () => {
  const result = analyzeMoodPatternsByPhase([], BASE_SUMMARY);
  assert.strictEqual(result.hasData, false);
  Object.values(CYCLE_PHASES).forEach((phase) => {
    assert.ok(result.byPhase[phase], `expected byPhase for ${phase}`);
    assert.strictEqual(result.summary[phase].total, 0);
    assert.strictEqual(result.topMoodByPhase[phase], null);
  });
});

test("analyzeMoodPatternsByPhase aggregates counts and top moods per phase", () => {
  const moodLogs = [
    { date: "2025-01-01", mood: "happy" },
    { date: "2025-01-03", mood: "sad" },
    { date: "2025-01-08", mood: "energized" },
    { date: "2025-01-15", mood: "neutral" },
    { date: "2025-01-20", mood: "tired" }
  ];

  const result = analyzeMoodPatternsByPhase(moodLogs, BASE_SUMMARY);

  assert.strictEqual(result.hasData, true);

  const menstruationSummary = result.summary[CYCLE_PHASES.MENSTRUATION];
  assert.strictEqual(menstruationSummary.total, 2);
  assert.strictEqual(menstruationSummary.topMood, "happy");
  assert.strictEqual(menstruationSummary.topCount, 1);
  assert.strictEqual(menstruationSummary.topPercentage, 50);
  assert.strictEqual(result.topMoodByPhase[CYCLE_PHASES.MENSTRUATION], "happy");
  assert.deepEqual(
    menstruationSummary.moodCounts.map((item) => item.mood),
    ["happy", "sad"]
  );

  const follicularSummary = result.summary[CYCLE_PHASES.FOLLICULAR];
  assert.strictEqual(follicularSummary.total, 1);
  assert.strictEqual(follicularSummary.topMood, "energized");

  const ovulationSummary = result.summary[CYCLE_PHASES.OVULATION];
  assert.strictEqual(ovulationSummary.total, 1);
  assert.strictEqual(ovulationSummary.topMood, "neutral");

  const lutealSummary = result.summary[CYCLE_PHASES.LUTEAL];
  assert.strictEqual(lutealSummary.total, 1);
  assert.strictEqual(lutealSummary.topMood, "tired");
});
