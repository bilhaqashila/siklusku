"use client";

import { useEffect, useMemo, useState } from "react";
import OnboardingGate from "@/components/siklus/OnboardingGate";
import FirstPeriodGuide from "@/components/siklus/FirstPeriodGuide";
import CycleOnboarding from "@/components/siklus/CycleOnboarding";
import MoodPieChart from "@/components/siklus/charts/MoodPieChart";
import CycleTrendChart from "@/components/siklus/charts/CycleTrendChart";
import ChartExportButton from "@/components/siklus/charts/ChartExportButton";
import { shallow } from "zustand/shallow"; 
import useSiklusStore from "@/stores/useSiklusStore";
import { calculateMoodDistribution, summarizeMoodTrend } from "@/lib/siklus/mood";
import { projectUpcomingPeriods } from "@/lib/siklus/cycleMath";
import { DEFAULT_VALUES, STORAGE_KEYS } from "@/lib/siklus/localStore";

export default function SikluskuPage() {
  const siklusState = useSiklusStore((state) => state, shallow);
  const {
    hydrated,
    hydrate,
    onboardingCompleted,
    onboardingData,
    moodLogs,
    cycleSummary,
    setOnboardingCompleted,
    updateOnboardingData
  } = siklusState;
  const [flow, setFlow] = useState("loading");

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }
    setFlow(onboardingCompleted ? "dashboard" : "gate");
  }, [hydrated, onboardingCompleted]);

  const moodDistribution = useMemo(() => calculateMoodDistribution(moodLogs), [moodLogs]);
  const moodSummary = useMemo(() => summarizeMoodTrend(moodLogs), [moodLogs]);
  const upcomingPeriods = useMemo(() => {
    if (!onboardingData.lastPeriodStart) {
      return [];
    }
    return projectUpcomingPeriods({
      lastPeriodStart: onboardingData.lastPeriodStart,
      cycleLength: onboardingData.cycleLength
    });
  }, [onboardingData.lastPeriodStart, onboardingData.cycleLength]);

  function handleGuideComplete() {
    setOnboardingCompleted(true);
    updateOnboardingData(DEFAULT_VALUES[STORAGE_KEYS.onboardingData]);
    setFlow("dashboard");
  }

  function handleFormComplete() {
    setOnboardingCompleted(true);
    setFlow("dashboard");
  }

  function renderDashboard() {
    return (
      <div className="space-y-8">
        <section className="rounded-3xl bg-gradient-to-r from-pink-100 via-white to-pink-50 p-6 shadow-sm">
          <h1 className="text-3xl font-semibold text-slate-800">Halo, ini ringkasan siklusmu ??</h1>
          <p className="mt-2 text-sm text-slate-600">
            Simak titik penting dari catatanmu. Kamu bisa update detail kapan saja lewat pengaturan.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl border border-pink-100 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-medium text-slate-500">Rata-rata siklus</h3>
            <p className="mt-2 text-3xl font-semibold text-slate-800">{cycleSummary.averageCycleLength} hari</p>
          </article>
          <article className="rounded-2xl border border-pink-100 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-medium text-slate-500">Rata-rata menstruasi</h3>
            <p className="mt-2 text-3xl font-semibold text-slate-800">{cycleSummary.averagePeriodLength} hari</p>
          </article>
          <article className="rounded-2xl border border-pink-100 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-medium text-slate-500">Mood dominan</h3>
            <p className="mt-2 text-3xl font-semibold capitalize text-slate-800">{moodSummary.dominantMood}</p>
          </article>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-pink-100 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-800">Mood 30 hari terakhir</h3>
            <MoodPieChart data={moodDistribution} />
          </div>
          <div className="rounded-3xl border border-pink-100 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-800">Tren panjang siklus</h3>
            <CycleTrendChart
              points={[
                {
                  label: "Saat ini",
                  value: cycleSummary.averageCycleLength
                }
              ]}
            />
          </div>
        </section>

        <section className="rounded-3xl border border-pink-100 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800">Periode berikutnya</h3>
          {upcomingPeriods.length ? (
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              {upcomingPeriods.map((date) => (
                <li key={date} className="flex items-center justify-between rounded-2xl bg-pink-50 px-4 py-3">
                  <span>Perkiraan mulai</span>
                  <span className="font-semibold text-pink-600">{date}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-slate-500">Lengkapi data onboarding untuk dapat prediksi periode berikutnya.</p>
          )}
        </section>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-pink-100 bg-white p-6 shadow-sm">
          <div>
            <h3 className="text-lg font-semibold text-slate-800">Simpan ringkasanmu</h3>
            <p className="text-sm text-slate-500">Unduh versi PNG untuk disimpan pribadi atau kirim ke seseorang yang kamu percaya.</p>
          </div>
          <ChartExportButton
            stats={{
              averageCycleLength: cycleSummary.averageCycleLength,
              averagePeriodLength: cycleSummary.averagePeriodLength,
              dominantMood: moodSummary.dominantMood,
              moodEntries: moodLogs.length
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <main className="container mx-auto max-w-4xl space-y-8 px-4 py-10">
      <OnboardingGate
        open={flow === "gate"}
        onBelum={() => setFlow("guide")}
        onSudah={() => setFlow("form")}
      />

      {flow === "guide" ? (
        <FirstPeriodGuide onComplete={handleGuideComplete} />
      ) : null}

      {flow === "form" ? <CycleOnboarding onComplete={handleFormComplete} /> : null}

      {flow === "dashboard" ? renderDashboard() : null}
    </main>
  );
}



