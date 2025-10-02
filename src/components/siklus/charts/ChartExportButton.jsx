"use client";

import { useState } from "react";

const CANVAS_SIZE = 1080;

export default function ChartExportButton({ filename = "siklusku-report.png", stats }) {
  const [downloading, setDownloading] = useState(false);

  function drawReport(context, data) {
    const gradient = context.createLinearGradient(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    gradient.addColorStop(0, "#fdf2f8");
    gradient.addColorStop(1, "#fce7f3");
    context.fillStyle = gradient;
    context.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    context.fillStyle = "#ec4899";
    context.font = "bold 68px 'Poppins', 'Arial', sans-serif";
    context.fillText("Ringkasan Siklusku", 80, 160);

    context.fillStyle = "#1f2937";
    context.font = "28px 'Inter', 'Arial', sans-serif";

    const items = [
      { label: "Rata-rata Siklus", value: `${data?.averageCycleLength ?? "-"} hari` },
      { label: "Rata-rata Menstruasi", value: `${data?.averagePeriodLength ?? "-"} hari` },
      { label: "Mood Dominan", value: data?.dominantMood ?? "-" },
      { label: "Total Log Mood", value: data?.moodEntries ?? 0 }
    ];

    items.forEach((item, index) => {
      const y = 260 + index * 120;
      context.fillStyle = "#ec4899";
      context.fillText(item.label, 80, y);
      context.fillStyle = "#1f2937";
      context.font = "bold 42px 'Inter', 'Arial', sans-serif";
      context.fillText(item.value, 80, y + 52);
      context.font = "28px 'Inter', 'Arial', sans-serif";
    });

    context.fillStyle = "#6b7280";
    context.font = "24px 'Inter', 'Arial', sans-serif";
    context.fillText("Generated with RISA Siklusku", 80, CANVAS_SIZE - 120);
    context.fillText(new Date().toLocaleDateString(), 80, CANVAS_SIZE - 80);
  }

  function handleDownload() {
    if (downloading) {
      return;
    }
    setDownloading(true);
    const canvas = document.createElement("canvas");
    canvas.width = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;
    const context = canvas.getContext("2d");
    drawReport(context, stats);
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = filename;
    link.click();
    setDownloading(false);
  }

  return (
    <button
      type="button"
      className="rounded-full border border-pink-200 bg-white px-4 py-2 text-sm font-medium text-pink-600 shadow-sm transition hover:scale-[1.01] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-500 cursor-pointer disabled:opacity-50"
      onClick={handleDownload}
      disabled={downloading}
      aria-label="Unduh ringkasan PNG"
    >
      {downloading ? "Menyiapkan..." : "Export PNG"}
    </button>
  );
}
