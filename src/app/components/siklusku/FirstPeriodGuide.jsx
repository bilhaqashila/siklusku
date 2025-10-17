'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { gsap } from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const GUIDE_SECTIONS = [
  {
    id: 'intro',
    title: 'Apa itu haid?',
    description: 'Haid (atau menstruasi) adalah proses alami di mana tubuh mengeluarkan darah dari rahim. Ini tandanya tubuh kamu sudah tumbuh menjadi perempuan dewasa.',
    accent: 'from-pink-100 via-white to-orange-50',
    visual: {
      imageSrc: '/image/placeholder-gate.png',
      alt: 'Remaja dan kalender haid',
    },
  },
  {
    id: 'signs',
    title: 'Kenapa haid bisa terjadi?',
    description: 'Setiap bulan, tubuhmu mempersiapkan rahim untuk kehamilan. Kalau nggak terjadi pembuahan, lapisan rahim dilepaskan dan keluar sebagai darah haid.',
    accent: 'from-rose-100 via-white to-purple-50',
    visual: {
      imageSrc: '/image/phase-luteal.png',
      alt: 'Remaja dan bulan',
    },
  },
  {
    id: 'prep',
    title: 'Persiapan apa yang bisa kamu lakukan?',
    description: 'Siapkan tas kecil berisi: tisu basah, pembalut, obat nyeri, dan celana dalam. Nanti kalau sudah haid, pahami siklusmu biar nggak kaget.',
    accent: 'from-amber-100 via-white to-green-50',
    visual: {
      imageSrc: '/image/hero-vaksin.png',
      alt: 'Remaja membawa obat',
    },
  },
  {
    id: 'support',
    title: 'Apa saja tanda menjelang haid?',
    description:
      '1-2 minggu sebelum haid kamu mungkin merasakan: kram perut, punggung pegal, jerawatan, mudah lelah, atau mood naik-turun. Semua itu normal! Tapi kalau ganggu aktivitasmu, catat aja di Siklusku. Pelajari polanya dan langsung cari bantuan kalau perlu.',
    accent: 'from-blue-100 via-white to-emerald-50',
    visual: {
      imageSrc: '/image/phase-menstruation.png',
      alt: 'Remaja membawa teh hangat',
    },
  },
];

export default function FirstPeriodGuide({ onComplete }) {
  const containerRef = useRef(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [activeSection, setActiveSection] = useState(GUIDE_SECTIONS[0].id);

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
    if (!containerRef.current) return;

    const guideSections = Array.from(containerRef.current.querySelectorAll('[data-guide-section]'));

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible.length > 0) {
          const nextActive = visible[0].target.getAttribute('data-guide-section');
          if (nextActive) setActiveSection(nextActive);
        }
      },
      { root: null, threshold: [0.25, 0.5, 0.75] }
    );

    guideSections.forEach((section) => observer.observe(section));

    let ctx;
    if (!reducedMotion) {
      ctx = gsap.context(() => {
        guideSections.forEach((section) => {
          ScrollTrigger.create({
            trigger: section,
            start: 'top 85%',
            once: true,
            onEnter: () => {
              gsap.fromTo(section, { autoAlpha: 0, y: 12, willChange: 'transform, opacity' }, { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power2.out', clearProps: 'will-change' });
            },
          });
        });
      }, containerRef);
    }

    return () => {
      guideSections.forEach((section) => observer.unobserve(section));
      observer.disconnect();
      ScrollTrigger.getAll().forEach((t) => t.kill());
      if (ctx) ctx.revert();
    };
  }, [reducedMotion]);

  const progressItems = useMemo(
    () =>
      GUIDE_SECTIONS.map((section) => ({
        id: section.id,
        title: section.title,
      })),
    []
  );

  return (
    <div ref={containerRef} className="space-y-8">
      <header className="rounded-3xl bg-linear-to-r from-pink-100 via-white to-pink-50 p-6 shadow-sm">
        <h3 className="mt-2 text-2xl font-semibold text-slate-800">Mari berkenalan dengan tubuhmu!</h3>
        <p className="mt-2 text-sm text-slate-600">Haid itu fase alami yang cuma dialami perempuan. Dan kamu gaperlu takut! Sini deh, aku kasih tau segalanya tentang haid.</p>
      </header>

      <div className="flex flex-col gap-6 md:flex-row">
        {/* Progress nav */}
        <nav aria-label="Progress panduan" className="overflow-visible px-2 md:w-48 md:px-0">
          <ol className="flex flex-row gap-x-3 justify-between md:flex-col md:gap-4">
            {progressItems.map((item, index) => {
              const isActive = item.id === activeSection;
              return (
                <li key={item.id} className="flex min-w-0 items-center gap-3">
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-colors ${
                      isActive ? 'border-pink-500 bg-pink-500 text-white' : 'border-pink-200 bg-white text-pink-400'
                    }`}
                    aria-hidden="true"
                  >
                    {index + 1}
                  </span>
                  <span className={`truncate text-xs font-medium ${isActive ? 'text-pink-600' : 'text-slate-400'}`} aria-current={isActive ? 'step' : undefined} title={item.title}>
                    {item.title}
                  </span>
                </li>
              );
            })}
          </ol>
        </nav>

        <div className="flex-1 space-y-6" aria-label="Panduan persiapan haid">
          {GUIDE_SECTIONS.map((section, index) => (
            <section key={section.id} id={section.id} aria-labelledby={`${section.id}-heading`} data-guide-section={section.id} className="rounded-2xl border border-pink-100 bg-white p-6 shadow-sm">
              <div className={`grid gap-4 sm:grid-cols-[auto_1fr] sm:items-center bg-linear-to-r ${section.accent} rounded-2xl p-5`}>
                <div className="relative flex h-28 w-28 items-center justify-center overflow-hidden rounded-2xl bg-white/70 shadow-sm">
                  <img src={section.visual.imageSrc} alt={section.visual.alt} className="h-full w-full object-contain" />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/70 text-base font-semibold text-pink-600" aria-hidden="true">
                      {index + 1}
                    </span>
                    <h4 id={`${section.id}-heading`} className="text-lg font-semibold text-slate-800">
                      {section.title}
                    </h4>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">{section.description}</p>
                </div>
              </div>
            </section>
          ))}
        </div>
      </div>

      <div className="flex flex-col items-center gap-3 rounded-3xl bg-white p-6 text-center">
        <button
          data-ripple="true"
          type="button"
          className="relative cursor-pointer rounded-full bg-pink-500 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-transform duration-200 ease-out hover:shadow-lg motion-safe:hover:scale-[1.03] motion-reduce:transform-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-600 overflow-hidden"
          aria-label="Selesai membaca panduan, kembali ke dashboard"
          onClick={onComplete}
        >
          Buka Siklusku
        </button>
      </div>
    </div>
  );
}
