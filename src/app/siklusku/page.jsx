"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import { Droplet, Moon, Sparkles, Sprout } from "lucide-react";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/siklus/Tabs";
import OnboardingGate from "@/components/siklus/OnboardingGate";
import FirstPeriodGuide from "@/components/siklus/FirstPeriodGuide";
import CycleOnboarding from "@/components/siklus/CycleOnboarding";
import MoodLogger, { MOOD_OPTIONS } from "@/components/siklus/MoodLogger";
import ConsistencyCard from "@/components/siklus/ConsistencyCard";
import MoodDistributionCard from "@/components/siklus/MoodDistributionCard";
import MoodPatternCard from "@/components/siklus/MoodPatternCard";
import CycleLengthCard from "@/components/siklus/CycleLengthCard";
import AchievementsCard from "@/components/siklus/AchievementsCard";
import LoveLetterModal from "@/components/siklus/LoveLetterModal";
import LogPeriodForm from "@/components/siklus/LogPeriodForm";

import useSiklusStore from "@/stores/useSiklusStore";
import useSettingsStore from "@/stores/useSettingsStore";

import { gsap } from "gsap";
import { attachRipple } from "@/lib/siklus/microInteractions";
import { shouldShowDailyMoodNudge, getTodayKey } from "@/lib/siklus/nudges";
import {
  cycleDay,
  calculatePhase,
  projectUpcomingPeriods,
  formatDisplayDate,
} from "@/lib/siklus/cycleMath";
import { summarizeMoodTrend } from "@/lib/siklus/mood";

const CycleTrendChart = dynamic(() => import("@/components/siklus/charts/CycleTrendChart"), {
  ssr: false,
  loading: () => <ChartSkeleton label="grafik tren siklus" />,
});

const ChartExportButton = dynamic(() => import("@/components/siklus/charts/ChartExportButton"), {
  ssr: false,
  loading: () => <ExportButtonFallback />,
});

function ChartSkeleton({ label }) {
  return (
    <div className="flex h-48 w-full items-center justify-center rounded-3xl border border-dashed border-pink-200 bg-white/70 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-400">
      Memuat {label}...
    </div>
  );
}

function ExportButtonFallback() {
  return (
    <button
      type="button"
      disabled
      className="relative inline-flex items-center justify-center rounded-full bg-pink-400 px-6 py-2 text-sm font-semibold text-white opacity-70 shadow-sm"
    >
      Menyiapkan export...
    </button>
  );
}

const MOOD_META = MOOD_OPTIONS.reduce((acc, option) => {
  acc[option.mood] = { label: option.label, color: option.chartColor || "#ec4899" };
  return acc;
}, {});

