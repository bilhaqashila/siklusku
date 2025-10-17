import React from 'react';
import useSiklusStore from '../../store/useSiklusStore';

export default function AchievementsCard() {
  const achievements = useSiklusStore((state) => state.achievements || []);

  if (!achievements || achievements.length === 0) {
    return (
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <h3 className="text-lg font-medium mb-2">Pencapaian</h3>
        <p className="text-gray-500 text-sm">
          Catat suasana hatimu secara rutin untuk mendapatkan pencapaian.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm">
      <h3 className="text-lg font-medium mb-3">Pencapaian</h3>
      
      <div className="space-y-2">
        {achievements.map(achievement => (
          <div key={achievement.id} className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-yellow-100 text-yellow-800">
              ðŸ†
            </span>
            <div>
              <p className="font-medium text-sm">{achievement.title}</p>
              <p className="text-xs text-gray-500">{achievement.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}