"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import useSiklusStore from "@/stores/useSiklusStore";
import CalendarRange from "./CalendarRange";
import { formatDisplayDate } from "@/lib/siklus/cycleMath";

export default function LogPeriodForm({ open, onClose }) {
  const addPeriod = useSiklusStore((s) => s.addPeriod);
  const onboardingData = useSiklusStore((s) => s.onboardingData);

  const cardRef = useRef(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const [range, setRange] = useState({ start: null, end: null });
  const [pain, setPain] = useState(5);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setSubmitting(false);
    setMsg("");

    // Default the view to lastPeriodStart if available
    setRange({
      start: null,
      end: null,
    });

    // entrance anim (respect reduced motion via media query)
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        cardRef.current,
        { autoAlpha: 0, y: 12 },
        { autoAlpha: 1, y: 0, duration: 0.28, ease: "power2.out" }
      );
    }, cardRef);
    return () => ctx?.revert();
  }, [open]);

  const painOptions = useMemo(() => Array.from({ length: 10 }, (_, i) => i + 1), []);

  function validate() {
    const e = {};
    const today = new Date().toISOString().slice(0, 10);
    if (!range.start) e.start = "Pilih tanggal mulai ya.";
    if (range.start && range.start > today) e.start = "Tanggal mulai tidak boleh di masa depan.";
    if (!range.end) e.end = "Pilih tanggal selesai ya.";
    if (range.end && range.end > today) e.end = "Tanggal selesai tidak boleh di masa depan.";
    if (range.start && range.end && range.end < range.start) e.end = "Tanggal selesai tidak boleh sebelum mulai.";
    if (!Number.isFinite(pain) || pain < 1 || pain > 10) e.pain = "Pilih skala nyeri 1–10.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setSubmitting(true);
    setMsg("");
    try {
      addPeriod({
        start: range.start,
        end: range.end,
        painScale: pain,
      });
      setMsg("Tersimpan! Prediksi & ringkasan sudah diperbarui.");
      // brief closing delay for feedback
      setTimeout(() => onClose?.(), 350);
    } catch (err) {
      setSubmitting(false);
      setMsg(err?.message || "Gagal menyimpan. Coba lagi ya.");
    }
  }

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-4"
    >
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={() => !submitting && onClose?.()}
        aria-hidden="true"
      />
      {/* card */}
      <div
        ref={cardRef}
        className="relative w-full max-w-lg rounded-3xl border border-pink-100 bg-white p-5 shadow-xl sm:p-6 dark:border-slate-800 dark:bg-slate-900"
      >
        <header className="mb-4 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-pink-500">
              Catatan Haid Baru
            </p>
            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
              Tambahkan Tanggal Haid
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Pilih rentang tanggal haid dan skala nyeri (1–10).
            </p>
          </div>
          <button
            type="button"
            onClick={() => !submitting && onClose?.()}
            className="rounded-full px-3 py-1 text-sm text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Tutup
          </button>
        </header>

        <div className="space-y-6">
          {/* Calendar */}
          <div>
            <CalendarRange
              value={range}
              onChange={setRange}
              max={new Date().toISOString().slice(0, 10)}
              ariaInvalid={Boolean(errors.start) || Boolean(errors.end)}
              ariaDescribedBy={undefined}
            />
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span>
                Mulai: {range.start ? formatDisplayDate(range.start) : "Belum dipilih"}
              </span>
              <span>{"\u2022"}</span>
              <span>
                Selesai: {range.end ? formatDisplayDate(range.end) : "Belum dipilih"}
              </span>
            </div>
            <div className="space-y-1 text-xs text-red-500" aria-live="polite">
              {errors.start ? <p role="alert">{errors.start}</p> : null}
              {errors.end ? <p role="alert">{errors.end}</p> : null}
            </div>
          </div>

          {/* Pain scale */}
          <div>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Skala nyeri saat haid
            </span>
            <div
              role="radiogroup"
              aria-label="Skala nyeri 1 sampai 10"
              className="mt-2 flex flex-wrap gap-2"
            >
              {painOptions.map((n) => (
                <button
                  key={n}
                  type="button"
                  role="radio"
                  aria-checked={pain === n}
                  onClick={() => setPain(n)}
                  className={`h-9 w-9 rounded-full border text-sm font-semibold transition-transform focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-500 hover:scale-105 ${
                    pain === n
                      ? "border-pink-500 bg-pink-500 text-white"
                      : "border-slate-200 bg-white text-slate-600"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
            {errors.pain ? <p className="mt-1 text-xs text-red-500">{errors.pain}</p> : null}
          </div>

          {/* Message */}
          {msg ? (
            <div className="rounded-xl bg-pink-50 px-4 py-3 text-xs text-pink-700 dark:bg-pink-900/30 dark:text-pink-200">
              {msg}
            </div>
          ) : null}
        </div>

        <footer className="mt-6 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => !submitting && onClose?.()}
            className="rounded-full border border-slate-200 px-5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            disabled={submitting}
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="relative rounded-full bg-pink-500 px-6 py-2 text-sm font-semibold text-white shadow-sm transition-transform duration-200 ease-out hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-500 disabled:opacity-40"
            disabled={submitting}
          >
            {submitting ? "Menyimpan..." : "Simpan"}
          </button>
        </footer>
      </div>
    </div>
  );
}
