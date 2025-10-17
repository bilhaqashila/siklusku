"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";

const focusableSelectors =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
const confettiColors = ["#FF6B9F", "#FFD166", "#9DDE7A", "#6C5CE7", "#5AC8FA"];
const confettiPieces = Array.from({ length: 18 }, (_, index) => ({
  id: index,
  left: (index * 7) % 100,
  delay: (index % 6) * 0.12,
  duration: 1.1 + (index % 4) * 0.15,
  color: confettiColors[index % confettiColors.length],
  rotation: (index % 2 === 0 ? 1 : -1) * (12 + index * 3),
}));

export default function LoveLetterModal({ open, onClose, reducedMotion }) {
  const overlayRef = useRef(null);
  const [closeEnabled, setCloseEnabled] = useState(false);
  const [remaining, setRemaining] = useState(3);

  // Keep a ref in sync with closeEnabled so handlers inside effects can read latest value
  const closeEnabledRef = useRef(closeEnabled);
  useEffect(() => {
    closeEnabledRef.current = closeEnabled;
  }, [closeEnabled]);

  // Countdown gating
  useEffect(() => {
    if (!open) {
      setCloseEnabled(false);
      setRemaining(5);
      return;
    }

    setCloseEnabled(false);
    setRemaining(3);

    const timeout = setTimeout(() => setCloseEnabled(true), 3000);
    const interval = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [open]);

  // Mount/unmount effects, key handling, focus trap
  // 🔒 Dependency list is CONSTANT (length/order never changes)
  useEffect(() => {
    if (!open || !overlayRef.current) return;

    const overlay = overlayRef.current;
    const panel = overlay.querySelector(".love-letter-panel");
    const previouslyActive = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    let ctx;
    if (!reducedMotion) {
      ctx = gsap.context(() => {
        gsap.set(overlay, { autoAlpha: 0 });
        gsap.set(panel, { autoAlpha: 0, y: 24, scale: 0.98 });
        gsap
          .timeline({ defaults: { ease: "power2.out" } })
          .to(overlay, { autoAlpha: 1, duration: 0.18 })
          .to(panel, { autoAlpha: 1, y: 0, scale: 1, duration: 0.32 }, "<0.04");
      }, overlayRef);
    }

    const focusables = overlay.querySelectorAll(focusableSelectors);
    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    const handleKeyDown = (event) => {
      if (event.key === "Tab" && first && last) {
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
        if (closeEnabledRef.current) onClose?.();
      }
    };

    overlay.addEventListener("keydown", handleKeyDown);
    first?.focus();

    return () => {
      overlay.removeEventListener("keydown", handleKeyDown);
      if (ctx) ctx.revert();
      document.body.style.overflow = previousOverflow;
      if (previouslyActive && previouslyActive instanceof HTMLElement) {
        previouslyActive.focus();
      }
    };
  }, [open, onClose, reducedMotion]); // 👈 constant size/order

  const confettiStyle = useMemo(
    () =>
      confettiPieces.map((piece) => ({
        left: `${piece.left}%`,
        animationDelay: `${piece.delay}s`,
        animationDuration: `${piece.duration}s`,
        backgroundColor: piece.color,
        transform: `rotate(${piece.rotation}deg)`,
      })),
    []
  );

  if (!open) return null;

  function handleCloseClick() {
    if (!closeEnabled) return;
    onClose?.();
  }

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-3 sm:p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="love-letter-title"
      aria-describedby="love-letter-message"
    >
      <div className="love-letter-panel relative w-full max-w-[700px] overflow-hidden rounded-[24px] border border-pink-100 bg-white/95 shadow-2xl max-h-[92svh]">
        <div className="absolute inset-0 bg-linear-to-br from-pink-100 via-white to-slate-50" aria-hidden="true" />

        <div className="relative flex h-full flex-col">
          <header className="px-5 pb-2 pt-5 sm:px-8 sm:pt-8">
            <h2 id="love-letter-title" className="text-center text-2xl font-semibold text-slate-900 sm:text-3xl">
              💌 Kamu Mendapat Surat Cinta 💌
            </h2>
          </header>

          <div className="flex-1 overflow-auto px-5 py-4 sm:px-8 sm:py-6 overscroll-contain">
            <div className="grid items-center gap-6 sm:grid-cols-2">
              <div className="space-y-4 text-center text-slate-700 sm:text-left">
                <p id="love-letter-message" className="text-sm leading-relaxed text-slate-600">
                  Hai sayang.. aku tubuhmu 💖
                  <br />
                  <br />
                  Setiap bulan, aku membersihkan dan mempersiapkan ruang baru untukmu.
                  <br />
                  Bukan karena ada yang salah, tapi karena aku sehat!
                  <br />
                  <br />
                  Terimakasih sudah merawatku dengan lembut.
                  <br />
                  Kita tumbuh bersama ya? Cukup dengarkan… dan catat.
                </p>
              </div>

              <div className="relative mx-auto flex items-center justify-center">
                <img
                  src="/image/suratcinta.png"
                  alt="Ilustrasi surat cinta"
                  className="h-52 w-52 object-contain sm:h-64 sm:w-64"
                />
              </div>
            </div>
          </div>

          <footer className="sticky bottom-0 z-[1] bg-gradient-to-t from-white to-white/80 px-5 pb-5 pt-3 sm:px-8">
            <div className="flex justify-center">
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-full bg-pink-500 px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-pink-200/60 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-600 disabled:cursor-not-allowed disabled:opacity-60"
                onClick={handleCloseClick}
                disabled={!closeEnabled}
                aria-disabled={!closeEnabled}
                aria-describedby="love-letter-countdown-message"
              >
                {closeEnabled ? "Mulai Mencatat" : `Tunggu ${remaining}s`}
              </button>
              <span id="love-letter-countdown-message" aria-live="polite" className="sr-only">
                {closeEnabled ? "Tombol siap ditekan" : `Tombol siap dalam ${remaining} detik`}
              </span>
            </div>
          </footer>
        </div>

        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {confettiStyle.map((style, index) => (
            <span
              key={confettiPieces[index].id}
              data-confetti-piece
              className="confetti-piece"
              style={style}
              aria-hidden="true"
            />
          ))}
        </div>
      </div>

      <style jsx>{`
        .confetti-piece {
          position: absolute;
          top: -10%;
          width: 12px;
          height: 18px;
          border-radius: 9999px;
          opacity: 0;
          animation-name: confettiFall;
          animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
          animation-fill-mode: forwards;
        }
        @keyframes confettiFall {
          0% {
            transform: translate3d(0, -20px, 0) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          100% {
            transform: translate3d(0, 320px, 0) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
