"use client";

import { useState } from "react";
import { QRCode } from "react-qrcode-logo";

interface QRCodeDisplayProps {
  url: string;
}

export default function QRCodeDisplay({ url }: QRCodeDisplayProps) {
  const [copied, setCopied] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {/* QR Code Button - Enhanced Minimalistic & Luxury */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="p-2.5 bg-white/80 backdrop-blur-md text-gray-700 rounded-full hover:bg-white hover:shadow-xl hover:text-black transition-all duration-300 border border-white/20 flex items-center justify-center shadow-sm group"
        title="显示二维码"
      >
        <svg className="w-[18px] h-[18px] group-hover:scale-110 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.25} d="M3 10h3v3H3v-3zm5 0h3v3H8v-3zm5 0h3v3h-3v-3zm0-5h3v3h-3V5zM3 5h3v3H3V5zm5 0h3v3H8V5zm5 10h3v3h-3v-3zM3 15h3v3H3v-3zm5 0h3v3H8v-3z" />
        </svg>
      </button>

      {/* Modal Overlay - Elegant & Subtle */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setIsModalOpen(false)}>
          {/* Modal Content - Minimalistic & High-end */}
          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-8 shadow-2xl max-w-md w-full mx-4 border border-gray-100" onClick={(e) => e.stopPropagation()}>
            {/* Close button */}
            <div className="flex justify-end">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* QR Code */}
            <div className="flex flex-col items-center">
              <h3 className="text-lg font-medium text-gray-800 mb-6 mt-2">扫描二维码</h3>
              <div className="mb-8 p-3 bg-white rounded-xl shadow-sm">
                <QRCode
                  value={url}
                  size={220}
                  logoImage="/kaka.png"
                  logoWidth={55}
                  logoHeight={55}
                  quietZone={10}
                  qrStyle="dots"
                  eyeRadius={8}
                  fgColor="#222222"
                />
              </div>
              <div className="w-full flex items-center gap-2 mb-2">
                <input
                  type="text"
                  value={url}
                  readOnly
                  className="flex-1 py-2.5 px-3 text-sm text-gray-600 bg-gray-50/70 border border-gray-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-300 focus:border-gray-300 font-light tracking-wide"
                />
                <button
                  onClick={copyToClipboard}
                  className="p-2.5 bg-black/90 text-white rounded-lg hover:bg-black hover:shadow-md transition-all duration-300 group"
                  title="复制链接"
                >
                  {copied ? (
                    <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.25} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-[18px] h-[18px] group-hover:scale-110 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.25} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                  )}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
}
