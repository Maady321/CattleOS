"use client";

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, FlipHorizontal } from 'lucide-react';
import { Html5QrcodeScanner, Html5Qrcode } from 'html5-qrcode';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (data: string) => void;
}

export const QRScannerModal = ({ isOpen, onClose, onScan }: QRScannerModalProps) => {
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    if (isOpen) {
      const startScanner = async () => {
        try {
          const html5QrCode = new Html5Qrcode("reader");
          scannerRef.current = html5QrCode;
          
          await html5QrCode.start(
            { facingMode: "environment" },
            {
              fps: 10,
              qrbox: { width: 250, height: 250 }
            },
            (decodedText) => {
              onScan(decodedText);
              stopScanner();
            },
            (errorMessage) => {
              // Ignore common errors during scanning
            }
          );
        } catch (err) {
          console.error("Camera access failed:", err);
        }
      };

      // Slight delay to ensure DOM is ready
      const timer = setTimeout(startScanner, 300);
      return () => {
        clearTimeout(timer);
        stopScanner();
      };
    }
  }, [isOpen, onScan]);

  const stopScanner = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (err) {
        console.error("Stop failed:", err);
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-[300] p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-xl"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg bg-patch-black text-white rounded-[32px] md:rounded-[48px] shadow-2xl overflow-hidden"
          >
            <div className="p-6 md:p-10">
              <div className="flex justify-between items-center mb-6 md:mb-8">
                 <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-white/10 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0">
                       <Camera size={24} className="text-white" />
                    </div>
                    <div className="min-w-0">
                       <h2 className="text-xl md:text-2xl font-black truncate">Digital Tag Scanner</h2>
                       <p className="text-white/40 text-[10px] md:text-sm font-medium truncate">Point camera at animal tag QR</p>
                    </div>
                 </div>
                 <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/20 hover:text-white shrink-0">
                    <X size={24} />
                 </button>
              </div>

              <div className="relative aspect-square bg-black/50 rounded-[24px] md:rounded-[32px] overflow-hidden border border-white/10 mb-6 md:mb-8">
                 <div id="reader" className="w-full h-full"></div>
                 {/* Decorative scanning overlay */}
                 <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute inset-6 md:inset-10 border-2 border-white/20 rounded-2xl"></div>
                    <motion.div 
                       animate={{ top: ['10%', '90%'] }}
                       transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                       className="absolute left-6 md:left-10 right-6 md:right-10 h-0.5 bg-grass-green shadow-[0_0_15px_rgba(34,197,94,0.5)]"
                    />
                 </div>
              </div>

              <div className="flex items-center gap-3 md:gap-4 p-4 md:p-6 bg-white/5 rounded-2xl md:rounded-3xl border border-white/10">
                 <div className="w-8 h-8 md:w-10 md:h-10 bg-orange-500/20 text-orange-400 rounded-lg md:rounded-xl flex items-center justify-center shrink-0">
                    <FlipHorizontal size={20} />
                 </div>
                 <p className="text-[10px] md:text-xs font-medium text-white/60">Using rear camera for better focus on physical tags.</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
