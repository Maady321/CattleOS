"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { PageHeader, CTASection } from '@/components/marketing/MarketingUI';
import { useParams } from 'next/navigation';
import { translations, Language } from '@/lib/translations';

export default function PricingClient() {
  const params = useParams();
  const lang = (params.locale as Language) || 'en';
  const t = translations[lang].pricing;

  const plans = [
    {
      ...t.starter,
      cta: t.ctaFree,
      popular: false,
      color: "bg-black/5 text-black",
      href: "/login"
    },
    {
      ...t.pro,
      cta: t.ctaBuy,
      popular: true,
      color: "bg-grass-green text-white",
      href: "/login"
    },
    {
      ...t.business,
      cta: t.ctaContact,
      popular: false,
      color: "bg-patch-black text-white",
      href: "/contact"
    }
  ];

  return (
    <div className="bg-ivory min-h-screen">
      <PageHeader 
        badge="Simple Pricing"
        title={<>{t.title.split(' ').map((word, i) => i === t.title.split(' ').length - 1 ? <span key={i} className="text-grass-green">{word}</span> : word + ' ')}</>}
        subtitle={t.sub}
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
                  {t.mostPopular}
                </div>
              )}
              
              <div className="mb-10">
                <h3 className="text-2xl font-black mb-4">{plan.name}</h3>
                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-5xl font-black tracking-tighter">₹{plan.price}</span>
                  <span className="text-black/40 font-bold">{t.monthly}</span>
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
                href={`/${lang}${plan.href}`}
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
                        <th className="py-6 font-black text-center text-xs tracking-widest">Elite</th>
                     </tr>
                  </thead>
                  <tbody className="font-bold text-sm">
                     {[
                       { name: "Digital Passport (QR)", starter: true, pro: true, elite: true },
                       { name: "Health Analytics", starter: "Basic", pro: "Advanced", elite: "Full" },
                       { name: "Staff Management", starter: false, pro: false, elite: true },
                       { name: "Data Exports", starter: "CSV", pro: "CSV/PDF", elite: "Custom" },
                       { name: "AI Diagnostics", starter: false, pro: true, elite: true },
                       { name: "Support", starter: "Community", pro: "Email", elite: "24/7 Priority" }
                     ].map((row, i) => (
                       <tr key={i} className="border-b border-black/5 group hover:bg-black/[0.01] transition-colors">
                          <td className="py-6 text-black/70">{row.name}</td>
                          <td className="py-6 text-center">{typeof row.starter === 'boolean' ? (row.starter ? <Check className="mx-auto text-grass-green" size={16} /> : "—") : row.starter}</td>
                          <td className="py-6 text-center text-grass-green">{typeof row.pro === 'boolean' ? (row.pro ? <Check className="mx-auto text-grass-green" size={16} /> : "—") : row.pro}</td>
                          <td className="py-6 text-center">{typeof row.elite === 'boolean' ? (row.elite ? <Check className="mx-auto text-grass-green" size={16} /> : "—") : row.elite}</td>
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
