"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, MessageSquare, Phone, MapPin, Send, CheckCircle2, ArrowRight } from 'lucide-react';
import { PageHeader } from '@/components/marketing/MarketingUI';

export default function ContactClient() {
  const [formState, setFormState] = useState<'idle' | 'sending' | 'sent'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormState('sending');
    setTimeout(() => setFormState('sent'), 1500);
  };

  return (
    <div className="bg-ivory min-h-screen">
      <PageHeader 
        badge="Contact Us"
        title={<>Let's start a <span className="text-grass-green">Conversation.</span></>}
        subtitle="Have questions about CattleOS? Our team is here to help you optimize your farm."
      />

      <section className="pb-32 px-6 md:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-20">
          
          {/* Contact Form */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white p-8 md:p-12 rounded-[40px] border border-black/5 shadow-premium"
          >
            {formState === 'sent' ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-20">
                <div className="w-20 h-20 bg-grass-green/10 text-grass-green rounded-full flex items-center justify-center mb-6">
                  <CheckCircle2 size={40} />
                </div>
                <h3 className="text-3xl font-black mb-4">Message Sent!</h3>
                <p className="text-black/60 font-medium max-w-sm">We've received your inquiry and will get back to you within 24 hours.</p>
                <button onClick={() => setFormState('idle')} className="mt-8 text-grass-green font-black uppercase text-xs tracking-widest hover:underline">Send another message</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-black/40 ml-1">Full Name</label>
                    <input required type="text" className="w-full px-6 py-4 bg-black/5 rounded-2xl border-none font-bold outline-none focus:ring-2 focus:ring-grass-green/20 transition-all" placeholder="John Doe" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-black/40 ml-1">Email Address</label>
                    <input required type="email" className="w-full px-6 py-4 bg-black/5 rounded-2xl border-none font-bold outline-none focus:ring-2 focus:ring-grass-green/20 transition-all" placeholder="john@example.com" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-black/40 ml-1">Subject</label>
                  <select className="w-full px-6 py-4 bg-black/5 rounded-2xl border-none font-bold outline-none focus:ring-2 focus:ring-grass-green/20 transition-all appearance-none">
                    <option>General Inquiry</option>
                    <option>Sales & Pricing</option>
                    <option>Technical Support</option>
                    <option>Partnership</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-black/40 ml-1">Message</label>
                  <textarea required rows={5} className="w-full px-6 py-4 bg-black/5 rounded-2xl border-none font-bold outline-none focus:ring-2 focus:ring-grass-green/20 transition-all resize-none" placeholder="Tell us more about your farm..."></textarea>
                </div>
                <button 
                  type="submit" 
                  disabled={formState === 'sending'}
                  className="w-full py-5 bg-patch-black text-white rounded-[24px] font-black text-lg flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-xl disabled:opacity-50"
                >
                  {formState === 'sending' ? 'Sending...' : <>Send Message <Send size={20} /></>}
                </button>
              </form>
            )}
          </motion.div>

          {/* Contact Info */}
          <div className="space-y-12">
             <div>
                <h3 className="text-3xl font-black mb-8">Other ways to reach us</h3>
                <div className="space-y-6">
                   {[
                     { icon: Mail, label: "Email Support", value: "support@cattleos.com" },
                     { icon: MessageSquare, label: "Live Chat", value: "Available 24/7 in-app" },
                     { icon: Phone, label: "Sales Hotline", value: "+91 (484) 2345-678" },
                     { icon: MapPin, label: "Headquarters", value: "Infopark, Kochi, Kerala" }
                   ].map((item, i) => (
                     <div key={i} className="flex items-center gap-6 p-6 bg-white rounded-3xl border border-black/5 shadow-premium">
                        <div className="w-12 h-12 bg-grass-green/10 text-grass-green rounded-2xl flex items-center justify-center">
                           <item.icon size={24} />
                        </div>
                        <div>
                           <p className="text-[10px] font-black uppercase tracking-widest text-black/30 mb-1">{item.label}</p>
                           <p className="text-lg font-black">{item.value}</p>
                        </div>
                     </div>
                   ))}
                </div>
             </div>

             <div className="bg-patch-black p-10 rounded-[40px] text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-grass-green/20 blur-[60px]"></div>
                <h4 className="text-2xl font-black mb-4 relative z-10">Visit our help center</h4>
                <p className="text-white/40 font-medium mb-8 relative z-10">Find answers to common questions about setup, billing, and cattle health tracking.</p>
                <a href="/faq" className="inline-flex items-center gap-2 text-grass-green font-black uppercase text-xs tracking-widest hover:underline relative z-10">
                   Browse Knowledge Base <ArrowRight size={14} />
                </a>
             </div>
          </div>

        </div>
      </section>
    </div>
  );
}
