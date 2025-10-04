"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import AbstractIllustration from "./AbstractIllustration";
import SparklesIcon from "lucide-react/dist/esm/icons/sparkles";
import BookOpenIcon from "lucide-react/dist/esm/icons/book-open";
import CalendarIcon from "lucide-react/dist/esm/icons/calendar";
import HeartIcon from "lucide-react/dist/esm/icons/heart";
import { gsap } from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import useSettingsStore from "@/stores/useSettingsStore";
import { shallow } from "zustand/shallow";

gsap.registerPlugin(ScrollTrigger);

const GUIDE_SECTIONS = [
  {
    id: "intro",
    title: "Apa itu haid?",
    description:
      "Haid adalah proses alami ketika lapisan rahim dilepaskan dan keluar sebagai darah. Siklus ini tanda tubuhmu sehat dan sedang tumbuh.",
    accent: "from-pink-100 via-white to-orange-50",
    visual: {
      icon: SparklesIcon,
      alt: "Remaja tersenyum memegang buku catatan",
      palette: {
        primary: "#fce7f3",
        secondary: "#f9a8d4",
        accent: "#fdf2f8",
        highlight: "#f472b6",
        icon: "#be185d"
      }
    }
  },
  {
    id: "signs",
    title: "Tanda-tanda akan mulai haid",
    description:
      "Payudara mulai berkembang, tumbuh rambut halus, atau muncul bercak di pakaian dalam. Setiap tubuh berbeda, jadi santai saja dan amati perlahan.",
    accent: "from-rose-100 via-white to-purple-50",
    visual: {
      icon: BookOpenIcon,
      alt: "Dua remaja membaca buku bersama",
      palette: {
        primary: "#ede9fe",
        secondary: "#d8b4fe",
        accent: "#f3e8ff",
        highlight: "#a855f7",
        icon: "#7c3aed"
      }
    }
  },
  {
    id: "prep",
    title: "Persiapan yang bisa kamu lakukan",
    description:
      "Siapkan pembalut atau menstrual pad, catat perkiraan tanggal, dan sediakan tas kecil berisi kebutuhan daruratmu. Jangan lupa simpan nomor orang dewasa yang bisa kamu hubungi.",
    accent: "from-amber-100 via-white to-green-50",
    visual: {
      icon: CalendarIcon,
      alt: "Remaja menunjuk kalender",
      palette: {
        primary: "#ddfce7",
        secondary: "#bbf7d0",
        accent: "#ecfdf3",
        highlight: "#34d399",
        icon: "#047857"
      }
    }
  },
  {
    id: "support",
    title: "Cara dukung teman",
    description:
      "Tawarkan bantuan dengan ramah, bantu mereka merasa nyaman, dan jaga privasi. Saling dukung bikin semua merasa lebih tenang dan percaya diri.",
    accent: "from-blue-100 via-white to-emerald-50",
    visual: {
      icon: HeartIcon,
      alt: "Remaja berpelukan memberikan dukungan",
      palette: {
        primary: "#dbeafe",
        secondary: "#93c5fd",
        accent: "#e0f2fe",
        highlight: "#60a5fa",
        icon: "#2563eb"
      }
    }
  }
];

