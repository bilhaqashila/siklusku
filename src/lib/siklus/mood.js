import { toDate } from "./cycleMath.js";

const KNOWN_MOODS = [
  "Senang",
  "Bersemangat",
  "Biasa",
  "Lelah",
  "Sedih" 
];

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function normalizeMoodEntry(entry = {}) {
  const rawDate = toDate(entry.date) || new Date();
  const isoDate = rawDate.toISOString().slice(0, 10);
  const mood = KNOWN_MOODS.includes(entry.mood) ? entry.mood : "biasa";
  const noteValue = typeof entry.note === "string"
    ? entry.note.trim()
    : typeof entry.notes === "string"
    ? entry.notes.trim()
    : "";
  const emojiValue = typeof entry.emoji === "string" ? entry.emoji : null;
  const symptoms = Array.isArray(entry.symptoms) ? entry.symptoms.slice(0, 8) : [];

  return {
    id: entry.id || `${rawDate.toISOString()}-${mood}`,
    date: isoDate,
    mood,
    note: noteValue,
    notes: noteValue,
    emoji: emojiValue,
    symptoms
  };
}

export function calculateMoodDistribution(entries = [], options = {}) {
  const { days, referenceDate } = options || {};
  const normalizedEntries = entries.map((entry) => normalizeMoodEntry(entry));
  const distribution = KNOWN_MOODS.reduce((acc, mood) => {
    acc[mood] = 0;
    return acc;
  }, {});

  let startTime = null;
  let endTime = null;

  if (typeof days === "number" && days > 0) {
    const reference = referenceDate ? toDate(referenceDate) : toDate(new Date());
    if (reference) {
      endTime = reference.getTime();
      startTime = endTime - (days - 1) * MS_PER_DAY;
    }
  }

  normalizedEntries.forEach((entry) => {
    if (startTime !== null && endTime !== null) {
      const entryDate = toDate(entry.date);
      if (!entryDate) {
        return;
      }
      const entryTime = entryDate.getTime();
      if (entryTime < startTime || entryTime > endTime) {
        return;
      }
    }

    distribution[entry.mood] += 1;
  });

  return distribution;
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
      dominantMood: "biasa",
      streak: 0
    };
  }

  const normalizedEntries = entries.map((entry) => normalizeMoodEntry(entry));
  const distribution = normalizedEntries.reduce((acc, entry) => {
    acc[entry.mood] = (acc[entry.mood] || 0) + 1;
    return acc;
  }, {});

  const dominantMood = Object.entries(distribution)
    .sort((a, b) => b[1] - a[1])[0][0];

  let streak = 0;
  let previousMood = null;

  normalizedEntries
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



