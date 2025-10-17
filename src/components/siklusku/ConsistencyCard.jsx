import React, { useMemo } from 'react';
import useSiklusStore from '../../store/useSiklusStore';

const MONTHLY_TARGET = 30;

function toLocalDateString(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function addDaysISO(iso, delta) {
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + delta);
  return toLocalDateString(dt);
}

export default function ConsistencyCard() {
  const dailyLogs = useSiklusStore((s) => s.dailyLogs || []);

  const { totalTrackedDays, trackedLast30, longestStreak, hasTodayDaily, consistencyPercent } = useMemo(() => {
    if (!Array.isArray(dailyLogs) || dailyLogs.length === 0) {
      return {
        totalTrackedDays: 0,
        trackedLast30: 0,
        longestStreak: 0,
        hasTodayDaily: false,
        consistencyPercent: 0,
      };
    }

    // Build a unique set of valid YYYY-MM-DD dates from daily logs
    const dateSet = new Set(dailyLogs.map((l) => (l && typeof l.date === 'string' ? l.date : null)).filter(Boolean));

    const totalTrackedDays = dateSet.size;

    const today = new Date();
    const todayKey = toLocalDateString(today);
    const startKey = toLocalDateString(new Date(today.getTime() - 29 * 24 * 60 * 60 * 1000)); // 30-day window

    // Count days within last 30 days
    let trackedLast30 = 0;
    for (const d of dateSet) {
      if (d >= startKey && d <= todayKey) trackedLast30 += 1;
    }

    const hasTodayDaily = dateSet.has(todayKey);

    // Compute longest consecutive-day streak from all-time logs
    const allDatesSorted = Array.from(dateSet).sort(); // lex sort works for YYYY-MM-DD
    let longestStreak = 0;
    let currentStreak = 0;
    let prev = null;

    for (const iso of allDatesSorted) {
      if (prev && iso === addDaysISO(prev, 1)) {
        currentStreak += 1;
      } else {
        currentStreak = 1;
      }
      longestStreak = Math.max(longestStreak, currentStreak);
      prev = iso;
    }

    const consistencyPercent = Math.min(100, Math.round((trackedLast30 / MONTHLY_TARGET) * 100));

    return {
      totalTrackedDays,
      trackedLast30,
      longestStreak,
      hasTodayDaily,
      consistencyPercent,
    };
  }, [dailyLogs]);

  const progress = consistencyPercent;

  return (
    <article className="rounded-2xl border border-pink-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Konsistensi pencatatan</h3>
        {hasTodayDaily ? (
          <span
            className="inline-flex items-center rounded-full bg-pink-100 px-3 py-1 text-xs font-medium text-pink-700 dark:bg-pink-900/30 dark:text-pink-200"
            aria-label="Sudah membuat jurnal hari ini"
            title="Sudah membuat jurnal hari ini"
          >
            Hari ini✔️
          </span>
        ) : null}
      </div>

      <div className="mt-2 flex items-end justify-between">
        <p className="text-3xl font-semibold text-slate-800 dark:text-slate-100">{progress}%</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">Target: catat setiap hari selama {MONTHLY_TARGET} hari</p>
      </div>

      <div className="mt-3" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress} aria-label={`Kemajuan menuju ${MONTHLY_TARGET} hari log bulan ini`}>
        <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-700">
          <div className="h-full rounded-full bg-pink-500" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-slate-500 dark:text-slate-400">Log 30 hari</dt>
          <dd className="font-semibold text-slate-800 dark:text-slate-100">{trackedLast30} hari</dd>
        </div>
        <div>
          <dt className="text-slate-500 dark:text-slate-400">Total hari tercatat</dt>
          <dd className="font-semibold text-slate-800 dark:text-slate-100">{totalTrackedDays}</dd>
        </div>
        <div>
          <dt className="text-slate-500 dark:text-slate-400">Streak terpanjang</dt>
          <dd className="font-semibold text-slate-800 dark:text-slate-100">{longestStreak} hari</dd>
        </div>
      </dl>
    </article>
  );
}