export default function FirstPeriodGuide({ onComplete }) {
  const containerRef = useRef(null);
  const settingsState = useSettingsStore((state) => state, shallow);
  const { settings, hydrate } = settingsState;
  const [activeSection, setActiveSection] = useState(GUIDE_SECTIONS[0].id);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!containerRef.current) {
      return undefined;
    }

    const guideSections = Array.from(containerRef.current.querySelectorAll("[data-guide-section]"));

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible.length > 0) {
          const nextActive = visible[0].target.getAttribute("data-guide-section");
          if (nextActive) {
            setActiveSection(nextActive);
          }
        }
      },
      {
        root: null,
        threshold: [0.25, 0.5, 0.75]
      }
    );

    guideSections.forEach((section) => observer.observe(section));

    let ctx;
    if (!settings.reducedMotion) {
      ctx = gsap.context(() => {
        guideSections.forEach((section) => {
          ScrollTrigger.create({
            trigger: section,
            start: "top 80%",
            once: true,
            onEnter: () => {
              gsap.fromTo(
                section,
                { autoAlpha: 0, y: 24 },
                {
                  autoAlpha: 1,
                  y: 0,
                  duration: 0.6,
                  ease: "power2.out"
                }
              );
            }
          });
        });
      }, containerRef);
    }

    return () => {
      guideSections.forEach((section) => observer.unobserve(section));
      observer.disconnect();
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      if (ctx) {
        ctx.revert();
      }
    };
  }, [settings.reducedMotion]);

  const progressItems = useMemo(
    () =>
      GUIDE_SECTIONS.map((section) => ({
        id: section.id,
        title: section.title
      })),
    []
  );

  return (
    <div ref={containerRef} className="space-y-8">
      <header className="rounded-3xl bg-linear-to-r from-pink-100 via-white to-pink-50 p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-pink-500">
          Panduan pertama kali
        </p>
        <h3 className="mt-2 text-2xl font-semibold text-slate-800">
          Yuk kenalan pelan-pelan dengan tubuhmu
        </h3>
        <p className="mt-2 text-sm text-slate-600">
          Baca pelan-pelan, kamu bisa kembali kapan saja. Kami siapkan versi ringan dan mudah dipahami.
        </p>
      </header>

      <div className="flex flex-col gap-6 md:flex-row">
        <nav aria-label="Progress panduan" className="md:w-48">
          <ol className="flex flex-row justify-between md:flex-col md:gap-4">
            {progressItems.map((item, index) => {
              const isActive = item.id === activeSection;
              return (
                <li key={item.id} className="flex items-center gap-3">
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold transition-colors ${
                      isActive ? "border-pink-500 bg-pink-500 text-white" : "border-pink-200 bg-white text-pink-400"
                    }`}
                    aria-hidden="true"
                  >
                    {index + 1}
                  </span>
                  <span
                    className={`text-xs font-medium ${isActive ? "text-pink-600" : "text-slate-400"}`}
                    aria-current={isActive ? "step" : undefined}
                  >
                    {item.title}
                  </span>
                </li>
              );
            })}
          </ol>
        </nav>

        <div className="flex-1 space-y-6" aria-label="Panduan persiapan haid">
          {GUIDE_SECTIONS.map((section, index) => (
            <section
              key={section.id}
              id={section.id}
              aria-labelledby={`${section.id}-heading`}
              data-guide-section={section.id}
              className="rounded-2xl border border-pink-100 bg-white p-6 shadow-sm"
            >
              <div className={`grid gap-4 sm:grid-cols-[auto_1fr] sm:items-center bg-linear-to-r ${section.accent} rounded-2xl p-5`}>
                <div className="relative h-28 w-28 overflow-hidden rounded-2xl bg-white/70 shadow-sm">
                  <AbstractIllustration
                    alt={section.visual.alt}
                    icon={section.visual.icon}
                    palette={section.visual.palette}
                    id={`guide-${section.id}`}
                    className="h-full w-full"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/70 text-base font-semibold text-pink-600" aria-hidden="true">
                      {index + 1}
                    </span>
                    <h4 id={`${section.id}-heading`} className="text-lg font-semibold text-slate-800">{section.title}</h4>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">{section.description}</p>
                </div>
              </div>
            </section>
          ))}
        </div>
      </div>

      <div className="flex flex-col items-center gap-3 rounded-3xl bg-white p-6 text-center shadow-sm">
        <p id="guide-save-hint" className="text-sm text-slate-600">Simpan halaman ini kalau butuh baca ulang ya!</p>
        <button data-ripple="true"
          type="button"
          className="relative cursor-pointer rounded-full bg-pink-500 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-transform duration-200 ease-out hover:shadow-lg motion-safe:hover:scale-[1.03] motion-reduce:transform-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-600 overflow-hidden"
          aria-label="Selesai membaca panduan, kembali ke dashboard" aria-describedby="guide-save-hint"
          onClick={onComplete}
        >
          Siap mulai tracking saat waktunya tiba
        </button>
      </div>
    </div>
  );
}

