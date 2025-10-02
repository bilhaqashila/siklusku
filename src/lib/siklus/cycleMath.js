const MS_PER_DAY = 24 * 60 * 60 * 1000;

function toDate(value) {
  if (!value) {
    return null;
  }
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function diffInDays(start, end) {
  const startDate = toDate(start);
  const endDate = toDate(end);
  if (!startDate || !endDate) {
    return null;
  }
  const diff = Math.floor((endDate.getTime() - startDate.getTime()) / MS_PER_DAY);
  return diff;
}

export function getCycleDay(referenceDate, lastPeriodStart) {
  const start = toDate(lastPeriodStart);
  const ref = toDate(referenceDate) || new Date();
  if (!start) {
    return null;
  }
  const diff = diffInDays(start, ref);
  if (diff === null || diff < 0) {
    return null;
  }
  return diff + 1;
}

export function calculatePhase(cycleDay, periodLength = 5, cycleLength = 28) {
  if (!cycleDay) {
    return "unknown";
  }
  if (cycleDay <= periodLength) {
    return "menstruation";
  }
  const ovulationWindowStart = Math.max(periodLength + 1, Math.floor(cycleLength * 0.45));
  const ovulationWindowEnd = ovulationWindowStart + 2;
  if (cycleDay >= ovulationWindowStart && cycleDay <= ovulationWindowEnd) {
    return "ovulation";
  }
  if (cycleDay < ovulationWindowStart) {
    return "follicular";
  }
  if (cycleDay <= cycleLength) {
    return "luteal";
  }
  return "unknown";
}

export function predictNextPeriod(lastPeriodStart, cycleLength = 28) {
  const start = toDate(lastPeriodStart);
  if (!start) {
    return null;
  }
  const next = new Date(start.getTime() + cycleLength * MS_PER_DAY);
  return next.toISOString().slice(0, 10);
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
  if (!start) {
    return [];
  }
  const timeline = [];
  for (let day = 1; day <= cycleLength; day += 1) {
    const date = new Date(start.getTime() + (day - 1) * MS_PER_DAY);
    timeline.push({
      day,
      date: date.toISOString().slice(0, 10),
      phase: calculatePhase(day, periodLength, cycleLength)
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
  if (!start) {
    return [];
  }
  return Array.from({ length: cyclesToProject }, (_, index) => {
    const projection = new Date(start.getTime() + (index + 1) * cycleLength * MS_PER_DAY);
    return projection.toISOString().slice(0, 10);
  });
}

export { toDate };
