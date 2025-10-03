"use client";

import { useState, useEffect, useMemo } from "react";
import useSiklusStore from "@/stores/useSiklusStore";

export const MOOD_OPTIONS = [
  {
    emoji: "😊",
    mood: "happy",
    label: "Senang",
    color: "bg-green-100 text-green-600 border-green-200 hover:bg-green-200",
    chartColor: "#22c55e" // Green color for happy
  },
  {
    emoji: "😐",
    mood: "neutral",
    label: "Biasa",
    color: "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200",
    chartColor: "#3b82f6" // Blue color for neutral
  },
  {
    emoji: "😢",
    mood: "sad",
    label: "Sedih",
    color: "bg-blue-100 text-blue-600 border-blue-200 hover:bg-blue-200",
    chartColor: "#8b5cf6" // Purple color for sad
  },
  {
    emoji: "😴",
    mood: "tired",
    label: "Lelah",
    color: "bg-purple-100 text-purple-600 border-purple-200 hover:bg-purple-200",
    chartColor: "#ec4899" // Pink color for tired
  },
  {
    emoji: "⚡",
    mood: "energized",
    label: "Berenergi",
    color: "bg-yellow-100 text-yellow-600 border-yellow-200 hover:bg-yellow-200",
    chartColor: "#f97316" // Orange color for energized
  }
];

const MAX_NOTE_LENGTH = 280;

