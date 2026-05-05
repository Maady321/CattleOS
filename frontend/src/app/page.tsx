"use client";

import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ChevronRight, Leaf, ShieldCheck, BarChart3, Languages, ArrowRight, Play, CheckCircle2 } from 'lucide-react';
import { translations, Language } from '@/lib/translations';
import { HolsteinBackground } from '@/components/ui/HolsteinBackground';

export default function LandingPage() {
  const [lang, setLang] = useState<Language>('en');
  const t = translations[lang];
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, -100]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  const toggleLang = () => setLang(prev => prev === 'en' ? 'ml' : 'en');

  return (
    <div className="relative min-h-screen font-sans selection:bg-grass-green selection:text-white overflow-x-hidden">
      <HolsteinBackground />

      {/* Glass Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-8 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center bg-white/60 backdrop-blur-xl border border-white/20 px-8 py-4 rounded-[24px] shadow-premium">
          <div className="flex items-center gap-3 text-2xl font-black tracking-tighter">
            <div className="w-10 h-10 bg-patch-black rounded-xl flex items-center justify-center text-white shadow-lg">C</div>
            CattleOS
          </div>
          
          <div className="hidden md:flex items-center gap-10 font-bold text-sm uppercase tracking-widest text-black/60">
            <a href="#features" className="hover:text-black transition-colors">{t.features}</a>
            <a href="#" className="hover:text-black transition-colors">Testimonials</a>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={toggleLang} className="flex items-center gap-2 px-4 py-2 rounded-full border border-black/5 hover:bg-black/5 transition-all font-bold text-xs uppercase">
              <Languages size={14} />
              {lang === 'en' ? 'മലയാളം' : 'English'}
            </button>
            <a href="/login" className="bg-patch-black text-white px-8 py-3 rounded-full hover:scale-105 active:scale-95 transition-all shadow-premium font-bold text-sm">
              {t.getStarted}
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-44 pb-32 px-8 max-w-7xl mx-auto flex flex-col items-center text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-grass-green/10 text-grass-green border border-grass-green/20 mb-8 font-bold text-xs uppercase tracking-widest"
        >
          <span className="w-2 h-2 rounded-full bg-grass-green animate-pulse"></span>
          Trusted by Dairy Farmers across Kerala
        </motion.div>

        <motion.h1 
          style={{ opacity }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-6xl md:text-8xl font-black leading-[1.05] tracking-tight mb-10 max-w-5xl"
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
          className="text-xl md:text-2xl text-black/50 max-w-3xl mb-12 font-medium leading-relaxed"
        >
          {t.heroSub}
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-6"
        >
          <button className="group bg-patch-black text-white px-10 py-5 rounded-[24px] text-lg font-black flex items-center gap-3 hover:scale-105 transition-all shadow-2xl">
            {t.getStarted} <ArrowRight className="group-hover:translate-x-1 transition-transform" />
          </button>
          <button className="group bg-white border border-black/10 px-10 py-5 rounded-[24px] text-lg font-black flex items-center gap-3 hover:bg-black/5 transition-all">
            <div className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Play size={16} fill="black" />
            </div>
            Watch Product Tour
          </button>
        </motion.div>
      </section>

      {/* Cinematic Preview */}
      <motion.section 
        style={{ y: y1 }}
        className="px-8 max-w-6xl mx-auto -mt-10 mb-32"
      >
        <div className="aspect-video bg-white rounded-[40px] shadow-2xl border-8 border-white overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-tr from-patch-black/20 to-transparent"></div>
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 backdrop-blur-sm">
             <button className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl scale-0 group-hover:scale-100 transition-transform duration-500">
                <Play size={32} fill="black" />
             </button>
          </div>
          <img 
            src="/hero-cow.png" 
            alt="Cattle Management Dashboard" 
            className="w-full h-full object-cover grayscale-[20%] group-hover:scale-105 transition-transform duration-1000"
          />
        </div>
      </motion.section>

      {/* Features Grid */}
      <section id="features" className="py-32 px-8 max-w-7xl mx-auto relative">
        <div className="flex flex-col items-center text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6">Everything you need to <br/> scale your farm.</h2>
          <div className="w-20 h-1.5 bg-grass-green rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {[
            { icon: ShieldCheck, title: t.cattlePassport, desc: "Instant QR profiles for every animal with full ancestry and health history." },
            { icon: Leaf, title: t.healthAlerts, desc: "AI-ready diagnostics and automated vaccination reminders via WhatsApp." },
            { icon: BarChart3, title: t.milkAnalytics, desc: "Detailed production charts and revenue forecasting for data-driven growth." },
          ].map((feature, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -10 }}
              className="p-10 bg-white rounded-[32px] border border-black/5 shadow-premium hover:border-grass-green/30 transition-all group"
            >
              <div className="w-16 h-16 rounded-[20px] bg-black/5 flex items-center justify-center text-patch-black mb-8 group-hover:bg-grass-green group-hover:text-white transition-all duration-500 shadow-inner">
                <feature.icon size={32} />
              </div>
              <h3 className="text-2xl font-black mb-4">{feature.title}</h3>
              <p className="text-black/40 font-medium leading-relaxed">
                {feature.desc}
              </p>
              <div className="mt-8 pt-8 border-t border-black/5 flex items-center justify-between">
                 <span className="text-xs font-bold uppercase tracking-widest text-black/20 group-hover:text-grass-green transition-colors">Learn More</span>
                 <ArrowRight size={16} className="text-black/10 group-hover:text-grass-green transition-colors" />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Malayalam Context Section */}
      <section className="py-32 bg-patch-black text-white relative overflow-hidden rounded-[80px] mx-8 mb-32">
         <div className="absolute top-0 right-0 w-1/2 h-full bg-grass-green/20 blur-[150px]"></div>
         <div className="max-w-7xl mx-auto px-12 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div>
               <h2 className="text-5xl md:text-6xl font-black mb-10 leading-tight">
                  {lang === 'en' ? 'Built specifically for Kerala Farmers.' : 'കേരളത്തിലെ കർഷകർക്കായി പ്രത്യേകം നിർമ്മിച്ചത്.'}
               </h2>
               <div className="space-y-6">
                  {[
                    "Malayalam Interface & Support",
                    "Regional Cattle Breed Tracking",
                    "Local Feed & Nutrition Optimization",
                    "Government Subsidy Reports"
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4 text-xl font-bold text-white/70">
                       <CheckCircle2 className="text-grass-green" size={24} />
                       {item}
                    </div>
                  ))}
               </div>
            </div>
            <div className="relative">
               <div className="bg-white/10 backdrop-blur-2xl p-8 rounded-[40px] border border-white/10 shadow-2xl">
                  <pre className="text-grass-green font-mono text-sm mb-4 tracking-tighter opacity-50">{"// cattle_analysis.py"}</pre>
                  <div className="space-y-4">
                     <div className="h-4 bg-white/20 rounded-full w-3/4"></div>
                     <div className="h-4 bg-white/20 rounded-full w-1/2"></div>
                     <div className="h-4 bg-white/20 rounded-full w-5/6"></div>
                  </div>
                  <div className="mt-12 flex justify-end">
                     <div className="w-20 h-20 bg-grass-green rounded-full flex items-center justify-center shadow-lg">
                        <BarChart3 size={32} />
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>

      <footer className="py-20 px-8 text-center bg-white/50 backdrop-blur-sm">
        <div className="flex items-center justify-center gap-2 text-2xl font-black mb-8 tracking-tighter">
            <div className="w-8 h-8 bg-patch-black rounded-lg flex items-center justify-center text-white text-xs shadow-lg">C</div>
            CattleOS
        </div>
        <p className="text-black/30 text-sm font-bold uppercase tracking-widest">
          © 2026 CattleOS — Empowering the next generation of Dairy Farmers.
        </p>
      </footer>
    </div>
  );
}
