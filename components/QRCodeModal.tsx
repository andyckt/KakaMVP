import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { QRCode } from 'react-qrcode-logo';

interface QRCodeModalProps {
  url: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function QRCodeModal({ url, isOpen, onClose }: QRCodeModalProps) {
  const [copied, setCopied] = useState(false);
  const qrCodeRef = useRef<any>(null);

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative bg-white rounded-3xl p-6 max-w-md w-full shadow-xl">
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        {/* Title */}
        <h2 className="text-2xl font-bold mb-4 text-center" style={{ fontFamily: "'Times New Roman', serif" }}>
          扫描二维码
        </h2>
        
        {/* QR Code */}
        <div className="flex justify-center mb-6">
          <QRCode
            ref={qrCodeRef}
            value={url}
            size={250}
            qrStyle="dots"
            logoImage="/kaka.png"
            logoWidth={60}
            logoHeight={60}
            removeQrCodeBehindLogo={true}
            logoPadding={5}
            logoPaddingStyle="circle"
            eyeRadius={10}
            ecLevel="H"
          />
        </div>
        
        {/* URL display and copy button */}
        <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
          <div className="flex-1 p-3 truncate text-gray-600">{url}</div>
          <button 
            onClick={handleCopyUrl}
            className="p-3 brand-gradient text-white hover:opacity-90 transition-all"
          >
            {copied ? (
              <span>已复制</span>
            ) : (
              <span>复制</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
} 