"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import useSettingsStore from "@/stores/useSettingsStore";
import { shallow } from "zustand/shallow";

const SECTIONS = [
  {
    id: "intro",
    title: "Apa itu haid?",
    description:
      "Haid adalah proses alami ketika tubuh melepaskan lapisan rahim setiap bulan. Siklus ini jadi tanda tubuhmu tumbuh dan sehat."
  },
  {
    id: "signs",
    title: "Tanda-tanda akan mulai haid",
    description:
      "Biasanya diawali dengan payudara yang mulai berkembang, tumbuh rambut halus, atau muncul bercak. Setiap tubuh berbeda, tidak perlu dibandingkan."
  },
  {
    id: "prep",
    title: "Persiapan yang bisa kamu lakukan",
    description:
      "Siapkan pembalut atau menstrual pad, catat tanggal perkiraan, dan sediakan tas kecil berisi kebutuhan daruratmu."
  },
  {
    id: "support",
    title: "Cara dukung teman",
    description:
      "Tawarkan bantuan dengan ramah, bantu mereka merasa nyaman, dan jaga privasi. Saling dukung bikin semua merasa lebih tenang."
  }
];

export default function FirstPeriodGuide({ onComplete }) {
  const containerRef = useRef(null);
  const settingsState = useSettingsStore((state) => state, shallow);
  const { settings, hydrate } = settingsState;

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!containerRef.current) {
      return undefined;
    }
    if (settings.reducedMotion) {
      return undefined;
    }
    const sections = containerRef.current.querySelectorAll("section");
    const ctx = gsap.context(() => {
      gsap.fromTo(
        sections,
        { autoAlpha: 0, y: 16 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: "power2.out"
        }
      );
    }, containerRef);
    return () => ctx.revert();
  }, [settings.reducedMotion]);

  return (
    <div ref={containerRef} className="space-y-8">
      <header className="rounded-3xl bg-gradient-to-r from-pink-100 via-white to-pink-50 p-6 shadow-sm">
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

      <div className="space-y-6" aria-label="Panduan persiapan haid">
        {SECTIONS.map((section, index) => (
          <section
            key={section.id}
            className="rounded-2xl border border-pink-100 bg-white p-6 shadow-xs"
          >
            <div className="flex items-start gap-4">
              <span
                className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-100 text-base font-semibold text-pink-600"
                aria-hidden="true"
              >
                {index + 1}
              </span>
              <div>
                <h4 className="text-lg font-semibold text-slate-800">{section.title}</h4>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {section.description}
                </p>
              </div>
            </div>
          </section>
        ))}
      </div>

      <div className="flex flex-col items-center gap-3 rounded-3xl bg-white p-6 text-center shadow-sm">
        <p className="text-sm text-slate-600">
          Simpan halaman ini kalau butuh baca ulang ya!
        </p>
        <button
          type="button"
          className="rounded-full bg-pink-500 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-transform duration-200 hover:scale-[1.02] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-600 cursor-pointer"
          aria-label="Selesai membaca panduan, kembali ke dashboard"
          onClick={onComplete}
        >
          Siap mulai tracking saat waktunya tiba
        </button>
      </div>
    </div>
  );
}