// ---- Phase metadata ----
const PHASE_ART = {
  menstruation: {
    imageAlt: "Ilustrasi remaja minum teh hangat untuk fase menstruasi",
    imageSrc: "/image/phase-menstruation.png",
    palette: { primary: "#fbcfe8", secondary: "#f9a8d4", accent: "#fde4f2", highlight: "#f8b4d9", icon: "#db2777" },
    gradient: "from-rose-100 via-white to-rose-50",
    gradientDark: "dark:from-rose-950 dark:via-slate-950 dark:to-slate-900",
    badge: "bg-rose-100 text-rose-600",
    badgeDark: "dark:bg-rose-900/40 dark:text-rose-200 dark:border dark:border-rose-800/50",
    icon: Droplet,
    name: "Menstruasi",
    description: "Fase pembersihan alami tubuhmu",
    tips: ["Istirahat cukup dan konsumsi makanan bergizi. Tubuhmu sedang bekerja keras!"],
  },
  follicular: {
    imageAlt: "Ilustrasi remaja membawa bunga",
    imageSrc: "/image/phase-follicular.png",
    palette: { primary: "#bbf7d0", secondary: "#86efac", accent: "#dcfce7", highlight: "#34d399", icon: "#047857" },
    gradient: "from-green-100 via-white to-emerald-50",
    gradientDark: "dark:from-emerald-950 dark:via-slate-950 dark:to-slate-900",
    badge: "bg-emerald-100 text-emerald-600",
    badgeDark: "dark:bg-emerald-900/40 dark:text-emerald-200 dark:border dark:border-emerald-800/50",
    icon: Sprout,
    name: "Folikuler",
    description: "Masa pemulihan dan pertumbuhan sel baru",
    tips: ["Energi mulai meningkat! Waktu yang baik untuk olahraga ringan atau belajar hal baru."],
  },
  ovulation: {
    imageAlt: "Ilustrasi remaja dengan bunga bermekaran",
    imageSrc: "/image/phase-ovulation.png",
    palette: { primary: "#fef3c7", secondary: "#fde68a", accent: "#fffbeb", highlight: "#facc15", icon: "#b45309" },
    gradient: "from-amber-100 via-white to-yellow-50",
    gradientDark: "dark:from-amber-950 dark:via-slate-950 dark:to-slate-900",
    badge: "bg-amber-100 text-amber-600",
    badgeDark: "dark:bg-amber-900/40 dark:text-amber-200 dark:border dark:border-amber-800/60",
    icon: Sparkles,
    name: "Ovulasi",
    description: "Sel telur sudah siap dibuahi, ini masa subur kamu.",
    tips: ["Puncak kesuburan, tetap jaga kesehatan."],
    psaMessage: "Ovulasi = Masa Subur. Perempuan memiliki peluang kehamilan lebih tinggi di masa ini.",
  },
  luteal: {
    imageAlt: "Ilustrasi remaja dengan bulan sabit",
    imageSrc: "/image/phase-luteal.png",
    palette: { primary: "#c7d2fe", secondary: "#a5b4fc", accent: "#e0e7ff", highlight: "#6366f1", icon: "#4338ca" },
    gradient: "from-indigo-100 via-white to-slate-50",
    gradientDark: "dark:from-indigo-950 dark:via-slate-950 dark:to-slate-900",
    badge: "bg-indigo-100 text-indigo-600",
    badgeDark: "dark:bg-indigo-900/40 dark:text-indigo-200 dark:border dark:border-indigo-800/50",
    icon: Moon,
    name: "Luteal",
    description: "Persiapan tubuh menuju menstruasi berikutnya",
    tips: ["Mungkin kamu merasa lebih lelah atau sensitif dari biasanya. Perbanyak istirahat dan merawat diri."],
  },
  unknown: {
    imageAlt: "Ilustrasi remaja muda",
    imageSrc: "/image/phase-unknown.png",
    palette: {
      primary: "#fef2f2",
      secondary: "#fecaca",
      accent: "#fee2e2",
      highlight: "#f472b6",
      icon: "#be185d",
    },
    gradient: "from-rose-50 via-white to-rose-100",
    gradientDark: "dark:from-rose-900 dark:via-rose-950 dark:to-rose-900",
    badge: "bg-rose-100 text-rose-700 border border-rose-200",
    badgeDark: "dark:bg-rose-800/70 dark:text-rose-200 dark:border dark:border-rose-700/60",
    icon: Sparkles,
    name: "jurnal mood",
    description: "Data siklus lengkap bantu kami menyesuaikan tips khusus untukmu.",
    tips: [],
  },
};

