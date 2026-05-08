"use client";

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Leaf, ShieldCheck, BarChart3, ArrowRight, Play, CheckCircle2 } from 'lucide-react';
import { translations, Language } from '@/lib/translations';
import Image from 'next/image';

// Client Components
import { HeroVisuals } from '@/components/landing/HeroVisuals';

// Dynamically import heavy/below-the-fold components
const HolsteinBackground = dynamic(() => import('@/components/ui/HolsteinBackground').then(mod => mod.HolsteinBackground), { ssr: false });

import { useParams } from 'next/navigation';

export default function LandingPage() {
  const params = useParams();
  const lang = (params.locale as Language) || 'en';
  const t = translations[lang];
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, -100]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);


  return (
    <div className="relative min-h-screen font-sans selection:bg-grass-green selection:text-white overflow-x-hidden text-patch-black">
      <HolsteinBackground />
      
      {/* Hero Section */}
      <section className="relative pt-32 md:pt-48 pb-20 md:pb-40 px-6 md:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-16 md:gap-24">
          
          {/* Left Content */}
          <div className="flex-1 text-center lg:text-left">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-grass-green/10 text-grass-green border border-grass-green/20 mb-8 font-bold text-[10px] md:text-xs uppercase tracking-widest"
            >
              <span className="w-2 h-2 rounded-full bg-grass-green animate-pulse"></span>
              Trusted by Dairy Farmers across Kerala
            </motion.div>

            <motion.h1 
              style={{ opacity }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="text-4xl sm:text-6xl md:text-8xl font-black leading-[1.1] tracking-tight mb-8"
            >
              {lang === 'en' ? (
                <>Precision Farming for the <span className="text-grass-green">Modern Herd.</span></>
              ) : (
                t.heroTitle
              )}
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-lg md:text-2xl text-black/70 max-w-2xl mb-10 md:mb-12 font-medium leading-relaxed"
            >
              {t.heroSub}
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 md:gap-6 w-full sm:w-auto justify-center lg:justify-start"
            >
              <a href="/login" className="group bg-patch-black text-white px-8 md:px-10 py-4 md:py-5 rounded-[20px] md:rounded-[24px] text-base md:text-lg font-black flex items-center justify-center gap-3 hover:scale-105 transition-all shadow-2xl">
                {t.getStarted} <ArrowRight className="group-hover:translate-x-1 transition-transform" />
              </a>
              <button className="group bg-white border border-black/10 px-8 md:px-10 py-4 md:py-5 rounded-[20px] md:rounded-[24px] text-base md:text-lg font-black flex items-center justify-center gap-3 hover:bg-black/5 transition-all">
                <div className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Play size={16} fill="black" />
                </div>
                Watch Tour
              </button>
            </motion.div>
          </div>

          <HeroVisuals />

        </div>
      </section>

      {/* Cinematic Preview */}
      <motion.section 
        style={{ y: y1 }}
        className="px-4 md:px-8 max-w-6xl mx-auto -mt-6 md:-mt-10 mb-20 md:mb-32"
      >
        <div className="aspect-video bg-white rounded-[24px] md:rounded-[40px] shadow-2xl border-4 md:border-8 border-white overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-tr from-patch-black/20 to-transparent"></div>
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 backdrop-blur-sm">
             <button className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-full flex items-center justify-center shadow-2xl scale-0 group-hover:scale-100 transition-transform duration-500">
                <Play size={28} fill="black" />
             </button>
          </div>
          <Image 
            src="/hero-cow.png" 
            alt="Cattle Management Dashboard" 
            fill
            className="w-full h-full object-cover grayscale-[20%] group-hover:scale-105 transition-transform duration-1000"
          />
        </div>
      </motion.section>

      {/* Features Grid */}
      <section id="features" className="py-20 md:py-32 px-6 md:px-8 max-w-7xl mx-auto relative">
        <div className="flex flex-col items-center text-center mb-16 md:mb-20">
          <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-6">Everything you need to <br className="hidden md:block"/> scale your farm.</h2>
          <div className="w-16 md:w-20 h-1.5 bg-grass-green rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
          {[
            { icon: ShieldCheck, title: t.cattlePassport, desc: "Instant QR profiles for every animal with full ancestry and health history." },
            { icon: Leaf, title: t.healthAlerts, desc: "AI-ready diagnostics and automated vaccination reminders via WhatsApp." },
            { icon: BarChart3, title: t.milkAnalytics, desc: "Detailed production charts and revenue forecasting for data-driven growth." },
          ].map((feature, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -10 }}
              className="p-8 md:p-10 bg-white rounded-[24px] md:rounded-[32px] border border-black/5 shadow-premium hover:border-grass-green/30 transition-all group"
            >
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-[16px] md:rounded-[20px] bg-black/5 flex items-center justify-center text-patch-black mb-6 md:mb-8 group-hover:bg-grass-green group-hover:text-white transition-all duration-500 shadow-inner">
                <feature.icon size={30} />
              </div>
              <h3 className="text-xl md:text-2xl font-black mb-4">{feature.title}</h3>
              <p className="text-black/60 font-medium leading-relaxed text-sm md:text-base">
                {feature.desc}
              </p>
              <div className="mt-6 md:mt-8 pt-6 md:pt-8 border-t border-black/5 flex items-center justify-between">
                 <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-black/40 group-hover:text-grass-green transition-colors">Learn More</span>
                 <ArrowRight size={16} className="text-black/10 group-hover:text-grass-green transition-colors" />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Malayalam Context Section */}
      <section className="py-20 md:py-32 bg-patch-black text-white relative overflow-hidden rounded-[40px] md:rounded-[80px] mx-4 md:mx-8 mb-20 md:mb-32">
         <div className="absolute top-0 right-0 w-1/2 h-full bg-grass-green/20 blur-[150px]"></div>
         <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-20 items-center">
            <div>
               <h2 className="text-3xl md:text-6xl font-black mb-8 md:mb-10 leading-tight">
                  {lang === 'en' ? 'Built specifically for Kerala Farmers.' : 'കേരളത്തിലെ കർഷകർക്കായി പ്രത്യേകം നിർമ്മിച്ചത്.'}
               </h2>
               <div className="space-y-4 md:space-y-6">
                  {[
                    "Malayalam Interface & Support",
                    "Regional Cattle Breed Tracking",
                    "Local Feed & Nutrition Optimization",
                    "Government Subsidy Reports"
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 md:gap-4 text-lg md:text-xl font-bold text-white/70">
                       <CheckCircle2 className="text-grass-green" size={22} />
                       {item}
                    </div>
                  ))}
               </div>
            </div>
            <div className="relative mt-8 lg:mt-0">
               <div className="bg-white/10 backdrop-blur-2xl p-6 md:p-8 rounded-[24px] md:rounded-[40px] border border-white/10 shadow-2xl">
                  <pre className="text-grass-green font-mono text-xs md:text-sm mb-4 tracking-tighter opacity-50">{"// cattle_analysis.py"}</pre>
                  <div className="space-y-3 md:space-y-4">
                     <div className="h-3 md:h-4 bg-white/20 rounded-full w-3/4"></div>
                     <div className="h-3 md:h-4 bg-white/20 rounded-full w-1/2"></div>
                     <div className="h-3 md:h-4 bg-white/20 rounded-full w-5/6"></div>
                  </div>
                  <div className="mt-8 md:mt-12 flex justify-end">
                     <div className="w-16 h-16 md:w-20 md:h-20 bg-grass-green rounded-full flex items-center justify-center shadow-lg">
                        <BarChart3 size={32} />
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>

      <footer className="py-16 md:py-20 px-6 md:px-8 text-center bg-white/50 backdrop-blur-sm">
        <div className="flex items-center justify-center gap-2 text-xl md:text-2xl font-black mb-6 md:mb-8 tracking-tighter">
            <div className="w-8 h-8 bg-patch-black rounded-lg flex items-center justify-center text-white text-xs shadow-lg">C</div>
            CattleOS
        </div>
        <p className="text-black/60 text-[10px] md:text-sm font-bold uppercase tracking-widest max-w-md mx-auto">
          © 2026 CattleOS — Empowering the next generation of Dairy Farmers.
        </p>
      </footer>
    </div>
  );
}
