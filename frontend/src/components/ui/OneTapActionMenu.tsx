'use client';

import React, { useState } from 'react';
import { Plus, Milk, Syringe, PlusCircle, X, Check, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { translations, Language } from '@/lib/translations';

export default function OneTapActionMenu() {
  const { user } = useAuthStore();
  const lang = (user?.language || 'en') as Language;
  const t = translations[lang] || translations.en;

  const [isOpen, setIsOpen] = useState(false);
  const [activeLog, setActiveLog] = useState<string | null>(null);
  const [value, setValue] = useState('');

  const actions = [
    { id: 'milk', label: t.actionMenu.milk, icon: Milk, color: 'bg-emerald-500' },
    { id: 'med', label: t.actionMenu.health, icon: Syringe, color: 'bg-blue-500' },
    { id: 'cattle', label: t.actionMenu.cattle, icon: PlusCircle, color: 'bg-purple-500' },
  ];

  const handleAction = (id: string) => {
    setActiveLog(id);
    setIsOpen(false);
  };

  const handleSave = () => {
    // Save logic
    setActiveLog(null);
    setValue('');
  };

  return (
    <div className="fixed bottom-24 lg:bottom-8 right-6 lg:right-8 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <div className="absolute bottom-20 right-0 flex flex-col gap-4">
            {actions.map((action, i) => (
              <motion.button
                key={action.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => handleAction(action.id)}
                className={`${action.color} text-white w-16 h-16 rounded-full shadow-2xl flex flex-col items-center justify-center gap-1 border-4 border-black/20 tap-active`}
              >
                <action.icon className="w-6 h-6" />
                <span className="text-[10px] font-bold uppercase">{action.label}</span>
              </motion.button>
            ))}
          </div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`${isOpen ? 'bg-slate-800' : 'bg-primary'} text-white w-20 h-20 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 tap-active border-4 border-white/10`}
      >
        {isOpen ? <X className="w-10 h-10" /> : <Sparkles className="w-10 h-10 text-white fill-white/20" />}
      </button>

      {/* Quick Entry Modal */}
      <AnimatePresence>
        {activeLog && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-6">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-surface w-full max-w-sm rounded-[40px] p-8 border border-white/10 shadow-2xl"
            >
              <h2 className="text-2xl font-bold mb-6 text-center">
                {activeLog === 'milk' ? t.actionMenu.logMilk : t.actionMenu.logHealth}
              </h2>
              
              <input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="0"
                autoFocus
                className="w-full bg-black/30 border-none text-6xl font-black text-center py-8 rounded-3xl mb-8 focus:ring-4 focus:ring-primary/20 text-emerald-400"
              />

              <div className="flex gap-4">
                <button 
                  onClick={() => setActiveLog(null)}
                  className="flex-1 py-6 bg-white/5 text-slate-400 font-bold rounded-3xl border border-white/5 tap-active"
                >
                  {t.actionMenu.cancel}
                </button>
                <button 
                  onClick={handleSave}
                  className="flex-1 py-6 bg-primary text-white font-bold rounded-3xl shadow-xl shadow-primary/20 tap-active"
                >
                  {t.actionMenu.save}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
