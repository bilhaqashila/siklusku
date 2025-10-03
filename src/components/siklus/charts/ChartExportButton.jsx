"use client";

import { useEffect, useMemo, useState } from "react";

const CANVAS_SIZE = 1080;
const MAX_LEGEND = 5;

function getLegendItems(legend) {
  if (!Array.isArray(legend)) {
    return [];
  }
  return legend
    .filter((item) => item && Number(item.count) > 0)
    .map((item) => ({
      label: item.label || item.mood || "-",
      mood: item.mood || item.label || "-",
      count: Number(item.count) || 0,
      color: item.color || "#94a3b8"
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, MAX_LEGEND);
}

function drawReport(context, data = {}, legendItems = []) {
  const gradient = context.createLinearGradient(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  gradient.addColorStop(0, "#fdf2f8");
  gradient.addColorStop(1, "#fce7f3");
  context.fillStyle = gradient;
  context.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

  context.fillStyle = "#ec4899";
  context.font = "bold 68px 'Poppins','Arial',sans-serif";
  context.fillText("Ringkasan Siklusku", 80, 160);

  const stats = [
    { label: "Rata-rata Siklus", value: `${data?.averageCycleLength ?? "-"} hari` },
    { label: "Rata-rata Menstruasi", value: `${data?.averagePeriodLength ?? "-"} hari` },
    { label: "Mood Dominan", value: data?.dominantMood ?? "-" },
    { label: "Total Log Mood", value: data?.moodEntries ?? 0 }
  ];

  context.font = "28px 'Inter','Arial',sans-serif";
  stats.forEach((item, index) => {
    const baseY = 260 + index * 120;
    context.fillStyle = "#ec4899";
    context.fillText(item.label, 80, baseY);
    context.fillStyle = "#1f2937";
    context.font = "bold 42px 'Inter','Arial',sans-serif";
    context.fillText(String(item.value), 80, baseY + 52);
    context.font = "28px 'Inter','Arial',sans-serif";
  });

  if (legendItems.length) {
    const legendStartX = 640;
    context.font = "bold 32px 'Inter','Arial',sans-serif";
    legendItems.forEach((item, index) => {
      const baseY = 260 + index * 90;
      context.fillStyle = item.color;
      context.fillRect(legendStartX, baseY - 28, 36, 36);
      context.fillStyle = "#1f2937";
      context.fillText(item.label, legendStartX + 52, baseY);
      context.font = "24px 'Inter','Arial',sans-serif";
      context.fillStyle = "#6b7280";
      context.fillText(`${item.count}x`, legendStartX + 52, baseY + 26);
      context.font = "bold 32px 'Inter','Arial',sans-serif";
    });
  }

  context.fillStyle = "#6b7280";
  context.font = "24px 'Inter','Arial',sans-serif";
  context.fillText("Generated with RISA Siklusku", 80, CANVAS_SIZE - 120);
  context.fillText(new Date().toLocaleDateString(), 80, CANVAS_SIZE - 80);
}

function buildShareSummary(data = {}, legendItems = []) {
  const lines = [
    "Ringkasan Siklusku",
    `Rata-rata siklus: ${data?.averageCycleLength ?? "-"} hari`,
    `Rata-rata menstruasi: ${data?.averagePeriodLength ?? "-"} hari`,
    `Mood dominan: ${data?.dominantMood ?? "-"}`,
    `Total log mood: ${data?.moodEntries ?? 0}`
  ];

  if (legendItems.length) {
    const top = legendItems
      .slice(0, 3)
      .map((item) => `${item.label} (${item.count}x)`)
      .join(", ");
    lines.push(`Mood terbanyak 30 hari terakhir: ${top}`);
  }

  lines.push("Unduh PNG di aplikasi Siklusku 💗");
  return lines.join("\n");
}

export default function ChartExportButton({ filename = "siklusku-report.png", stats, legend }) {
  const [downloading, setDownloading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [status, setStatus] = useState(null);

  const legendItems = useMemo(() => getLegendItems(legend), [legend]);

  useEffect(() => {
    if (!status) {
      return undefined;
    }
    const timeout = setTimeout(() => setStatus(null), 3500);
    return () => clearTimeout(timeout);
  }, [status]);

  function createCanvas() {
    const dpr = Math.max(1, Math.floor(window.devicePixelRatio || 1));
    const canvas = document.createElement("canvas");
    canvas.width = CANVAS_SIZE * dpr;
    canvas.height = CANVAS_SIZE * dpr;
    const context = canvas.getContext("2d");
    context.scale(dpr, dpr);
    drawReport(context, stats, legendItems);
    return canvas;
  }

  function handleDownload() {
    if (downloading) {
      return;
    }
    setDownloading(true);
    try {
      const canvas = createCanvas();
      const url = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.click();
    } finally {
      setDownloading(false);
    }
  }

  function handleShare() {
    if (sharing) {
      return;
    }
    if (typeof window === "undefined" || typeof navigator === "undefined") {
      setStatus("Bagikan tidak tersedia di perangkat ini");
      return;
    }

    setSharing(true);
    const canvas = createCanvas();
    const summary = buildShareSummary(stats, legendItems);

    canvas.toBlob(async (blob) => {
      if (!blob) {
        setStatus("Gagal menyiapkan ringkasan");
        setSharing(false);
        return;
      }
      try {
        const file = new File([blob], filename, { type: "image/png" });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: "Ringkasan Siklusku", text: summary });
          setStatus("Berhasil dibagikan");
        } else if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
          await navigator.clipboard.writeText(summary);
          setStatus("Ringkasan teks tersalin");
        } else {
          setStatus("Bagikan tidak tersedia di perangkat ini");
        }
      } catch (error) {
        setStatus("Gagal membagikan. Coba lagi ya.");
      } finally {
        setSharing(false);
      }
    }, "image/png");
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="rounded-full border border-pink-200 bg-white px-4 py-2 text-sm font-medium text-pink-600 shadow-sm transition hover:scale-[1.01] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-500 disabled:opacity-50"
          onClick={handleDownload}
          disabled={downloading}
          aria-label="Unduh ringkasan PNG"
        >
          {downloading ? "Menyiapkan..." : "Export PNG"}
        </button>
        <button
          type="button"
          className="rounded-full border border-pink-200 bg-white px-4 py-2 text-sm font-medium text-pink-600 shadow-sm transition hover:scale-[1.01] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-500 disabled:opacity-50"
          onClick={handleShare}
          disabled={sharing}
          aria-label="Bagikan ringkasan"
        >
          {sharing ? "Menyiapkan..." : "Bagikan"}
        </button>
      </div>
      {status ? <p className="text-xs text-slate-500 dark:text-slate-400">{status}</p> : null}
    </div>
  );
}
