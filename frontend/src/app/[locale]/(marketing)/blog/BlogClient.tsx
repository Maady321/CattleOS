"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, User, ArrowRight, Tag } from 'lucide-react';
import { PageHeader, CTASection } from '@/components/marketing/MarketingUI';
import Image from 'next/image';

const articles = [
  {
    title: "10 Tips for Improving Milk Production in Dairy Farms",
    slug: "tips-improving-milk-production",
    date: "May 5, 2026",
    category: "Management",
    desc: "Discover proven strategies to boost your herd's daily milk yield through nutrition and stress management."
  },
  {
    title: "The Future of Cattle Tracking: Why QR Passports are Essential",
    slug: "future-cattle-tracking-qr-passports",
    date: "May 1, 2026",
    category: "Technology",
    desc: "How digital identity is transforming livestock governance and farm efficiency in modern agriculture."
  },
  {
    title: "Common Cattle Diseases and How to Prevent Them",
    slug: "common-cattle-diseases-prevention",
    date: "April 28, 2026",
    category: "Health",
    desc: "A comprehensive guide to identifying early signs of illness and maintaining a healthy herd."
  },
  {
    title: "Modernizing Kerala's Dairy Sector through AI Insights",
    slug: "modernizing-kerala-dairy-ai",
    date: "April 22, 2026",
    category: "Regional",
    desc: "Exploring the impact of localized technology on small-scale dairy farmers across the state."
  },
  {
    title: "The Role of Nutrition in Cattle Health and Longevity",
    slug: "role-nutrition-cattle-health",
    date: "April 15, 2026",
    category: "Management",
    desc: "Optimizing feed cycles and nutrient intake for sustainable livestock growth."
  },
  {
    title: "Automating Vaccination Reminders for Your Herd",
    slug: "automating-vaccination-reminders",
    date: "April 10, 2026",
    category: "Technology",
    desc: "How automated alerts can save your farm from critical health outbreaks."
  },
  {
    title: "Breeding Management: Data-Driven Strategies for Success",
    slug: "breeding-management-data-driven",
    date: "April 5, 2026",
    category: "Management",
    desc: "Using historical data to optimize breeding cycles and improve herd quality."
  },
  {
    title: "Navigating Government Subsidies for Dairy Farmers",
    slug: "government-subsidies-dairy-farmers",
    date: "March 28, 2026",
    category: "Insights",
    desc: "A step-by-step guide to applying for agricultural grants with digital documentation."
  },
  {
    title: "Scaling Your Farm: From 5 to 50 Cattle with CattleOS",
    slug: "scaling-farm-cattleos-case-study",
    date: "March 20, 2026",
    category: "Growth",
    desc: "How modular management tools enable small farms to transition into commercial enterprises."
  },
  {
    title: "Why Multilingual Software is the Key to Rural Tech Adoption",
    slug: "multilingual-software-rural-tech",
    date: "March 15, 2026",
    category: "Regional",
    desc: "Breaking the language barrier in agricultural technology for better farmer engagement."
  }
];

export default function BlogClient() {
  return (
    <div className="bg-ivory min-h-screen">
      <PageHeader 
        badge="CattleOS Insights"
        title={<>Expert advice for the <br /> <span className="text-grass-green">Modern Farmer.</span></>}
        subtitle="The latest news, guides, and stories from the intersection of technology and agriculture."
      />

      <section className="pb-32 px-6 md:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {articles.map((post, i) => (
            <motion.article 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              viewport={{ once: true }}
              className="flex flex-col bg-white rounded-[40px] border border-black/5 shadow-premium hover:shadow-2xl transition-all overflow-hidden group"
            >
              <div className="aspect-[16/10] bg-patch-black/5 relative overflow-hidden">
                 <div className="absolute top-6 left-6 z-10 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-black">
                    {post.category}
                 </div>
                 <div className="w-full h-full bg-gradient-to-tr from-patch-black/20 to-transparent group-hover:scale-110 transition-transform duration-1000"></div>
              </div>
              <div className="p-10 flex-1 flex flex-col">
                 <div className="flex items-center gap-4 text-[10px] font-bold text-black/30 uppercase tracking-widest mb-6">
                    <span className="flex items-center gap-1.5"><Calendar size={12} /> {post.date}</span>
                    <span className="flex items-center gap-1.5"><User size={12} /> Team CattleOS</span>
                 </div>
                 <h3 className="text-2xl font-black mb-4 leading-tight group-hover:text-grass-green transition-colors">
                    <a href={`/blog/${post.slug}`}>{post.title}</a>
                 </h3>
                 <p className="text-black/60 font-medium leading-relaxed mb-8 text-sm line-clamp-3">
                    {post.desc}
                 </p>
                 <div className="mt-auto pt-6 border-t border-black/5 flex items-center justify-between">
                    <a href={`/blog/${post.slug}`} className="text-[10px] font-black uppercase tracking-widest text-black hover:text-grass-green transition-colors">Read Article</a>
                    <ArrowRight size={16} className="text-black/10 group-hover:text-grass-green group-hover:translate-x-1 transition-all" />
                 </div>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      <CTASection />
    </div>
  );
}
