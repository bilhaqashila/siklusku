"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import useSiklusStore from "@/stores/useSiklusStore";
import useSettingsStore from "@/stores/useSettingsStore";
import { shallow } from "zustand/shallow";

const todayIso = () => new Date().toISOString().slice(0, 10);

function DateStep({ values, errors, onChange }) {
  return (
    <fieldset className="space-y-4" aria-describedby="period-date-hint">
      <legend className="text-lg font-semibold text-slate-800">Kapan terakhir kali kamu haid?</legend>
      <p id="period-date-hint" className="text-sm text-slate-500">
        Isi tanggal mulai dan selesai haid terakhirmu. Kalau lupa, isi perkiraan terbaikmu ya.
      </p>
      <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
        Tanggal mulai
        <input
          type="date"
          max={todayIso()}
          value={values.lastPeriodStart || ""}
          onChange={(event) => onChange("lastPeriodStart", event.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-500"
        />
        {errors.lastPeriodStart ? (
          <span className="text-xs text-red-500">{errors.lastPeriodStart}</span>
        ) : null}
      </label>
      <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
        Tanggal selesai
        <input
          type="date"
          max={todayIso()}
          value={values.lastPeriodEnd || ""}
          onChange={(event) => onChange("lastPeriodEnd", event.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-500"
        />
        {errors.lastPeriodEnd ? (
          <span className="text-xs text-red-500">{errors.lastPeriodEnd}</span>
        ) : null}
      </label>
    </fieldset>
  );
}

function CycleStep({ values, errors, onChange }) {
  const painScale = Array.from({ length: 10 }, (_, index) => index + 1);
  return (
    <fieldset className="space-y-4">
      <legend className="text-lg font-semibold text-slate-800">Kenalan sama pola siklusmu</legend>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
          Panjang siklus (hari)
          <input
            type="number"
            min="21"
            max="35"
            value={values.cycleLength ?? ""}
            onChange={(event) => onChange("cycleLength", Number(event.target.value))}
            className="rounded-lg border border-slate-200 px-3 py-2 text-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-500"
          />
          {errors.cycleLength ? (
            <span className="text-xs text-red-500">{errors.cycleLength}</span>
          ) : null}
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
          Lama haid (hari)
          <input
            type="number"
            min="2"
            max="8"
            value={values.periodLength ?? ""}
            onChange={(event) => onChange("periodLength", Number(event.target.value))}
            className="rounded-lg border border-slate-200 px-3 py-2 text-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-500"
          />
          {errors.periodLength ? (
            <span className="text-xs text-red-500">{errors.periodLength}</span>
          ) : null}
        </label>
      </div>
      <div className="space-y-2">
        <span className="text-sm font-medium text-slate-700">Keteraturan siklus</span>
        <div className="flex flex-wrap gap-3" role="radiogroup" aria-label="Pilih keteraturan siklus">
          {["regular", "irregular", "not-sure"].map((option) => (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={values.regularity === option}
              onClick={() => onChange("regularity", option)}
              className={`rounded-full border px-4 py-2 text-sm font-medium capitalize transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-500 cursor-pointer ${
                values.regularity === option
                  ? "border-pink-500 bg-pink-100 text-pink-600"
                  : "border-slate-200 bg-white text-slate-600"
              }`}
            >
              {option.replace("-", " ")}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <span className="text-sm font-medium text-slate-700">Skala nyeri haid</span>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Skala nyeri haid 1 sampai 10">
          {painScale.map((value) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={values.painScale === value}
              onClick={() => onChange("painScale", value)}
              className={`h-9 w-9 rounded-full border text-sm font-medium transition-transform focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-500 hover:scale-105 cursor-pointer ${
                values.painScale === value
                  ? "border-pink-500 bg-pink-500 text-white"
                  : "border-slate-200 bg-white text-slate-600"
              }`}
            >
              {value}
            </button>
          ))}
        </div>
        {errors.painScale ? (
          <span className="text-xs text-red-500">{errors.painScale}</span>
        ) : null}
      </div>
    </fieldset>
  );
}

function IdentityStep({ values, errors, onChange }) {
  return (
    <fieldset className="space-y-4">
      <legend className="text-lg font-semibold text-slate-800">Cerita sedikit tentang dirimu</legend>
      <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
        Tahun lahir
        <input
          type="number"
          min="1990"
          max="2015"
          value={values.birthYear ?? ""}
          onChange={(event) => onChange("birthYear", Number(event.target.value))}
          className="rounded-lg border border-slate-200 px-3 py-2 text-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-500"
          aria-describedby="birthYearHint"
        />
        <span id="birthYearHint" className="text-xs text-slate-500">
          Contoh: 2009
        </span>
        {errors.birthYear ? (
          <span className="text-xs text-red-500">{errors.birthYear}</span>
        ) : null}
      </label>
    </fieldset>
  );
}

const steps = [
  { id: "dates", component: DateStep, title: "Tanggal terakhir haid" },
  { id: "details", component: CycleStep, title: "Detail siklus" },
  { id: "identity", component: IdentityStep, title: "Tahun lahir" }
];

function getStepErrors(stepIndex, values) {
  const nextErrors = {};
  if (stepIndex === 0) {
    if (!values.lastPeriodStart) {
      nextErrors.lastPeriodStart = "Isi tanggal mulai ya";
    }
    if (!values.lastPeriodEnd) {
      nextErrors.lastPeriodEnd = "Isi tanggal selesai ya";
    }
    if (values.lastPeriodStart && values.lastPeriodEnd) {
      if (values.lastPeriodEnd < values.lastPeriodStart) {
        nextErrors.lastPeriodEnd = "Tanggal selesai tidak boleh sebelum tanggal mulai";
      }
      if (values.lastPeriodStart > todayIso()) {
        nextErrors.lastPeriodStart = "Tanggal tidak boleh di masa depan";
      }
    }
  }
  if (stepIndex === 1) {
    if (!values.cycleLength || values.cycleLength < 21 || values.cycleLength > 35) {
      nextErrors.cycleLength = "Panjang siklus 21-35 hari";
    }
    if (!values.periodLength || values.periodLength < 2 || values.periodLength > 8) {
      nextErrors.periodLength = "Lama haid 2-8 hari";
    }
    if (!values.painScale) {
      nextErrors.painScale = "Pilih skala nyeri";
    }
  }
  if (stepIndex === 2) {
    if (!values.birthYear || values.birthYear < 1990 || values.birthYear > 2015) {
      nextErrors.birthYear = "Isi tahun lahir antara 1990-2015";
    }
  }
  return nextErrors;
}

export default function CycleOnboarding({ onComplete }) {
  const siklusState = useSiklusStore((state) => state, shallow);
  const { onboardingData, updateOnboardingData, setOnboardingCompleted } = siklusState;
  const settingsState = useSettingsStore((state) => state, shallow);
  const { settings, hydrate } = settingsState;

  const [activeStep, setActiveStep] = useState(0);
  const [errors, setErrors] = useState({});
  const cardRef = useRef(null);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!cardRef.current || settings.reducedMotion) {
      return undefined;
    }
    const ctx = gsap.context(() => {
      gsap.fromTo(
        cardRef.current,
        { autoAlpha: 0, y: 12 },
        { autoAlpha: 1, y: 0, duration: 0.4, ease: "power2.out" }
      );
    }, cardRef);
    return () => ctx.revert();
  }, [activeStep, settings.reducedMotion]);

  const currentValues = useMemo(
    () => ({
      ...onboardingData,
      cycleLength: onboardingData.cycleLength ?? 28,
      periodLength: onboardingData.periodLength ?? 5,
      regularity: onboardingData.regularity || "regular",
      painScale: onboardingData.painScale ?? 5
    }),
    [onboardingData]
  );

  const pendingErrors = useMemo(
    () => getStepErrors(activeStep, currentValues),
    [activeStep, currentValues]
  );

  const StepComponent = steps[activeStep].component;

  function validate(stepIndex) {
    const nextErrors = getStepErrors(stepIndex, currentValues);
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleNext() {
    if (!validate(activeStep)) {
      return;
    }
    if (activeStep === steps.length - 1) {
      setOnboardingCompleted(true);
      onComplete?.();
      return;
    }
    setErrors({});
    setActiveStep((previous) => previous + 1);
  }

  function handleBack() {
    setErrors({});
    setActiveStep((previous) => Math.max(0, previous - 1));
  }

  function handleChange(field, value) {
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    updateOnboardingData({ [field]: value });
  }

  return (
    <div className="space-y-6" ref={cardRef}>
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-pink-500">
          Langkah {activeStep + 1} dari {steps.length}
        </p>
        <h3 className="text-2xl font-semibold text-slate-800">{steps[activeStep].title}</h3>
      </header>
      <div className="rounded-3xl border border-pink-100 bg-white p-6 shadow-sm">
        <StepComponent values={currentValues} errors={{ ...errors, ...pendingErrors }} onChange={handleChange} />
      </div>
      <div className="flex items-center justify-between">
        <button
          type="button"
          className="rounded-full border border-slate-200 px-6 py-2 text-sm font-medium text-slate-600 transition hover:scale-[1.01] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-500 cursor-pointer disabled:opacity-40"
          onClick={handleBack}
          disabled={activeStep === 0}
        >
          Kembali
        </button>
        <button
          type="button"
          className="rounded-full bg-pink-500 px-6 py-2 text-sm font-semibold text-white shadow-sm transition hover:scale-[1.02] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-500 cursor-pointer disabled:opacity-40"
          onClick={handleNext}
          disabled={Object.keys(pendingErrors).length > 0}
        >
          {activeStep === steps.length - 1 ? "Selesai" : "Lanjut"}
        </button>
      </div>
    </div>
  );
}


