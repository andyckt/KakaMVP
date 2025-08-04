import React, { useState } from 'react';
import QRCodeModal from './QRCodeModal';

interface QRCodeButtonProps {
  url?: string;
  className?: string;
}

export default function QRCodeButton({ url, className = '' }: QRCodeButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Use the current URL if none is provided
  const qrCodeUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  
  return (
    <>
      <button 
        onClick={() => setIsModalOpen(true)}
        className={`p-2 rounded-full brand-gradient text-white hover:opacity-90 transition-all shadow-lg hover:shadow-xl btn-hover-effect ${className}`}
        aria-label="显示二维码"
        title="显示二维码"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
        </svg>
      </button>
      
      <QRCodeModal 
        url={qrCodeUrl} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
} 