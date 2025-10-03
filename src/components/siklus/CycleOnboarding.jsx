"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import useSiklusStore from "@/stores/useSiklusStore";
import useSettingsStore from "@/stores/useSettingsStore";
import CalendarRange from "./CalendarRange";
import { formatDisplayDate } from "@/lib/siklus/cycleMath";

const todayIso = () => new Date().toISOString().slice(0, 10);

const GOAL_OPTIONS = [
  {
    id: "prediction",
    emoji: "??",
    label: "Prediksi haid",
    description: "Selalu tahu kapan periode berikutnya datang."
  },
  {
    id: "fertility",
    emoji: "??",
    label: "Rencana kesuburan",
    description: "Pantau masa suburmu dengan mudah."
  },
  {
    id: "health",
    emoji: "??",
    label: "Kesehatan tubuh",
    description: "Catat pola makan, tidur, dan aktivitas."
  },
  {
    id: "mood",
    emoji: "??",
    label: "Mood harian",
    description: "Kenali pola emosi sepanjang siklus."
  },
  {
    id: "symptoms",
    emoji: "??",
    label: "Gejala",
    description: "Simpan catatan gejala unikmu."
  },
  {
    id: "pain",
    emoji: "??",
    label: "Kelola nyeri",
    description: "Lihat pola rasa sakit untuk cari bantuan."
  },
  {
    id: "general",
    emoji: "?",
    label: "Catatan umum",
    description: "Satu tempat untuk semua cerita tubuhmu."
  }
];

function calculateDurationDays(start, end) {
  if (!start || !end) {
    return null;
  }
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return null;
  }
  const diff = endDate.getTime() - startDate.getTime();
  if (!Number.isFinite(diff) || diff < 0) {
    return null;
  }
  return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
}

