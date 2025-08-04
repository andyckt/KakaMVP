"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import QRCodeButton from "./QRCodeButton";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  
  // Don't show QR code button on homepage
  const showQRCode = pathname !== "/";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-effect">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <div className="relative w-8 h-8">
                <Image
                  src="/kaka.png"
                  alt="卡卡科技 Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <span className="text-black" style={{ fontFamily: "'Times New Roman', serif", fontSize: "18px", fontWeight: 400 }}>卡卡科技</span>
            </Link>
          </div>

          {/* Auth Buttons - Desktop */}
          <div className="hidden md:flex items-center gap-4">
            {showQRCode && <QRCodeButton className="mr-2" />}
            {/* <button className="text-gray-600 hover:text-gray-900 transition-colors" style={{ fontFamily: "'Times New Roman', serif", fontSize: "16px", fontWeight: 400 }}>登录</button> */}
            <button className="px-4 py-2 brand-gradient text-white rounded-lg hover:opacity-90 transition-all duration-200 shadow-lg hover:shadow-xl btn-hover-effect" style={{ fontFamily: "'Times New Roman', serif", fontSize: "16px", fontWeight: 400 }}>
              开始使用
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            {showQRCode && <QRCodeButton />}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {isMenuOpen ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4">
            <div className="flex flex-col gap-2">
              {/* <button className="text-left text-gray-600 hover:text-gray-900 transition-colors py-2" style={{ fontFamily: "'Times New Roman', serif", fontSize: "16px", fontWeight: 400 }}>登录</button> */}
              <button className="px-4 py-2 brand-gradient text-white rounded-lg hover:opacity-90 transition-all duration-200 text-left shadow-lg btn-hover-effect" style={{ fontFamily: "'Times New Roman', serif", fontSize: "16px", fontWeight: 400 }}>
                开始使用
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
