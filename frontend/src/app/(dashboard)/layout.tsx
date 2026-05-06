"use client";

import React, { useState } from 'react';
import { LayoutDashboard, Users, HeartPulse, Milk, Bell, Settings, LogOut, Search, PlusCircle } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useCattleStore } from '@/store/cattleStore';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import OneTapActionMenu from '@/components/ui/OneTapActionMenu';
import { translations, Language } from '@/lib/translations';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { logout, user, updateUser } = useAuthStore();
  const { alerts, cattle } = useCattleStore();
  const router = useRouter();
  const pathname = usePathname();

  const lang = (user?.language || 'en') as Language;
  const t = translations[lang] || translations.en;

  const unreadCount = alerts.filter(a => !a.isRead).length;

  // FARMER-NATIVE IA (Information Architecture)
  const menuItems = [
    { icon: LayoutDashboard, label: t.dashboard || 'Home', short: 'Home', href: '/dashboard' },
    { icon: Users, label: t.myHerd || 'Herd', short: 'Herd', href: '/dashboard/cattle' },
    { icon: Milk, label: t.production.title || 'Milk', short: 'Milk', href: '/dashboard/production' },
    { icon: HeartPulse, label: t.health.title || 'Health', short: 'Health', href: '/dashboard/health' },
    { icon: Bell, label: t.alerts || 'Alerts', short: 'Alerts', href: '/dashboard/alerts' },
  ];

  const toggleLang = () => {
    updateUser({ language: lang === 'en' ? 'ml' : 'en' });
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-emerald-500/30 overflow-x-hidden font-sans flex">
      
      {/* DESKTOP SIDEBAR - Elite Productivity */}
      <aside className="hidden lg:flex flex-col w-72 h-screen fixed left-0 top-0 bg-slate-900/50 backdrop-blur-3xl border-r border-white/5 z-50 p-6">
        <div className="flex items-center gap-3 mb-12">
          <Link href="/dashboard" className="flex items-center gap-3">
            <Image 
              src="/image.png" 
              alt="CattleOS Logo" 
              width={40} 
              height={40} 
              className="rounded-xl shadow-lg shadow-emerald-500/20"
            />
            <h1 className="text-2xl font-black tracking-tighter text-white italic">
              Cattle<span className="text-emerald-500">OS</span>
            </h1>
          </Link>
        </div>

        <nav className="flex-1 space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold transition-all group ${
                  isActive 
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <item.icon size={22} strokeWidth={isActive ? 3 : 2} />
                <span className="text-sm tracking-tight">{item.label}</span>
                {item.label === 'Alerts' && unreadCount > 0 && (
                  <span className="ml-auto w-5 h-5 bg-red-500 text-white text-[10px] font-black flex items-center justify-center rounded-full">
                    {unreadCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="pt-6 border-t border-white/5 space-y-2">
          <button 
            onClick={toggleLang}
            className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold text-emerald-400 hover:bg-white/5 transition-all"
          >
            <span className="w-6 h-6 flex items-center justify-center bg-emerald-500/10 rounded-lg text-xs">
              {lang === 'en' ? 'ML' : 'EN'}
            </span>
            <span className="text-sm tracking-tight">{lang === 'en' ? 'മലയാളം' : 'English'}</span>
          </button>
          <button 
            onClick={() => router.push('/dashboard/settings')}
            className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold text-slate-400 hover:bg-white/5 hover:text-white transition-all"
          >
            <Settings size={22} />
            <span className="text-sm tracking-tight">{t.settings}</span>
          </button>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut size={22} />
            <span className="text-sm tracking-tight">{t.logout}</span>
          </button>
        </div>
      </aside>

      {/* MOBILE TOP BAR - Hidden on Desktop */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-black/60 backdrop-blur-2xl border-b border-white/5 z-50 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image 
            src="/image.png" 
            alt="CattleOS Logo" 
            width={32} 
            height={32} 
            className="rounded-xl"
          />
          <h1 className="text-xl font-black tracking-tighter text-white italic">
            Cattle<span className="text-emerald-500">OS</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-2">
           {/* SYSTEM STATUS MINI PILL */}
           <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,1)]" />
              <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">Online</span>
           </div>

           <button 
            onClick={toggleLang}
            className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-[10px] uppercase"
          >
            {lang === 'en' ? 'മലയാളം' : 'English'}
          </button>
          <button 
            onClick={() => router.push('/dashboard/settings')}
            className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400"
          >
            <Settings size={20} />
          </button>
        </div>
      </header>

      {/* MAIN VIEWPORT - Responsive Margins */}
      <div className="flex-1 lg:pl-72 min-h-screen">
        <main className="pt-20 lg:pt-12 pb-36 px-4 md:px-12 max-w-5xl mx-auto">
          <header className="mb-10 lg:mb-16 flex justify-between items-end">
             <div>
                <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white">
                  {menuItems.find(item => item.href === pathname)?.label || 'Overview'}
                </h2>
                <p className="text-slate-500 text-sm md:text-base font-medium mt-2">
                  {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
                </p>
             </div>
             
             {/* Desktop Search / Quick Stats */}
             <div className="hidden lg:flex items-center gap-4 bg-white/5 p-2 rounded-2xl border border-white/5">
                <div className="px-4 py-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                   <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Herd Size</span>
                   <p className="text-lg font-black text-white">{cattle.length} Animals</p>
                </div>
                <div className="px-4 py-2 bg-blue-500/10 rounded-xl border border-blue-500/20">
                   <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Status</span>
                   <p className="text-lg font-black text-white">All Active</p>
                </div>
             </div>
          </header>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            {children}
          </motion.div>
        </main>
      </div>

      {/* MOBILE DOWNBAR (BOTTOM NAV) - Hidden on Desktop */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-3xl border-t border-white/10 z-[90] pb-safe">
        <div className="flex justify-between items-center h-20 max-w-lg mx-auto px-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`relative flex flex-col items-center justify-center gap-1.5 flex-1 h-full transition-all active:scale-90 ${
                  isActive ? 'text-emerald-400' : 'text-slate-400'
                }`}
              >
                <div className={`p-2 rounded-2xl transition-all ${isActive ? 'bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.1)]' : ''}`}>
                  <item.icon size={isActive ? 24 : 22} strokeWidth={isActive ? 3 : 2} />
                </div>
                <span className="text-[8px] font-black uppercase tracking-widest leading-none text-center">
                  {item.short}
                </span>
                {isActive && (
                  <motion.div 
                    layoutId="nav-pill" 
                    className="absolute -top-0.5 w-8 h-1 bg-emerald-500 rounded-full" 
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
                {item.label === 'Alerts' && unreadCount > 0 && (
                  <span className="absolute top-3 right-3 w-4 h-4 bg-red-500 text-white text-[8px] font-black flex items-center justify-center rounded-full border-2 border-black animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>
      
      {/* ACTION HUB - Instant Access to Logging */}
      <OneTapActionMenu />

      {/* OFFLINE STATUS INDICATOR - Desktop Only */}
      <div className="hidden lg:block fixed top-8 right-8 z-[100] pointer-events-auto">
         <div className="bg-emerald-500/10 backdrop-blur-md border border-emerald-500/20 px-4 py-2 rounded-2xl flex items-center gap-3 shadow-2xl">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,1)]" />
            <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">System Online</span>
         </div>
      </div>
    </div>
  );
}
