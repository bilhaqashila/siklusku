import test from "node:test";
import assert from "node:assert/strict";

import {
  getCycleDay,
  calculatePhase,
  predictNextPeriod,
  calculateCycleSummary,
  buildCycleTimeline,
  projectUpcomingPeriods
} from "../src/lib/siklus/cycleMath.js";

test("getCycleDay returns null without start date", () => {
  assert.equal(getCycleDay(new Date(), null), null);
});

test("getCycleDay calculates day difference", () => {
  const today = new Date("2025-02-10");
  assert.equal(getCycleDay(today, "2025-02-05"), 6);
});

test("calculatePhase follows ranges", () => {
  assert.equal(calculatePhase(2, 5, 28), "menstruation");
  assert.equal(calculatePhase(8, 5, 28), "follicular");
});

test("predictNextPeriod adds cycle length", () => {
  assert.equal(predictNextPeriod("2025-02-01", 28), "2025-03-01");
});

test("calculateCycleSummary falls back when missing", () => {
  const summary = calculateCycleSummary();
  assert.equal(summary.averageCycleLength, 28);
  assert.equal(summary.averagePeriodLength, 5);
});

test("calculateCycleSummary averages provided periods", () => {
  const summary = calculateCycleSummary([
    { start: "2025-01-01", end: "2025-01-06" },
    { start: "2025-01-30", end: "2025-02-03" }
  ]);
  assert.equal(summary.averagePeriodLength, 6);
  assert.equal(summary.averageCycleLength, 29);
});

test("buildCycleTimeline returns per-day entries", () => {
  const timeline = buildCycleTimeline({
    lastPeriodStart: "2025-01-01",
    cycleLength: 5,
    periodLength: 2
  });
  assert.equal(timeline.length, 5);
  assert.equal(timeline[0].day, 1);
  assert.equal(timeline[0].phase, "menstruation");
});

test("projectUpcomingPeriods lists future cycles", () => {
  const projections = projectUpcomingPeriods({
    lastPeriodStart: "2025-01-01",
    cyclesToProject: 2,
    cycleLength: 28
  });
  assert.equal(projections.length, 2);
  assert.equal(projections[0], "2025-01-29");
});


