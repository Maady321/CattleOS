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
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[300]"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 m-auto w-full max-w-lg h-fit bg-patch-black text-white z-[301] rounded-[48px] shadow-2xl overflow-hidden"
          >
            <div className="p-10">
              <div className="flex justify-between items-center mb-8">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                       <Camera size={24} className="text-white" />
                    </div>
                    <div>
                       <h2 className="text-2xl font-black">Digital Tag Scanner</h2>
                       <p className="text-white/40 text-sm font-medium">Point camera at animal tag QR</p>
                    </div>
                 </div>
                 <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/20 hover:text-white">
                    <X size={24} />
                 </button>
              </div>

              <div className="relative aspect-square bg-black/50 rounded-[32px] overflow-hidden border border-white/10 mb-8">
                 <div id="reader" className="w-full h-full"></div>
                 {/* Decorative scanning overlay */}
                 <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute inset-10 border-2 border-white/20 rounded-2xl"></div>
                    <motion.div 
                       animate={{ top: ['10%', '90%'] }}
                       transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                       className="absolute left-10 right-10 h-0.5 bg-grass-green shadow-[0_0_15px_rgba(34,197,94,0.5)]"
                    />
                 </div>
              </div>

              <div className="flex items-center gap-4 p-6 bg-white/5 rounded-3xl border border-white/10">
                 <div className="w-10 h-10 bg-orange-500/20 text-orange-400 rounded-xl flex items-center justify-center">
                    <FlipHorizontal size={20} />
                 </div>
                 <p className="text-xs font-medium text-white/60">Using rear camera for better focus on physical tags.</p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
