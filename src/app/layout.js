import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata = {
  title: "RISA - Remaja Indonesia SehAt",
  description: "Dibuat oleh kelompok Sulianti Saroso",
  icons: {
    icon: "/favicon.ico",}
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} antialiased`}
      >
        <a
          href="#main-content"
          className="absolute left-4 top-4 z-50 -translate-y-24 rounded-full bg-pink-600 px-4 py-2 text-sm font-semibold text-white shadow-lg transition-transform focus-visible:translate-y-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          Lewati ke konten utama
        </a>
                <Navbar />
          {children}
        <Footer />
      </body>
    </html>
  );
}
