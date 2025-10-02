"use client";

import { useEffect, useMemo } from "react";
import MoodPieChart from "@/components/siklus/charts/MoodPieChart";
import CycleTrendChart from "@/components/siklus/charts/CycleTrendChart";
import ChartExportButton from "@/components/siklus/charts/ChartExportButton";
import useSiklusStore from "@/stores/useSiklusStore";
import { shallow } from "zustand/shallow";
import { calculateMoodDistribution, summarizeMoodTrend } from "@/lib/siklus/mood";

export default function SikluskuReportPage() {
  const siklusState = useSiklusStore((state) => state, shallow);
  const { hydrate, hydrated, moodLogs, cycleSummary } = siklusState;

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const moodDistribution = useMemo(() => calculateMoodDistribution(moodLogs), [moodLogs]);
  const moodSummary = useMemo(() => summarizeMoodTrend(moodLogs), [moodLogs]);

  if (!hydrated) {
    return (
      <main className="container mx-auto max-w-4xl px-4 py-10">
        <p className="text-sm text-slate-500">Memuat ringkasan...</p>
      </main>
    );
  }

  return (
    <main className="container mx-auto max-w-4xl space-y-8 px-4 py-10">
      <header className="rounded-3xl bg-gradient-to-r from-pink-100 via-white to-pink-50 p-6 shadow-sm">
        <h1 className="text-3xl font-semibold text-slate-800">Laporan lengkap Siklusku</h1>
        <p className="mt-2 text-sm text-slate-600">
          Semua insight dari data yang kamu isi terhimpun di sini. Cocok untuk dibawa ke dokter atau dibaca ulang.
        </p>
      </header>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-pink-100 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800">Mood keseluruhan</h2>
          <MoodPieChart data={moodDistribution} />
        </div>
        <div className="rounded-3xl border border-pink-100 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800">Panjang siklus</h2>
          <CycleTrendChart
            points={moodLogs.map((entry, index) => ({
              label: `Log ${index + 1}`,
              value: cycleSummary.averageCycleLength
            }))}
          />
        </div>
      </section>

      <section className="rounded-3xl border border-pink-100 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-800">Ringkasan cepat</h2>
        <ul className="mt-4 space-y-3 text-sm text-slate-600">
          <li className="flex items-center justify-between rounded-2xl bg-pink-50 px-4 py-3">
            <span>Rata-rata siklus</span>
            <span className="font-semibold text-pink-600">{cycleSummary.averageCycleLength} hari</span>
          </li>
          <li className="flex items-center justify-between rounded-2xl bg-pink-50 px-4 py-3">
            <span>Rata-rata menstruasi</span>
            <span className="font-semibold text-pink-600">{cycleSummary.averagePeriodLength} hari</span>
          </li>
          <li className="flex items-center justify-between rounded-2xl bg-pink-50 px-4 py-3">
            <span>Mood dominan</span>
            <span className="font-semibold capitalize text-pink-600">{moodSummary.dominantMood}</span>
          </li>
        </ul>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-pink-100 bg-white p-6 shadow-sm">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Unduh laporan</h2>
          <p className="text-sm text-slate-500">Simpen sebagai PNG untuk dibaca kapan saja.</p>
        </div>
        <ChartExportButton
          filename="siklusku-report.png"
          stats={{
            averageCycleLength: cycleSummary.averageCycleLength,
            averagePeriodLength: cycleSummary.averagePeriodLength,
            dominantMood: moodSummary.dominantMood,
            moodEntries: moodLogs.length
          }}
        />
      </div>
    </main>
  );
}


