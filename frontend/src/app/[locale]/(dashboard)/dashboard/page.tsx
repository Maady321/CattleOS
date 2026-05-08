"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Milk, Activity, HeartPulse, Bell, Plus, TrendingUp, ShieldCheck } from 'lucide-react';
import { useCattleStore } from '@/store/cattleStore';
import { useAuthStore } from '@/store/authStore';
import { translations, Language } from '@/lib/translations';
import { useRouter } from 'next/navigation';
import { Button, Skeleton } from '@/components/ui/core';

export default function OverviewPage() {
  const router = useRouter();
  const { productionLogs, cattle, alerts } = useCattleStore();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);

  const lang = (user?.language || 'en') as Language;
  const t = translations[lang] || translations.en;

  React.useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const totalYieldToday = productionLogs
    .filter(log => log.date === new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }))
    .reduce((acc, log) => acc + parseFloat(log.yield || '0'), 0);

  if (loading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-48 w-full rounded-[40px]" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-32 w-full rounded-[32px]" />
          <Skeleton className="h-32 w-full rounded-[32px]" />
        </div>
        <Skeleton className="h-64 w-full rounded-[40px]" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* JOB-TO-BE-DONE: HERO ACTION CARD */}
      <section className="bg-gradient-to-br from-emerald-600 to-emerald-900 p-6 md:p-8 rounded-[40px] shadow-2xl shadow-emerald-500/20 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 md:p-8 opacity-10 group-hover:scale-125 transition-transform duration-700">
          <Milk size={100} className="md:size-[120px]" strokeWidth={1} />
        </div>
        
        <div className="relative z-10">
          <h3 className="text-emerald-200 text-sm font-black uppercase tracking-widest mb-2">{t.overview.morningProduction}</h3>
          <div className="flex items-baseline gap-2 mb-6">
            <span className="text-5xl md:text-6xl font-black text-white">{totalYieldToday.toFixed(1)}</span>
            <span className="text-xl md:text-2xl font-bold text-emerald-300">{t.overview.liters}</span>
          </div>
          
          <Button 
            variant="secondary" 
            size="lg" 
            className="w-full !bg-white !text-emerald-900 hover:bg-emerald-50 shadow-2xl text-xs md:text-base font-black py-4 md:py-6"
            onClick={() => router.push('/dashboard/production')}
          >
            {lang === 'en' ? 'Record New Log' : 'പുതിയ പാൽ അളവ് ചേർക്കുക'}
          </Button>
        </div>
      </section>

      {/* QUICK STATUS GRID */}
      <div className="grid grid-cols-2 gap-4">
        <StatusCard 
          label={t.myHerd || 'My Herd'} 
          value={cattle.length} 
          subText="Animals Active"
          icon={<Activity className="text-blue-400" />}
          color="blue"
        />
        <StatusCard 
          label={t.health.title || 'Health'} 
          value="Good" 
          subText="0 Sick Animals"
          icon={<HeartPulse className="text-red-400" />}
          color="red"
        />
      </div>

      {/* RECENT ALERTS - CALM VISUAL HIERARCHY */}
      <section className="bg-surface border border-white/5 p-8 rounded-[40px]">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Bell className="text-amber-400 w-5 h-5" />
            {t.alerts || 'Alerts'}
          </h3>
          {alerts.length > 0 && (
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
              {alerts.length} Total
            </span>
          )}
        </div>
        
        <div className="space-y-4">
          {alerts.length > 0 ? (
            alerts.slice(0, 3).map((alert, i) => (
              <div key={alert.id} className="flex items-center gap-4 p-4 bg-white/5 rounded-3xl border border-white/5">
                <div className={`w-2 h-2 rounded-full ${alert.type === 'health' ? 'bg-red-500' : 'bg-amber-500'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold">{alert.title}</p>
                  <p className="text-xs text-slate-500 line-clamp-1">{alert.message}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center">
              <ShieldCheck className="w-12 h-12 text-white/5 mx-auto mb-4" />
              <p className="text-slate-600 font-bold uppercase tracking-widest text-xs">All Systems Healthy</p>
            </div>
          )}
        </div>
      </section>

      {/* INSIGHT PREVIEW */}
      <section className="bg-surface border border-white/5 p-8 rounded-[40px] flex items-center justify-between group cursor-pointer hover:border-emerald-500/20 transition-all">
         <div>
            <h3 className="text-lg font-bold">Weekly Performance</h3>
            <p className="text-slate-500 text-sm">Up 12% from last week</p>
         </div>
         <TrendingUp className="text-emerald-500 group-hover:translate-x-2 transition-transform" />
      </section>
    </div>
  );
}

function StatusCard({ label, value, subText, icon, color }: any) {
  return (
    <div className="bg-surface border border-white/5 p-6 rounded-[32px] hover:border-white/10 transition-all group">
      <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">{label}</p>
      <h4 className="text-2xl font-black">{value}</h4>
      <p className="text-[10px] font-medium text-slate-400 mt-1">{subText}</p>
    </div>
  );
}
