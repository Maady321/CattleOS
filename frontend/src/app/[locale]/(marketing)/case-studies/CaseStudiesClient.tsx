"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, ShieldCheck, Award, Quote } from 'lucide-react';
import { PageHeader, CTASection } from '@/components/marketing/MarketingUI';

const stories = [
  {
    title: "Scaling Production by 40% at GreenValley Estates",
    client: "GreenValley Dairy",
    location: "Palakkad, Kerala",
    metric: "+40% Yield",
    icon: TrendingUp,
    desc: "How CattleOS helped a mid-size farm transition from manual logs to automated milk production analytics, resulting in a dramatic increase in operational efficiency.",
    quote: "CattleOS didn't just give us software; they gave us a lens to see our farm's true potential."
  },
  {
    title: "Zero Outbreak Policy: Managing Health for 200+ Cattle",
    client: "Heritage Livestock",
    location: "Wayanad, Kerala",
    metric: "100% Health Score",
    icon: ShieldCheck,
    desc: "By implementing the CattleOS digital passport system and automated vaccination reminders, Heritage Livestock achieved a full year without a single major health outbreak.",
    quote: "The automated reminders changed everything. We finally have peace of mind regarding our herd's health."
  },
  {
    title: "Regional Cooperative Digitization: A Success Story",
    client: "Munnar Milk Coop",
    location: "Munnar, Kerala",
    metric: "50+ Farmers",
    icon: Award,
    desc: "A cooperative-wide deployment of CattleOS enabled unified production tracking and transparent revenue distribution for dozens of local farmers.",
    quote: "Transparency was our biggest challenge. CattleOS provided the trust we needed to grow our cooperative."
  }
];

export default function CaseStudiesClient() {
  return (
    <div className="bg-ivory min-h-screen">
      <PageHeader 
        badge="Success Stories"
        title={<>Real impact on <br /> <span className="text-grass-green">Real Farms.</span></>}
        subtitle="Discover how CattleOS is helping farmers across the region build more profitable and sustainable businesses."
      />

      <section className="pb-32 px-6 md:px-8 max-w-7xl mx-auto space-y-20">
        {stories.map((story, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className={`flex flex-col ${i % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-12 items-center bg-white p-8 md:p-16 rounded-[48px] border border-black/5 shadow-premium`}
          >
             <div className="flex-1 space-y-8">
                <div className="flex items-center gap-4">
                   <div className="w-16 h-16 bg-grass-green/10 text-grass-green rounded-3xl flex items-center justify-center">
                      <story.icon size={32} />
                   </div>
                   <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-black/30">{story.location}</p>
                      <h3 className="text-2xl md:text-3xl font-black">{story.client}</h3>
                   </div>
                </div>
                <h4 className="text-3xl md:text-4xl font-black leading-tight tracking-tight">{story.title}</h4>
                <p className="text-lg md:text-xl text-black/60 font-medium leading-relaxed">
                   {story.desc}
                </p>
                <div className="p-8 bg-black/5 rounded-[32px] relative">
                   <Quote className="absolute top-4 right-4 text-black/5" size={40} />
                   <p className="text-lg font-bold italic text-black/70 mb-4">"{story.quote}"</p>
                   <p className="text-[10px] font-black uppercase tracking-widest text-black/30">— Farm Manager</p>
                </div>
             </div>
             <div className="flex-1 w-full lg:w-auto aspect-square bg-patch-black rounded-[40px] flex items-center justify-center text-white p-12 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-grass-green/20 to-transparent"></div>
                <div className="relative z-10">
                   <p className="text-7xl md:text-9xl font-black mb-4 tracking-tighter">{story.metric.split(' ')[0]}</p>
                   <p className="text-xl md:text-2xl font-black uppercase tracking-[0.2em] opacity-40">{story.metric.split(' ')[1]}</p>
                </div>
             </div>
          </motion.div>
        ))}
      </section>

      <CTASection />
    </div>
  );
}
