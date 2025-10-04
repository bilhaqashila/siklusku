"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import AbstractIllustration from "./AbstractIllustration";
import HeartIcon from "lucide-react/dist/esm/icons/heart";
import { gsap } from "gsap";

const focusableSelectors = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
const confettiColors = ["#FF6B9F", "#FFD166", "#9DDE7A", "#6C5CE7", "#5AC8FA"];
const confettiPieces = Array.from({ length: 18 }, (_, index) => ({
  id: index,
  left: (index * 7) % 100,
  delay: (index % 6) * 0.12,
  duration: 1.1 + (index % 4) * 0.15,
  color: confettiColors[index % confettiColors.length],
  rotation: (index % 2 === 0 ? 1 : -1) * (12 + index * 3)
}));

const LOVE_LETTER_PALETTE = {
  primary: "#fdf2f8",
  secondary: "#fb7185",
  accent: "#fde8f3",
  highlight: "#f43f5e",
  icon: "#be123c"
};

export default function LoveLetterModal({ open, onClose, reducedMotion }) {
  const overlayRef = useRef(null);
  const [closeEnabled, setCloseEnabled] = useState(false);
  const [remaining, setRemaining] = useState(3);

  useEffect(() => {
    if (!open) {
      setCloseEnabled(false);
      setRemaining(5);
      return undefined;
    }

    setCloseEnabled(false);
    setRemaining(5);

    const timeout = setTimeout(() => {
      setCloseEnabled(true);
    }, 5000);

    const interval = setInterval(() => {
      setRemaining((previous) => {
        if (previous <= 1) {
          clearInterval(interval);
          return 0;
        }
        return previous - 1;
      });
    }, 1000);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [open]);

  useEffect(() => {
    if (!open || !overlayRef.current) {
      return undefined;
    }

    const overlay = overlayRef.current;
    const panel = overlay.querySelector(".love-letter-panel");
    const previouslyActive = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    let ctx;
    if (!reducedMotion) {
      ctx = gsap.context(() => {
        gsap.set(overlay, { autoAlpha: 0 });
        gsap.set(panel, { autoAlpha: 0, y: 24, scale: 0.95 });
        gsap
          .timeline({ defaults: { ease: "power2.out" } })
          .to(overlay, { autoAlpha: 1, duration: 0.2 })
          .to(panel, { autoAlpha: 1, y: 0, scale: 1, duration: 0.4 }, "<0.05");
      }, overlayRef);
    }

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
        if (closeEnabled) {
          onClose?.();
        }
      }
    };

    overlay.addEventListener("keydown", handleKeyDown);
    first?.focus();

    return () => {
      overlay.removeEventListener("keydown", handleKeyDown);
      if (ctx) {
        ctx.revert();
      }
      document.body.style.overflow = previousOverflow;
      if (previouslyActive && previouslyActive instanceof HTMLElement) {
        previouslyActive.focus();
      }
    };
  }, [open, onClose, reducedMotion]);

  const confettiStyle = useMemo(
    () =>
      confettiPieces.map((piece) => ({
        left: `${piece.left}%`,
        animationDelay: `${piece.delay}s`,
        animationDuration: `${piece.duration}s`,
        backgroundColor: piece.color,
        transform: `rotate(${piece.rotation}deg)`
      })),
    []
  );

  if (!open) {
    return null;
  }

  function handleCloseClick() {
    if (!closeEnabled) {
      return;
    }
    onClose?.();
  }

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="love-letter-title"
      aria-describedby="love-letter-intro love-letter-message"
    >
      <div className="love-letter-panel relative w-full max-w-2xl overflow-hidden rounded-[32px] border border-pink-100 bg-white/95 shadow-2xl">
        <div className="absolute inset-0 bg-linear-to-br from-pink-100 via-white to-slate-50" aria-hidden="true" />
        <div className="relative grid gap-6 p-8 sm:grid-cols-[1.1fr_0.9fr] sm:p-10">
          <div className="space-y-4 text-left text-slate-700">
            <div className="space-y-2">
              <h2 id="love-letter-title" className="text-3xl font-semibold text-slate-900 text-center">
                💌 Kamu Mendapat Surat Cinta 💌</h2>
              <p id="love-letter-intro" className="text-sm leading-relaxed text-slate-600">
                Hai sayangku, aku tubuhmu.</p>
              <p id="love-letter-message" className="text-sm leading-relaxed text-slate-600">
                Setiap bulan, aku membersihkan dan mempersiapkan ruang baru untukmu. Bukan karena ada yang salah, tapi karena aku sehat! Terimakasih sudah merawatku dengan lembut. Kita tumbuh bersama ya? Cukup dengarkan… dan catat.
              </p>
            </div>
            <div className="flex justify-center">
            <button
              type="button"
              className="mt-4 inline-flex items-center justify-center rounded-full bg-pink-500 px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-pink-200/60 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-600 disabled:cursor-not-allowed disabled:opacity-60"
              onClick={handleCloseClick}
              disabled={!closeEnabled}
              aria-disabled={!closeEnabled}
              aria-describedby="love-letter-countdown-message"
            >
              {closeEnabled ? "Mulai Mencatat" : `Tunggu ${remaining}s`}
            </button>
            <span
              id="love-letter-countdown-message"
              aria-live="polite"
              className="sr-only"
            >
              {closeEnabled ? "Tombol siap ditekan" : `Tombol siap dalam ${remaining} detik`}
            </span>
            </div>
           </div>
           <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 rounded-[28px]" aria-hidden="true" />
            <AbstractIllustration
              alt="Ilustrasi surat cinta"
              icon={HeartIcon}
              palette={LOVE_LETTER_PALETTE}
              id="love-letter-art"
              className="relative z-10 h-64 w-64 sm:h-72 sm:w-72"
            />
           </div>
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