// ---- Placeholder copy ----
const PLACEHOLDER_COPY = {
  loading: {
    title: "Menyiapkan ruangmu",
    message:
      "Kami sedang memuat data onboarding supaya pengalamanmu tetap personal dan aman di perangkat ini.",
    showPulse: true,
    imageSrc: "/image/placeholder-loading.png",
    imageAlt: "Ilustrasi pengisian data sedang dimuat",
  },
  gate: {
    title: "Yuk mulai kenalan",
    message: "Pilih sudah atau belum haid untuk menentukan langkah berikutnya.",
    showPulse: false,
    imageSrc: "/image/placeholder-gate.png",
    imageAlt: "Ilustrasi pilihan sudah atau belum haid",
  },
  guide: {
    title: "Mengenal Menstruasi Pertamamu",
    message: "Baca deh! kamu udah tau semua info haid di bawah ini belum?",
    showPulse: false,
    imageSrc: "/image/placeholder-guide.png",
    imageAlt: "Ilustrasi panduan pertama haid",
  },
  form: {
    title: "Isi data siklusmu",
    message:
      "Catat tanggal haid, panjang siklus, dan gejala haid kamu untuk mendapatkan laporan kesehatan reproduksi.",
    showPulse: false,
    imageSrc: "/image/placeholder-form.png",
    imageAlt: "Ilustrasi formulir siklus",
  },
};

