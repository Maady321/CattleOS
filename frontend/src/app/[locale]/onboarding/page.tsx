'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Input } from '@/components/ui/core';
import { Check, ArrowRight, Languages, Home, Activity, Bell } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    language: 'ml',
    farmName: '',
    cattleName: '',
    reminders: true
  });
  const router = useRouter();

  const next = () => setStep(s => s + 1);

  const complete = () => {
    // Analytics: track('ONBOARDING_COMPLETED', { duration: ... })
    router.push('/dashboard');
  };

  const steps = [
    {
      id: 1,
      title: 'Choose Language',
      icon: <Languages className="w-16 h-16 text-emerald-400" />,
      content: (
        <div className="grid grid-cols-1 gap-4 mt-12">
          <Button 
            variant="secondary" 
            size="xl" 
            className="h-24 text-2xl font-black bg-white/5 border-2 border-white/10 hover:border-emerald-500/50"
            onClick={() => {setFormData({...formData, language: 'ml'}); next();}}
          >
            മലയാളം
          </Button>
          <Button 
            variant="secondary" 
            size="xl" 
            className="h-24 text-2xl font-black bg-white/5 border-2 border-white/10 hover:border-emerald-500/50"
            onClick={() => {setFormData({...formData, language: 'en'}); next();}}
          >
            English
          </Button>
        </div>
      )
    },
    {
      id: 2,
      title: 'Farm Name',
      icon: <Home className="w-16 h-16 text-blue-400" />,
      content: (
        <div className="space-y-8 mt-12">
          <Input 
            placeholder="e.g. My Dairy Farm" 
            autoFocus
            className="text-2xl h-20 text-center"
            value={formData.farmName} 
            onChange={(e) => setFormData({...formData, farmName: e.target.value})}
          />
          <Button size="xl" className="w-full h-20" onClick={next} disabled={!formData.farmName}>
            Next <ArrowRight className="ml-2" />
          </Button>
        </div>
      )
    },
    {
      id: 3,
      title: 'First Animal',
      icon: <Activity className="w-16 h-16 text-red-400" />,
      content: (
        <div className="space-y-8 mt-12">
          <Input 
            placeholder="Cow Name (e.g. Ganga)" 
            autoFocus
            className="text-2xl h-20 text-center"
            value={formData.cattleName} 
            onChange={(e) => setFormData({...formData, cattleName: e.target.value})}
          />
          <div className="flex flex-col gap-4">
            <Button size="xl" className="w-full h-20" onClick={next} disabled={!formData.cattleName}>
              Add Animal
            </Button>
            <button className="text-slate-500 text-sm font-black uppercase tracking-widest py-4" onClick={next}>
              Skip for now
            </button>
          </div>
        </div>
      )
    },
    {
      id: 4,
      title: 'Aha Moment',
      icon: <Bell className="w-16 h-16 text-amber-400" />,
      content: (
        <div className="space-y-12 mt-12 text-center">
          <p className="text-slate-400 text-lg font-medium leading-relaxed">
            We'll send you a 1-tap WhatsApp alert for your morning milk logs.
          </p>
          <div className="p-8 bg-white/5 rounded-[40px] border border-white/5">
             <div className="flex items-center justify-between">
                <span className="text-xl font-bold">Daily Alerts</span>
                <div className="w-16 h-8 bg-emerald-500 rounded-full flex items-center justify-end px-1">
                   <div className="w-6 h-6 bg-white rounded-full shadow-lg" />
                </div>
             </div>
          </div>
          <Button size="xl" className="w-full h-20 shadow-2xl shadow-emerald-500/40" onClick={complete}>
            Start Farming
          </Button>
        </div>
      )
    }
  ];

  const currentStep = steps.find(s => s.id === step);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8 font-sans overflow-hidden">
      <div className="w-full max-w-md relative">
        {/* LIGHTNING PROGRESS */}
        <div className="flex gap-3 justify-center mb-16">
          {steps.map(s => (
            <div key={s.id} className={`h-2 rounded-full transition-all duration-700 ${s.id <= step ? 'bg-emerald-500 w-12' : 'bg-white/10 w-4'}`} />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ type: 'spring', damping: 20, stiffness: 150 }}
            className="text-center"
          >
            <div className="flex justify-center mb-8">{currentStep?.icon}</div>
            <h1 className="text-4xl font-black tracking-tight text-white mb-2">{currentStep?.title}</h1>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Step {step} of {steps.length}</p>
            {currentStep?.content}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
