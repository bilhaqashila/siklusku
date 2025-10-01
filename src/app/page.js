import Image from "next/image";
import HeroSection from "./landing-page/HeroSection";
import OurStaff from "./landing-page/OurStaff";

export default function Home() {
  return (
    <>
      <HeroSection />

      {/** Features */}
      <section className="my-8 mx-auto">
        <div className="bg-gradient-to-r from-pink-50 to-pink-100 py-8 px-4">
          <div className="container mx-auto">
            <div className="grid grid-cols-2 lg:grid-cols-2 text-center gap-8 max-w-4xl mx-auto">
              <div className="p-6 hover:-translate-y-2 duration-300 ease-out">
                <div className="w-fit mx-auto mb-4">
                  <Image width={80} height={80} src="/image/hero-privacy.png" alt="Keamanan Data" className="mx-auto md:w-32 md:h-32"/>
                </div>
                <h3 className="font-semibold text-gray-800 mb-3 text-lg">Data Aman</h3>
                <p className="text-sm text-gray-600 leading-6">Semua data di platform ini dijamin aman serta terjaga kerahasiaannya</p>
              </div>
              <div className="p-6 hover:-translate-y-2 duration-300 ease-out">
                <div className="w-fit mx-auto mb-4">
                  <Image width={80} height={80} src="/image/hero-game.png" alt="Game Edukatif" className="mx-auto md:w-32 md:h-32"/>
                </div>
                <h3 className="font-semibold text-gray-800 mb-3 text-lg">Game Edukatif</h3>
                <p className="text-sm text-gray-600 leading-6">Game seru untuk uji pengetahuanmu sekaligus nambah wawasan baru</p>
              </div>
              <div className="p-6 hover:-translate-y-2 duration-300 ease-out">
                <div className="w-fit mx-auto mb-4">
                  <Image width={80} height={80} src="/image/hero-vaksin.png" alt="Info Vaksin HPV" className="mx-auto md:w-32 md:h-32"/>
                </div>
                <h3 className="font-semibold text-gray-800 mb-3 text-lg">Info Vaksin HPV</h3>
                <p className="text-sm text-gray-600 leading-6">Temukan informasi lengkap tentang vaksin HPV, termasuk lokasi layanan dan harga</p>
              </div>
              <div className="p-6 hover:-translate-y-2 duration-300 ease-out">
                <div className="w-fit mx-auto mb-4">
                  <Image width={80} height={80} src="/image/hero-kalender.png" alt="Kalender Menstruasi" className="mx-auto md:w-32 md:h-32"/>
                </div>
                <h3 className="font-semibold text-gray-800 mb-3 text-lg">Kalender Menstruasi</h3>
                <p className="text-sm text-gray-600 leading-6">Buat catatan tentang haid, gejala, dan mood harian secara mudah dan rahasia</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/** Article */}
      <section className="container my-16 mx-auto">
        <div className="p-4">
          <div className="flex justify-between items-center mb-6">
            <h4 className="font-semibold text-2xl text-gray-800">Artikel Populer</h4>

            <a href="all-article.html" className="flex justify-center items-center gap-2 font-medium hover:text-pink-500 transition-colors">
              <span className="text-base">Lihat Semua</span>
              <Image width={24} height={24} src="https://img.icons8.com/ios/50/right.png" alt="Lihat Semua" className="w-6 h-6"/>
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4">
            <div className="mb-6 hover:text-pink-600 transition-colors duration-300 cursor-pointer">
              <a href="article-hiv.html">
                <div className="bg-[url('/image/article-image-1.png')] bg-cover bg-center w-full h-56 mb-3 rounded-lg shadow-md hover:shadow-lg transition-shadow"></div>
                <span className="font-medium">HIV? Gak Usah Panik, Yuk Kenalan Dulu!</span>
                <p className="text-sm leading-relaxed text-gray-600">Kenalan sama HIV biar gak salah paham dan tetap bisa jaga diri.</p>
              </a>
            </div>
            <div className="mb-6 hover:text-pink-600 transition-colors duration-300 cursor-pointer">
              <a href="./article-seks.html">
                <div className="bg-[url('/image/article-image-2.png')] bg-cover bg-center w-full h-56 mb-3 rounded-lg shadow-md hover:shadow-lg transition-shadow"></div>
                <span className="font-medium">Seks Itu Apa Sih? Biar Gak Salah Paham dan Bisa Jaga Diri!</span>
                <p className="text-gray-600 leading-relaxed text-sm">Belajar soal seks biar gak salah langkah dan bisa jaga diri.</p>
              </a>
            </div>
            <div className="mb-6 hover:text-pink-600 transition-colors duration-300 cursor-pointer">
              <a href="article-menstruasi.html">
                <div className="bg-[url('/image/article-image-3.png')] bg-cover bg-center w-full h-56 mb-3 rounded-lg shadow-md hover:shadow-lg transition-shadow"></div>
                <span className="font-medium">Menstruasi Pertama: Kenapa Bisa Terjadi dan Gak Usah Takut!</span>
                <p className="text-gray-600 leading-relaxed text-sm">Menstruasi pertama itu alami, yuk siapin diri biar gak panik.</p>
              </a>
            </div>
          </div>
        </div>
      </section>

      <OurStaff />

      {/** Sponsor & Partner */}
      <section className="container my-16 mx-auto">
        <div className="mb-1">
          <h4 className="font-semibold text-center text-2xl">Sponsor & Partner</h4>
        </div>

        <div className="flex flex-wrap justify-center items-center gap-8">
          <div className="flex flex-col items-center p-4">
            <Image src="/image/Laboratorium Klinik Prodia.jpg" width={120} height={80} className="w-30 h-20 object-contain mb-2" alt="Laboratorium Prodia" />
            <span className="text-center text-sm text-gray-600 font-medium">PT Prodia Widyahusada Tbk</span>
          </div>
          <div className="flex flex-col items-center p-4">
            <Image src="/image/laurier_logo.jpg" width={120} height={80} className="w-30 h-20 object-contain mb-2" alt="Laurier" />
            <span className="text-center text-sm text-gray-600 font-medium">PT Kao Indonesia</span>
          </div>
        </div>
      </section>
    </>
  );
}
