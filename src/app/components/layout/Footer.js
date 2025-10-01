import Link from "next/link";
import Image from "next/image";

export default function Footer() {
    const year = new Date().getFullYear();
  return (
    <footer className="bg-white border-t border-gray-200 text-gray-700 text-sm">
      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        
        {/** Kiri: Logo + Alamat */}
        <div>
          <div className="flex items-center gap-2 mb-3">
          <Image src="/image/LogoRisa.png" width={100} height={32} alt="RISA Logo"/>
          </div>
          <p className="mb-1">Jl. Dr. Cipto Mangunkusomo no. 123, Jakarta Pusat, Indonesia</p>
          <p className="font-medium">+62 812 234 567</p>
        </div>

        {/** Tengah: Link */}
        <div className="space-y-2">
          <Link href="#" className="block hover:text-pink-500">Terms of Use</Link>
          <Link href="#" className="block hover:text-pink-500">Cookie Settings</Link>
          <Link href="#" className="block hover:text-pink-500">Join Community</Link>
        </div>

        {/** Kanan: Social Media */}
        <div className="space-y-3">
          <p className="font-semibold text-lg">Klik disini kalau mau tau lebih banyak!</p>
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M7.75 2h8.5A5.75 5.75 0 0122 7.75v8.5A5.75 5.75 0 0116.25 22h-8.5A5.75 5.75 0 012 16.25v-8.5A5.75 5.75 0 017.75 2z" />
              <path d="M12 7.25a4.75 4.75 0 100 9.5 4.75 4.75 0 000-9.5zM17.25 6.75h.01" />
            </svg>
            <span>@risaofficial</span>
          </div>
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M15 10.5l-6-3.5v7l6-3.5z" />
              <rect x="3" y="4" width="18" height="16" rx="2" ry="2"/>
            </svg>
            <span>@risaofficial</span>
          </div>
        </div>
      </div>

      {/** Copyrigth */}
      <div className="border-t border-gray-200 text-center py-4 text-xs text-gray-500">
        Copyright ©${year} by RISA company
      </div>
    </footer>
  )
}
