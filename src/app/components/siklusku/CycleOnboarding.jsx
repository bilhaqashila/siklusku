'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { gsap } from 'gsap';
import useSiklusStore from '../../store/useSiklusStore';
import CalendarRange from './CalendarRange';
import { formatDisplayDate } from '@/lib/siklus/cycleMath';

// Helpers
const todayIso = () => new Date().toISOString().slice(0, 10);

function calculateDurationDays(start, end) {
  if (!start || !end) return null;
  const s = new Date(start);
  const e = new Date(end);
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return null;
  const diff = e.getTime() - s.getTime();
  if (!Number.isFinite(diff) || diff < 0) return null;
  return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
}

/** ================== Step ================== */
function UnifiedStep({ values, errors, onChange }) {
  const today = todayIso();

  const rangeValue = useMemo(
    () => ({
      start: values.lastPeriodStart || null,
      end: values.lastPeriodEnd || null,
    }),
    [values.lastPeriodStart, values.lastPeriodEnd]
  );

  const durationWarning = useMemo(() => {
    const d = calculateDurationDays(values.lastPeriodStart, values.lastPeriodEnd);
    if (!d || d <= 8) return null;
    return 'Durasi haidmu lebih dari 8 hari. Kalau ini baru terjadi, coba diskusikan dengan orang dewasa atau tenaga kesehatan yang kamu percaya.';
  }, [values.lastPeriodStart, values.lastPeriodEnd]);

  function handleRangeChange(nextRange) {
    onChange('lastPeriodStart', nextRange.start || null);
    onChange('lastPeriodEnd', nextRange.end || null);
  }

  const painScale = Array.from({ length: 10 }, (_, i) => i + 1);

  return (
    <fieldset className="space-y-6">
      {/* Date Range */}
      <div className="space-y-2">
        <legend className="text-lg font-semibold text-slate-800">Tanggal haid terakhirmu</legend>

        <CalendarRange
          value={rangeValue}
          onChange={handleRangeChange}
          max={today}
          ariaInvalid={Boolean(errors.lastPeriodStart) || Boolean(errors.lastPeriodEnd)}
          ariaDescribedBy={[errors.lastPeriodStart ? 'lastPeriodStart-error' : null, errors.lastPeriodEnd ? 'lastPeriodEnd-error' : null].filter(Boolean).join(' ') || undefined}
        />

        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <span>Mulai: {rangeValue.start ? formatDisplayDate(rangeValue.start) : 'Belum dipilih'}</span>
          <span>{'\u2022'}</span>
          <span>Selesai: {rangeValue.end ? formatDisplayDate(rangeValue.end) : 'Belum dipilih'}</span>
        </div>

        <div className="space-y-1 text-xs text-red-500" aria-live="polite">
          {errors.lastPeriodStart ? (
            <p id="lastPeriodStart-error" role="alert">
              {errors.lastPeriodStart}
            </p>
          ) : null}
          {errors.lastPeriodEnd ? (
            <p id="lastPeriodEnd-error" role="alert">
              {errors.lastPeriodEnd}
            </p>
          ) : null}
        </div>

        {durationWarning ? <p className="text-xs text-amber-600">{durationWarning}</p> : null}
      </div>

      {/* Pain Scale */}
      <div className="space-y-3">
        <span className="text-sm font-medium text-slate-700">Skala nyeri haidmu</span>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Skala nyeri haid 1 sampai 10">
          {painScale.map((value) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={values.painScale === value}
              onClick={() => onChange('painScale', value)}
              className={`h-9 w-9 rounded-full border text-sm font-medium transition-transform focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-500 hover:scale-105 cursor-pointer ${
                values.painScale === value ? 'border-pink-500 bg-pink-500 text-white' : 'border-slate-200 bg-white text-slate-600'
              }`}
            >
              {value}
            </button>
          ))}
        </div>
        {errors.painScale ? (
          <span id="painScale-error" role="alert" className="text-xs text-red-500">
            {errors.painScale}
          </span>
        ) : null}
      </div>
    </fieldset>
  );
}

/** ============== Validation ============== */
function getStepErrors(values) {
  const nextErrors = {};
  const today = todayIso();

  if (!values.lastPeriodStart) {
    nextErrors.lastPeriodStart = 'Isi tanggal mulai ya';
  } else if (values.lastPeriodStart > today) {
    nextErrors.lastPeriodStart = 'Tanggal tidak boleh di masa depan';
  }

  if (!values.lastPeriodEnd) {
    nextErrors.lastPeriodEnd = 'Isi tanggal selesai ya';
  } else if (values.lastPeriodEnd > today) {
    nextErrors.lastPeriodEnd = 'Tanggal tidak boleh di masa depan';
  }

  if (values.lastPeriodStart && values.lastPeriodEnd && values.lastPeriodEnd < values.lastPeriodStart) {
    nextErrors.lastPeriodEnd = 'Tanggal selesai tidak boleh sebelum tanggal mulai';
  }

  const pain = Number(values.painScale);
  if (!Number.isFinite(pain) || pain < 1 || pain > 10) {
    nextErrors.painScale = 'Pilih skala nyeri 1–10';
  }

  return nextErrors;
}

