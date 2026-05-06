"use client";

import React, { useState } from 'react';
import { LayoutDashboard, Users, HeartPulse, Milk, Bell, Settings, LogOut, Search, PlusCircle } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useCattleStore } from '@/store/cattleStore';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import OneTapActionMenu from '@/components/ui/OneTapActionMenu';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { logout, user } = useAuthStore();
  const { alerts } = useCattleStore();
  const router = useRouter();
  const pathname = usePathname();

  const unreadCount = alerts.filter(a => !a.isRead).length;

  // FARMER-NATIVE IA (Information Architecture)
  const menuItems = [
    { icon: LayoutDashboard, label: 'Home', href: '/dashboard' },
    { icon: Users, label: 'My Herd', href: '/dashboard/cattle' },
    { icon: Milk, label: 'Production', href: '/dashboard/production' },
    { icon: HeartPulse, label: 'Health', href: '/dashboard/health' },
    { icon: Bell, label: 'Alerts', href: '/dashboard/alerts' },
  ];

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-emerald-500/30 overflow-x-hidden font-sans">
      {/* ELITE TOP BAR - Minimal & High Visibility */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-black/60 backdrop-blur-2xl border-b border-white/5 z-50 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Milk className="text-white w-5 h-5" />
          </div>
          <h1 className="text-xl font-black tracking-tighter text-white italic">
            Cattle<span className="text-emerald-500">OS</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push('/dashboard/settings')}
            className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <Settings size={20} />
          </button>
        </div>
      </header>

      {/* MAIN VIEWPORT - Padded for Top Bar and Bottom Nav */}
      <main className="pt-20 pb-36 px-4 md:px-8 max-w-lg md:max-w-4xl mx-auto">
        <header className="mb-8">
           <h2 className="text-3xl font-black tracking-tight text-white">
             {menuItems.find(item => item.href === pathname)?.label || 'Overview'}
           </h2>
           <p className="text-slate-500 text-sm font-medium mt-1">
             {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
           </p>
        </header>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          {children}
        </motion.div>
      </main>

      {/* ONE-THUMB BOTTOM NAVIGATION - Elite Rural Ergonomics */}
      <nav className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-3xl border-t border-white/10 z-[90] pb-safe">
        <div className="flex justify-between items-center h-20 max-w-lg mx-auto px-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`relative flex flex-col items-center justify-center gap-1.5 flex-1 h-full transition-all active:scale-90 ${
                  isActive ? 'text-emerald-400' : 'text-slate-500'
                }`}
              >
                <div className={`p-2 rounded-2xl transition-all ${isActive ? 'bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.1)]' : ''}`}>
                  <item.icon size={isActive ? 24 : 22} strokeWidth={isActive ? 3 : 2} />
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest leading-none">
                  {item.label}
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

      {/* OFFLINE STATUS INDICATOR */}
      <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] pointer-events-none">
         <div className="bg-emerald-500/10 backdrop-blur-md border border-emerald-500/20 px-3 py-1 rounded-full flex items-center gap-2 shadow-2xl shadow-emerald-500/20">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">System Online</span>
         </div>
      </div>
    </div>
  );
}
