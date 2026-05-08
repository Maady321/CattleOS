"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, Search } from 'lucide-react';
import { PageHeader, CTASection } from '@/components/marketing/MarketingUI';

const faqData = [
  {
    category: "General",
    questions: [
      { q: "What is CattleOS?", a: "CattleOS is a comprehensive, AI-powered software platform designed for dairy farm management and livestock tracking. It helps farmers manage health records, milk production, and digital identities for their cattle." },
      { q: "Is CattleOS free to use?", a: "We offer a 'Starter' plan which is free for up to 5 cattle profiles. For larger farms and advanced features like AI diagnostics, we have Professional and Enterprise tiers." },
      { q: "Do I need special hardware to use CattleOS?", a: "No special hardware is required. CattleOS is a cloud-based platform accessible via any smartphone, tablet, or computer with an internet connection." },
      { q: "Is my data secure on CattleOS?", a: "Yes, we use enterprise-grade encryption (AES-256) and secure cloud infrastructure to ensure your farm data is always private and protected." }
    ]
  },
  {
    category: "Features",
    questions: [
      { q: "How do QR Digital Passports work?", a: "Once you register a cow, CattleOS generates a unique QR code. You can print this on ear tags or keep it digitally. Scanning it instantly reveals the animal's full history and health status." },
      { q: "Can I track milk production for each cow?", a: "Yes, you can log daily yields per session (Morning/Evening) for each individual animal and view detailed performance analytics." },
      { q: "Does CattleOS send vaccination reminders?", a: "Yes, CattleOS allows you to schedule vaccinations and medical check-ups, sending automated reminders via the app and SMS/WhatsApp." },
      { q: "Is there an offline mode?", a: "CattleOS is a Progressive Web App (PWA) that supports offline data entry, which automatically syncs once you are back online." }
    ]
  },
  {
    category: "Support & Regional",
    questions: [
      { q: "Is CattleOS available in Malayalam?", a: "Yes, CattleOS is fully localized with a complete Malayalam interface to empower dairy farmers across Kerala." },
      { q: "How can I contact technical support?", a: "You can reach us via the in-app live chat, email support@cattleos.com, or our regional hotline for Enterprise customers." },
      { q: "Does CattleOS help with government subsidies?", a: "CattleOS can generate detailed production and health reports that can be used as supporting documentation for government subsidy applications." },
      { q: "Can I manage multiple farm locations?", a: "Our Enterprise plan supports multi-site management, allowing you to oversee different farm locations from a single dashboard." }
    ]
  },
  {
    category: "Health & Analytics",
    questions: [
      { q: "What kind of AI insights does CattleOS provide?", a: "Our AI engine analyzes production trends to predict future yields and identifies potential health issues before they become critical." },
      { q: "Can I track breeding cycles?", a: "Yes, CattleOS includes specialized tools for tracking heat cycles, insemination dates, and pregnancy progress." },
      { q: "Is there a limit to how many logs I can create?", a: "There is no limit to the number of production or health logs you can create on our paid plans." },
      { q: "Can I export my farm data?", a: "Yes, you can export all your data in CSV or PDF formats at any time for your own records or audits." }
    ]
  },
  {
    category: "Account & Billing",
    questions: [
      { q: "How do I upgrade my plan?", a: "You can upgrade your plan at any time through the 'Billing' section in your dashboard settings." },
      { q: "Can I cancel my subscription anytime?", a: "Yes, we offer monthly and yearly plans that can be cancelled at any time without hidden fees." },
      { q: "Are there discounts for large cooperatives?", a: "Yes, we offer special pricing for dairy cooperatives and large-scale agricultural organizations. Please contact our sales team." },
      { q: "Can I add staff members to my account?", a: "Staff and role management is available on the Enterprise plan, allowing you to give specific permissions to farm workers." }
    ]
  }
];

export default function FAQClient() {
  const [openIndex, setOpenIndex] = useState<string | null>("General-0");
  const [searchQuery, setSearchQuery] = useState("");

  const toggleFAQ = (id: string) => {
    setOpenIndex(openIndex === id ? null : id);
  };

  return (
    <div className="bg-ivory min-h-screen">
      <PageHeader 
        badge="Knowledge Base"
        title={<>Frequently Asked <span className="text-grass-green">Questions.</span></>}
        subtitle="Everything you need to know about managing your farm with CattleOS."
      />

      <section className="pb-32 px-6 md:px-8 max-w-4xl mx-auto">
        {/* Search Bar */}
        <div className="mb-16 relative">
           <div className="absolute inset-y-0 left-6 flex items-center text-black/20">
              <Search size={20} />
           </div>
           <input 
             type="text" 
             placeholder="Search questions..."
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
             className="w-full pl-16 pr-8 py-6 bg-white rounded-[32px] border border-black/5 shadow-premium outline-none focus:ring-2 focus:ring-grass-green/20 transition-all font-bold text-lg"
           />
        </div>

        <div className="space-y-16">
          {faqData.map((category, catIndex) => (
            <div key={catIndex}>
               <h3 className="text-xs font-black uppercase tracking-[0.3em] text-black/30 mb-8 ml-2">{category.category}</h3>
               <div className="space-y-4">
                 {category.questions.filter(q => q.q.toLowerCase().includes(searchQuery.toLowerCase())).map((item, qIndex) => {
                   const id = `${category.category}-${qIndex}`;
                   const isOpen = openIndex === id;
                   return (
                     <div 
                       key={qIndex}
                       className={`bg-white rounded-[32px] border border-black/5 transition-all overflow-hidden ${isOpen ? 'shadow-2xl ring-1 ring-black/5' : 'hover:bg-black/[0.01]'}`}
                     >
                       <button 
                         onClick={() => toggleFAQ(id)}
                         className="w-full px-8 py-8 flex items-center justify-between text-left"
                       >
                         <span className="text-xl font-black pr-8">{item.q}</span>
                         <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isOpen ? 'bg-patch-black text-white' : 'bg-black/5 text-black/40'}`}>
                           {isOpen ? <Minus size={20} /> : <Plus size={20} />}
                         </div>
                       </button>
                       <AnimatePresence>
                         {isOpen && (
                           <motion.div 
                             initial={{ height: 0, opacity: 0 }}
                             animate={{ height: "auto", opacity: 1 }}
                             exit={{ height: 0, opacity: 0 }}
                             className="px-8 pb-8"
                           >
                             <p className="text-lg text-black/60 font-medium leading-relaxed border-t border-black/5 pt-6">
                               {item.a}
                             </p>
                           </motion.div>
                         )}
                       </AnimatePresence>
                     </div>
                   );
                 })}
               </div>
            </div>
          ))}
        </div>
      </section>

      <CTASection />
    </div>
  );
}
