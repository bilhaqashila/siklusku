"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import DropletIcon from "lucide-react/dist/esm/icons/droplet";
import MoonIcon from "lucide-react/dist/esm/icons/moon";
import SparklesIcon from "lucide-react/dist/esm/icons/sparkles";
import SproutIcon from "lucide-react/dist/esm/icons/sprout";
import AbstractIllustration from "@/components/siklus/AbstractIllustration";
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
import useSiklusStore from "@/stores/useSiklusStore";
import { gsap } from "gsap";
import { attachRipple } from "@/lib/siklus/microInteractions";
import useSettingsStore from "@/stores/useSettingsStore";
import { shouldShowDailyMoodNudge, getTodayKey } from "@/lib/siklus/nudges";
import {
  cycleDay,
  calculatePhase,
  projectUpcomingPeriods,
  formatDisplayDate
} from "@/lib/siklus/cycleMath";
import { summarizeMoodTrend } from "@/lib/siklus/mood";

const CycleTrendChart = dynamic(() => import("@/components/siklus/charts/CycleTrendChart"), {
  ssr: false,
  loading: () => <ChartSkeleton label="grafik tren siklus" />
});

const ChartExportButton = dynamic(() => import("@/components/siklus/charts/ChartExportButton"), {
  ssr: false,
  loading: () => <ExportButtonFallback />
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
  acc[option.mood] = { label: option.label, color: option.chartColor || '#ec4899' };
  return acc;
}, {});

const PHASE_ART = {
  menstruation: {
    imageAlt: "Ilustrasi remaja minum teh hangat untuk fase menstruasi",
    palette: {
      primary: "#fbcfe8",
      secondary: "#f9a8d4",
      accent: "#fde4f2",
      highlight: "#f8b4d9",
      icon: "#db2777"
    },
    gradient: "from-rose-100 via-white to-rose-50",
    gradientDark: "dark:from-rose-950 dark:via-slate-950 dark:to-slate-900",
    badge: "bg-rose-100 text-rose-600",
    badgeDark: "dark:bg-rose-900/40 dark:text-rose-200 dark:border dark:border-rose-800/50",
    icon: DropletIcon,
    name: "Menstruasi",
    description: "Fase pembersihan alami tubuhmu",
    tips: [
      "Istirahat cukup dan konsumsi makanan bergizi. Tubuhmu sedang bekerja keras!"
    ]
  },
  follicular: {
    imageAlt: "Ilustrasi remaja membawa bunga",
    palette: {
      primary: "#bbf7d0",
      secondary: "#86efac",
      accent: "#dcfce7",
      highlight: "#34d399",
      icon: "#047857"
    },
    gradient: "from-green-100 via-white to-emerald-50",
    gradientDark: "dark:from-emerald-950 dark:via-slate-950 dark:to-slate-900",
    badge: "bg-emerald-100 text-emerald-600",
    badgeDark: "dark:bg-emerald-900/40 dark:text-emerald-200 dark:border dark:border-emerald-800/50",
    icon: SproutIcon,
    name: "Folikuler",
    description: "Masa pemulihan dan pertumbuhan sel baru",
    tips: [
      "Energi mulai meningkat! Waktu yang baik untuk olahraga ringan atau belajar hal baru."
    ]
  },
  ovulation: {
    imageAlt: "Ilustrasi remaja dengan bunga bermekaran",
    palette: {
      primary: "#fef3c7",
      secondary: "#fde68a",
      accent: "#fffbeb",
      highlight: "#facc15",
      icon: "#b45309"
    },
    gradient: "from-amber-100 via-white to-yellow-50",
    gradientDark: "dark:from-amber-950 dark:via-slate-950 dark:to-slate-900",
    badge: "bg-amber-100 text-amber-600",
    badgeDark: "dark:bg-amber-900/40 dark:text-amber-200 dark:border dark:border-amber-800/60",
    icon: SparklesIcon,
    name: "Ovulasi",
    description: "Sel telur sudah siap dibuahi, ini masa subur kamu.",
    tips: [
      "Puncak kesuburan, tetap jaga kesehatan."
    ],
    psaMessage: "Ovulasi = Masa Subur. Perempuan memiliki peluang kehamilan lebih tinggi di masa ini."
  },
  luteal: {
    imageAlt: "Ilustrasi remaja dengan bulan sabit",
    palette: {
      primary: "#c7d2fe",
      secondary: "#a5b4fc",
      accent: "#e0e7ff",
      highlight: "#6366f1",
      icon: "#4338ca"
    },
    gradient: "from-indigo-100 via-white to-slate-50",
    gradientDark: "dark:from-indigo-950 dark:via-slate-950 dark:to-slate-900",
    badge: "bg-indigo-100 text-indigo-600",
    badgeDark: "dark:bg-indigo-900/40 dark:text-indigo-200 dark:border dark:border-indigo-800/50",
    icon: MoonIcon,
    name: "Luteal",
    description: "Persiapan tubuh menuju menstruasi berikutnya",
    tips: [
      "Mungkin kamu merasa lebih lelah atau sensitif dari biasanya. Perbanyak istirahat dan merawat diri."
    ]
  },
  unknown: {
    imageAlt: "Ilustrasi remaja menunjuk kalender",
    palette: {
      primary: "#e2e8f0",
      secondary: "#cbd5f5",
      accent: "#f1f5f9",
      highlight: "#94a3b8",
      icon: "#475569"
    },
    gradient: "from-slate-100 via-white to-slate-50",
    gradientDark: "dark:from-slate-900 dark:via-slate-950 dark:to-slate-900",
    badge: "bg-slate-200 text-slate-700",
    badgeDark: "dark:bg-slate-800/70 dark:text-slate-200 dark:border dark:border-slate-700/60",
    icon: SparklesIcon,
    name: "Belum ada data",
    description: "Data siklus lengkap bantu kami menyesuaikan tips khusus untukmu.",
    tips: []
  }
};


