const MS_PER_DAY = 24 * 60 * 60 * 1000;

function normalizeDate(value) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function toDate(value) {
  if (!value) {
    return null;
  }
  if (value instanceof Date) {
    return normalizeDate(value);
  }
  if (typeof value === "string") {
    const parts = value.split("-");
    if (parts.length === 3) {
      const [year, month, day] = parts.map((part) => Number.parseInt(part, 10));
      if ([year, month, day].every((part) => Number.isFinite(part))) {
        const date = new Date(year, month - 1, day);
        return Number.isNaN(date.getTime()) ? null : normalizeDate(date);
      }
    }
  }
  return normalizeDate(value);
}

function normalizePositiveInteger(value, fallback) {
  const numeric = Number.parseInt(value, 10);
  if (Number.isFinite(numeric) && numeric > 0) {
    return numeric;
  }
  return fallback;
}

function formatDateLocal(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return [year, month, day].join("-");
}

function diffInDays(start, end) {
  const startDate = toDate(start);
  const endDate = toDate(end);
  if (!startDate || !endDate) {
    return null;
  }
  return Math.floor((endDate.getTime() - startDate.getTime()) / MS_PER_DAY);
}

export function cycleDay(referenceDate, lastPeriodStart, cycleLength = 28) {
  const start = toDate(lastPeriodStart);
  const today = toDate(referenceDate) || toDate(new Date());
  const normalizedCycleLength = normalizePositiveInteger(cycleLength, 28);

  if (!start || !today || !normalizedCycleLength) {
    return null;
  }

  const diff = Math.floor((today.getTime() - start.getTime()) / MS_PER_DAY);
  if (!Number.isFinite(diff)) {
    return null;
  }

  const modulo = ((diff % normalizedCycleLength) + normalizedCycleLength) % normalizedCycleLength;
  return modulo + 1;
}

export function getCycleDay(referenceDate, lastPeriodStart, cycleLength) {
  return cycleDay(referenceDate, lastPeriodStart, cycleLength);
}

export function ovulationDay(cycleLength = 28) {
  const normalizedCycleLength = normalizePositiveInteger(cycleLength, 28);
  return Math.max(1, normalizedCycleLength - 14);
}

export function calculatePhase(cycleDayValue, periodLength = 5, cycleLength = 28) {
  const normalizedCycleLength = normalizePositiveInteger(cycleLength, 28);
  const normalizedPeriodLength = Math.min(
    normalizedCycleLength,
    Math.max(1, normalizePositiveInteger(periodLength, 5))
  );

  if (!cycleDayValue) {
    return "unknown";
  }

  const day = ((Math.round(cycleDayValue) - 1 + normalizedCycleLength) % normalizedCycleLength) + 1;

  if (day <= normalizedPeriodLength) {
    return "menstruation";
  }

  const ovulationStart = Math.min(
    normalizedCycleLength,
    Math.max(normalizedPeriodLength + 1, ovulationDay(normalizedCycleLength))
  );
  const ovulationEnd = Math.min(normalizedCycleLength, ovulationStart + 1);

  if (day >= ovulationStart && day <= ovulationEnd) {
    return "ovulation";
  }

  if (day < ovulationStart) {
    return "follicular";
  }

  return "luteal";
}

export function predictNextPeriod(lastPeriodStart, cycleLength = 28) {
  const start = toDate(lastPeriodStart);
  const normalizedCycleLength = normalizePositiveInteger(cycleLength, 28);
  if (!start) {
    return null;
  }
  const next = new Date(start.getTime() + normalizedCycleLength * MS_PER_DAY);
  return formatDateLocal(next);
}

export function calculatePeriodLength(start, end) {
  const diff = diffInDays(start, end);
  if (diff === null) {
    return null;
  }
  return Math.max(1, diff + 1);
}

export function calculateCycleLength(prevStart, nextStart) {
  const diff = diffInDays(prevStart, nextStart);
  if (diff === null) {
    return null;
  }
  return Math.max(1, diff);
}

function average(values) {
  if (!values || values.length === 0) {
    return null;
  }
  const sum = values.reduce((total, value) => total + value, 0);
  return Math.round(sum / values.length);
}

export function calculateCycleSummary(periods = []) {
  if (!Array.isArray(periods) || periods.length === 0) {
    return {
      averageCycleLength: 28,
      averagePeriodLength: 5
    };
  }

  const sorted = [...periods]
    .map((entry) => ({
      start: toDate(entry.start),
      end: toDate(entry.end)
    }))
    .filter((entry) => entry.start)
    .sort((a, b) => a.start.getTime() - b.start.getTime());

  if (sorted.length === 0) {
    return {
      averageCycleLength: 28,
      averagePeriodLength: 5
    };
  }

  const cycleLengths = [];
  const periodLengths = [];

  sorted.forEach((entry, index) => {
    if (entry.end) {
      const periodLength = calculatePeriodLength(entry.start, entry.end);
      if (periodLength) {
        periodLengths.push(periodLength);
      }
    }
    const next = sorted[index + 1];
    if (next) {
      const cycleLength = calculateCycleLength(entry.start, next.start);
      if (cycleLength) {
        cycleLengths.push(cycleLength);
      }
    }
  });

  return {
    averageCycleLength: average(cycleLengths) || 28,
    averagePeriodLength: average(periodLengths) || 5
  };
}

export function buildCycleTimeline({
  lastPeriodStart,
  cycleLength = 28,
  periodLength = 5
} = {}) {
  const start = toDate(lastPeriodStart);
  const normalizedCycleLength = normalizePositiveInteger(cycleLength, 28);
  const normalizedPeriodLength = Math.min(
    normalizedCycleLength,
    Math.max(1, normalizePositiveInteger(periodLength, 5))
  );

  if (!start) {
    return [];
  }

  const timeline = [];
  for (let day = 1; day <= normalizedCycleLength; day += 1) {
    const date = new Date(start.getTime() + (day - 1) * MS_PER_DAY);
    timeline.push({
      day,
      date: formatDateLocal(date),
      phase: calculatePhase(day, normalizedPeriodLength, normalizedCycleLength)
    });
  }
  return timeline;
}

export function projectUpcomingPeriods({
  lastPeriodStart,
  cyclesToProject = 3,
  cycleLength = 28
} = {}) {
  const start = toDate(lastPeriodStart);
  const normalizedCycleLength = normalizePositiveInteger(cycleLength, 28);
  if (!start) {
    return [];
  }
  return Array.from({ length: cyclesToProject }, (_, index) => {
    const projection = new Date(start.getTime() + (index + 1) * normalizedCycleLength * MS_PER_DAY);
    return formatDateLocal(projection);
  });
}

export { toDate };




