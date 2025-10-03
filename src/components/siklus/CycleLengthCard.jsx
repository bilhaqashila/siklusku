import React from 'react';
import useSiklusStore from '@/stores/useSiklusStore';

export default function CycleLengthCard() {
  const cycleSummary = useSiklusStore((state) => state.cycleSummary);

  const { averageCycleLength, averagePeriodLength } = cycleSummary;
  
  return (
    <div className="bg-white rounded-lg p-4 shadow-sm">
      <h3 className="text-lg font-medium mb-3">Rata-rata Siklus</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-3 bg-pink-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Panjang Siklus</p>
          <p className="text-2xl font-bold text-pink-600">
            {averageCycleLength ? `${averageCycleLength} hari` : '-'}
          </p>
        </div>
        
        <div className="text-center p-3 bg-red-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Durasi Menstruasi</p>
          <p className="text-2xl font-bold text-red-600">
            {averagePeriodLength ? `${averagePeriodLength} hari` : '-'}
          </p>
        </div>
      </div>
    </div>
  );
}