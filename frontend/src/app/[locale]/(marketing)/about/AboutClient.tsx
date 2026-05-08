"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Target, Users, ShieldCheck, Award, Globe } from 'lucide-react';
import { PageHeader, CTASection } from '@/components/marketing/MarketingUI';

export default function AboutClient() {
  return (
    <div className="bg-ivory min-h-screen">
      <PageHeader 
        badge="Our Mission"
        title={<>Empowering the next generation of <span className="text-grass-green">Dairy Farmers.</span></>}
        subtitle="We bridge the gap between traditional wisdom and modern technology to build a more sustainable future for agriculture."
      />

      <section className="py-20 px-6 md:px-8 max-w-5xl mx-auto">
        <div className="bg-white p-12 md:p-20 rounded-[40px] md:rounded-[80px] border border-black/5 shadow-premium relative overflow-hidden">
           <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-black mb-12 tracking-tight">The Story of CattleOS</h2>
              <div className="space-y-8 text-lg md:text-xl text-black/60 font-medium leading-relaxed">
                 <p>
                    Founded in the heart of Kerala, CattleOS began with a simple observation: while the world was digitizing rapidly, the backbone of our economy—dairy farming—was being left behind. Farmers were still relying on handwritten logs and memory to track the health and production of their most valuable assets.
                 </p>
                 <p>
                    We set out to build more than just a software platform. We wanted to create a digital ecosystem that honors the dignity of the farmer while providing them with the precision tools of a modern tech startup.
                 </p>
                 <p>
                    Today, CattleOS is the leading digital cattle passport system in the region, helping thousands of farmers transition from guesswork to data-driven growth.
                 </p>
              </div>
           </div>
           <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-grass-green/5 rounded-full blur-[100px]"></div>
        </div>
      </section>

      <section className="py-32 px-6 md:px-8 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
         {[
           { icon: Target, title: "Our Vision", desc: "To be the global standard for livestock identity and health governance." },
           { icon: Heart, title: "Our Values", desc: "Trust, transparency, and localized empowerment in every line of code." },
           { icon: Users, title: "Our Community", desc: "A growing network of forward-thinking farmers and agricultural experts." }
         ].map((item, i) => (
           <motion.div 
             key={i}
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             transition={{ delay: i * 0.1 }}
             viewport={{ once: true }}
             className="flex flex-col items-center"
           >
              <div className="w-20 h-20 bg-white rounded-[32px] border border-black/5 shadow-premium flex items-center justify-center text-grass-green mb-8">
                 <item.icon size={36} />
              </div>
              <h3 className="text-2xl font-black mb-4 tracking-tight">{item.title}</h3>
              <p className="text-black/60 font-medium leading-relaxed">{item.desc}</p>
           </motion.div>
         ))}
      </section>

      <section className="py-32 bg-patch-black text-white rounded-[60px] md:rounded-[120px] mx-4 md:mx-8 mb-20 relative overflow-hidden">
         <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-grass-green/10 to-transparent"></div>
         <div className="max-w-7xl mx-auto px-6 md:px-12 text-center">
            <h2 className="text-3xl md:text-6xl font-black mb-16 tracking-tight">Trust & Quality Metrics</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
               {[
                 { label: "Farmers Empowered", value: "5k+", icon: Users },
                 { label: "Digital Passports", value: "25k+", icon: ShieldCheck },
                 { label: "Yield Accuracy", value: "99.8%", icon: Award },
                 { label: "Regional Nodes", value: "12", icon: Globe }
               ].map((stat, i) => (
                 <div key={i} className="flex flex-col items-center">
                    <div className="text-grass-green mb-4 opacity-50"><stat.icon size={24} /></div>
                    <p className="text-4xl md:text-6xl font-black mb-2">{stat.value}</p>
                    <p className="text-white/40 text-[10px] md:text-xs font-black uppercase tracking-widest">{stat.label}</p>
                 </div>
               ))}
            </div>
         </div>
      </section>

      <CTASection />
    </div>
  );
}
