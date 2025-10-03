"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { Droplet, Moon, Sparkles, Sprout } from "lucide-react";
import OnboardingGate from "@/components/siklus/OnboardingGate";
import FirstPeriodGuide from "@/components/siklus/FirstPeriodGuide";
import CycleOnboarding from "@/components/siklus/CycleOnboarding";
import CycleTrendChart from "@/components/siklus/charts/CycleTrendChart";
import MoodLogger from "@/components/siklus/MoodLogger";
import ChartExportButton from "@/components/siklus/charts/ChartExportButton";
import MoodDistributionCard from "@/components/siklus/MoodDistributionCard";
import MoodPatternCard from "@/components/siklus/MoodPatternCard";
import CycleLengthCard from "@/components/siklus/CycleLengthCard";
import AchievementsCard from "@/components/siklus/AchievementsCard";
import LoveLetterModal from "@/components/siklus/LoveLetterModal";
import useSiklusStore from "@/stores/useSiklusStore";
import {
  cycleDay,
  calculatePhase,
  projectUpcomingPeriods,
  formatDisplayDate
} from "@/lib/siklus/cycleMath";
import { summarizeMoodTrend } from "@/lib/siklus/mood";

const PHASE_ART = {
  menstruation: {
    image: {
      src: "/image/Teen%20Girl%20With%20Hot%20Tea%20(Menstrual%20Phase%20Illustration).png",
      alt: "Ilustrasi remaja minum teh hangat untuk fase menstruasi"
    },
    gradient: "from-rose-100 via-white to-rose-50",
    gradientDark: "dark:from-rose-950 dark:via-slate-950 dark:to-slate-900",
    badge: "bg-rose-100 text-rose-600",
    badgeDark: "dark:bg-rose-900/40 dark:text-rose-200 dark:border dark:border-rose-800/50",
    icon: Droplet,
    name: "Menstruasi",
    description: "Fase pembersihan alami tubuhmu",
    tips: [
      "Istirahat cukup dan konsumsi makanan bergizi. Tubuhmu sedang bekerja keras!"
    ]
  },
  follicular: {
    image: {
      src: "/image/Teen%20Girl%20With%20Flower%20(Follicular%20Phase%20Illustration).png",
      alt: "Ilustrasi remaja membawa bunga"
    },
    gradient: "from-green-100 via-white to-emerald-50",
    gradientDark: "dark:from-emerald-950 dark:via-slate-950 dark:to-slate-900",
    badge: "bg-emerald-100 text-emerald-600",
    badgeDark: "dark:bg-emerald-900/40 dark:text-emerald-200 dark:border dark:border-emerald-800/50",
    icon: Sprout,
    name: "Folikuler",
    description: "Masa pemulihan dan pertumbuhan sel baru",
    tips: [
      "Energi mulai meningkat! Waktu yang baik untuk olahraga ringan atau belajar hal baru."
    ]
  },
  ovulation: {
    image: {
      src: "/image/Teen%20Girl%20With%20Blossom%20(Ovulation%20Phase%20Illustration).png",
      alt: "Ilustrasi remaja dengan bunga bermekaran"
    },
    gradient: "from-amber-100 via-white to-yellow-50",
    gradientDark: "dark:from-amber-950 dark:via-slate-950 dark:to-slate-900",
    badge: "bg-amber-100 text-amber-600",
    badgeDark: "dark:bg-amber-900/40 dark:text-amber-200 dark:border dark:border-amber-800/60",
    icon: Sparkles,
    name: "Ovulasi",
    description: "Sel telur sudah siap dibuahi, ini masa subur kamu.",
    tips: [
      "Puncak kesuburan, tetap jaga kesehatan."
    ],
    psaMessage: "Ovulasi = Masa Subur. Perempuan memiliki peluang kehamilan lebih tinggi di masa ini."
  },
  luteal: {
    image: {
      src: "/image/Teen%20Girl%20With%20Moon%20(Luteal%20Phase%20Illustration).png",
      alt: "Ilustrasi remaja dengan bulan sabit"
    },
    gradient: "from-indigo-100 via-white to-slate-50",
    gradientDark: "dark:from-indigo-950 dark:via-slate-950 dark:to-slate-900",
    badge: "bg-indigo-100 text-indigo-600",
    badgeDark: "dark:bg-indigo-900/40 dark:text-indigo-200 dark:border dark:border-indigo-800/50",
    icon: Moon,
    name: "Luteal",
    description: "Persiapan tubuh menuju menstruasi berikutnya",
    tips: [
      "Mungkin kamu merasa lebih lelah atau sensitif dari biasanya. Perbanyak istirahat dan merawat diri."
    ]
  },
  unknown: {
    image: {
      src: "/image/Teen%20Girl%20Pointing%20at%20Calendar%20(Cycle%20Tracker%20%20Calendar%20Widget).png",
      alt: "Ilustrasi remaja menunjuk kalender"
    },
    gradient: "from-slate-100 via-white to-slate-50",
    gradientDark: "dark:from-slate-900 dark:via-slate-950 dark:to-slate-900",
    badge: "bg-slate-200 text-slate-700",
    badgeDark: "dark:bg-slate-800/70 dark:text-slate-200 dark:border dark:border-slate-700/60",
    icon: Sparkles,
    name: "Belum ada data",
    description: "Data siklus lengkap bantu kami menyesuaikan tips khusus untukmu.",
    tips: []
  }
};