function OnboardingPlaceholder({ state }) {
  const copy = PLACEHOLDER_COPY[state] || PLACEHOLDER_COPY.loading;
  const src = copy.imageSrc || "/image/placeholder-form.png";
  const alt = copy.imageAlt || copy.title;
  return (
    <section
      className="rounded-[32px] border border-pink-100/70 bg-white/85 p-8 text-center shadow-sm backdrop-blur-sm dark:border-slate-800/60 dark:bg-slate-900/70"
      role="status"
      aria-live="polite"
      aria-busy={state === "loading"}
    >
      <div className="mx-auto flex max-w-md flex-col items-center gap-6">
        <div className="relative h-28 w-28">
          <div
            className={`absolute inset-0 rounded-full ${
              copy.showPulse
                ? "bg-pink-200/70 motion-safe:animate-pulse dark:bg-pink-900/40"
                : "bg-pink-100/60 dark:bg-pink-900/20"
            }`}
            aria-hidden="true"
          />
          <img src={src} alt={alt} className="relative z-10 h-full w-full object-contain" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{copy.title}</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">{copy.message}</p>
        </div>
        {copy.showPulse ? (
          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75 motion-safe:animate-ping" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-pink-500" />
            </span>
            <span>Jangan tutup halaman ya, ini hanya sebentar.</span>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function normalizeNumber(value, fallback) {
  const numeric = Number.parseInt(value, 10);
  return Number.isFinite(numeric) && numeric > 0 ? numeric : fallback;
}

export default function SikluskuPage() {
  // ---- refs & state ----
  const rippleCleanupsRef = useRef([]);
  const moodSectionRef = useRef(null);

  const [flow, setFlow] = useState("loading");
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const hasInitializedFlowRef = useRef(false);

  const [loveLetterOpen, setLoveLetterOpen] = useState(false);
  const [loveLetterShown, setLoveLetterShown] = useState(false);

  const [showDailyNudge, setShowDailyNudge] = useState(false);
  const [lastNudgeShownDate, setLastNudgeShownDate] = useState(null);

  // tabs
  const [activeTab, setActiveTab] = useState("dashboard");

  // log form modal
  const [logFormOpen, setLogFormOpen] = useState(false);

  // ---- stores ----
  const onboardingCompleted = useSiklusStore((s) => s.onboardingCompleted);
  const onboardingData = useSiklusStore((s) => s.onboardingData);
  const moodLogs = useSiklusStore((s) => s.moodLogs);
  const cycleSummary = useSiklusStore((s) => s.cycleSummary);
  const moodDistribution = useSiklusStore((s) => s.moodDistribution);
  const achievements = useSiklusStore((s) => s.achievements ?? []);

  const setOnboardingCompletedAction = useSiklusStore((s) => s.setOnboardingCompleted);
  const resetOnboardingDataAction = useSiklusStore((s) => s.resetOnboardingData);

  const nudgesEnabled = useSettingsStore((s) => s.nudgesEnabled);
  const settingsHydrated = useSettingsStore((s) => s.hydrated ?? true);

  const goals = onboardingData?.goals || [];

  // ---- helpers ----
  function markLoveLetterShown() {
    try {
      localStorage.setItem("risa:loveLetterShownOnce", "true");
    } catch {}
    setLoveLetterShown(true);
  }

  // hydrate both stores once
  useEffect(() => {
    try {
      useSiklusStore.getState().hydrate?.();
    } catch {}
    try {
      useSettingsStore.getState().hydrate?.();
    } catch {}
    setHydrated(true);
    try {
      setLoveLetterShown(localStorage.getItem("risa:loveLetterShownOnce") === "true");
    } catch {}
  }, []);

  // visibility pause/resume GSAP
  useEffect(() => {
    const onVis = () => {
      if (document.hidden) {
        gsap.globalTimeline.pause();
        gsap.ticker?.sleep?.();
      } else {
        gsap.globalTimeline.resume();
        gsap.ticker?.wake?.();
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  // reduced motion
  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setPrefersReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  // flow after hydration
  useEffect(() => {
    if (!hydrated || hasInitializedFlowRef.current) return;
    hasInitializedFlowRef.current = true;
    setFlow(onboardingCompleted ? "dashboard" : "gate");
    if (onboardingCompleted && !loveLetterShown) setLoveLetterOpen(true);
  }, [hydrated, onboardingCompleted, loveLetterShown]);

  // Hard guard: keep tab on dashboard if onboarding not completed
  useEffect(() => {
    if (!onboardingCompleted) setActiveTab("dashboard");
  }, [onboardingCompleted]);

  // ripple attach/cleanup
  useEffect(() => {
    const cleanupAll = () => {
      rippleCleanupsRef.current.forEach((fn) => fn && fn());
      rippleCleanupsRef.current = [];
    };
    cleanupAll();
    if (prefersReducedMotion) return cleanupAll;
    const nodes = Array.from(document.querySelectorAll('[data-ripple="true"]'));
    rippleCleanupsRef.current = nodes.map((node) => attachRipple(node));
    return cleanupAll;
  }, [prefersReducedMotion, flow, loveLetterOpen, showDailyNudge, hydrated]);

  // daily mood nudge
  useEffect(() => {
    if (!settingsHydrated || !hydrated || flow !== "dashboard") {
      if (showDailyNudge) setShowDailyNudge(false);
      return;
    }
    const evaluate = () => {
      const now = new Date();
      const eligible = shouldShowDailyMoodNudge({ now, moodLogs, nudgesEnabled });
      if (!eligible) return setShowDailyNudge(false);
      const todayKey = getTodayKey(now);
      if (lastNudgeShownDate === todayKey) return;
      setShowDailyNudge(true);
      setLastNudgeShownDate(todayKey);
    };
    evaluate();
    const id = window.setInterval(evaluate, 60 * 1000);
    return () => window.clearInterval(id);
  }, [settingsHydrated, hydrated, flow, moodLogs, nudgesEnabled, lastNudgeShownDate, showDailyNudge]);

  // ---- derivations ----
  const isHydrating = !hydrated || flow === "loading";
  const placeholderState = isHydrating ? "loading" : flow !== "dashboard" ? flow : null;
  const showPlaceholder = Boolean(placeholderState);

  const moodSummary = useMemo(() => summarizeMoodTrend(moodLogs), [moodLogs]);

  const moodLegend = useMemo(() => {
    if (!moodDistribution) return [];
    return Object.entries(moodDistribution)
      .filter(([, count]) => count > 0)
      .map(([mood, count]) => {
        const meta = MOOD_META[mood] || { label: mood, color: "#94a3b8" };
        return { mood, label: meta.label, color: meta.color, count };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [moodDistribution]);

  const cycleTrendPoints = useMemo(() => {
    const history = Array.isArray(cycleSummary.cycleHistory) ? cycleSummary.cycleHistory : [];
    if (!history.length) return [{ label: "Saat ini", value: cycleSummary.averageCycleLength }];
    const fmt = new Intl.DateTimeFormat("id-ID", { month: "short" });
    const pts = history
      .map((item) => {
        const ref = item.end || item.start;
        const d = ref ? new Date(ref) : null;
        if (!d || Number.isNaN(d.getTime())) return null;
        return { label: `${fmt.format(d)} ${String(d.getFullYear()).slice(-2)}`, value: item.length };
      })
      .filter(Boolean);
    return pts.length ? pts.slice(-6) : [{ label: "Saat ini", value: cycleSummary.averageCycleLength }];
  }, [cycleSummary]);

  const upcomingPeriods = useMemo(() => {
    if (!onboardingData?.lastPeriodStart) return [];
    return projectUpcomingPeriods({
      lastPeriodStart: onboardingData.lastPeriodStart,
      cycleLength: onboardingData.cycleLength,
    });
  }, [onboardingData?.lastPeriodStart, onboardingData?.cycleLength]);

  const cycleInsight = useMemo(() => {
    const hasData = Boolean(onboardingData.lastPeriodStart);
    const cycleLen = normalizeNumber(cycleSummary.averageCycleLength, 28);
    const periodLen = normalizeNumber(cycleSummary.averagePeriodLength, 5);
    const day = hasData ? cycleDay(new Date(), onboardingData.lastPeriodStart, cycleLen) : null;
    const phaseKey = day ? calculatePhase(day, periodLen, cycleLen) : "unknown";
    return { hasData, day, phaseKey, cycleLength: cycleLen, periodLength: periodLen };
  }, [onboardingData.lastPeriodStart, cycleSummary]);

  // ---- handlers ----
  function handleNudgeLogNow() {
    setShowDailyNudge(false);
    const todayKey = getTodayKey(new Date());
    if (lastNudgeShownDate !== todayKey) setLastNudgeShownDate(todayKey);
    moodSectionRef.current?.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
  }

  function handleNudgeDismiss() {
    setShowDailyNudge(false);
    const todayKey = getTodayKey(new Date());
    if (lastNudgeShownDate !== todayKey) setLastNudgeShownDate(todayKey);
  }

  function handleLoveLetterClose() {
    markLoveLetterShown();
    setLoveLetterOpen(false);
    setFlow("dashboard");
  }

  function resetOnboardingData() {
    resetOnboardingDataAction?.();
  }
  function setOnboardingCompleted(val = true) {
    setOnboardingCompletedAction?.(val);
  }
  function handleGuideComplete() {
    resetOnboardingData();
    setOnboardingCompleted(true);
    setLoveLetterOpen(true);
  }
  function handleFormComplete() {
    setOnboardingCompleted(true);
    setLoveLetterOpen(true);
  }

  // ---- UI sections ----
  function renderPhaseHero() {
    const phaseMeta = PHASE_ART[cycleInsight.phaseKey] || PHASE_ART.unknown;
    const isUnknown = cycleInsight.phaseKey === "unknown";
    const tips = Array.isArray(phaseMeta.tips) ? phaseMeta.tips : [];
    const phaseName = phaseMeta.name;
    const showTips = tips.length > 0;

    const headline = isUnknown ? "Belum mulai haid? Gapapa!" : `Hari ke-${cycleInsight.day} siklusmu`;
    const subline = isUnknown ? "" : `Kamu sedang di fase ${phaseName}`;
    const description = isUnknown
      ? "Kamu bisa mulai dari catat mood harianmu dulu.\nNanti kalau kamu udah haid, klik catat dan mulai jurnal siklus bulananmu!\nSampai saat itu, kamu tetap bisa jurnal mood harianmu kapan saja disini 💕"
      : (phaseMeta.description ?? "Data siklus lengkap bantu kami menyesuaikan tips khusus untukmu.");

    const Icon = phaseMeta.icon;
    const fertilityEnabled = Array.isArray(goals) && goals.includes("fertility");
    const psaMessage = phaseMeta.psaMessage;
    const showPSA = Boolean(psaMessage && cycleInsight.phaseKey === "ovulation");
    const psaClass = fertilityEnabled
      ? "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-200 dark:border-amber-800/60"
      : "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800/60 dark:text-slate-200 dark:border-slate-700/60";

    return (
      <div className="space-y-6">
        <section
          className={`overflow-hidden rounded-[32px] border border-white/40 bg-gradient-to-r ${phaseMeta.gradient} ${phaseMeta.gradientDark ?? ""} p-6 shadow-sm sm:p-8 dark:border-white/10`}
        >
          <div className="grid gap-6 md:grid-cols-[1.15fr_auto] md:items-center">
            <div className="space-y-5">
              <span className={`inline-flex items-center gap-2 rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-wide ${phaseMeta.badge} ${phaseMeta.badgeDark ?? ""}`}>
                <Icon className="h-4 w-4" aria-hidden="true" />
                <span className="text-slate-900 dark:text-slate-100">
                  {isUnknown ? "jurnal mood" : phaseName}
                </span>
              </span>

              <div className="space-y-2 text-left">
                <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100 sm:text-[34px]">
                  {headline}
                </h1>
                {subline ? <p className="text-sm text-slate-600 dark:text-slate-300">{subline}</p> : null}
              </div>

              <p className="whitespace-pre-line text-sm text-slate-600 dark:text-slate-300">{description}</p>

              {!isUnknown ? (
                <dl className="grid grid-cols-2 gap-4 text-left sm:max-w-sm">
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Panjang siklus
                    </dt>
                    <dd className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                      {cycleInsight.cycleLength} hari
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Lama menstruasi
                    </dt>
                    <dd className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                      {cycleInsight.periodLength} hari
                    </dd>
                  </div>
                </dl>
              ) : null}

              {isUnknown ? (
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-full border border-pink-300 bg-white px-5 py-2 text-sm font-semibold text-gray-800 shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-400"
                  onClick={() => setFlow("form")}
                >
                  Catat Siklusku 🩸
                </button>
              ) : null}

              {onboardingCompleted && (cycleInsight.day || onboardingData?.lastPeriodStart) ? (
                <div>
                  <button
                    type="button"
                    data-ripple="true"
                    className="inline-flex items-center gap-2 rounded-full border border-pink-200 bg-white px-4 py-2 text-xs font-semibold text-pink-600 shadow-sm hover:bg-pink-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-600"
                    onClick={() => setLogFormOpen(true)}
                  >
                    Tambahkan Tanggal Haid
                  </button>
                </div>
              ) : null}
            </div>

            <div className="relative hidden h-64 w-64 md:block">
              <div className="absolute inset-0 rounded-full bg-white/70 blur-3xl dark:bg-white/10" aria-hidden="true" />
              <img src={phaseMeta.imageSrc} alt={phaseMeta.imageAlt} className="relative z-10 h-full w-full object-contain" />
            </div>
          </div>
        </section>

        <section className="rounded-[28px] border border-pink-100 bg-white p-6 shadow-sm sm:p-8 dark:border-slate-700/60 dark:bg-slate-900">
          <div className="space-y-4 text-left">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Tips spesial untukmu:</h2>

            {showTips ? (
              <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-200">
                {tips.map((tip) => (
                  <li key={tip} className="flex items-start gap-3">
                    <span className="mt-1 inline-flex h-2.5 w-2.5 shrink-0 rounded-full bg-pink-400 dark:bg-pink-300" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Catat mood kamu disini setiap hari, seperti sebuah jurnal khusus untuk suasana hatimu.
              </p>
            )}

            {showPSA ? (
              <div className={`mt-4 rounded-2xl border px-4 py-3 text-sm font-medium ${psaClass}`}>{psaMessage}</div>
            ) : null}
          </div>
        </section>
      </div>
    );
  }

  // ---- dashboard area with tabs (NO hooks here) ----
  function renderDashboard() {
    const hasUpcoming = Array.isArray(upcomingPeriods) && upcomingPeriods.length > 0;
    const hasAchievements = Array.isArray(achievements) && achievements.length > 0;
    const showReportTab = onboardingCompleted;

    return (
      <div className="space-y-8">
        {showDailyNudge ? (
          <section
            role="status"
            aria-live="polite"
            className="flex flex-col gap-4 rounded-3xl border border-amber-200 bg-amber-50 p-6 text-amber-900 shadow-sm dark:border-amber-500/40 dark:bg-amber-900/20 dark:text-amber-100"
          >
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="space-y-1">
                <h3 className="text-base font-semibold">Mau catat mood hari ini?</h3>
                <p className="text-sm text-amber-800/80 dark:text-amber-100/80">
                  Kamu belum mencatat moodmu hari ini. Apa yang kamu rasakan?
                </p>
              </div>
            </div>
          </section>
        ) : null}

        {renderPhaseHero()}

        <Tabs
          // If onboarding not completed, the Tabs will always show "dashboard"
          value={onboardingCompleted ? activeTab : "dashboard"}
          onValueChange={(val) => {
            // Hard prevent selecting "report" until eligible
            if (!onboardingCompleted && val === "report") return;
            setActiveTab(val);
          }}
        >
          <TabsList>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            {showReportTab ? <TabsTrigger value="report">Laporan</TabsTrigger> : null}
          </TabsList>

          {/* ===================== DASHBOARD ===================== */}
          <TabsContent value="dashboard">
            <div className="space-y-8">
              {/* 1) Consistency + Upcoming (or placeholder) */}
              <section className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                <ConsistencyCard />

                {hasUpcoming ? (
                  <section className="rounded-3xl border border-pink-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Perkiraan haid berikutnya</h3>
                    <ul className="mt-3 space-y-2 text-sm text-slate-600">
                      {upcomingPeriods.map((isoDate) => {
                        const displayDate = formatDisplayDate(isoDate) || isoDate;
                        return (
                          <li
                            key={isoDate}
                            className="flex items-center justify-between rounded-2xl bg-pink-50 px-4 py-3"
                          >
                            <span className="items-center font-semibold text-pink-600">{displayDate}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </section>
                ) : (
                  <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Perkiraan haid berikutnya</h3>
                    <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                      Kami akan menampilkan perkiraan tanggal haid setelah kamu menambahkan catatan
                      haid kamu. Saat ini kamu bisa mulai dari catat mood harianmu dulu ya. 💕
                    </p>
                  </section>
                )}
              </section>

              {/* 2) Mood Logger */}
              <div ref={moodSectionRef}>
                <MoodLogger />
              </div>

              {/* 3) Mood Distribution */}
              <section className="grid grid-cols-1">
                <MoodDistributionCard />
              </section>

              {/* 4) Achievements */}
              {hasAchievements ? (
                <section className="mb-6">
                  <AchievementsCard />
                </section>
              ) : null}

              {/* === Artikel Rekomendasi (inside dashboard) === */}
              <section
                id="recommendations"
                className="rounded-[28px] border border-pink-100 bg-white p-6 shadow-sm sm:p-8 dark:border-slate-700/60 dark:bg-slate-900"
              >
                <h3 className="mb-8 text-center text-xl font-bold text-gray-800 dark:text-slate-100">
                  Rekomendasi bacaan untuk kamu
                </h3>

                <div className="grid grid-cols-1 gap-4 p-2 md:grid-cols-3 md:gap-4 lg:gap-6">
                  {/* Card 1 */}
                  <a
                    href="/article-hiv.html"
                    className="group block cursor-pointer rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:text-pink-600 dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div
                      className="mb-2 h-48 w-full rounded-xl bg-cover bg-top"
                      style={{ backgroundImage: "url(/image/article-image-1.png)" }}
                      aria-hidden="true"
                    />
                    <span className="font-medium">HIV? Gak Usah Panik, Yuk Kenalan Dulu!</span>
                    <p className="text-sm leading-relaxed text-gray-600 dark:text-slate-400">
                      Kenalan sama HIV biar gak salah paham dan tetap bisa jaga diri.
                    </p>
                  </a>

                  {/* Card 2 */}
                  <a
                    href="/article-seks.html"
                    className="group block cursor-pointer rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:text-pink-600 dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div
                      className="mb-2 h-48 w-full rounded-xl bg-cover bg-top"
                      style={{ backgroundImage: "url(/image/article-image-2.png)" }}
                      aria-hidden="true"
                    />
                    <span className="font-medium">
                      Seks Itu Apa Sih? Biar Gak Salah Paham dan Bisa Jaga Diri!
                    </span>
                    <p className="text-sm leading-relaxed text-gray-600 dark:text-slate-400">
                      Belajar soal seks biar gak salah langkah dan bisa jaga diri.
                    </p>
                  </a>

                  {/* Card 3 */}
                  <a
                    href="/article-menstruasi.html"
                    className="group block cursor-pointer rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:text-pink-600 dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div
                      className="mb-2 h-48 w-full rounded-xl bg-cover bg-top"
                      style={{ backgroundImage: "url(/image/article-image-3.png)" }}
                      aria-hidden="true"
                    />
                    <span className="font-medium">
                      Menstruasi Pertama: Kenapa Bisa Terjadi dan Gak Usah Takut!
                    </span>
                    <p className="text-sm leading-relaxed text-gray-600 dark:text-slate-400">
                      Menstruasi pertama itu alami, yuk siapin diri biar gak panik.
                    </p>
                  </a>
                </div>
              </section>
            </div>
          </TabsContent>

          {/* ====================== REPORT ======================= */}
          {showReportTab ? (
            <TabsContent value="report">
              <div className="space-y-8">
                <section className="grid grid-cols-1">
                  <MoodPatternCard />
                </section>

                <section className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="rounded-3xl border border-pink-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Tren panjang siklus</h3>
                    <CycleTrendChart points={cycleTrendPoints} />
                  </div>

                  <div className="rounded-3xl border border-pink-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Ringkasan cepat</h3>
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
                        <span className="capitalize font-semibold text-pink-600">{moodSummary.dominantMood}</span>
                      </li>
                    </ul>
                  </div>
                </section>

                <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-pink-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Unduh laporan</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Simpan sebagai PNG untuk dibaca kapan saja.</p>
                  </div>
                  <ChartExportButton
                    filename="siklusku-report.png"
                    stats={{
                      averageCycleLength: cycleSummary.averageCycleLength,
                      averagePeriodLength: cycleSummary.averagePeriodLength,
                      dominantMood: moodSummary.dominantMood,
                      moodEntries: moodLogs.length,
                    }}
                    legend={moodLegend}
                  />
                </div>
              </div>
            </TabsContent>
          ) : null}
        </Tabs>
      </div>
    );
  }

  return (
    <main id="main-content" tabIndex="-1" role="main" className="container mx-auto max-w-4xl space-y-8 px-4 py-10 dark:text-slate-100">
      <LoveLetterModal open={loveLetterOpen} onClose={handleLoveLetterClose} reducedMotion={prefersReducedMotion} />

      {showPlaceholder ? <OnboardingPlaceholder state={placeholderState} /> : null}

      {hydrated ? (
        <OnboardingGate open={flow === "gate"} onBelum={() => setFlow("guide")} onSudah={() => setFlow("form")} reducedMotion={prefersReducedMotion} />
      ) : null}

      {flow === "guide" ? <FirstPeriodGuide onComplete={handleGuideComplete} /> : null}
      {flow === "form" ? <CycleOnboarding onComplete={handleFormComplete} /> : null}
      {flow === "dashboard" ? renderDashboard() : null}

      {/* Log Period Modal */}
      <LogPeriodForm open={logFormOpen} onClose={() => setLogFormOpen(false)} />
    </main>
  );
}
