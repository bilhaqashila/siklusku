import test from 'node:test';
import assert from 'node:assert/strict';

import { getTodayKey, shouldShowDailyMoodNudge } from '../src/lib/siklus/nudges.js';

test('does not show nudge before 20:00 local time', () => {
  const date = new Date(2025, 9, 3, 19, 45, 0);
  const result = shouldShowDailyMoodNudge({ now: date, moodLogs: [], nudgesEnabled: true });
  assert.equal(result, false);
});

test('shows nudge after 20:00 when no mood log exists', () => {
  const date = new Date(2025, 9, 3, 20, 5, 0);
  const result = shouldShowDailyMoodNudge({ now: date, moodLogs: [], nudgesEnabled: true });
  assert.equal(result, true);
});

test('does not show nudge when mood log exists for today', () => {
  const date = new Date(2025, 9, 3, 21, 0, 0);
  const todayKey = getTodayKey(date);
  const moodLogs = [{ date: todayKey, mood: 'happy' }];
  const result = shouldShowDailyMoodNudge({ now: date, moodLogs, nudgesEnabled: true });
  assert.equal(result, false);
});

test('respects nudges toggle', () => {
  const date = new Date(2025, 9, 3, 21, 0, 0);
  const result = shouldShowDailyMoodNudge({ now: date, moodLogs: [], nudgesEnabled: false });
  assert.equal(result, false);
});