"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ArrowLeft, Home, User, Leaf, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const router = useRouter();

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  return (
    <div className="min-h-screen bg-ivory flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        {/* Progress Bar */}
        <div className="flex justify-between mb-12 relative">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-black/5 -translate-y-1/2 -z-10"></div>
          <div 
            className="absolute top-1/2 left-0 h-1 bg-grass-green -translate-y-1/2 -z-10 transition-all duration-500"
            style={{ width: `${((step - 1) / 2) * 100}%` }}
          ></div>
          {[1, 2, 3].map((i) => (
            <div 
              key={i} 
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-500 ${
                step >= i ? 'bg-grass-green text-white shadow-lg' : 'bg-white border border-black/5 text-black/20'
              }`}
            >
              {step > i ? <CheckCircle2 size={20} /> : i}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white p-12 rounded-[40px] shadow-premium border border-black/5"
            >
              <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mb-8">
                <User size={32} />
              </div>
              <h2 className="text-4xl font-black mb-4 tracking-tight">Complete your profile</h2>
              <p className="text-black/40 font-medium mb-10 text-lg">Tell us a bit about yourself to personalize your experience.</p>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold mb-2 ml-1">Preferred Language</label>
                  <select className="w-full px-6 py-4 rounded-2xl bg-black/5 border-none outline-none font-bold">
                    <option>Malayalam</option>
                    <option>English</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2 ml-1">Experience Level</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button className="p-4 rounded-2xl border-2 border-grass-green bg-grass-green/5 text-grass-green font-bold">New Farmer</button>
                    <button className="p-4 rounded-2xl border border-black/5 font-bold hover:bg-black/5">Pro Farmer</button>
                  </div>
                </div>
              </div>

              <button 
                onClick={nextStep}
                className="w-full mt-12 bg-patch-black text-white py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all"
              >
                Continue <ChevronRight />
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white p-12 rounded-[40px] shadow-premium border border-black/5"
            >
              <button onClick={prevStep} className="mb-8 flex items-center gap-2 text-black/40 font-bold text-sm uppercase tracking-widest hover:text-black">
                <ArrowLeft size={16} /> Back
              </button>
              <div className="w-16 h-16 bg-green-50 text-grass-green rounded-2xl flex items-center justify-center mb-8">
                <Home size={32} />
              </div>
              <h2 className="text-4xl font-black mb-4 tracking-tight">Setup your Farm</h2>
              <p className="text-black/40 font-medium mb-10 text-lg">Every great journey starts with a home for your herd.</p>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold mb-2 ml-1">Farm Name</label>
                  <input type="text" placeholder="e.g. Green Valley Farm" className="w-full px-6 py-4 rounded-2xl bg-black/5 border-none outline-none font-bold focus:bg-white focus:ring-2 focus:ring-grass-green/20" />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2 ml-1">Location (District)</label>
                  <select className="w-full px-6 py-4 rounded-2xl bg-black/5 border-none outline-none font-bold">
                    <option>Wayanad</option>
                    <option>Idukki</option>
                    <option>Palakkad</option>
                    <option>Kottayam</option>
                  </select>
                </div>
              </div>

              <button 
                onClick={nextStep}
                className="w-full mt-12 bg-patch-black text-white py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all"
              >
                Continue <ChevronRight />
              </button>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white p-12 rounded-[40px] shadow-premium border border-black/5 text-center"
            >
              <div className="w-24 h-24 bg-grass-green text-white rounded-[32px] flex items-center justify-center mb-10 mx-auto shadow-xl">
                <CheckCircle2 size={48} />
              </div>
              <h2 className="text-4xl font-black mb-4 tracking-tight">You&apos;re all set!</h2>
              <p className="text-black/40 font-medium mb-12 text-lg">CattleOS is ready to help you manage your farm like a pro.</p>
              
              <button 
                onClick={() => router.push('/dashboard')}
                className="w-full bg-grass-green text-white py-6 rounded-[24px] font-black text-xl hover:scale-105 active:scale-95 transition-all shadow-xl"
              >
                Enter Dashboard
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
