"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { Sparkles } from "lucide-react";
import AbstractIllustration from "./AbstractIllustration";

export default function OnboardingGate({ open, onBelum, onSudah, reducedMotion = false }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!open || !containerRef.current) return;

    const overlay = containerRef.current;
    const panel = overlay.querySelector(".gate-panel");

    // ===== Animations =====
    let ctx;
    if (!reducedMotion) {
      ctx = gsap.context((localCtx) => {
        gsap.set(overlay, { autoAlpha: 0 });
        gsap.set(panel, { autoAlpha: 0, scale: 0.92, y: 24 });

        gsap
          .timeline({ defaults: { ease: "power2.out" } })
          .to(overlay, { autoAlpha: 1, duration: 0.2 })
          .to(panel, { autoAlpha: 1, scale: 1, y: 0, duration: 0.35 }, "<");

        // Hover micro-interaction
        const buttons = panel.querySelectorAll("[data-gate-button][data-ripple='true']");
        buttons.forEach((button) => {
          const hoverTl = gsap.timeline({ paused: true }).to(button, {
            scale: 1.05,
            duration: 0.18,
            ease: "power2.out",
          });

          const enter = () => hoverTl.play();
          const leave = () => hoverTl.reverse();

          button.addEventListener("pointerenter", enter);
          button.addEventListener("pointerleave", leave);
          button.addEventListener("pointercancel", leave);

          localCtx.add(() => {
            button.removeEventListener("pointerenter", enter);
            button.removeEventListener("pointerleave", leave);
            button.removeEventListener("pointercancel", leave);
          });
        });

        // Pause animations when tab hidden
        const onVis = () =>
          document.hidden ? gsap.globalTimeline.pause() : gsap.globalTimeline.resume();
        document.addEventListener("visibilitychange", onVis);
        localCtx.add(() => document.removeEventListener("visibilitychange", onVis));
      }, containerRef);
    } else {
      overlay.style.opacity = "1";
      panel.style.opacity = "1";
      panel.style.transform = "none";
    }

    // ===== Focus trap =====
    const allCandidates = Array.from(
      overlay.querySelectorAll("button, [href], input, select, textarea, [tabindex]")
    );

    const focusables = allCandidates.filter((el) => {
      const tab = el.getAttribute("tabindex");
      const isNeg = tab !== null ? parseInt(tab, 10) < 0 : false;
      const hasDisabled = "disabled" in el;
      const disabled = hasDisabled ? el.disabled : el.getAttribute("disabled") !== null;
      const ariaHidden = el.getAttribute("aria-hidden") === "true";
      return !isNeg && !disabled && !ariaHidden;
    });

    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    const handleKeyDown = (event) => {
      if (event.key === "Tab" && focusables.length > 1) {
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
      if (event.key === "Escape") {
        event.preventDefault(); // prevent bubbling
      }
    };

    overlay.addEventListener("keydown", handleKeyDown);
    first?.focus();

    return () => {
      overlay.removeEventListener("keydown", handleKeyDown);
      if (ctx) ctx.revert();
    };
  }, [open, reducedMotion]);

  if (!open) return null;

  function handleChoice(callback) {
    if (!containerRef.current || reducedMotion) {
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

  const PALETTE = {
    primary: "#fce7f3",
    secondary: "#f9a8d4",
    accent: "#fdf2f8",
    highlight: "#f472b6",
    icon: "#be185d",
  };

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
          {/* Left column */}
          <div className="space-y-5 text-center sm:text-left">
            <div className="mx-auto h-24 w-48 sm:hidden">
              <AbstractIllustration
                alt="Kartu sambutan Siklusku"
                icon={Sparkles}
                palette={PALETTE}
                id="gate-mobile"
                className="h-full w-full"
              />
            </div>

            <span className="inline-flex items-center gap-2 rounded-full bg-pink-100 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-pink-600">
              RISA - Siklusku
            </span>

            <div>
              <h2 id="onboarding-title" className="text-3xl font-semibold text-slate-900">
                Apakah kamu sudah mengalami haid?
              </h2>
              <p id="onboarding-subtitle" className="mt-3 text-sm text-slate-600">
                Bangun kebiasaan mencatat siklus menstruasimu di sini!
              </p>
            </div>

            <ul
              id="onboarding-benefits"
              className="flex flex-col gap-2 text-left text-sm text-slate-600"
            >
              <li className="flex items-start gap-2">
                <span
                  className="mt-1 inline-flex h-2 w-2 rounded-full bg-pink-500"
                  aria-hidden="true"
                />
                <span>Catat haid, mood, dan gejala dengan aman di perangkatmu.</span>
              </li>
              <li className="flex items-start gap-2">
                <span
                  className="mt-1 inline-flex h-2 w-2 rounded-full bg-pink-500"
                  aria-hidden="true"
                />
                <span>Dapatkan informasi personal seputar kesehatan reproduksi.</span>
              </li>
            </ul>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <button
                type="button"
                aria-label="Belum pernah haid"
                data-gate-button
                data-ripple="true"
                className="relative inline-flex min-h-[52px] w-full items-center justify-center rounded-full bg-pink-500 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-pink-200/60 transition-transform duration-200 ease-out hover:shadow-xl motion-safe:hover:scale-[1.03] motion-reduce:transform-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-600 sm:flex-1 overflow-hidden"
                onClick={() => handleChoice(onBelum)}
              >
                Belum
              </button>

              <button
                type="button"
                aria-label="Sudah haid"
                data-gate-button
                data-ripple="true"
                className="relative inline-flex min-h-[52px] w-full items-center justify-center rounded-full border border-pink-200 bg-white px-6 py-3 text-base font-semibold text-pink-600 shadow-md transition-transform duration-200 ease-out hover:shadow-lg motion-safe:hover:scale-[1.03] motion-reduce:transform-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-600 sm:flex-1 overflow-hidden"
                onClick={() => handleChoice(onSudah)}
              >
                Sudah
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Kami tidak menyimpan data di server. Semua informasi tersimpan di perangkatmu.
            </p>
          </div>

          {/* Right column illustration */}
          <div className="relative hidden justify-center sm:flex">
            <div className="relative h-64 w-64">
              <div
                className="absolute inset-0 rounded-full bg-pink-100 blur-3xl"
                aria-hidden="true"
              />
              <AbstractIllustration
                alt="Ilustrasi remaja menunjuk kalender menstruasi"
                icon={Sparkles}
                palette={PALETTE}
                id="gate-desktop"
                className="relative z-10 h-full w-full"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