export default function MoodLogger() {
  const moodLogs = useSiklusStore((state) => state.moodLogs);
  const addMoodLog = useSiklusStore((state) => state.addMoodLog);
  const [selectedMood, setSelectedMood] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [note, setNote] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  // Get today's mood if it exists
  const todayMood = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return moodLogs.find(log => log.date === today) || null;
  }, [moodLogs]);

  // Set initial selected mood and note if they exist for today
  useEffect(() => {
    if (todayMood) {
      const moodOption = MOOD_OPTIONS.find(option => option.mood === todayMood.mood);
      setSelectedMood(moodOption || null);
      
      if (todayMood.note) {
        setNote(todayMood.note);
        setShowNoteInput(true);
      }
    } else {
      // Reset state if no mood for today
      setSelectedMood(null);
      setNote("");
      setShowNoteInput(false);
      setIsEditing(false);
    }
  }, [todayMood]);

  function handleMoodSelect(moodOption) {
    // Prevent multiple selections by checking if the same mood is already selected
    if (selectedMood?.mood === moodOption.mood) {
      return; // Don't count repeated clicks on the same mood
    }
    
    // If there's already a mood for today and we're not in edit mode, show warning
    if (todayMood && !isEditing) {
      setShowWarning(true);
      setShowSuccess(false);
      
      // Hide warning message after 3 seconds
      setTimeout(() => {
        setShowWarning(false);
      }, 3000);
      return;
    }

    const today = new Date().toISOString().slice(0, 10);
    const moodEntry = {
      date: today,
      mood: moodOption.mood,
      emoji: moodOption.emoji,
      note: note.trim() || undefined
    };

    addMoodLog(moodEntry);
    setSelectedMood(moodOption);
    setIsEditing(false);

    // Check if we're changing an existing mood or logging a new one
    const isChanging = todayMood && todayMood.mood !== moodOption.mood;

    setShowSuccess(true);
    setShowWarning(false);

    // Hide success message after 3 seconds
    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
  }

  function handleNoteChange(e) {
    const value = e.target.value;
    if (value.length <= MAX_NOTE_LENGTH) {
      setNote(value);
    }
  }

  function saveNote() {
    if (!selectedMood) return;
    
    const today = new Date().toISOString().slice(0, 10);
    const moodEntry = {
      date: today,
      mood: selectedMood.mood,
      emoji: selectedMood.emoji,
      note: note.trim() || undefined
    };

    addMoodLog(moodEntry);
    setShowSuccess(true);
    setIsEditing(false);
    setShowNoteInput(false); // Close the note input after saving
    
    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
  }

  function startEditing() {
    setIsEditing(true);
    setShowWarning(false);
  }

  function cancelEditing() {
    setIsEditing(false);
    
    // Reset to current mood data
    if (todayMood) {
      const moodOption = MOOD_OPTIONS.find(option => option.mood === todayMood.mood);
      setSelectedMood(moodOption || null);
      setNote(todayMood.note || "");
      setShowNoteInput(!!todayMood.note);
    }
  }

  return (
    <section className="rounded-3xl border border-pink-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
            Bagaimana perasaanmu hari ini?
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Catat mood harianmu untuk melihat pola emosimu
          </p>
        </div>

        {/* Show existing mood entry if not editing */}
        {todayMood && !isEditing ? (
          <div className="space-y-4">
            <div className="flex flex-col items-center p-4 rounded-2xl bg-pink-50 border border-pink-100">
              <p className="text-sm text-slate-600 mb-2">Mood hari ini:</p>
              <div className="flex items-center gap-2">
                <span className="text-3xl" role="img" aria-hidden="true">
                  {todayMood.emoji}
                </span>
                <span className="font-medium text-slate-800">
                  {MOOD_OPTIONS.find(option => option.mood === todayMood.mood)?.label}
                </span>
              </div>
              
              {todayMood.note && (
                <div className="mt-3 p-3 bg-white rounded-lg w-full">
                  <p className="text-sm text-slate-600">{todayMood.note}</p>
                </div>
              )}
              
              <button
                onClick={startEditing}
                className="mt-4 rounded-lg bg-pink-500 px-4 py-2 text-sm font-medium text-white hover:bg-pink-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-500"
              >
                Ubah Mood Hari Ini
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3">
              {MOOD_OPTIONS.map((option) => (
                <button
                  key={option.mood}
                  type="button"
                  onClick={() => handleMoodSelect(option)}
                  className={`flex flex-col items-center gap-1 sm:gap-2 rounded-xl sm:rounded-2xl border p-2 sm:p-4 text-center transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-500 cursor-pointer ${option.color} ${
                    selectedMood?.mood === option.mood ? "ring-2 ring-pink-500 ring-offset-1 sm:ring-offset-2" : ""
                  }`}
                  aria-label={`Catat mood ${option.label}`}
                >
                  <span className="text-xl sm:text-2xl" role="img" aria-hidden="true">
                    {option.emoji}
                  </span>
                  <span className="text-[10px] sm:text-xs font-medium">
                    {option.label}
                  </span>
                </button>
              ))}
            </div>

            {selectedMood && (
              <div className="space-y-2">
                {!showNoteInput ? (
                  <button
                    onClick={() => setShowNoteInput(true)}
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-500"
                  >
                    <span className="text-slate-400">+</span> Tambah catatan (opsional)
                  </button>
                ) : (
                  <div className="space-y-2">
                    <textarea
                      value={note}
                      onChange={handleNoteChange}
                      onBlur={() => note.trim() && saveNote()}
                      placeholder="Tulis catatan tentang perasaanmu hari ini..."
                      className="w-full resize-none rounded-lg border border-slate-200 p-3 text-sm text-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-500"
                      rows={3}
                      maxLength={MAX_NOTE_LENGTH}
                    ></textarea>
                    <div className="flex justify-between">
                      <span className="text-xs text-slate-400">
                        {note.length}/{MAX_NOTE_LENGTH} karakter
                      </span>
                      <button
                        onClick={saveNote}
                        className="rounded-lg bg-pink-500 px-4 py-1 text-sm font-medium text-white hover:bg-pink-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-500"
                      >
                        Simpan
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {isEditing && (
              <div className="flex justify-end">
                <button
                  onClick={cancelEditing}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-500"
                >
                  Batal
                </button>
              </div>
            )}
          </>
        )}

        {showSuccess && (
          <div className="flex items-center justify-center gap-2 rounded-2xl bg-green-100 p-3 text-sm font-medium text-green-700">
            <span className="text-green-500" aria-hidden="true">✓</span>
            <span>
              {isEditing
                ? "Mood hari ini berhasil diubah"
                : "Mood hari ini berhasil dicatat"}
            </span>
          </div>
        )}

        {showWarning && (
          <div className="flex items-center justify-center gap-2 rounded-2xl bg-amber-100 p-3 text-sm font-medium text-amber-700">
            <span className="text-amber-500" aria-hidden="true">⚠️</span>
            <span>
              Kamu sudah mencatat mood hari ini. Klik "Ubah Mood Hari Ini" untuk mengubahnya.
            </span>
          </div>
        )}
      </div>
    </section>
  );
}




