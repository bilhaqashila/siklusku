"use client";

import { useState, useMemo } from "react";
import useSiklusStore from "@/stores/useSiklusStore";

export const MOOD_OPTIONS = [
  { 
    emoji: "😊", 
    mood: "Senang",     
    label: "Senang",     
    color: "bg-green-50 text-green-600 border-green-200 hover:bg-green-100",   
    chartColor: "#bbf7d0" 
  },
  { 
    emoji: "😐", 
    mood: "Biasa",   
    label: "Biasa",      
    color: "bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100",    
    chartColor: "#bfdbfe" 
  },
  { 
    emoji: "😢", 
    mood: "Sedih",       
    label: "Sedih",      
    color: "bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-100",        
    chartColor: "#d8b4fe" 
  },
  { 
    emoji: "😴", 
    mood: "Lelah",     
    label: "Lelah",      
    color: "bg-pink-50 text-pink-600 border-pink-200 hover:bg-pink-100", 
    chartColor: "#fbcfe8" 
  },
  { 
    emoji: "⚡", 
    mood: "Bersemangat", 
    label: "Bersemangat",  
    color: "bg-yellow-50 text-yellow-600 border-yellow-200 hover:bg-yellow-100", 
    chartColor: "#fef3c7" 
  }
];

export default function MoodLogger() {
  const moodLogs = useSiklusStore((s) => s.moodLogs);
  const addMoodLog = useSiklusStore((s) => s.addMoodLog);
  const replaceMoodLogs = useSiklusStore((s) => s.replaceMoodLogs);

  const [selectedMood, setSelectedMood] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const todayISO = new Date().toISOString().slice(0, 10);
  const todayMood = useMemo(
    () => moodLogs.find((l) => l.date === todayISO) || null,
    [moodLogs, todayISO]
  );

  // set default selected state from existing log
  if (!selectedMood && todayMood) {
    const opt = MOOD_OPTIONS.find((o) => o.mood === todayMood.mood);
    if (opt) setSelectedMood(opt);
  }

  function commitMood(option) {
    const entry = {
      date: todayISO,
      mood: option.mood,
      emoji: option.emoji
    };

    if (todayMood) {
      // ✅ overwrite: ganti entri hari ini
      const next = moodLogs.filter((l) => l.date !== todayISO).concat(entry);
      replaceMoodLogs(next);
    } else {
      // tambah baru
      addMoodLog(entry);
    }

    setSelectedMood(option);
    setShowSuccess(true);
    window.setTimeout(() => setShowSuccess(false), 2000);
  }

  return (
    <section className="rounded-3xl border border-pink-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
            Bagaimana perasaanmu hari ini?
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Pilih salah satu untuk mencatat mood harianmu.
          </p>
        </div>

        {/* Tampilan ringkas jika sudah ada mood hari ini */}
        {todayMood ? (
          <div className="flex flex-col items-center p-4 rounded-2xl bg-pink-50 border border-pink-100">
            <p className="text-sm text-slate-600 mb-2">Mood hari ini:</p>
            <div className="flex items-center gap-2">
              <span className="text-3xl" aria-hidden="true">{todayMood.emoji}</span>
              <span className="font-medium text-slate-800">
                {MOOD_OPTIONS.find((o) => o.mood === todayMood.mood)?.label}
              </span>
            </div>
            <p className="mt-3 text-xs text-slate-500">
              Klik pilihan lain di bawah untuk mengganti.
            </p>
          </div>
        ) : null}

        {/* Pilihan mood */}
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3">
          {MOOD_OPTIONS.map((option) => (
            <button
              key={option.mood}
              type="button"
              onClick={() => commitMood(option)}
              className={`flex flex-col items-center gap-1 sm:gap-2 rounded-xl sm:rounded-2xl border p-2 sm:p-4 text-center transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-500 cursor-pointer ${option.color} ${
                selectedMood?.mood === option.mood ? "ring-2 ring-pink-500 ring-offset-1 sm:ring-offset-2" : ""
              }`}
              aria-label={`Catat mood ${option.label}`}
            >
              <span className="text-xl sm:text-2xl" aria-hidden="true">{option.emoji}</span>
              <span className="text-[10px] sm:text-xs font-medium">{option.label}</span>
            </button>
          ))}
        </div>

        {showSuccess && (
          <div className="flex items-center justify-center gap-2 rounded-2xl bg-green-100 p-3 text-sm font-medium text-green-700">
            <span className="text-green-500" aria-hidden="true">✓</span>
            <span>Mood hari ini tersimpan.</span>
          </div>
        )}
      </div>
    </section>
  );
}
