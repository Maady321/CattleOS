"use client";

import React from 'react';
import { motion } from 'framer-motion';

export const HolsteinBackground = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-ivory pointer-events-none">
      {/* Abstract Patches */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.03, scale: 1 }}
        transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
        className="absolute -top-20 -left-20 w-[600px] h-[500px] bg-patch-black rounded-full blur-[100px]"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.05, scale: 1 }}
        transition={{ duration: 3, repeat: Infinity, repeatType: 'reverse', delay: 0.5 }}
        className="absolute top-1/2 -right-40 w-[800px] h-[600px] bg-patch-black rounded-full blur-[120px]"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.02, scale: 1 }}
        transition={{ duration: 4, repeat: Infinity, repeatType: 'reverse', delay: 1 }}
        className="absolute -bottom-40 left-1/4 w-[500px] h-[400px] bg-grass-green rounded-full blur-[100px]"
      />

      {/* Sharp Decorative Patches (SVG) */}
      <svg className="absolute top-0 right-0 w-full h-full opacity-[0.02] pointer-events-none" viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg">
        <path d="M0,0 Q200,100 400,0 T800,100 L1000,0 L1000,1000 L0,1000 Z" fill="black" />
        <circle cx="900" cy="100" r="150" fill="black" />
        <path d="M200,800 Q400,600 600,800 T900,700" stroke="black" strokeWidth="2" fill="none" opacity="0.5" />
      </svg>
    </div>
  );
};
