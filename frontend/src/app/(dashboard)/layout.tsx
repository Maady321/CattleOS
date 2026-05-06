"use client";

import React, { useState } from 'react';
import { LayoutDashboard, Users, HeartPulse, Milk, Pipette, Bell, Settings, LogOut, Menu, X, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useCattleStore } from '@/store/cattleStore';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { logout, user } = useAuthStore();
  const { alerts } = useCattleStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const unreadCount = alerts.filter(a => !a.isRead).length;

  const menuItems = [
    { icon: LayoutDashboard, label: 'Overview', href: '/dashboard', activeColor: 'bg-grass-green', iconColor: 'text-white' },
    { icon: Users, label: 'Cattle', href: '/dashboard/cattle', activeColor: 'bg-grass-green', iconColor: 'text-white' },
    { icon: HeartPulse, label: 'Health', href: '/dashboard/health', activeColor: 'bg-grass-green', iconColor: 'text-white' },
    { icon: Milk, label: 'Production', href: '/dashboard/production', activeColor: 'bg-grass-green', iconColor: 'text-white' },
    { icon: Pipette, label: 'Breeding', href: '/dashboard/breeding', activeColor: 'bg-grass-green', iconColor: 'text-white' },
    { icon: Bell, label: 'Alerts', href: '/dashboard/alerts', activeColor: 'bg-grass-green', iconColor: 'text-white' },
    { icon: ShieldCheck, label: 'Integrity', href: '/dashboard/integrity', activeColor: 'bg-cyan-500', iconColor: 'text-white' },
  ];

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const SidebarContent = () => (
    <>
      <div className="mb-12 flex items-center gap-3">
        <div className="w-20 h-20 flex items-center justify-center group">
           <img 
             src="/image.png" 
             className="w-full h-full object-contain scale-110 group-hover:scale-125 transition-transform duration-500" 
             alt="Logo" 
           />
        </div>
        <div>
           <h1 className="text-2xl font-black tracking-tighter text-white leading-none">
             Cattle<span className="text-grass-green">OS</span>
           </h1>
           <p className="text-[8px] font-black uppercase tracking-[0.3em] text-white/30 mt-1">Smart Herd Tech</p>
        </div>
      </div>

      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsSidebarOpen(false)}
              className={`flex items-center gap-4 px-6 py-4 rounded-2xl font-black transition-all duration-300 ${
                isActive 
                  ? `${item.activeColor} ${item.iconColor} shadow-xl scale-[1.02]` 
                  : 'text-white/40 hover:bg-white/5 hover:text-white hover:translate-x-1'
              }`}
            >
              <div className={`transition-transform duration-300 ${isActive ? 'scale-110' : ''}`}>
                <item.icon size={22} strokeWidth={isActive ? 3 : 2} />
              </div>
              {item.label}
              {item.label === 'Alerts' && unreadCount > 0 && !isActive && (
                <span className="ml-auto w-5 h-5 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full animate-pulse">
                  {unreadCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-8 border-t border-white/10 space-y-6">
        <div className="px-6 py-4 bg-white/5 rounded-[24px] flex items-center gap-4 border border-white/5">
          <div className="w-10 h-10 bg-grass-green rounded-xl flex items-center justify-center text-white font-black shadow-lg overflow-hidden shrink-0">
            {user?.profile_image ? (
              <img src={user.profile_image} className="w-full h-full object-cover" alt="Profile" />
            ) : (
              (user?.full_name || 'SJ').split(' ').map(n => n[0]).join('').toUpperCase()
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-black text-white truncate">{user?.full_name || 'Farm Owner'}</p>
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest truncate">Premium Plan</p>
          </div>
        </div>

        <div className="space-y-2">
          <Link href="/dashboard/settings" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-white/40 hover:bg-white/5 hover:text-white transition-all">
            <Settings size={22} />
            Settings
          </Link>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-red-400 hover:bg-red-400/10 transition-all text-left"
          >
            <LogOut size={22} />
            Logout
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-ivory">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-80 bg-patch-black border-r border-white/5 p-8 flex-col">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.aside 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="lg:hidden fixed inset-y-0 left-0 w-80 bg-patch-black p-8 flex flex-col z-50 shadow-2xl"
            >
              <button 
                onClick={() => setIsSidebarOpen(false)}
                className="absolute top-8 right-8 w-10 h-10 flex items-center justify-center rounded-xl bg-black/5"
              >
                <X size={20} />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto w-full">
        <header className="flex justify-between items-center mb-8 md:mb-12">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden w-12 h-12 flex items-center justify-center rounded-2xl bg-white border border-black/5 shadow-sm"
            >
              <Menu size={24} />
            </button>
            <h2 className="text-2xl md:text-3xl font-extrabold truncate max-w-[200px] sm:max-w-none">
              {menuItems.find(item => item.href === pathname)?.label || 'Dashboard'}
            </h2>
          </div>
          
          <div className="flex items-center gap-3 md:gap-4">
            <button 
              onClick={() => router.push('/dashboard/alerts')}
              className="p-3 bg-white rounded-2xl border border-black/5 shadow-sm relative group hover:scale-105 active:scale-95 transition-all"
            >
              <Bell size={20} className={unreadCount > 0 ? 'text-black animate-swing' : 'text-black/40'} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-white shadow-lg group-hover:scale-110 transition-transform">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-grass-green flex items-center justify-center text-white font-bold overflow-hidden shadow-lg border-2 border-white">
              {user?.profile_image ? (
                 <img src={user.profile_image} className="w-full h-full object-cover" alt="Profile" />
              ) : (
                (user?.full_name || 'SJ').split(' ').map(n => n[0]).join('').toUpperCase()
              )}
            </div>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}
