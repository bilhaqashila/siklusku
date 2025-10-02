import { toDate } from "./cycleMath";

const KNOWN_MOODS = [
  "happy",
  "energized",
  "calm",
  "neutral",
  "tired",
  "sad",
  "anxious",
  "crampy"
];

export function normalizeMoodEntry(entry = {}) {
  const date = toDate(entry.date) || new Date();
  const id = entry.id || `${date.toISOString()}-${entry.mood || "unknown"}`;
  const mood = KNOWN_MOODS.includes(entry.mood) ? entry.mood : "neutral";

  return {
    id,
    date: date.toISOString().slice(0, 10),
    mood,
    notes: typeof entry.notes === "string" ? entry.notes.trim() : "",
    symptoms: Array.isArray(entry.symptoms) ? entry.symptoms.slice(0, 8) : []
  };
}

export function calculateMoodDistribution(entries = []) {
  const base = KNOWN_MOODS.reduce((acc, mood) => {
    acc[mood] = 0;
    return acc;
  }, {});

  entries.forEach((entry) => {
    const normalized = normalizeMoodEntry(entry);
    base[normalized.mood] += 1;
  });

  return base;
}

export function groupMoodByDate(entries = []) {
  return entries.reduce((acc, entry) => {
    const normalized = normalizeMoodEntry(entry);
    if (!acc[normalized.date]) {
      acc[normalized.date] = [];
    }
    acc[normalized.date].push(normalized);
    return acc;
  }, {});
}

export function summarizeMoodTrend(entries = []) {
  if (!entries.length) {
    return {
      dominantMood: "neutral",
      streak: 0
    };
  }

  const distribution = calculateMoodDistribution(entries);
  const dominantMood = Object.entries(distribution)
    .sort((a, b) => b[1] - a[1])[0][0];

  let streak = 0;
  let previousMood = null;

  entries
    .map((entry) => normalizeMoodEntry(entry))
    .sort((a, b) => (a.date < b.date ? -1 : 1))
    .forEach((entry) => {
      if (entry.mood === previousMood) {
        streak += 1;
      } else {
        streak = 1;
        previousMood = entry.mood;
      }
    });

  return {
    dominantMood,
    streak
  };
}

export { KNOWN_MOODS };
