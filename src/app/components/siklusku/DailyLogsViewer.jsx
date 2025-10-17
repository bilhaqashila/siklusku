'use client';

import { useMemo } from 'react';
import { Calendar, Heart, Droplets, MessageCircle } from 'lucide-react';
import useSiklusStore from '../../store/useSiklusStore';

const FLOW_LABELS = {
  1: { label: 'Ringan', emoji: '💧' },
  2: { label: 'Sedang', emoji: '💧💧' },
  3: { label: 'Banyak', emoji: '💧💧💧' },
  4: { label: 'Sangat Banyak', emoji: '💧💧💧💧' },
};

const MOOD_LABELS = {
  happy: { label: 'Senang', emoji: '😊' },
  sad: { label: 'Sedih', emoji: '😢' },
  angry: { label: 'Kesal', emoji: '😠' },
  anxious: { label: 'Cemas', emoji: '😰' },
  normal: { label: 'Biasa aja', emoji: '😐' },
};

const SYMPTOM_LABELS = {
  cramps: { label: 'Kram perut', emoji: '😣' },
  headache: { label: 'Sakit kepala', emoji: '🤕' },
  bloating: { label: 'Perut kembung', emoji: '😮💨' },
  backache: { label: 'Sakit punggung', emoji: '😰' },
  fatigue: { label: 'Lelah', emoji: '😴' },
  acne: { label: 'Jerawatan', emoji: '😔' },
};

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function DailyLogsViewer() {
  const dailyLogs = useSiklusStore((state) => state.dailyLogs || []);

  const recentLogs = useMemo(() => {
    return dailyLogs.slice(0, 7); // Show last 7 entries
  }, [dailyLogs]);

  if (!recentLogs.length) {
    return (
      <div className="bg-white rounded-3xl shadow-sm border border-pink-100 p-6 text-center">
        <Calendar className="w-12 h-12 text-pink-300 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-slate-800 mb-2">Belum Ada Jurnal</h3>
        <p className="text-sm text-slate-600">Mulai catat jurnal harianmu untuk melihat pola dan tren</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-pink-100 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-pink-500" />
        <h3 className="text-lg font-semibold text-slate-800">Riwayat jurnal harianku</h3>
      </div>

      <div className="space-y-4">
        {recentLogs.map((log, index) => (
          <div key={`${log.date}-${index}`} className="border border-pink-100 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-slate-800">{formatDate(log.date)}</h4>
              {log.mood && MOOD_LABELS[log.mood] && (
                <div className="flex items-center gap-2 bg-pink-50 px-3 py-1 rounded-full">
                  <span>{MOOD_LABELS[log.mood].emoji}</span>
                  <span className="text-sm font-medium text-pink-700">{MOOD_LABELS[log.mood].label}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              {/* Flow */}
              {log.flow && FLOW_LABELS[log.flow] && (
                <div className="flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-pink-500" />
                  <span className="text-slate-600">
                    {FLOW_LABELS[log.flow].emoji} {FLOW_LABELS[log.flow].label}
                  </span>
                </div>
              )}

              {/* Symptoms */}
              {log.symptoms && log.symptoms.length > 0 && (
                <div className="flex items-start gap-2">
                  <Heart className="w-4 h-4 text-pink-500 mt-0.5" />
                  <div className="flex flex-wrap gap-1">
                    {log.symptoms.map((symptomId) => {
                      const symptom = SYMPTOM_LABELS[symptomId];
                      return symptom ? (
                        <span key={symptomId} className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                          {symptom.emoji} {symptom.label}
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Story */}
            {log.story && (
              <div className="mt-3 pt-3 border-t border-pink-100">
                <div className="flex items-start gap-2">
                  <MessageCircle className="w-4 h-4 text-pink-500 mt-0.5" />
                  <p className="text-sm text-slate-600 italic">"{log.story}"</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {dailyLogs.length > 7 && (
        <div className="mt-4 text-center">
          <p className="text-sm text-slate-500">Menampilkan 7 jurnal terakhir dari {dailyLogs.length} total jurnal</p>
        </div>
      )}
    </div>
  );
}
