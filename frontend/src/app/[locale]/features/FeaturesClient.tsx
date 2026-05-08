"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, BarChart3, Leaf, QrCode, Bell, HeartPulse, Globe, Smartphone, Zap } from 'lucide-react';
import { PageHeader, CTASection } from '@/components/marketing/MarketingUI';

const features = [
  {
    icon: QrCode,
    title: "Digital Cattle Passports",
    desc: "Instant QR-ready profiles for every animal. Store ancestry, health records, and production history in a secure digital vault.",
    color: "bg-blue-500",
    shadow: "shadow-blue-200"
  },
  {
    icon: BarChart3,
    title: "Milk Production Analytics",
    desc: "Real-time production tracking with predictive AI insights. Forecast revenue and identify top-performing cattle automatically.",
    color: "bg-grass-green",
    shadow: "shadow-green-200"
  },
  {
    icon: HeartPulse,
    title: "Health & Vital Monitoring",
    desc: "Continuous health surveillance. Track vaccinations, deworming, and medical history with enterprise-grade precision.",
    color: "bg-red-500",
    shadow: "shadow-red-200"
  },
  {
    icon: Bell,
    title: "Automated Reminders",
    desc: "Never miss a vaccination or check-up. Automated SMS and WhatsApp alerts for scheduled health interventions.",
    color: "bg-amber-500",
    shadow: "shadow-amber-200"
  },
  {
    icon: Zap,
    title: "AI Insights Dashboard",
    desc: "Harness the power of AI to optimize feed cycles, breeding schedules, and overall farm efficiency.",
    color: "bg-patch-black",
    shadow: "shadow-gray-300"
  },
  {
    icon: Globe,
    title: "Multilingual Support",
    desc: "Built for local impact. Full support for Malayalam and English to empower every farmer in Kerala.",
    color: "bg-purple-500",
    shadow: "shadow-purple-200"
  }
];

export default function FeaturesClient() {
  return (
    <div className="bg-ivory min-h-screen">
      <PageHeader 
        badge="Enterprise Features"
        title={<>Precision tools for the <span className="text-grass-green">Digital Farm.</span></>}
        subtitle="Every tool you need to manage health, production, and profitability in one seamless platform."
      />

      <section className="py-20 px-6 md:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="bg-white p-10 rounded-[32px] border border-black/5 shadow-premium hover:shadow-2xl transition-all group"
            >
              <div className={`w-16 h-16 ${feature.color} text-white rounded-[20px] flex items-center justify-center mb-8 shadow-lg ${feature.shadow} group-hover:rotate-6 transition-all duration-500`}>
                <feature.icon size={32} />
              </div>
              <h3 className="text-2xl font-black mb-4 tracking-tight">{feature.title}</h3>
              <p className="text-black/60 font-medium leading-relaxed">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="py-32 bg-white rounded-[60px] md:rounded-[120px] mx-4 md:mx-8 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
           <div>
              <h2 className="text-3xl md:text-6xl font-black mb-10 leading-tight tracking-tight">
                 PWA & Mobile Ready <br /> <span className="text-grass-green">Management on the go.</span>
              </h2>
              <p className="text-lg md:text-xl text-black/60 font-medium leading-relaxed mb-12">
                 CattleOS is a Progressive Web App, meaning you can install it on your phone just like a native app. Works offline and stays synced with the cloud.
              </p>
              <div className="space-y-6">
                 {[
                   "Instant loading even on slow 4G",
                   "Offline data entry in remote farm areas",
                   "Push notifications for critical health alerts",
                   "Cross-device sync (Mobile, Tablet, Desktop)"
                 ].map((item, i) => (
                   <div key={i} className="flex items-center gap-4 text-lg font-bold text-black/70">
                      <div className="w-6 h-6 rounded-full bg-grass-green/10 flex items-center justify-center">
                         <Smartphone size={14} className="text-grass-green" />
                      </div>
                      {item}
                   </div>
                 ))}
              </div>
           </div>
           <div className="relative flex justify-center">
              <div className="relative w-full max-w-[400px] aspect-[9/19] bg-patch-black rounded-[60px] border-[8px] border-black/10 shadow-2xl overflow-hidden p-4">
                 <div className="w-full h-full bg-white rounded-[40px] flex items-center justify-center flex-col p-8 text-center">
                    <div className="w-20 h-20 bg-grass-green rounded-3xl flex items-center justify-center text-white mb-6">
                       <ShieldCheck size={40} />
                    </div>
                    <h4 className="font-black text-2xl mb-2">CattleOS</h4>
                    <p className="text-black/40 text-xs uppercase tracking-widest font-black">Digital Passport System</p>
                 </div>
              </div>
           </div>
        </div>
      </section>

      <CTASection />
    </div>
  );
}
