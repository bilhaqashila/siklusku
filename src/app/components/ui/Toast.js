'use client';
import { useState, useEffect } from 'react';

export default function Toast({ message, onAccept, onDecline, show }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
    }
  }, [show]);

  const handleAccept = () => {
    setIsVisible(false);
    onAccept();
  };

  const handleDecline = () => {
    setIsVisible(false);
    onDecline();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-white border-2 border-[#b18597] rounded-xl shadow-lg p-4 max-w-md mx-4">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <div className="w-6 h-6 bg-[#f9c4d2] rounded-full flex items-center justify-center">
            <span className="text-[#382b22] text-sm">📍</span>
          </div>
        </div>
        <div className="flex-1">
          <p className="text-[#382b22] text-sm font-medium mb-3">{message}</p>
          <div className="flex gap-2">
            <button
              onClick={handleAccept}
              className="px-4 py-2 bg-[#f9c4d2] text-[#382b22] text-sm font-semibold rounded-lg border border-[#b18597] hover:bg-[#f7b5c7] transition-colors"
            >
              Izinkan
            </button>
            <button
              onClick={handleDecline}
              className="px-4 py-2 bg-gray-100 text-gray-600 text-sm font-semibold rounded-lg border border-gray-300 hover:bg-gray-200 transition-colors"
            >
              Tidak
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}