/** ============== Container ============== */
export default function CycleOnboarding({ onComplete }) {
  const onboardingData = useSiklusStore((s) => s.onboardingData);
  const updateOnboardingDraft = useSiklusStore((s) => s.updateOnboardingDraft);
  const commitOnboardingData = useSiklusStore((s) => s.commitOnboardingData);
  const setOnboardingCompleted = useSiklusStore((s) => s.setOnboardingCompleted);

  const [errors, setErrors] = useState({});
  const cardRef = useRef(null);
  const stepHeadingRef = useRef(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  // detect system reduced motion
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (!cardRef.current || reducedMotion) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(cardRef.current, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.4, ease: 'power2.out' });
    }, cardRef);
    return () => ctx?.revert();
  }, [reducedMotion]);

  useEffect(() => {
    stepHeadingRef.current?.focus();
  }, []);

  const currentValues = useMemo(
    () => ({
      lastPeriodStart: onboardingData.lastPeriodStart ?? null,
      lastPeriodEnd: onboardingData.lastPeriodEnd ?? null,
      painScale: onboardingData.painScale ?? 5,
    }),
    [onboardingData]
  );

  const stepValidation = useMemo(() => getStepErrors(currentValues), [currentValues]);

  function validateNow() {
    const nextErrors = getStepErrors(currentValues);
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  // ✅ Finish: commit + mark complete + set love letter eligibility (shown later by page)
  function handleNext() {
    if (!validateNow()) return;
    commitOnboardingData?.();
    setOnboardingCompleted?.(true);
    try {
      localStorage.setItem('risa:loveLetterEligible', 'true');
    } catch {}
    onComplete?.();
  }

  // ✅ Cancel: DO NOT mark complete, DO NOT set eligibility
  function handleBack() {
    try {
      localStorage.removeItem('risa:loveLetterEligible'); // ensure no popup
    } catch {}
    onComplete?.();
  }

  function handleChange(field, value) {
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    let nextValue = value;

    if (field === 'lastPeriodStart' || field === 'lastPeriodEnd') {
      nextValue = value || null;
    } else if (field === 'painScale') {
      if (value === null || value === undefined || value === '') {
        nextValue = null;
      } else if (typeof value === 'number') {
        nextValue = Number.isFinite(value) ? value : null;
      } else {
        const parsed = Number.parseInt(value, 10);
        nextValue = Number.isFinite(parsed) ? parsed : null;
      }
    }

    updateOnboardingDraft?.({ [field]: nextValue });
  }

  const liveErrorMessage = Object.values(errors).find(Boolean) || '';
  const errorMessageId = liveErrorMessage ? 'onboarding-error-message' : undefined;

  return (
    <div className="space-y-6" ref={cardRef}>
      {liveErrorMessage ? (
        <span id={errorMessageId} className="sr-only" aria-live="assertive">
          {liveErrorMessage}
        </span>
      ) : null}

      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-pink-500">Informasi Haid Terakhir</p>
        <h3 ref={stepHeadingRef} tabIndex={-1} className="text-2xl font-semibold text-slate-800">
          Tanggal & Skala Nyeri
        </h3>
      </header>

      <div className="rounded-3xl border border-pink-100 bg-white p-6 shadow-sm">
        <UnifiedStep values={currentValues} errors={errors} onChange={handleChange} />
      </div>

      <div className="flex flex-col items-center justify-end gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          data-ripple="true"
          onClick={handleBack}
          className="rounded-full border border-pink-300 bg-white px-6 py-2 text-sm font-medium text-pink-600 hover:bg-pink-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-400 transition"
        >
          Batal
        </button>

        <button
          type="button"
          data-ripple="true"
          className="relative rounded-full bg-pink-500 px-6 py-2 text-sm font-semibold text-white shadow-sm transition-transform duration-200 ease-out hover:shadow-lg motion-safe:hover:scale-[1.03] motion-reduce:transform-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-pink-500 cursor-pointer disabled:opacity-40 overflow-hidden"
          onClick={handleNext}
          disabled={Object.keys(stepValidation).length > 0}
          aria-disabled={Object.keys(stepValidation).length > 0}
          aria-describedby={errorMessageId}
        >
          Selesai
        </button>
      </div>
    </div>
  );
}
