"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import COPY_ID from "@/lib/siklus/copy/id";

const focusableSelectors = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
const illustrationSrc = "/image/calendar-teen.png";
const welcomeCardSrc = "/image/onboarding-welcome-card.png";

export default function OnboardingGate({ open, onBelum, onSudah }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!open || !containerRef.current) {
      return undefined;
    }

    const overlay = containerRef.current;
    const panel = overlay.querySelector(".gate-panel");

    const ctx = gsap.context((gsapContext) => {
      gsap.set(overlay, { autoAlpha: 0 });
      gsap.set(panel, { autoAlpha: 0, scale: 0.92, y: 24 });

      gsap
        .timeline({ defaults: { ease: "power2.out" } })
        .to(overlay, { autoAlpha: 1, duration: 0.2 })
        .to(panel, { autoAlpha: 1, scale: 1, y: 0, duration: 0.35 }, "<");

      const buttons = panel.querySelectorAll("[data-gate-button]");
      buttons.forEach((button) => {
        const hoverTimeline = gsap
          .timeline({ paused: true })
          .to(button, { scale: 1.05, duration: 0.18, ease: "power2.out" });

        const handleEnter = () => hoverTimeline.play();
        const handleLeave = () => hoverTimeline.reverse();

        button.addEventListener("pointerenter", handleEnter);
        button.addEventListener("pointerleave", handleLeave);
        button.addEventListener("pointercancel", handleLeave);

        gsapContext.add(() => {
          button.removeEventListener("pointerenter", handleEnter);
          button.removeEventListener("pointerleave", handleLeave);
          button.removeEventListener("pointercancel", handleLeave);
        });
      });
    }, containerRef);

    const focusables = overlay.querySelectorAll(focusableSelectors);
    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    const handleKeyDown = (event) => {
      if (event.key === "Tab") {
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
      if (event.key === "Escape") {
        event.preventDefault();
      }
    };

    overlay.addEventListener("keydown", handleKeyDown);
    first?.focus();

    return () => {
      ctx.revert();
      overlay.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  if (!open) {
    return null;
  }

  const copy = COPY_ID.onboarding.gate;

  function handleChoice(callback) {
    if (!containerRef.current) {
      callback();
      return;
    }

    const overlay = containerRef.current;
    const panel = overlay.querySelector(".gate-panel");

    gsap
      .timeline({ defaults: { ease: "power2.in" }, onComplete: callback })
      .to(panel, { autoAlpha: 0, y: -20, scale: 0.94, duration: 0.22 })
      .to(overlay, { autoAlpha: 0, duration: 0.18 }, "<0.05");
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
      aria-describedby="onboarding-subtitle"
    >
      <div className="gate-panel w-full max-w-3xl rounded-[32px] bg-white/95 p-6 shadow-2xl sm:p-8">
        <div className="grid gap-6 sm:grid-cols-[1.1fr_0.9fr] sm:items-center">
          <div className="space-y-5 text-center sm:text-left">
            <div className="mx-auto h-24 w-48 sm:hidden">
              <Image
                src={welcomeCardSrc}
                alt="Kartu sambutan Siklusku"
                width={192}
                height={96}
                className="h-full w-full rounded-2xl object-cover"
                priority
              />
            </div>
            <span className="inline-flex items-center gap-2 rounded-full bg-pink-100 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-pink-600">
              RISA - Siklusku
            </span>
            <div>
              <h2 id="onboarding-title" className="text-3xl font-semibold text-slate-900">
                {copy.title}
              </h2>
              <p id="onboarding-subtitle" className="mt-3 text-sm text-slate-600">
                {copy.subtitle}
              </p>
            </div>
            <ul className="flex flex-col gap-2 text-left text-sm text-slate-600">
              <li className="flex items-start gap-2">
                <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-pink-500" aria-hidden="true" />
                <span>Catat haid, mood, dan gejala dengan aman di perangkatmu.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-pink-500" aria-hidden="true" />
                <span>Dapatkan panduan sesuai kebutuhanmu saat ini.</span>
              </li>
            </ul>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <button
                type="button"
                role="button"
                aria-label={copy.no}
                data-gate-button
                className="inline-flex min-h-[52px] w-full items-center justify-center rounded-full bg-pink-500 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-pink-200/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-600 sm:flex-1"
                onClick={() => handleChoice(onBelum)}
              >
                {copy.no}
              </button>
              <button
                type="button"
                role="button"
                aria-label={copy.yes}
                data-gate-button
                className="inline-flex min-h-[52px] w-full items-center justify-center rounded-full border border-pink-200 bg-white px-6 py-3 text-base font-semibold text-pink-600 shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-600 sm:flex-1"
                onClick={() => handleChoice(onSudah)}
              >
                {copy.yes}
              </button>
            </div>
            <p className="text-xs text-slate-500">
              Kami tidak menyimpan data di server. Semua informasi tersimpan di perangkatmu.
            </p>
          </div>
          <div className="relative hidden justify-center sm:flex">
            <div className="relative h-64 w-64">
              <Image
                src={welcomeCardSrc}
                alt="Pesan sambutan Siklusku"
                fill
                sizes="(max-width: 1024px) 220px, 256px"
                className="rounded-3xl object-cover opacity-30"
              />
              <div className="absolute inset-0 rounded-full bg-pink-100 blur-3xl" aria-hidden="true" />
              <Image
                src={illustrationSrc}
                alt="Ilustrasi remaja menunjuk kalender menstruasi"
                fill
                priority
                sizes="(max-width: 768px) 160px, 256px"
                className="rounded-3xl object-cover shadow-lg"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}