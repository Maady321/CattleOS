"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Check, ShieldCheck, Zap, Star, LayoutGrid, BarChart3, QrCode } from 'lucide-react';
import { PageHeader, CTASection } from '@/components/marketing/MarketingUI';

const plans = [
  {
    name: "Starter",
    price: "0",
    desc: "For small hobby farms and individual owners.",
    features: [
      "Up to 5 Cattle Profiles",
      "Digital Cattle Passports",
      "Basic Production Logging",
      "Standard Health Records",
      "Malayalam Support"
    ],
    cta: "Start for Free",
    popular: false,
    color: "bg-black/5 text-black"
  },
  {
    name: "Professional",
    price: "1,499",
    desc: "Optimized for scaling commercial dairy farms.",
    features: [
      "Unlimited Cattle Profiles",
      "Advanced Milk Analytics",
      "AI Health Diagnostics",
      "Vaccination Reminders",
      "PWA App Installation",
      "Premium Dashboard Features"
    ],
    cta: "Get Started",
    popular: true,
    color: "bg-grass-green text-white"
  },
  {
    name: "Enterprise",
    price: "4,999",
    desc: "Full infrastructure for cooperatives and large estates.",
    features: [
      "Multiple Farm Locations",
      "Staff Role Management",
      "Custom API Access",
      "Advanced Export Reports",
      "24/7 Dedicated Support",
      "White-label Reports"
    ],
    cta: "Contact Sales",
    popular: false,
    color: "bg-patch-black text-white"
  }
];

export default function PricingClient() {
  return (
    <div className="bg-ivory min-h-screen">
      <PageHeader 
        badge="Simple Pricing"
        title={<>Plans that grow with your <span className="text-grass-green">Herd.</span></>}
        subtitle="Transparent pricing with no hidden fees. Choose the plan that fits your farm's needs."
      />

      <section className="pb-32 px-6 md:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className={`relative bg-white rounded-[40px] p-10 md:p-12 border border-black/5 shadow-premium flex flex-col ${plan.popular ? 'ring-2 ring-grass-green scale-105 z-10' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-grass-green text-white px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest shadow-xl shadow-green-200">
                  Most Popular
                </div>
              )}
              
              <div className="mb-10">
                <h3 className="text-2xl font-black mb-4">{plan.name}</h3>
                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-5xl font-black tracking-tighter">₹{plan.price}</span>
                  <span className="text-black/40 font-bold">/ month</span>
                </div>
                <p className="text-black/60 font-medium text-sm leading-relaxed">{plan.desc}</p>
              </div>

              <div className="space-y-4 mb-12 flex-1">
                {plan.features.map((feature, j) => (
                  <div key={j} className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${plan.popular ? 'bg-grass-green/10 text-grass-green' : 'bg-black/5 text-black/40'}`}>
                      <Check size={12} strokeWidth={4} />
                    </div>
                    <span className="text-sm font-bold text-black/70">{feature}</span>
                  </div>
                ))}
              </div>

              <a 
                href={plan.name === "Enterprise" ? "/contact" : "/login"}
                className={`w-full py-5 rounded-2xl font-black text-center transition-all shadow-lg active:scale-95 ${plan.color}`}
              >
                {plan.cta}
              </a>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="py-32 bg-white rounded-[60px] md:rounded-[120px] mx-4 md:mx-8 mb-20">
         <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-5xl font-black mb-16 tracking-tight">Feature Comparison</h2>
            
            <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                  <thead>
                     <tr className="border-b border-black/5">
                        <th className="py-6 font-black text-black/40 uppercase text-xs tracking-widest">Feature</th>
                        <th className="py-6 font-black text-center text-xs tracking-widest">Starter</th>
                        <th className="py-6 font-black text-center text-xs tracking-widest text-grass-green">Pro</th>
                        <th className="py-6 font-black text-center text-xs tracking-widest">Enterprise</th>
                     </tr>
                  </thead>
                  <tbody className="font-bold text-sm">
                     {[
                       { name: "Digital Passport (QR)", starter: true, pro: true, enterprise: true },
                       { name: "Health Analytics", starter: "Basic", pro: "Advanced", enterprise: "Full" },
                       { name: "Staff Management", starter: false, pro: false, enterprise: true },
                       { name: "Data Exports", starter: "CSV", pro: "CSV/PDF", enterprise: "Custom" },
                       { name: "AI Diagnostics", starter: false, pro: true, enterprise: true },
                       { name: "Support", starter: "Community", pro: "Email", enterprise: "24/7 Priority" }
                     ].map((row, i) => (
                       <tr key={i} className="border-b border-black/5 group hover:bg-black/[0.01] transition-colors">
                          <td className="py-6 text-black/70">{row.name}</td>
                          <td className="py-6 text-center">{typeof row.starter === 'boolean' ? (row.starter ? <Check className="mx-auto text-grass-green" size={16} /> : "—") : row.starter}</td>
                          <td className="py-6 text-center text-grass-green">{typeof row.pro === 'boolean' ? (row.pro ? <Check className="mx-auto text-grass-green" size={16} /> : "—") : row.pro}</td>
                          <td className="py-6 text-center">{typeof row.enterprise === 'boolean' ? (row.enterprise ? <Check className="mx-auto text-grass-green" size={16} /> : "—") : row.enterprise}</td>
                       </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>
      </section>

      <CTASection />
    </div>
  );
}
