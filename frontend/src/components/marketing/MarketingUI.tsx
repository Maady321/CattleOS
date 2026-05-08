"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export const PageHeader = ({ title, subtitle, badge }: { title: React.ReactNode, subtitle: string, badge?: string }) => {
  return (
    <section className="pt-32 pb-20 px-6 md:px-8 text-center max-w-4xl mx-auto">
      {badge && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-grass-green/10 text-grass-green border border-grass-green/20 mb-6 font-bold text-[10px] uppercase tracking-widest"
        >
          {badge}
        </motion.div>
      )}
      <motion.h1 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-4xl md:text-7xl font-black leading-[1.1] tracking-tight mb-8"
      >
        {title}
      </motion.h1>
      <motion.p 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.1 }}
        className="text-lg md:text-2xl text-black/60 font-medium leading-relaxed"
      >
        {subtitle}
      </motion.p>
    </section>
  );
};

export const CTASection = () => {
  return (
    <section className="py-24 px-6 md:px-8">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="max-w-6xl mx-auto bg-patch-black rounded-[40px] md:rounded-[80px] p-12 md:p-24 text-center relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-grass-green/20 to-transparent pointer-events-none"></div>
        <div className="relative z-10">
          <h2 className="text-3xl md:text-6xl font-black text-white mb-8 leading-tight">
            Ready to digitize your <br className="hidden md:block" /> dairy farm?
          </h2>
          <p className="text-white/60 text-lg md:text-xl mb-12 max-w-2xl mx-auto font-medium">
            Join the modern herd today. Secure digital passports, automated health tracking, and real-time analytics at your fingertips.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a href="/login" className="bg-grass-green text-white px-10 py-5 rounded-[24px] font-black text-lg flex items-center gap-3 hover:scale-105 transition-all shadow-xl shadow-grass-green/20">
              Get Started for Free <ArrowRight />
            </a>
            <a href="/contact" className="bg-white/10 text-white border border-white/10 px-10 py-5 rounded-[24px] font-black text-lg hover:bg-white/20 transition-all">
              Book a Demo
            </a>
          </div>
        </div>
      </motion.div>
    </section>
  );
};
