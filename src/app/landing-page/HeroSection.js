'use client';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import Image from "next/image";
import CustomButton from "../components/ui/CustomButton";
import Link from 'next/link';

export default function   HeroSection() {
  const heroRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      
      // Hero title - fade in from top
      tl.fromTo('.hero-title', 
        { opacity: 0, y: -50 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }
      )
      // Hero text - fade in from top with delay
      .fromTo('.hero-text',
        { opacity: 0, y: -30 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' },
        '-=0.4'
      )
      // Hero button - fade in from top with delay
      .fromTo('.hero-button',
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' },
        '-=0.3'
      )
      // Hero image - fade in from bottom
      .fromTo('.hero-image',
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' },
        '-=0.6'
      );
    }, heroRef);

    return () => ctx.revert();
  }, []);
  return (
    <section ref={heroRef} className="container my-4 mx-auto" id="hero">
        <div className="p-4">
        <h1 className="text-3xl md:text-4xl text-center font-bold mb-4 md:mb-6 hero-title opacity-0">Siklusku, Sahabat Terbaikmu</h1>
        <p className="text-center text-gray-600 leading-6 mb-8 max-w-2xl mx-auto hero-text opacity-0">Belajar tentang pubertas, cinta, dan kesehatan reproduksi dengan Siklusku: karena mengenal diri sendiri adalah langkah pertama melindungi diri</p>
        
        <div className="w-fit mx-auto mb-12 hero-button opacity-0">
            <Link href="/siklusku">
                <CustomButton className="px-6 py-3 text-base font-semibold" title="Ayo Mulai Sekarang" />
            </Link>
        </div>

        <div className="w-fit mx-auto">
            <Image src="/image/hero-siklusku.png" width={600} height={400} alt="Hero" className="hero-image opacity-0 max-w-full h-auto" />
        </div>
        </div>
    </section>
  )
}
