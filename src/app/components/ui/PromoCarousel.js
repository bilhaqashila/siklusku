'use client';
import { useState, useEffect } from 'react';

export default function PromoCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const promos = [
    {
      title: "Diskon 15% Paket Lengkap HPV",
      description: "Hemat Rp 382.500 untuk 3 dosis vaksin HPV",
      highlight: "Berlaku hingga akhir bulan",
      bgColor: "from-pink-100 to-purple-100"
    },
    {
      title: "Gratis Konsultasi Dokter",
      description: "Konsultasi dengan dokter spesialis kandungan",
      highlight: "Tanpa biaya tambahan",
      bgColor: "from-blue-100 to-cyan-100"
    },
    {
      title: "Cashback 10% untuk Pelajar",
      description: "Khusus pelajar SMA dengan kartu pelajar",
      highlight: "Maksimal cashback Rp 200.000",
      bgColor: "from-green-100 to-emerald-100"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % promos.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [promos.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % promos.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + promos.length) % promos.length);
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto h-32 overflow-hidden rounded-xl shadow-lg">
      <div 
        className="flex transition-transform duration-500 ease-in-out h-full"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {promos.map((promo, index) => (
          <div
            key={index}
            className={`min-w-full h-full bg-gradient-to-r ${promo.bgColor} flex items-center justify-center p-6`}
          >
            <div className="text-center">
              <h3 className="text-lg font-bold text-[#382b22] mb-2">{promo.title}</h3>
              <p className="text-sm text-gray-700 mb-1">{promo.description}</p>
              <p className="text-xs text-pink-600 font-semibold">{promo.highlight}</p>
            </div>
          </div>
        ))}
      </div>
      
      {/* Previous Button */}
      <button
        onClick={prevSlide}
        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition-colors"
      >
        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Next Button */}
      <button
        onClick={nextSlide}
        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition-colors"
      >
        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
      
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {promos.map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentSlide ? 'bg-pink-600' : 'bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
}