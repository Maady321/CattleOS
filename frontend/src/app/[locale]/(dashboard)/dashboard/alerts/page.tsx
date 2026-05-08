"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, HeartPulse, Zap, Info, CheckCircle2, MoreVertical, Trash2, Search, Filter, X, Calendar, Clock } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { translations, Language } from '@/lib/translations';

import { useCattleStore, Alert, AlertType } from '@/store/cattleStore';

export default function AlertsPage() {
  const { alerts, markAlertRead, removeAlert, markAllAlertsRead } = useCattleStore();
  const { user } = useAuthStore();
  
  const lang = (user?.language || 'en') as Language;
  const t = translations[lang] || translations.en;
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);

  const getTypeStyles = (type: AlertType) => {
    switch (type) {
      case 'health': return { icon: HeartPulse, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-100' };
      case 'breeding': return { icon: Zap, color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-100' };
      case 'reminder': return { icon: Bell, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-100' };
      case 'warning': return { icon: Info, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' };
      default: return { icon: Info, color: 'text-gray-500', bg: 'bg-gray-50', border: 'border-gray-100' };
    }
  };

  const handleOpenAlert = (alert: Alert) => {
    setSelectedAlert(alert);
    if (!alert.isRead) {
      markAlertRead(alert.id);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto relative">
      {/* Header */}
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2">{t.alertsPage.title}</h1>
          <p className="text-black/40 font-medium">{t.alertsPage.sub}</p>
        </div>
        <div className="flex gap-4">
           <button 
             onClick={markAllAlertsRead}
             className="text-xs font-bold uppercase tracking-widest text-black/40 hover:text-black transition-colors"
           >
             {t.alertsPage.markAll}
           </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-10 overflow-x-auto pb-2">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-black/20" />
          <input 
            type="text" 
            placeholder={t.alertsPage.search}
            className="w-full pl-14 pr-6 py-4 bg-white border border-black/5 rounded-2xl font-bold shadow-sm outline-none focus:ring-2 focus:ring-black/5"
          />
        </div>
        <button className="p-4 bg-white border border-black/5 rounded-2xl shadow-sm text-black/40 hover:text-black transition-all">
          <Filter size={20} />
        </button>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        <AnimatePresence mode='popLayout'>
          {alerts.map((alert) => {
            const styles = getTypeStyles(alert.type);
            return (
              <motion.div 
                key={alert.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={() => handleOpenAlert(alert)}
                className={`group p-6 rounded-[32px] bg-white border ${alert.isRead ? 'border-black/5 opacity-60' : `${styles.border} shadow-premium`} transition-all relative overflow-hidden cursor-pointer hover:border-black/20`}
              >
                {!alert.isRead && <div className={`absolute top-0 left-0 w-1.5 h-full ${styles.color.replace('text', 'bg')}`}></div>}
                
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start">
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 ${styles.bg} ${styles.color} rounded-2xl flex items-center justify-center shrink-0`}>
                    <styles.icon size={24} className="sm:size-[28px]" />
                  </div>
                  
                  <div className="flex-1 w-full">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-black tracking-tight">{alert.title}</h3>
                      <span className="text-xs font-bold text-black/20 uppercase tracking-widest">{alert.time}</span>
                    </div>
                    <p className="text-black/50 font-medium mb-6 leading-relaxed line-clamp-1">{alert.message}</p>
                    
                    <div className="flex items-center gap-6">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          removeAlert(alert.id);
                        }}
                        className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-red-500/50 hover:text-red-500 transition-all"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </div>
                  
                  <button className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-black/10 hover:text-black">
                    <MoreVertical size={20} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {alerts.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-20 text-center"
          >
             <div className="w-20 h-20 bg-black/5 rounded-full flex items-center justify-center mx-auto mb-6 text-black/10">
                <Bell size={40} />
             </div>
             <h3 className="text-2xl font-black mb-2">{t.alertsPage.empty}</h3>
             <p className="text-black/40 font-bold">{t.alertsPage.emptySub}</p>
          </motion.div>
        )}
      </div>

      {/* Alert Detail Modal */}
      <AnimatePresence>
        {selectedAlert && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedAlert(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-[200]"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-0 m-auto w-full max-w-xl h-fit bg-white z-[201] rounded-[48px] shadow-2xl overflow-hidden"
            >
              <div className="relative p-12">
                <button 
                  onClick={() => setSelectedAlert(null)}
                  className="absolute top-8 right-8 p-3 hover:bg-black/5 rounded-full transition-colors text-black/20 hover:text-black"
                >
                  <X size={24} />
                </button>

                {(() => {
                  const styles = getTypeStyles(selectedAlert.type);
                  return (
                    <>
                      <div className="flex items-center gap-6 mb-10">
                        <div className={`w-20 h-20 rounded-[28px] ${styles.bg} ${styles.color} flex items-center justify-center shadow-lg`}>
                          <styles.icon size={32} />
                        </div>
                        <div>
                          <h2 className="text-3xl font-black tracking-tight">{selectedAlert.title}</h2>
                          <div className="flex items-center gap-4 mt-1">
                            <span className="flex items-center gap-1.5 text-black/30 font-bold uppercase tracking-widest text-[10px]">
                              <Clock size={12} /> {selectedAlert.time}
                            </span>
                            <span className="flex items-center gap-1.5 text-black/30 font-bold uppercase tracking-widest text-[10px]">
                              <Calendar size={12} /> {selectedAlert.date}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="p-8 bg-black/5 rounded-[32px] mb-10">
                        <p className="text-lg font-medium leading-relaxed text-black/70 italic">
                          "{selectedAlert.message}"
                        </p>
                      </div>

                      <div className="flex justify-end gap-4">
                         <button 
                           onClick={() => {
                             removeAlert(selectedAlert.id);
                             setSelectedAlert(null);
                           }}
                           className="px-8 py-4 bg-red-50 text-red-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-100 transition-all"
                         >
                            Delete
                         </button>
                         <button 
                           onClick={() => setSelectedAlert(null)}
                           className="px-10 py-4 bg-patch-black text-white rounded-2xl font-black shadow-lg hover:scale-105 active:scale-95 transition-all"
                         >
                           Dismiss
                         </button>
                      </div>
                    </>
                  );
                })()}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

