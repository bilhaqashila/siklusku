'use client';

import { useState, useCallback, useMemo } from 'react';
import { Heart, Droplets, MessageCircle, Calendar } from 'lucide-react';
import useSiklusStore from '../../store/useSiklusStore';

const FLOW_LEVELS = [
  { id: 1, label: 'Ringan', color: 'bg-pink-100 text-pink-600', emoji: '💧' },
  { id: 2, label: 'Sedang', color: 'bg-pink-200 text-pink-700', emoji: '💧💧' },
  { id: 3, label: 'Banyak', color: 'bg-pink-300 text-pink-800', emoji: '💧💧💧' },
  { id: 4, label: 'Sangat Banyak', color: 'bg-red-200 text-red-700', emoji: '💧💧💧💧' },
];

const SYMPTOMS = [
  { id: 'cramps', label: 'Kram perut', emoji: '😣' },
  { id: 'headache', label: 'Sakit kepala', emoji: '🤕' },
  { id: 'bloating', label: 'Perut kembung', emoji: '😮‍💨' },
  { id: 'backache', label: 'Sakit punggung', emoji: '😰' },
  { id: 'fatigue', label: 'Lelah', emoji: '😴' },
  { id: 'acne', label: 'Jerawatan', emoji: '😔' },
];

const MOODS = [
  { id: 'happy', label: 'Senang', emoji: '😊', color: 'bg-yellow-100 text-yellow-700' },
  { id: 'sad', label: 'Sedih', emoji: '😢', color: 'bg-blue-100 text-blue-700' },
  { id: 'angry', label: 'Kesal', emoji: '😠', color: 'bg-red-100 text-red-700' },
  { id: 'anxious', label: 'Cemas', emoji: '😰', color: 'bg-purple-100 text-purple-700' },
  { id: 'normal', label: 'Biasa aja', emoji: '😐', color: 'bg-gray-100 text-gray-700' },
];

export default function DailyTracker() {
  const { addDailyLog } = useSiklusStore();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [selectedFlow, setSelectedFlow] = useState(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [selectedMood, setSelectedMood] = useState(null);
  const [story, setStory] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleSymptom = useCallback((symptomId) => {
    setSelectedSymptoms((prev) => (prev.includes(symptomId) ? prev.filter((id) => id !== symptomId) : [...prev, symptomId]));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!selectedMood) return;

    setIsSubmitting(true);
    try {
      const logData = {
        date: selectedDate,
        mood: selectedMood,
        flow: selectedFlow,
        symptoms: selectedSymptoms,
        story: story.trim(),
        timestamp: new Date().toISOString(),
      };

      await addDailyLog(logData);

      // Reset form
      setSelectedFlow(null);
      setSelectedSymptoms([]);
      setSelectedMood(null);
      setStory('');

      // Show success feedback
      setTimeout(() => setIsSubmitting(false), 500);
    } catch (error) {
      console.error('Failed to save daily log:', error);
      setIsSubmitting(false);
    }
  }, [selectedDate, selectedMood, selectedFlow, selectedSymptoms, story, addDailyLog]);

  const isFormValid = useMemo(() => selectedMood !== null, [selectedMood]);

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-pink-100 p-6 space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-slate-800 flex items-center justify-center gap-2">
          <Calendar className="w-5 h-5 text-pink-500" />
          Jurnal harianku
        </h2>
        <p className="text-sm text-slate-600 mt-1">Catat perasaan dan kondisimu hari ini</p>
      </div>

      {/* Date Selector */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">Tanggal</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          max={new Date().toISOString().slice(0, 10)}
          className="w-full p-3 border border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
        />
      </div>

      {/* Mood Selection */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
          <Heart className="w-4 h-4 text-pink-500" />
          Mood hari ini *
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {MOODS.map((mood) => (
            <button
              key={mood.id}
              type="button"
              onClick={() => setSelectedMood(mood.id)}
              className={`p-3 rounded-xl border-2 transition-all text-center ${selectedMood === mood.id ? `${mood.color} border-current` : 'border-gray-200 hover:border-pink-300'}`}
            >
              <div className="text-2xl mb-1">{mood.emoji}</div>
              <div className="text-xs font-medium">{mood.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Flow Level */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
          <Droplets className="w-4 h-4 text-pink-500" />
          Banyaknya haid (opsional)
        </label>
        <div className="grid grid-cols-2 gap-2">
          {FLOW_LEVELS.map((flow) => (
            <button
              key={flow.id}
              type="button"
              onClick={() => setSelectedFlow(flow.id)}
              className={`p-3 rounded-xl border-2 transition-all text-center ${selectedFlow === flow.id ? `${flow.color} border-current` : 'border-gray-200 hover:border-pink-300'}`}
            >
              <div className="text-lg mb-1">{flow.emoji}</div>
              <div className="text-xs font-medium">{flow.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Symptoms */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-slate-700">Gejala yang dirasakan (pilih yang sesuai)</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {SYMPTOMS.map((symptom) => (
            <button
              key={symptom.id}
              type="button"
              onClick={() => toggleSymptom(symptom.id)}
              className={`p-3 rounded-xl border-2 transition-all text-center ${selectedSymptoms.includes(symptom.id) ? 'bg-pink-100 text-pink-700 border-pink-300' : 'border-gray-200 hover:border-pink-300'}`}
            >
              <div className="text-lg mb-1">{symptom.emoji}</div>
              <div className="text-xs font-medium">{symptom.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Story/Notes */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-pink-500" />
          Cerita hari ini (opsional)
        </label>
        <textarea
          value={story}
          onChange={(e) => setStory(e.target.value)}
          placeholder="Tulis cerita atau catatan khusus hari ini..."
          rows={3}
          maxLength={500}
          className="w-full p-3 border border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
        />
        <div className="text-xs text-slate-500 text-right">{story.length}/500 karakter</div>
      </div>

      {/* Submit Button */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={!isFormValid || isSubmitting}
        className={`w-full py-3 rounded-xl font-semibold transition-all ${isFormValid && !isSubmitting ? 'bg-pink-500 text-white hover:bg-pink-600 hover:shadow-lg' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
      >
        {isSubmitting ? 'Menyimpan...' : 'Simpan Jurnal Hari Ini'}
      </button>
    </div>
  );
}
