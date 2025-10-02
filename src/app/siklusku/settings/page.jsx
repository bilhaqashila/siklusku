"use client";

import { useEffect } from "react";
import useSettingsStore from "@/stores/useSettingsStore";
import { shallow } from "zustand/shallow";
import useSiklusStore from "@/stores/useSiklusStore";
import { clearAllSiklusData } from "@/lib/siklus/localStore";

export default function SikluskuSettingsPage() {
  const settingsState = useSettingsStore((state) => state, shallow);
  const { hydrate: hydrateSettings, settings, toggleNudges, setReducedMotion } = settingsState;
  const siklusState = useSiklusStore((state) => state, shallow);
  const { hydrate: hydrateSiklus, resetOnboardingData, replaceMoodLogs, setGoals, setOnboardingCompleted, resetLoveLetter } = siklusState;

  useEffect(() => {
    hydrateSettings();
    hydrateSiklus();
  }, [hydrateSettings, hydrateSiklus]);

  function handleClearData() {
    clearAllSiklusData();
    resetOnboardingData();
    replaceMoodLogs([]);
    setGoals([]);
    resetLoveLetter();
    setOnboardingCompleted(false);
  }

  return (
    <main className="container mx-auto max-w-3xl space-y-10 px-4 py-10">
      <header className="rounded-3xl bg-gradient-to-r from-pink-100 via-white to-pink-50 p-6 shadow-sm">
        <h1 className="text-3xl font-semibold text-slate-800">Pengaturan Siklusku</h1>
        <p className="mt-2 text-sm text-slate-600">
          Ubah preferensi dan kelola data yang tersimpan di perangkatmu.
        </p>
      </header>

      <section className="space-y-6">
        <div className="rounded-3xl border border-pink-100 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-800">Notifikasi lembut</h2>
              <p className="text-sm text-slate-500">Nyalakan kalau mau diingatkan untuk catat mood sebelum jam 20.00.</p>
            </div>
            <button
              type="button"
              className={`rounded-full px-5 py-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-500 cursor-pointer ${
                settings.nudgesEnabled
                  ? "bg-pink-500 text-white"
                  : "border border-slate-200 bg-white text-slate-600"
              }`}
              onClick={toggleNudges}
              aria-pressed={settings.nudgesEnabled}
            >
              {settings.nudgesEnabled ? "Aktif" : "Mati"}
            </button>
          </div>
        </div>

        <div className="rounded-3xl border border-pink-100 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-800">Kurangi animasi</h2>
              <p className="text-sm text-slate-500">Aktifkan kalau kamu ingin tampilan lebih tenang tanpa animasi.</p>
            </div>
            <button
              type="button"
              className={`rounded-full px-5 py-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-500 cursor-pointer ${
                settings.reducedMotion
                  ? "bg-pink-500 text-white"
                  : "border border-slate-200 bg-white text-slate-600"
              }`}
              onClick={() => setReducedMotion(!settings.reducedMotion)}
              aria-pressed={settings.reducedMotion}
            >
              {settings.reducedMotion ? "Aktif" : "Mati"}
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-red-100 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-red-600">Hapus semua data</h2>
        <p className="mt-2 text-sm text-slate-600">
          Semua data onboarding, mood, dan pengaturan akan hilang dari perangkat ini. Tidak bisa dibatalkan.
        </p>
        <button
          type="button"
          className="mt-4 rounded-full bg-red-500 px-6 py-2 text-sm font-semibold text-white shadow-sm transition hover:scale-[1.01] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 cursor-pointer"
          onClick={handleClearData}
        >
          Hapus sekarang
        </button>
      </section>
    </main>
  );
}