const SUPPORT_IMAGE = "/image/Teen%20Girl%20Hugging%20Friend%20(Support%20Banner%20Illustration).png";
const PLACEHOLDER_IMAGE = "/image/Teen%20Girls%20Reading%20a%20Book%20Together%20(EducationOnboarding%20Guide).png";

const PLACEHOLDER_COPY = {
  loading: {
    title: "Menyiapkan ruangmu",
    message: "Kami sedang memuat data onboarding supaya pengalamanmu tetap personal dan aman di perangkat ini.",
    showPulse: true
  },
  gate: {
    title: "Yuk mulai kenalan",
    message: "Pilih sudah atau belum haid untuk menentukan langkah berikutnya.",
    showPulse: false
  },
  guide: {
    title: "Pelajari tubuhmu dengan tenang",
    message: "Scroll panduan pertama haid, kamu bisa kembali kapan saja.",
    showPulse: false
  },
  form: {
    title: "Isi data siklusmu",
    message: "Catat tanggal haid, panjang siklus, dan tujuan supaya insight lebih akurat.",
    showPulse: false
  }
};

function OnboardingPlaceholder({ state }) {
  const copy = PLACEHOLDER_COPY[state] || PLACEHOLDER_COPY.loading;
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
          <Image
            src={PLACEHOLDER_IMAGE}
            alt="Ilustrasi remaja membaca"
            fill
            priority
            sizes="112px"
            className="relative rounded-3xl object-cover shadow-md"
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
  const hydrate = useSiklusStore((state) => state.hydrate);
  const hydrated = useSiklusStore((state) => state.hydrated);
  const onboardingCompleted = useSiklusStore((state) => state.onboardingCompleted);
  const onboardingData = useSiklusStore((state) => state.onboardingData);
  const moodLogs = useSiklusStore((state) => state.moodLogs);
  const goals = useSiklusStore((state) => state.goals);
  const cycleSummary = useSiklusStore((state) => state.cycleSummary);
  const streak = useSiklusStore((state) => state.streak);
  const consistency = useSiklusStore((state) => state.consistency);
  const setOnboardingCompleted = useSiklusStore((state) => state.setOnboardingCompleted);
  const resetOnboardingData = useSiklusStore((state) => state.resetOnboardingData);
  const loveLetterShown = useSiklusStore((state) => state.loveLetterShown);
  const markLoveLetterShown = useSiklusStore((state) => state.markLoveLetterShown);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [loveLetterOpen, setLoveLetterOpen] = useState(false);
  const [flow, setFlow] = useState("loading");

  useEffect(() => {
    hydrate();
  }, [hydrate]);
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setPrefersReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }
    setFlow(onboardingCompleted ? "dashboard" : "gate");
  }, [hydrated, onboardingCompleted]);
  useEffect(() => {
    if (!hydrated) {
      return;
    }
    if (onboardingCompleted && !loveLetterShown) {
      setLoveLetterOpen(true);
    }
  }, [hydrated, onboardingCompleted, loveLetterShown]);

  const isHydrating = !hydrated || flow === "loading";
  const placeholderState = isHydrating ? "loading" : flow !== "dashboard" ? flow : null;
  const showPlaceholder = Boolean(placeholderState);
  const moodSummary = useMemo(() => summarizeMoodTrend(moodLogs), [moodLogs]);
  const cycleTrendPoints = useMemo(() => {
    const history = Array.isArray(cycleSummary.cycleHistory) ? cycleSummary.cycleHistory : [];
    if (!history.length) {
      return [
        {
          label: "Saat ini",
          value: cycleSummary.averageCycleLength
        }
      ];
    }
    const formatter = new Intl.DateTimeFormat("id-ID", { month: "short" });
    const points = history
      .map((item) => {
        const reference = item.end || item.start;
        const parsed = reference ? new Date(reference) : null;
        if (!parsed || Number.isNaN(parsed.getTime())) {
          return null;
        }
        const label = formatter.format(parsed) + " " + String(parsed.getFullYear()).slice(-2);
        return {
          label,
          value: item.length
        };
      })
      .filter(Boolean);
    if (!points.length) {
      return [
        {
          label: "Saat ini",
          value: cycleSummary.averageCycleLength
        }
      ];
    }
    return points.slice(-6);
  }, [cycleSummary]);
  const upcomingPeriods = useMemo(() => {
    if (!onboardingData.lastPeriodStart) {
      return [];
    }
    return projectUpcomingPeriods({
      lastPeriodStart: onboardingData.lastPeriodStart,
      cycleLength: onboardingData.cycleLength
    });
  }, [onboardingData.lastPeriodStart, onboardingData.cycleLength]);

  const cycleInsight = useMemo(() => {
    const hasData = Boolean(onboardingData.lastPeriodStart);
    const regularity = onboardingData.regularity;

    const safeCycleLength =
      regularity === "not-sure"
        ? 28
        : normalizeNumber(onboardingData.cycleLength, 28);

    const safePeriodLength =
      regularity === "not-sure"
        ? 5
        : normalizeNumber(onboardingData.periodLength, 5);

    const day = hasData
      ? cycleDay(new Date(), onboardingData.lastPeriodStart, safeCycleLength)
      : null;
    const phaseKey = day
      ? calculatePhase(day, safePeriodLength, safeCycleLength)
      : "unknown";

    return {
      hasData,
      day,
      phaseKey,
      cycleLength: safeCycleLength,
      periodLength: safePeriodLength
    };
  }, [onboardingData]);

  function handleLoveLetterClose() {
    markLoveLetterShown();
    setLoveLetterOpen(false);
  }

  function handleGuideComplete() {
    resetOnboardingData();
    setOnboardingCompleted(true);
    setFlow("dashboard");
  }

  function handleFormComplete() {
    setOnboardingCompleted(true);
    setFlow("dashboard");
  }

  function renderPhaseHero() {
    const phaseMeta = PHASE_ART[cycleInsight.phaseKey] || PHASE_ART.unknown;
    const tips = Array.isArray(phaseMeta.tips) ? phaseMeta.tips : [];
    const phaseName = phaseMeta.name;
    const showTips = tips.length > 0;

    const headline = cycleInsight.day
      ? `Hari ke-${cycleInsight.day} siklusmu`
      : "Lengkapi data siklusmu untuk melihat insight pribadi.";

    const subline = phaseName
      ? `Kamu sedang di fase ${phaseName}`
      : "Masukkan tanggal haid terakhirmu agar kami bisa memberi panduan harian.";

    const description = phaseMeta.description ?? "Data siklus lengkap bantu kami menyesuaikan tips khusus untukmu.";

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
          className={`overflow-hidden rounded-[32px] border border-white/40 bg-gradient-to-r ${phaseMeta.gradient} ${
            phaseMeta.gradientDark ?? ""
          } p-6 shadow-sm sm:p-8 dark:border-white/10`}
        >
          <div className="grid gap-6 md:grid-cols-[1.15fr_auto] md:items-center">
            <div className="space-y-5">
              <span className={`inline-flex items-center gap-2 rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-wide ${phaseMeta.badge} ${phaseMeta.badgeDark ?? ""}`}>
                <Icon className="h-4 w-4" aria-hidden="true" />
                <span className="text-slate-900 dark:text-slate-100">{phaseName ?? "Belum ada data"}</span>
              </span>
              <div className="space-y-2 text-left">
                <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100 sm:text-[34px]">
                  {headline}
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-300">{subline}</p>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300">{description}</p>
              <dl className="grid grid-cols-2 gap-4 text-left sm:max-w-sm">
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Panjang siklus</dt>
                  <dd className="text-lg font-semibold text-slate-900 dark:text-slate-100">{cycleInsight.cycleLength} hari</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Lama menstruasi</dt>
                  <dd className="text-lg font-semibold text-slate-900 dark:text-slate-100">{cycleInsight.periodLength} hari</dd>
                </div>
              </dl>
              {!cycleInsight.day ? (
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-full bg-pink-500 px-5 py-2 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-600"
                  onClick={() => setFlow("form")}
                >
                  Isi data siklus sekarang
                </button>
              ) : null}
            </div>
            <div className="relative hidden h-64 w-64 md:block">
              <div className="absolute inset-0 rounded-full bg-white/70 blur-3xl dark:bg-white/10" aria-hidden="true" />
              <Image
                src={phaseMeta.image.src}
                alt={phaseMeta.image.alt}
                fill
                sizes="(max-width: 1024px) 220px, 256px"
                className="rounded-[28px] object-cover shadow-lg"
                priority
              />
            </div>
          </div>
        </section>

        <section className="rounded-[28px] border border-pink-100 bg-white p-6 shadow-sm sm:p-8 dark:border-slate-700/60 dark:bg-slate-900">
          <div className="grid gap-6 md:grid-cols-[1.2fr_0.8fr] md:items-center">
            <div className="space-y-4 text-left">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Tips lembut untuk hari ini</h2>
              {showTips ? (
                <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-200">
                  {tips.map((tip) => (
                    <li key={tip} className="flex items-start gap-3">
                      <span className="mt-1 inline-flex h-2.5 w-2.5 flex-shrink-0 rounded-full bg-pink-400 dark:bg-pink-300" aria-hidden="true" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Masukkan data haid terakhirmu dan kami akan menyiapkan panduan harian yang cocok untukmu.
                </p>
              )}
              {showPSA ? (
                <div className={`mt-4 rounded-2xl border px-4 py-3 text-sm font-medium ${psaClass}`}>
                  {psaMessage}
                </div>
              ) : null}
            </div>
            <div className="relative hidden overflow-hidden rounded-3xl bg-pink-50 dark:bg-slate-800 md:flex">
              <Image
                src={SUPPORT_IMAGE}
                alt="Ilustrasi teman saling mendukung"
                fill
                sizes="(max-width: 1024px) 220px, 280px"
                className="object-cover"
              />
            </div>
          </div>
        </section>
      </div>
    );
  }

  function renderDashboard() {
    return (
      <div className="space-y-8">
        {renderPhaseHero()}

        <section className="grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl border border-pink-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Rata-rata siklus</h3>
            <p className="mt-2 text-3xl font-semibold text-slate-800 dark:text-slate-100">{cycleSummary.averageCycleLength} hari</p>
          </article>
          <article className="rounded-2xl border border-pink-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Rata-rata menstruasi</h3>
            <p className="mt-2 text-3xl font-semibold text-slate-800 dark:text-slate-100">{cycleSummary.averagePeriodLength} hari</p>
          </article>
          <article className="rounded-2xl border border-pink-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Streak pencatatan</h3>
            <p className="mt-2 text-3xl font-semibold text-slate-800 dark:text-slate-100">{streak} hari</p>
            <div className="mt-2">
              <div className="flex justify-between text-xs mb-1">
                <span>Konsistensi</span>
                <span>{consistency}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden dark:bg-slate-700">
                <div 
                  className="h-full bg-pink-500 rounded-full" 
                  style={{ width: `${consistency}%` }}
                ></div>
              </div>
            </div>
          </article>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <MoodDistributionCard />
          <div className="rounded-3xl border border-pink-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Tren panjang siklus</h3>
            <CycleTrendChart points={cycleTrendPoints} />
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
           <MoodPatternCard />
           <CycleLengthCard />
         </section>
         
         <section className="mb-6">
           <AchievementsCard />
         </section>

        {/* Add MoodLogger component */}
        <MoodLogger />

        <section className="rounded-3xl border border-pink-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Periode berikutnya</h3>
          {upcomingPeriods.length ? (
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              {upcomingPeriods.map((isoDate) => {
                const displayDate = formatDisplayDate(isoDate) || isoDate;
                return (
                  <li key={isoDate} className="flex items-center justify-between rounded-2xl bg-pink-50 px-4 py-3">
                    <span>Perkiraan mulai</span>
                    <span className="font-semibold text-pink-600">{displayDate}</span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Lengkapi data onboarding untuk dapat prediksi periode berikutnya.</p>
          )}
        </section>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-pink-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Simpan ringkasanmu</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Unduh versi PNG untuk disimpan pribadi atau kirim ke seseorang yang kamu percaya.</p>
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
    <main className="container mx-auto max-w-4xl space-y-8 px-4 py-10 dark:text-slate-100">
      <LoveLetterModal
        open={loveLetterOpen}
        onClose={handleLoveLetterClose}
        reducedMotion={prefersReducedMotion}
      />
      {showPlaceholder ? <OnboardingPlaceholder state={placeholderState} /> : null}

      {hydrated ? (
        <OnboardingGate open={flow === "gate"} onBelum={() => setFlow("guide")} onSudah={() => setFlow("form")} />
      ) : null}

      {flow === "guide" ? <FirstPeriodGuide onComplete={handleGuideComplete} /> : null}

      {flow === "form" ? <CycleOnboarding onComplete={handleFormComplete} /> : null}

      {flow === "dashboard" ? renderDashboard() : null}
    </main>
  );
}








