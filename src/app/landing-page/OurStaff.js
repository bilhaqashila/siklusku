'use client';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import Image from 'next/image';

export default function OurStaff() {
  const staffRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Staff cards hover animations
      const staffCards = staffRef.current.querySelectorAll('.staff-card');
      
      staffCards.forEach(card => {
        const handleMouseEnter = () => {
          gsap.to(card, {
            y: -5,
            duration: 0.3,
            ease: 'power2.out'
          });
        };
        
        const handleMouseLeave = () => {
          gsap.to(card, {
            y: 0,
            duration: 0.3,
            ease: 'power2.out'
          });
        };
        
        card.addEventListener('mouseenter', handleMouseEnter);
        card.addEventListener('mouseleave', handleMouseLeave);
        
        // Cleanup event listeners
        return () => {
          card.removeEventListener('mouseenter', handleMouseEnter);
          card.removeEventListener('mouseleave', handleMouseLeave);
        };
      });
    }, staffRef);

    return () => ctx.revert();
  }, []);
  return (
    <section ref={staffRef} className="container my-16 mx-auto" id="staff-section">
        <div className="mb-12">
        <h4 className="font-semibold text-center text-3xl text-gray-800 staff-title">Kenalan dengan Tim Kami</h4>
        <p className="text-center text-gray-600 mt-3 max-w-2xl mx-auto">Tim ahli yang berpengalaman dalam bidang kesehatan reproduksi dan edukasi remaja</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 staff-grid">
        <div className="text-center staff-card cursor-pointer">
            <div className="relative overflow-hidden rounded-full w-48 h-48 mx-auto mb-4 shadow-lg">
            <Image src="/image/andin.jpg" width={192} height={192} className="w-full h-full object-cover" alt="Andin - Ahli Kesehatan Reproduksi" />
            </div>
            <h5 className="font-semibold text-xl text-gray-800 mb-2">Andin</h5>
            <p className="text-gray-600 text-sm">Ahli Kesehatan Reproduksi</p>
        </div>
        <div className="text-center staff-card cursor-pointer">
            <div className="relative overflow-hidden rounded-full w-48 h-48 mx-auto mb-4 shadow-lg">
            <Image src="/image/Ashila.png" width={192} height={192} className="w-full h-full object-cover" alt="Ashila - Konselor Remaja" />
            </div>
            <h5 className="font-semibold text-xl text-gray-800 mb-2">Ashila</h5>
            <p className="text-gray-600 text-sm">Konselor Remaja</p>
        </div>
        <div className="text-center staff-card cursor-pointer">
            <div className="relative overflow-hidden rounded-full w-48 h-48 mx-auto mb-4 shadow-lg">
            <Image src="/image/Helena.png" width={192} height={192} className="w-full h-full object-cover" alt="Helena - Edukator Kesehatan" />
            </div>
            <h5 className="font-semibold text-xl text-gray-800 mb-2">Helena</h5>
            <p className="text-gray-600 text-sm">Edukator Kesehatan</p>
        </div>
        </div>
    </section>
  )
}
