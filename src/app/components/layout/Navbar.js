'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        const menu = document.getElementById("mobile-menu");
        
        const handleClick = (e) => {
            if (e.target.closest("#menu-toggle")) {
                setIsMenuOpen(true);
                menu.classList.remove("translate-x-full");
            }
            if (e.target.closest("#menu-close")) {
                setIsMenuOpen(false); 
                menu.classList.add("translate-x-full");
            }
        };

        document.addEventListener("click", handleClick);

        return () => {
            document.removeEventListener("click", handleClick);
        };
    }, []);  
    
    return (
    <nav className="w-full bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shadow-sm relative">
      {/** Logo */}
      <div className="flex items-center gap-2">
        <Link href="/">
          <Image src="/image/LogoRisa.png" width={100} height={32} alt="RISA Logo"/>
        </Link>
      </div>

      {/** Menu Desktop */}
      <ul className="hidden md:flex gap-6 text-gray-700 font-medium">
        <li><Link href="/articles" className="hover:text-pink-500">Artikel</Link></li>
        <li><Link href="/mini-game" className="hover:text-pink-500">Mini Games</Link></li>
        <li><Link href="/siklusku" className="hover:text-pink-500">My Cycle</Link></li>
        <li><Link href="/vaksin-hpv" className="hover:text-pink-500">Vaksin HPV</Link></li>
      </ul>

      {/** Right Section */}
      <div className="flex items-center gap-4">
        {/** Search */}
        <button aria-label="Cari" className="text-gray-600 hover:text-pink-500 cursor-pointer">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>


        {/** Profile Icon (Desktop) */}
        <button aria-label="Profile" className="hidden md:block p-2 text-gray-600 hover:text-pink-500 hover:bg-pink-50 rounded-full transition-all duration-200">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </button>

        {/** Mobile Toggle */}
        <button id="menu-toggle" className="md:hidden text-gray-600 hover:text-pink-500 cursor-pointer">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/** Mobile Menu Sidebar */}
      <div id="mobile-menu" className="fixed top-0 right-0 h-full w-64 bg-white shadow-lg transform translate-x-full transition-transform duration-300 ease-in-out z-50 md:hidden flex flex-col p-6 gap-4">
        <button id="menu-close" className="self-end text-gray-600 hover:text-pink-500">
          ✕
        </button>
        <button className="p-2 text-gray-600 hover:text-pink-500 hover:bg-pink-50 rounded-full transition-all duration-200">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </button>
        <Link href="/" className="hover:text-pink-500">Beranda</Link>
        <Link href="/mini-game" className="hover:text-pink-500">Mini Games</Link>
        <Link href="/siklusku" className="hover:text-pink-500">My Cycle</Link>
        <Link href="/vaksin-hpv" className="hover:text-pink-500">Vaksin HPV</Link>
      </div>
    </nav>
  )
}
