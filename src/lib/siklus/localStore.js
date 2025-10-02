const STORAGE_KEYS = {
  onboardingCompleted: "risa:cycleOnboardingCompleted",
  onboardingData: "risa:cycleOnboardingData",
  moodLogs: "risa:moodLogs",
  streak: "risa:streak",
  goals: "risa:goals",
  loveLetterShownOnce: "risa:loveLetterShownOnce",
  settings: "risa:settings"
};

const DEFAULT_VALUES = {
  [STORAGE_KEYS.onboardingCompleted]: false,
  [STORAGE_KEYS.onboardingData]: {
    lastPeriodStart: null,
    lastPeriodEnd: null,
    cycleLength: 28,
    periodLength: 5,
    regularity: "regular",
    painScale: 5,
    birthYear: null
  },
  [STORAGE_KEYS.moodLogs]: [],
  [STORAGE_KEYS.streak]: 0,
  [STORAGE_KEYS.goals]: [],
  [STORAGE_KEYS.loveLetterShownOnce]: false,
  [STORAGE_KEYS.settings]: {
    nudgesEnabled: true,
    reducedMotion: false
  }
};

const VALIDATORS = {
  [STORAGE_KEYS.onboardingCompleted]: (value) => typeof value === "boolean",
  [STORAGE_KEYS.onboardingData]: (value) =>
    value && typeof value === "object" &&
    ["cycleLength", "periodLength"].every((key) => typeof value[key] === "number"),
  [STORAGE_KEYS.moodLogs]: (value) => Array.isArray(value),
  [STORAGE_KEYS.streak]: (value) => Number.isInteger(value) && value >= 0,
  [STORAGE_KEYS.goals]: (value) => Array.isArray(value),
  [STORAGE_KEYS.loveLetterShownOnce]: (value) => typeof value === "boolean",
  [STORAGE_KEYS.settings]: (value) =>
    value && typeof value === "object" && typeof value.nudgesEnabled === "boolean"
};

function hasWindow() {
  return typeof window !== "undefined";
}

function getScopedStorage() {
  if (!hasWindow()) {
    return null;
  }
  try {
    return window.localStorage;
  } catch (error) {
    return null;
  }
}

function parseJson(raw) {
  if (raw === null || raw === undefined || raw === "") {
    return null;
  }
  try {
    return JSON.parse(raw);
  } catch (error) {
    return null;
  }
}

function applyGuard(key, value) {
  const validator = VALIDATORS[key];
  if (!validator) {
    return value;
  }
  return validator(value) ? value : DEFAULT_VALUES[key];
}

export function getLocalValue(key) {
  const storage = getScopedStorage();
  if (!storage) {
    return DEFAULT_VALUES[key];
  }
  const parsed = parseJson(storage.getItem(key));
  if (parsed === null || parsed === undefined) {
    return DEFAULT_VALUES[key];
  }
  return applyGuard(key, parsed);
}

export function setLocalValue(key, value) {
  const storage = getScopedStorage();
  if (!storage) {
    return;
  }
  const guarded = applyGuard(key, value);
  try {
    storage.setItem(key, JSON.stringify(guarded));
  } catch (error) {
    console.warn("Failed to persist value", key, error);
  }
}

export function mergeLocalValue(key, partial) {
  const current = getLocalValue(key);
  const next = { ...current, ...partial };
  setLocalValue(key, next);
  return next;
}

export function removeLocalValue(key) {
  const storage = getScopedStorage();
  if (!storage) {
    return;
  }
  try {
    storage.removeItem(key);
  } catch (error) {
    console.warn("Failed to remove value", key, error);
  }
}

export function clearAllSiklusData() {
  const storage = getScopedStorage();
  if (!storage) {
    return;
  }
  Object.values(STORAGE_KEYS).forEach((key) => {
    try {
      storage.removeItem(key);
    } catch (error) {
      console.warn("Failed to clear key", key, error);
    }
  });
}

export { STORAGE_KEYS, DEFAULT_VALUES };

