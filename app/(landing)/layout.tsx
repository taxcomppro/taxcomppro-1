import { Urbanist } from "next/font/google";
import "../globals.css";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

const urbanist = Urbanist({ subsets: ["latin"], variable: "--font-urbanist", display: "swap" });

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${urbanist.variable} font-[var(--font-urbanist,Urbanist),sans-serif] min-h-screen flex flex-col`}>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
