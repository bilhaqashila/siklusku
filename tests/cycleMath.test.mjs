import test from "node:test";
import assert from "node:assert/strict";

import {
  cycleDay,
  getCycleDay,
  ovulationDay,
  calculatePhase,
  predictNextPeriod,
  calculateCycleSummary,
  buildCycleTimeline,
  projectUpcomingPeriods,
  formatDisplayDate
} from "../src/lib/siklus/cycleMath.js";

test("cycleDay returns null without start date", () => {
  assert.equal(cycleDay(new Date(), null), null);
});

test("cycleDay wraps beyond cycle length using modulo", () => {
  const start = "2025-01-01";
  const reference = new Date("2025-02-10");
  // diff 40 days -> with cycle length 28 should yield day 13
  assert.equal(cycleDay(reference, start, 28), 13);
});

test("cycleDay handles future start dates by normalizing", () => {
  const today = new Date("2025-02-01");
  const futureStart = "2025-02-05";
  assert.equal(cycleDay(today, futureStart, 28), 25);
});

test("getCycleDay forwards to cycleDay", () => {
  const today = new Date("2025-02-10");
  assert.equal(getCycleDay(today, "2025-02-05"), cycleDay(today, "2025-02-05"));
});

test("ovulationDay defaults to cycleLength minus 14", () => {
  assert.equal(ovulationDay(32), 18);
  assert.equal(ovulationDay(), 14);
});

test("calculatePhase respects menstrual and ovulation windows", () => {
  assert.equal(calculatePhase(2, 5, 28), "menstruation");
  assert.equal(calculatePhase(7, 5, 28), "follicular");
  assert.equal(calculatePhase(14, 5, 28), "ovulation");
  assert.equal(calculatePhase(16, 5, 28), "luteal");
});

test("predictNextPeriod adds cycle length", () => {
  assert.equal(predictNextPeriod("2025-02-01", 28), "2025-03-01");
});

test("calculateCycleSummary falls back when missing", () => {
  const summary = calculateCycleSummary();
  assert.equal(summary.averageCycleLength, 28);
  assert.equal(summary.averagePeriodLength, 5);
  assert.ok(Array.isArray(summary.cycleHistory));
  assert.equal(summary.cycleHistory.length, 0);
});

test("calculateCycleSummary averages provided periods", () => {
  const summary = calculateCycleSummary([
    { start: "2025-01-01", end: "2025-01-06" },
    { start: "2025-01-30", end: "2025-02-03" }
  ]);
  assert.equal(summary.averagePeriodLength, 6);
  assert.equal(summary.averageCycleLength, 29);
  assert.equal(summary.cycleHistory.length, 1);
  assert.deepEqual(summary.cycleHistory[0], {
    start: "2025-01-01",
    end: "2025-01-30",
    length: 29
  });
});
test("calculateCycleSummary skips predicted entries in history", () => {
  const summary = calculateCycleSummary([
    { start: "2025-01-01", end: "2025-01-05" },
    { start: "2025-01-29", predicted: true }
  ]);
  assert.equal(summary.averageCycleLength, 28);
  assert.equal(summary.cycleHistory.length, 0);
});

test("calculateCycleSummary handles predicted next period", () => {
  const summary = calculateCycleSummary([
    { start: "2025-01-01", end: "2025-01-06" },
    { start: "2025-01-31" }
  ]);
  assert.equal(summary.averagePeriodLength, 6);
  assert.equal(summary.averageCycleLength, 30);
});

test("buildCycleTimeline normalizes phases", () => {
  const timeline = buildCycleTimeline({
    lastPeriodStart: "2025-01-01",
    cycleLength: 6,
    periodLength: 2
  });
  assert.equal(timeline.length, 6);
  assert.equal(timeline[0].phase, "menstruation");
  assert.equal(timeline[3].phase, "ovulation");
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

test("formatDisplayDate formats dd/MM/yyyy", () => {
  assert.equal(formatDisplayDate("2025-02-07"), "07/02/2025");
  assert.equal(formatDisplayDate(null), "");
});


