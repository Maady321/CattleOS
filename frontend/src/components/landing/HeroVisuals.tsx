"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3 } from 'lucide-react';
import Image from 'next/image';

export const HeroVisuals = () => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
      className="flex-1 relative flex items-center justify-center"
    >
      <div className="relative w-[320px] h-[320px] md:w-[600px] md:h-[600px] bg-patch-black rounded-[60px] md:rounded-[120px] flex items-center justify-center shadow-[0_64px_128px_-20px_rgba(0,0,0,0.6)] overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-tr from-grass-green/20 to-transparent opacity-50 group-hover:scale-150 transition-transform duration-1000"></div>
        
        <Image 
          src="/image.png" 
          alt="CattleOS Premium Branding" 
          width={500} 
          height={500} 
          className="relative z-10 w-56 h-56 md:w-96 md:h-96 rounded-[40px] md:rounded-[80px] shadow-2xl transition-all duration-700 group-hover:scale-110 group-hover:rotate-3"
          priority
        />
        
        <div className="absolute bottom-8 right-8 text-white/10 font-black italic tracking-widest text-xl select-none">
          CATTLEOS v2.0
        </div>
      </div>

      <motion.div 
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-10 -right-4 bg-white/80 backdrop-blur-xl p-6 rounded-3xl shadow-2xl border border-white/50 hidden md:block"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-grass-green rounded-2xl flex items-center justify-center text-white">
            <BarChart3 size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-black/40">Efficiency</p>
            <p className="text-xl font-black">+42%</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
