"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

const focusableSelectors = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export default function OnboardingGate({ open, onBelum, onSudah }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    if (!containerRef.current) {
      return;
    }
    const ctx = gsap.context(() => {
      gsap.fromTo(
        containerRef.current.querySelector('.gate-panel'),
        { autoAlpha: 0, scale: 0.9 },
        {
          autoAlpha: 1,
          scale: 1,
          duration: 0.35,
          ease: "power2.out"
        }
      );
    }, containerRef);

    const target = containerRef.current;
    const focusables = target.querySelectorAll(focusableSelectors);
    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    function handleKeyDown(event) {
      if (event.key === "Tab") {
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
      if (event.key === "Escape") {
        event.preventDefault();
      }
    }

    target.addEventListener("keydown", handleKeyDown);
    first?.focus();

    return () => {
      ctx.revert();
      target.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  if (!open) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
    >
      <div className="gate-panel w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl focus:outline-none">
        <div className="mb-6 text-center">
          <span className="mb-2 inline-block text-4xl" role="img" aria-hidden="true">
            ??
          </span>
          <h2 id="onboarding-title" className="text-2xl font-semibold text-pink-600">
            Halo! Sudah pernah mengalami haid?
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Jawabanmu bantu kami menyiapkan panduan yang paling pas untukmu.
          </p>
        </div>
        <div className="flex flex-col gap-4">
          <button
            type="button"
            role="button"
            aria-label="Belum, saya belum pernah haid"
            className="w-full rounded-full bg-pink-500 py-3 text-base font-semibold text-white shadow-sm transition-transform duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-600 hover:scale-[1.02] cursor-pointer"
            onClick={onBelum}
          >
            Belum, bantu aku persiapan
          </button>
          <button
            type="button"
            role="button"
            aria-label="Sudah, saya mau lanjut isi data siklus"
            className="w-full rounded-full border border-pink-300 bg-white py-3 text-base font-semibold text-pink-600 shadow-sm transition-transform duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-600 hover:scale-[1.02] cursor-pointer"
            onClick={onSudah}
          >
            Sudah, siap lanjut
          </button>
        </div>
      </div>
    </div>
  );
}
