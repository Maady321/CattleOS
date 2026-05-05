"use client";

import React, { useState } from 'react';
import { LayoutDashboard, Users, HeartPulse, Milk, Pipette, Bell, Settings, LogOut, Menu, X } from 'lucide-react';
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
    { icon: LayoutDashboard, label: 'Overview', href: '/dashboard' },
    { icon: Users, label: 'Cattle', href: '/dashboard/cattle' },
    { icon: HeartPulse, label: 'Health', href: '/dashboard/health' },
    { icon: Milk, label: 'Production', href: '/dashboard/production' },
    { icon: Pipette, label: 'Breeding', href: '/dashboard/breeding' },
    { icon: Bell, label: 'Alerts', href: '/dashboard/alerts' },
  ];

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const SidebarContent = () => (
    <>
      <div className="text-2xl font-bold mb-12 flex items-center gap-2">
        {user?.profile_image ? (
           <img src={user.profile_image} className="w-10 h-10 rounded-lg object-cover shadow-lg" alt="Profile" />
        ) : (
           <div className="w-10 h-10 bg-patch-black rounded-lg flex items-center justify-center text-white text-[10px] font-black">
              {(user?.full_name || 'SJ').split(' ').map(n => n[0]).join('').toUpperCase()}
           </div>
        )}
        CattleOS
      </div>

      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setIsSidebarOpen(false)}
            className={`flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all ${
              pathname === item.href 
                ? 'bg-patch-black text-white shadow-premium' 
                : 'text-black/40 hover:bg-black/5 hover:text-black'
            }`}
          >
            <item.icon size={22} />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="mt-auto pt-8 border-t border-black/5 space-y-2">
        <Link href="/dashboard/settings" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-black/40 hover:bg-black/5 hover:text-black transition-all">
          <Settings size={22} />
          Settings
        </Link>
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-red-500 hover:bg-red-50/50 transition-all text-left"
        >
          <LogOut size={22} />
          Logout
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-ivory">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-80 bg-white border-r border-black/5 p-8 flex-col">
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
              className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            />
            <motion.aside 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="lg:hidden fixed inset-y-0 left-0 w-80 bg-white p-8 flex flex-col z-50 shadow-2xl"
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
