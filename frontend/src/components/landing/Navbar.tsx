"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Languages, Menu, X } from 'lucide-react';
import Image from 'next/image';
import { translations, Language } from '@/lib/translations';
import { usePathname, useParams, useRouter } from 'next/navigation';

interface NavbarProps {}

export const Navbar = () => {
  const pathname = usePathname();
  const params = useParams();
  const router = useRouter();
  
  const currentLocale = (params.locale as Language) || 'en';
  const t = translations[currentLocale];
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const getLocalizedPath = (path: string) => `/${currentLocale}${path}`;

  const toggleLang = () => {
    const newLocale = currentLocale === 'en' ? 'ml' : 'en';
    const newPath = pathname.replace(`/${currentLocale}`, `/${newLocale}`);
    router.push(newPath);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-4 md:px-8 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center bg-white/60 backdrop-blur-xl border border-white/20 px-6 md:px-8 py-3 md:py-4 rounded-[24px] shadow-premium">
        <div className="flex items-center gap-3 text-xl md:text-2xl font-black tracking-tighter">
          <Image 
            src="/image.png" 
            alt="CattleOS Logo" 
            width={40} 
            height={40} 
            className="rounded-xl shadow-lg"
          />
          CattleOS
        </div>
        
        <div className="hidden lg:flex items-center gap-10 font-bold text-sm uppercase tracking-widest text-black/60">
          <a href={getLocalizedPath("/features")} className="hover:text-black transition-colors">Features</a>
          <a href={getLocalizedPath("/pricing")} className="hover:text-black transition-colors">Pricing</a>
          <a href={getLocalizedPath("/about")} className="hover:text-black transition-colors">About</a>
          <a href={getLocalizedPath("/blog")} className="hover:text-black transition-colors">Blog</a>
        </div>

        <div className="hidden md:flex items-center gap-4">
          <button onClick={toggleLang} className="flex items-center gap-2 px-4 py-2 rounded-full border border-black/5 hover:bg-black/5 transition-all font-bold text-xs uppercase">
            <Languages size={14} />
            {currentLocale === 'en' ? 'മലയാളം' : 'English'}
          </button>
          <a href={getLocalizedPath("/login")} className="bg-patch-black text-white px-8 py-3 rounded-full hover:scale-105 active:scale-95 transition-all shadow-premium font-bold text-sm">
            {t.getStarted}
          </a>
        </div>

        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-black/5"
        >
          {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="lg:hidden absolute top-24 left-4 right-4 bg-white/90 backdrop-blur-2xl border border-white/20 p-8 rounded-[32px] shadow-2xl z-40"
          >
            <div className="flex flex-col gap-6">
              <a href={getLocalizedPath("/features")} onClick={() => setIsMenuOpen(false)} className="text-2xl font-black">Features</a>
              <a href={getLocalizedPath("/pricing")} onClick={() => setIsMenuOpen(false)} className="text-2xl font-black">Pricing</a>
              <a href={getLocalizedPath("/about")} onClick={() => setIsMenuOpen(false)} className="text-2xl font-black">About</a>
              <a href={getLocalizedPath("/blog")} onClick={() => setIsMenuOpen(false)} className="text-2xl font-black">Blog</a>
              <a href={getLocalizedPath("/faq")} onClick={() => setIsMenuOpen(false)} className="text-2xl font-black">FAQ</a>
              <div className="pt-6 border-t border-black/5 flex flex-col gap-4">
                <button onClick={toggleLang} className="flex items-center justify-between w-full px-6 py-4 rounded-2xl bg-black/5 font-bold">
                  <span className="flex items-center gap-3"><Languages size={18} /> Language</span>
                  <span>{currentLocale === 'en' ? 'മലയാളം' : 'English'}</span>
                </button>
                <a href={getLocalizedPath("/login")} className="w-full bg-patch-black text-white py-5 rounded-2xl text-center font-black shadow-lg">
                  {t.getStarted}
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
