import test, { beforeEach } from "node:test";
import assert from "node:assert/strict";

import {
  getLocalValue,
  setLocalValue,
  mergeLocalValue,
  removeLocalValue,
  clearAllSiklusData,
  STORAGE_KEYS,
  DEFAULT_VALUES
} from "../src/lib/siklus/localStore.js";

class MemoryStorage {
  constructor() {
    this.map = new Map();
  }

  get length() {
    return this.map.size;
  }

  getItem(key) {
    return this.map.has(key) ? this.map.get(key) : null;
  }

  setItem(key, value) {
    this.map.set(key, String(value));
  }

  removeItem(key) {
    this.map.delete(key);
  }
}

beforeEach(() => {
  global.window = { localStorage: new MemoryStorage() };
});

test("getLocalValue returns defaults when empty", () => {
  const value = getLocalValue(STORAGE_KEYS.onboardingData);
  assert.deepEqual(value, DEFAULT_VALUES[STORAGE_KEYS.onboardingData]);
});

test("setLocalValue stores data", () => {
  setLocalValue(STORAGE_KEYS.onboardingCompleted, true);
  assert.equal(getLocalValue(STORAGE_KEYS.onboardingCompleted), true);
});

test("mergeLocalValue merges partial", () => {
  mergeLocalValue(STORAGE_KEYS.onboardingData, { cycleLength: 30 });
  const value = getLocalValue(STORAGE_KEYS.onboardingData);
  assert.equal(value.cycleLength, 30);
  assert.equal(value.periodLength, DEFAULT_VALUES[STORAGE_KEYS.onboardingData].periodLength);
});

test("removeLocalValue deletes key", () => {
  setLocalValue(STORAGE_KEYS.streak, 5);
  removeLocalValue(STORAGE_KEYS.streak);
  assert.equal(getLocalValue(STORAGE_KEYS.streak), DEFAULT_VALUES[STORAGE_KEYS.streak]);
});

test("clearAllSiklusData wipes every tracked key", () => {
  setLocalValue(STORAGE_KEYS.streak, 3);
  clearAllSiklusData();
  assert.equal(getLocalValue(STORAGE_KEYS.streak), 0);
});