function DateStep({ values, errors, onChange }) {
  const today = todayIso();
  const [simpleMode, setSimpleMode] = useState(false);
  const durationWarning = useMemo(() => {
    const duration = calculateDurationDays(values.lastPeriodStart, values.lastPeriodEnd);
    if (!duration || duration <= 8) {
      return null;
    }
    return "Durasi haidmu lebih dari 8 hari. Kalau ini baru terjadi, coba diskusikan dengan orang dewasa atau tenaga kesehatan yang kamu percaya.";
  }, [values.lastPeriodStart, values.lastPeriodEnd]);
  const rangeValue = useMemo(
    () => ({
      start: values.lastPeriodStart || null,
      end: values.lastPeriodEnd || null
    }),
    [values.lastPeriodStart, values.lastPeriodEnd]
  );

  const endMin = values.lastPeriodStart || undefined;
  const startErrorId = errors.lastPeriodStart ? "lastPeriodStart-error" : undefined;
  const endErrorId = errors.lastPeriodEnd ? "lastPeriodEnd-error" : undefined;
  const startDescribedBy = ["period-date-hint", startErrorId].filter(Boolean).join(" ");
  const endDescribedBy = ["period-date-hint", endErrorId].filter(Boolean).join(" ");

  function handleRangeChange(nextRange) {
    onChange("lastPeriodStart", nextRange.start || null);
    onChange("lastPeriodEnd", nextRange.end || null);
  }

  return (
    <fieldset className="space-y-4" aria-describedby="period-date-hint">
      <legend className="text-lg font-semibold text-slate-800">Kapan terakhir kali kamu haid?</legend>
      <p id="period-date-hint" className="text-sm text-slate-500">
        Isi tanggal mulai dan selesai haid terakhirmu. Kalau lupa, isi perkiraan terbaikmu ya.
      </p>
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>Pilih rentang haid terakhirmu.</span>
        <button
          type="button"
          className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-500"
          onClick={() => setSimpleMode((previous) => !previous)}
          aria-pressed={simpleMode}
        >
          {simpleMode ? "Gunakan kalender interaktif" : "Gunakan input sederhana"}
        </button>
      </div>
      {simpleMode ? (
        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            Tanggal mulai
            <input
              type="date"
              max={today}
              value={values.lastPeriodStart || ""}
              onChange={(event) => onChange("lastPeriodStart", event.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-500"
              aria-invalid={Boolean(errors.lastPeriodStart)}
              aria-describedby={startDescribedBy || undefined}
            />
            {errors.lastPeriodStart ? (
              <span id="lastPeriodStart-error" role="alert" className="text-xs text-red-500">{errors.lastPeriodStart}</span>
            ) : null}
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            Tanggal selesai
            <input
              type="date"
              min={endMin}
              max={today}
              value={values.lastPeriodEnd || ""}
              onChange={(event) => onChange("lastPeriodEnd", event.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-500"
              aria-invalid={Boolean(errors.lastPeriodEnd)}
              aria-describedby={endDescribedBy || undefined}
            />
            <span className="text-xs text-slate-400">Kalau belum selesai, pilih perkiraan terbaikmu.</span>
            {errors.lastPeriodEnd ? (
              <span id="lastPeriodEnd-error" role="alert" className="text-xs text-red-500">{errors.lastPeriodEnd}</span>
            ) : null}
          </label>
        </div>
      ) : (
        <>
          <CalendarRange
            value={rangeValue}
            onChange={handleRangeChange}
            max={today}
            ariaInvalid={Boolean(errors.lastPeriodStart) || Boolean(errors.lastPeriodEnd)}
            ariaDescribedBy={[startErrorId, endErrorId].filter(Boolean).join(" ") || undefined}
          />
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span>Mulai: {rangeValue.start ? formatDisplayDate(rangeValue.start) : "Belum dipilih"}</span>
            <span>{"\u2022"}</span>
            <span>Selesai: {rangeValue.end ? formatDisplayDate(rangeValue.end) : "Belum dipilih"}</span>
          </div>
          <div className="space-y-1 text-xs text-red-500" aria-live="polite">
            {errors.lastPeriodStart ? <p id="lastPeriodStart-error" role="alert">{errors.lastPeriodStart}</p> : null}
            {errors.lastPeriodEnd ? <p id="lastPeriodEnd-error" role="alert">{errors.lastPeriodEnd}</p> : null}
          </div>
        </>
      )}
      {durationWarning ? <p className="text-xs text-amber-600">{durationWarning}</p> : null}
    </fieldset>
  );
}

function CycleStep({ values, errors, onChange }) {
  const painScale = Array.from({ length: 10 }, (_, index) => index + 1);
  const cycleLengthErrorId = errors.cycleLength ? "cycleLength-error" : undefined;
  const periodLengthErrorId = errors.periodLength ? "periodLength-error" : undefined;
  const painScaleErrorId = errors.painScale ? "painScale-error" : undefined;
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
            onChange={(event) => onChange("cycleLength", event.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-2 text-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-500"
            aria-invalid={Boolean(errors.cycleLength)}
            aria-describedby={cycleLengthErrorId || undefined}
          />
          {errors.cycleLength ? (
            <span id="cycleLength-error" role="alert" className="text-xs text-red-500">{errors.cycleLength}</span>
          ) : null}
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
          Lama haid (hari)
          <input
            type="number"
            min="2"
            max="8"
            value={values.periodLength ?? ""}
            onChange={(event) => onChange("periodLength", event.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-2 text-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-500"
            aria-invalid={Boolean(errors.periodLength)}
            aria-describedby={periodLengthErrorId || undefined}
          />
          {errors.periodLength ? (
            <span id="periodLength-error" role="alert" className="text-xs text-red-500">{errors.periodLength}</span>
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
          <span id="painScale-error" role="alert" className="text-xs text-red-500">{errors.painScale}</span>
        ) : null}
      </div>
    </fieldset>
  );
}

function GoalsStep({ values, errors, onChange }) {
  const selected = Array.isArray(values.goals) ? values.goals : [];
  const goalsErrorId = errors.goals ? "goals-error" : undefined;
  const goalsDescribedBy = ["goals-hint", goalsErrorId].filter(Boolean).join(" ");

  function toggleGoal(goalId) {
    const isActive = selected.includes(goalId);
    const nextGoals = isActive ? selected.filter((item) => item !== goalId) : [...selected, goalId];
    onChange("goals", nextGoals);
  }

  return (
    <fieldset className="space-y-4" aria-describedby={goalsDescribedBy}>
      <legend className="text-lg font-semibold text-slate-800">Tujuanmu pakai Siklusku</legend>
      <p id="goals-hint" className="text-sm text-slate-500">
        Pilih minimal satu. Kami akan menampilkan tips dan fitur yang paling cocok dengan kebutuhanmu.
      </p>
      <div className="grid gap-3 md:grid-cols-2">
        {GOAL_OPTIONS.map((option) => {
          const isActive = selected.includes(option.id);
          return (
            <button
              key={option.id}
              type="button"
              role="checkbox"
              aria-checked={isActive}
              onClick={() => toggleGoal(option.id)}
              className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-500 cursor-pointer ${
                isActive
                  ? "border-pink-500 bg-pink-100 text-pink-700"
                  : "border-slate-200 bg-white text-slate-700"
              }`}
            >
              <span className="text-xl" aria-hidden="true">
                {option.emoji}
              </span>
              <span className="space-y-1">
                <span className="block text-sm font-semibold">{option.label}</span>
                <span className="block text-xs text-slate-500">{option.description}</span>
              </span>
            </button>
          );
        })}
      </div>
      {errors.goals ? <span id="goals-error" role="alert" className="text-xs text-red-500">{errors.goals}</span> : null}
      <p className="text-xs text-slate-400">Kamu bisa ubah pilihan kapan saja di Pengaturan.</p>
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
          onChange={(event) => onChange("birthYear", event.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-500"
          aria-describedby={errors.birthYear ? "birthYearHint birthYear-error" : "birthYearHint"}
          aria-invalid={Boolean(errors.birthYear)}
        />
        <span id="birthYearHint" className="text-xs text-slate-500">
          Contoh: 2009
        </span>
        {errors.birthYear ? (
          <span id="birthYear-error" role="alert" className="text-xs text-red-500">{errors.birthYear}</span>
        ) : null}
      </label>
    </fieldset>
  );
}

const steps = [
  { id: "dates", component: DateStep, title: "Tanggal terakhir haid" },
  { id: "details", component: CycleStep, title: "Detail siklus" },
  { id: "goals", component: GoalsStep, title: "Pilih tujuan" },
  { id: "identity", component: IdentityStep, title: "Tahun lahir" }
];

function getStepErrors(stepIndex, values) {
  const nextErrors = {};
  const today = todayIso();
  if (stepIndex === 0) {
    if (!values.lastPeriodStart) {
      nextErrors.lastPeriodStart = "Isi tanggal mulai ya";
    } else if (values.lastPeriodStart > today) {
      nextErrors.lastPeriodStart = "Tanggal tidak boleh di masa depan";
    }
    if (!values.lastPeriodEnd) {
      nextErrors.lastPeriodEnd = "Isi tanggal selesai ya";
    } else if (values.lastPeriodEnd > today) {
      nextErrors.lastPeriodEnd = "Tanggal tidak boleh di masa depan";
    }
    if (values.lastPeriodStart && values.lastPeriodEnd && values.lastPeriodEnd < values.lastPeriodStart) {
      nextErrors.lastPeriodEnd = "Tanggal selesai tidak boleh sebelum tanggal mulai";
    }
  }
  if (stepIndex === 1) {
    const cycleLength = Number(values.cycleLength);
    if (!Number.isFinite(cycleLength) || cycleLength < 21 || cycleLength > 35) {
      nextErrors.cycleLength = "Panjang siklus 21-35 hari";
    }
    const periodLength = Number(values.periodLength);
    if (!Number.isFinite(periodLength) || periodLength < 2 || periodLength > 8) {
      nextErrors.periodLength = "Lama haid 2-8 hari";
    }
    const painScale = Number(values.painScale);
    if (!Number.isFinite(painScale) || painScale < 1 || painScale > 10) {
      nextErrors.painScale = "Pilih skala nyeri";
    }
  }
  if (stepIndex === 2) {
    if (!Array.isArray(values.goals) || values.goals.length === 0) {
      nextErrors.goals = "Pilih minimal satu tujuan";
    }
  }
  if (stepIndex === 3) {
    const birthYearRaw = values.birthYear ? String(values.birthYear).trim() : "";
    const birthYearNumeric = Number.parseInt(birthYearRaw, 10);
    if (birthYearRaw.length !== 4 || !Number.isFinite(birthYearNumeric) || birthYearNumeric < 1990 || birthYearNumeric > 2015) {
      nextErrors.birthYear = "Isi tahun lahir antara 1990-2015";
    }
  }
  return nextErrors;
}

export default function CycleOnboarding({ onComplete }) {
  const onboardingData = useSiklusStore((state) => state.onboardingData);
  const updateOnboardingDraft = useSiklusStore((state) => state.updateOnboardingDraft);
  const commitOnboardingData = useSiklusStore((state) => state.commitOnboardingData);
  const setOnboardingCompleted = useSiklusStore((state) => state.setOnboardingCompleted);
  const settings = useSettingsStore((state) => state.settings);
  const hydrate = useSettingsStore((state) => state.hydrate);

  const [activeStep, setActiveStep] = useState(0);
  const [errors, setErrors] = useState({});
  const cardRef = useRef(null);
  const stepHeadingRef = useRef(null);
  const reducedMotion = settings?.reducedMotion ?? false;

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!cardRef.current || reducedMotion) {
      return undefined;
    }
    const ctx = gsap.context(() => {
      gsap.fromTo(
        cardRef.current,
        { autoAlpha: 0, y: 12 },
        { autoAlpha: 1, y: 0, duration: 0.4, ease: "power2.out" }
      );
    }, cardRef);
        return () => {
      ctx?.revert();
    };
  }, [activeStep, reducedMotion]);
  useEffect(() => {
    stepHeadingRef.current?.focus();
  }, [activeStep]);

  const currentValues = useMemo(
    () => ({
      ...onboardingData,
      cycleLength: onboardingData.cycleLength ?? 28,
      periodLength: onboardingData.periodLength ?? 5,
      regularity: onboardingData.regularity || "regular",
      painScale: onboardingData.painScale ?? 5,
      goals: Array.isArray(onboardingData.goals) ? onboardingData.goals : []
    }),
    [onboardingData]
  );

  const stepValidation = useMemo(
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
      commitOnboardingData();
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
    let nextValue = value;
    if (field === "lastPeriodStart" || field === "lastPeriodEnd") {
      nextValue = value || null;
    } else if (["cycleLength", "periodLength", "birthYear", "painScale"].includes(field)) {
      if (value === null || value === undefined || value === "") {
        nextValue = null;
      } else if (typeof value === "number") {
        nextValue = Number.isFinite(value) ? value : null;
      } else {
        const parsed = Number.parseInt(value, 10);
        nextValue = Number.isFinite(parsed) ? parsed : null;
      }
    } else if (field === "regularity" && typeof value !== "string") {
      nextValue = String(value);
    } else if (field === "goals") {
      nextValue = Array.isArray(value) ? value : [];
    }
    updateOnboardingDraft({ [field]: nextValue });
  }

  const nextDisabled = Object.keys(stepValidation).length > 0;
  const liveErrorMessage = Object.values(errors).find((message) => message) || "";
  const errorMessageId = liveErrorMessage ? id="onboarding-error-message" : undefined;

  return (
    <div className="space-y-6" ref={cardRef}>
      {liveErrorMessage ? (<span className="sr-only">{liveErrorMessage}</span>) : null}
          {liveErrorMessage} 
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-pink-500">
          Langkah {activeStep + 1} dari {steps.length}
        </p>
        <h3 ref={stepHeadingRef} tabIndex={-1} className="text-2xl font-semibold text-slate-800">{steps[activeStep].title}</h3>
      </header>
      <div className="rounded-3xl border border-pink-100 bg-white p-6 shadow-sm">
        <StepComponent values={currentValues} errors={errors} onChange={handleChange} />
      </div>
      <div className="flex items-center justify-between">
        <button
          type="button"
          data-ripple="true"
          className="relative rounded-full border border-slate-200 px-6 py-2 text-sm font-medium text-slate-600 transition-transform duration-200 ease-out hover:shadow-md motion-safe:hover:scale-[1.02] motion-reduce:transform-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-500 cursor-pointer disabled:opacity-40 overflow-hidden"
          onClick={handleBack}
          disabled={activeStep === 0}
          aria-disabled={activeStep === 0}
        >
          Kembali
        </button>
        <button
          type="button"
          data-ripple="true"
          className="relative rounded-full bg-pink-500 px-6 py-2 text-sm font-semibold text-white shadow-sm transition-transform duration-200 ease-out hover:shadow-lg motion-safe:hover:scale-[1.03] motion-reduce:transform-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-500 cursor-pointer disabled:opacity-40 overflow-hidden"
          onClick={handleNext}
          disabled={nextDisabled}
          aria-disabled={nextDisabled}
          aria-describedby={errorMessageId}
        >
          {activeStep === steps.length - 1 ? "Selesai" : "Lanjut"}
        </button>
      </div>
    </div>
  );
}
