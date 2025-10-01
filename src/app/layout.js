import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
// import store from './redux/store.js';
// import { Provider } from 'react-redux';

const inter = Inter({
  subsets: ["latin"],
});

export const metadata = {
  title: "RISA - Remaja Indonesia SehAt",
  description: "Dibuat oleh kelompok Sulianti Saroso",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} antialiased`}
      >
        <Navbar />
          {children}
        <Footer />
      </body>
    </html>
  );
}
