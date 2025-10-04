import React, { useMemo } from 'react';
import useSiklusStore from '@/stores/useSiklusStore';

const MONTHLY_TARGET = 30;

function toLocalDateString(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export default function ConsistencyCard() {
  const moodLogs = useSiklusStore((s) => s.moodLogs);
  const streak = useSiklusStore((s) => s.streak);
  const consistency = useSiklusStore((s) => s.consistency);

  const { totalTrackedDays, trackedLast30 } = useMemo(() => {
    if (!Array.isArray(moodLogs) || moodLogs.length === 0) {
      return { totalTrackedDays: 0, trackedLast30: 0 };
    }
    const uniqueAll = new Set();
    const unique30 = new Set();

    const today = new Date();
    const start = new Date(today);
    start.setDate(start.getDate() - 29);
    const todayStr = toLocalDateString(today);
    const startStr = toLocalDateString(start);

    for (const log of moodLogs) {
      const ds = typeof log?.date === 'string' ? log.date : null;
      if (!ds) continue;
      uniqueAll.add(ds);
      if (ds >= startStr && ds <= todayStr) unique30.add(ds);
    }

    return { totalTrackedDays: uniqueAll.size, trackedLast30: unique30.size };
  }, [moodLogs]);

  const progress = Math.min(100, Math.round((trackedLast30 / MONTHLY_TARGET) * 100));

  return (
    <article className="rounded-2xl border border-pink-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Konsistensi Pencatatan</h3>
      <div className="mt-2 flex items-end justify-between">
        <p className="text-3xl font-semibold text-slate-800 dark:text-slate-100">{consistency}%</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">Target bulanan: {MONTHLY_TARGET} hari</p>
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
          <dd className="font-semibold text-slate-800 dark:text-slate-100">{streak} hari</dd>
        </div>
      </dl>
    </article>
  );
}