const SUPPORT_PALETTE = {
  primary: "#fecdd3",
  secondary: "#fda4af",
  accent: "#ffe4e6",
  highlight: "#fb7185",
  icon: "#be123c"
};

const PLACEHOLDER_COPY = {
  loading: {
    title: "Menyiapkan ruangmu",
    message: "Kami sedang memuat data onboarding supaya pengalamanmu tetap personal dan aman di perangkat ini.",
    showPulse: true,
    illustration: {
      alt: "Ilustrasi pengisian data sedang dimuat",
      icon: SparklesIcon,
      palette: {
        primary: "#fbcfe8",
        secondary: "#f9a8d4",
        accent: "#fde4f2",
        highlight: "#f472b6",
        icon: "#be185d"
      },
      id: "placeholder-loading"
    }
  },
  gate: {
    title: "Yuk mulai kenalan",
    message: "Pilih sudah atau belum haid untuk menentukan langkah berikutnya.",
    showPulse: false,
    illustration: {
      alt: "Ilustrasi pilihan sudah atau belum haid",
      icon: DropletIcon,
      palette: {
        primary: "#bfdbfe",
        secondary: "#93c5fd",
        accent: "#dbeafe",
        highlight: "#3b82f6",
        icon: "#1d4ed8"
      },
      id: "placeholder-gate"
    }
  },
  guide: {
    title: "Pelajari tubuhmu dengan tenang",
    message: "Scroll panduan pertama haid, kamu bisa kembali kapan saja.",
    showPulse: false,
    illustration: {
      alt: "Ilustrasi panduan pertama haid",
      icon: SproutIcon,
      palette: {
        primary: "#bbf7d0",
        secondary: "#86efac",
        accent: "#dcfce7",
        highlight: "#34d399",
        icon: "#047857"
      },
      id: "placeholder-guide"
    }
  },
  form: {
    title: "Isi data siklusmu",
    message: "Catat tanggal haid, panjang siklus, dan tujuan supaya insight lebih akurat.",
    showPulse: false,
    illustration: {
      alt: "Ilustrasi formulir siklus",
      icon: SparklesIcon,
      palette: {
        primary: "#ddd6fe",
        secondary: "#c4b5fd",
        accent: "#ede9fe",
        highlight: "#8b5cf6",
        icon: "#6d28d9"
      },
      id: "placeholder-form"
    }
  }
};
function OnboardingPlaceholder({ state }) {
  const copy = PLACEHOLDER_COPY[state] || PLACEHOLDER_COPY.loading;
  const illustration = copy.illustration ?? {
    alt: copy.title,
    icon: SparklesIcon,
    palette: PHASE_ART.unknown.palette,
    id: "placeholder-generic"
  };

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
            className={`absolute inset-0 rounded-full ${copy.showPulse ? "bg-pink-200/70 motion-safe:animate-pulse dark:bg-pink-900/40" : "bg-pink-100/60 dark:bg-pink-900/20"}`}
            aria-hidden="true" 
          />
          <AbstractIllustration
            alt={illustration.alt}
            icon={illustration.icon}
            palette={illustration.palette}
            id={illustration.id}
            className="relative z-10 h-full w-full"
          />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{copy.title}</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">{copy.message}</p>
        </div>
        {copy.showPulse ? (
          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75 motion-safe:animate-ping" aria-hidden="true" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-pink-500" aria-hidden="true" />
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
  if (Number.isFinite(numeric) && numeric > 0) {
    return numeric;
  }
  return fallback;
}

export default function SikluskuPage() {
  // --- refs & state ---
  const rippleCleanupsRef = useRef([]);
  const moodSectionRef = useRef(null);

  const [flow, setFlow] = useState("loading");
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const [loveLetterOpen, setLoveLetterOpen] = useState(false);
  const [loveLetterShown, setLoveLetterShown] = useState(false);

  const [showDailyNudge, setShowDailyNudge] = useState(false);
  const [lastNudgeShownDate, setLastNudgeShownDate] = useState(null);

  // --- stores (add shallow if you like) ---
  const onboardingCompleted = useSiklusStore(s => s.onboardingCompleted);
  const onboardingData     = useSiklusStore(s => s.onboardingData);
  const moodLogs           = useSiklusStore(s => s.moodLogs);
  const cycleSummary       = useSiklusStore(s => s.cycleSummary);
  const moodDistribution   = useSiklusStore(s => s.moodDistribution); // used in moodLegend
  const goals              = onboardingData?.goals || [];

  const nudgesEnabled     = useSettingsStore(s => s.nudgesEnabled);
  const settingsHydrated  = useSettingsStore(s => s.hydrated ?? true);

  // --- helpers you reference ---
  function markLoveLetterShown() {
    try { localStorage.setItem("risa:loveLetterShownOnce", "true"); } catch {}
    setLoveLetterShown(true);
  }
  function resetOnboardingData() { /* TODO: call your store action if exists */ }
  function setOnboardingCompleted(_) { /* TODO: call your store action if exists */ }

  function handleVisibility() {
    try {
      if (document.hidden) {
        gsap.globalTimeline.pause();
        gsap.ticker?.sleep?.();
      } else {
        gsap.globalTimeline.resume();
        gsap.ticker?.wake?.();
      }
    } catch {}
  }

  // --- effects (now valid inside component) ---
  useEffect(() => {
    setHydrated(true);
    try { setLoveLetterShown(localStorage.getItem("risa:loveLetterShownOnce") === "true"); } catch {}
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setPrefersReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    setFlow(onboardingCompleted ? "dashboard" : "gate");
    if (onboardingCompleted && !loveLetterShown) setLoveLetterOpen(true);
  }, [hydrated, onboardingCompleted, loveLetterShown]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const cleanupAll = () => {
      rippleCleanupsRef.current.forEach(fn => fn && fn());
      rippleCleanupsRef.current = [];
    };
    cleanupAll();
    if (prefersReducedMotion) return cleanupAll;
    const nodes = Array.from(document.querySelectorAll('[data-ripple="true"]'));
    rippleCleanupsRef.current = nodes.map(node => attachRipple(node));
    return cleanupAll;
  }, [prefersReducedMotion, flow, loveLetterOpen, showDailyNudge, hydrated]);

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

  // --- memos/derivations ---
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
    const pts = history.map(item => {
      const ref = item.end || item.start;
      const d = ref ? new Date(ref) : null;
      if (!d || Number.isNaN(d.getTime())) return null;
      return { label: `${fmt.format(d)} ${String(d.getFullYear()).slice(-2)}`, value: item.length };
    }).filter(Boolean);
    return pts.length ? pts.slice(-6) : [{ label: "Saat ini", value: cycleSummary.averageCycleLength }];
  }, [cycleSummary]);

  const upcomingPeriods = useMemo(() => {
    if (!onboardingData?.lastPeriodStart) return [];
    return projectUpcomingPeriods({
      lastPeriodStart: onboardingData.lastPeriodStart,
      cycleLength: onboardingData.cycleLength
    });
  }, [onboardingData.lastPeriodStart, onboardingData.cycleLength]);

  const cycleInsight = useMemo(() => {
    const hasData = Boolean(onboardingData.lastPeriodStart);
    const reg = onboardingData.regularity;
    const safeCycle = reg === "not-sure" ? 28 : Number.parseInt(onboardingData.cycleLength, 10) || 28;
    const safePeriod = reg === "not-sure" ? 5 : Number.parseInt(onboardingData.periodLength, 10) || 5;
    const day = hasData ? cycleDay(new Date(), onboardingData.lastPeriodStart, safeCycle) : null;
    const phaseKey = day ? calculatePhase(day, safePeriod, safeCycle) : "unknown";
    return { hasData, day, phaseKey, cycleLength: safeCycle, periodLength: safePeriod };
  }, [onboardingData]);

  // --- handlers (unchanged) ---
  function handleNudgeLogNow() { /* …same as your version… */ }
  function handleNudgeDismiss() { /* …same as your version… */ }
  function handleLoveLetterClose() { markLoveLetterShown(); setLoveLetterOpen(false); }
  function handleGuideComplete() { resetOnboardingData(); setOnboardingCompleted(true); setFlow("dashboard"); }
  function handleFormComplete() { setOnboardingCompleted(true); setFlow("dashboard"); }

  // --- render helpers (your renderPhaseHero / renderDashboard stay the same) ---
  function renderPhaseHero() { /* …your existing renderPhaseHero body… */ }
  function renderDashboard() { /* …your existing renderDashboard body… */ }

  // --- return JSX ---
  return (
    <main id="main-content" tabIndex="-1" role="main" className="container mx-auto max-w-4xl space-y-8 px-4 py-10 dark:text-slate-100">
      <LoveLetterModal open={loveLetterOpen} onClose={handleLoveLetterClose} reducedMotion={prefersReducedMotion} />
      {showPlaceholder ? <OnboardingPlaceholder state={placeholderState} /> : null}
      {hydrated ? <OnboardingGate open={flow === "gate"} onBelum={() => setFlow("guide")} onSudah={() => setFlow("form")} reducedMotion={prefersReducedMotion} /> : null}
      {flow === "guide" ? <FirstPeriodGuide onComplete={handleGuideComplete} /> : null}
      {flow === "form" ? <CycleOnboarding onComplete={handleFormComplete} /> : null}
      {flow === "dashboard" ? renderDashboard() : null}
    </main>
  );
}