"use client";

import React from 'react';
import { LayoutDashboard, Users, HeartPulse, Milk, Pipette, Bell, Settings, LogOut } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useCattleStore } from '@/store/cattleStore';
import { useRouter, usePathname } from 'next/navigation';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { logout, user } = useAuthStore();
  const { alerts } = useCattleStore();
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

  return (
    <div className="flex min-h-screen bg-ivory">
      {/* Sidebar */}
      <aside className="w-80 bg-white border-r border-black/5 p-8 flex flex-col">
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
            <a
              key={item.href}
              href={item.href}
              suppressHydrationWarning
              className={`flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all ${
                pathname === item.href 
                  ? 'bg-patch-black text-white shadow-premium' 
                  : 'text-black/40 hover:bg-black/5 hover:text-black'
              }`}
            >
              <item.icon size={22} />
              {item.label}
            </a>
          ))}
        </nav>

        <div className="mt-auto pt-8 border-t border-black/5 space-y-2">
          <a href="/dashboard/settings" className="flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-black/40 hover:bg-black/5 hover:text-black transition-all">
            <Settings size={22} />
            Settings
          </a>
          <button 
            onClick={handleLogout}
            suppressHydrationWarning
            className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-red-500 hover:bg-red-50/50 transition-all"
          >
            <LogOut size={22} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-12 overflow-y-auto">
        <header className="flex justify-between items-center mb-12">
          <h2 className="text-3xl font-extrabold">Dashboard</h2>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push('/dashboard/alerts')}
              suppressHydrationWarning 
              className="p-3 bg-white rounded-2xl border border-black/5 shadow-sm relative group hover:scale-105 active:scale-95 transition-all"
            >
              <Bell size={20} className={unreadCount > 0 ? 'text-black animate-swing' : 'text-black/40'} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-white shadow-lg group-hover:scale-110 transition-transform">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            <div className="w-12 h-12 rounded-2xl bg-grass-green flex items-center justify-center text-white font-bold overflow-hidden shadow-lg border-2 border-white">
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
