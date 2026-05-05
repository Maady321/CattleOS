"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { Mail, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [isLoading, setIsLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const router = useRouter();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) return alert('Please enter a valid email address');
    
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      
      if (error) throw error;
      setStep('otp');
    } catch (error: any) {
      alert(error.message || 'Failed to send code.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) return alert('Please enter a valid 6-digit code');
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email',
      });

      if (error) throw error;

      if (data.session) {
        setAuth(data.session.access_token, { 
          full_name: data.user?.user_metadata?.full_name || 'Farm Owner',
          email: data.user?.email,
          id: data.user?.id
        });
        router.push('/dashboard');
      }
    } catch (error: any) {
      alert(error.message || 'Invalid code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ivory flex items-center justify-center px-4 overflow-hidden relative">
      {/* Decorative Background Element */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-grass-green/5 -skew-x-12 translate-x-1/2"></div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-12 rounded-[48px] border border-black/5 shadow-2xl max-w-md w-full relative z-10"
      >
        <div className="mb-10 text-center">
           <div className="w-16 h-16 bg-patch-black rounded-[20px] flex items-center justify-center mx-auto mb-6 shadow-xl">
              <div className="w-6 h-6 bg-white rounded-md"></div>
           </div>
           <h1 className="text-4xl font-black tracking-tight mb-2">CattleOS</h1>
           <p className="text-black/30 font-bold uppercase tracking-widest text-[10px]">Secure Digital Passport System</p>
        </div>

        <AnimatePresence mode="wait">
          {step === 'email' ? (
            <motion.form 
              key="email-step"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handleSendOtp} 
              className="space-y-8"
            >
              <div className="space-y-3">
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-black/30 ml-1">Email Address</label>
                <div className="relative">
                  <Mail size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-black/20" />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="owner@farm.com"
                    className="w-full pl-16 pr-6 py-5 rounded-3xl bg-black/5 border-2 border-transparent focus:bg-white focus:border-grass-green transition-all outline-none font-bold text-lg"
                    required
                  />
                </div>
                <p className="text-[10px] text-black/30 font-medium ml-1 italic">Enter your email to receive a secure access code.</p>
              </div>
              
              <button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-patch-black text-white py-5 rounded-[24px] font-black text-lg hover:scale-[1.02] active:scale-95 transition-all shadow-premium disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {isLoading ? 'Requesting Access...' : 'Get Access Code'} <ArrowRight size={20} />
              </button>
            </motion.form>
          ) : (
            <motion.form 
              key="otp-step"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handleVerifyOtp} 
              className="space-y-8"
            >
              <div className="space-y-3">
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-black/30 ml-1">6-Digit Code</label>
                <div className="relative">
                  <Lock size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-black/20" />
                  <input 
                    type="text" 
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="000 000"
                    className="w-full pl-16 pr-6 py-5 rounded-3xl bg-black/5 border-2 border-transparent focus:bg-white focus:border-grass-green transition-all outline-none font-black text-2xl tracking-[0.3em]"
                    required
                  />
                </div>
                <div className="flex justify-between items-center px-1">
                   <p className="text-[10px] text-black/30 font-medium italic uppercase tracking-wider line-clamp-1">Sending to {email}</p>
                   <button type="button" onClick={() => setStep('email')} className="text-[10px] font-black text-grass-green uppercase tracking-widest hover:underline shrink-0">Change</button>
                </div>
              </div>
              
              <button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-patch-black text-white py-5 rounded-[24px] font-black text-lg hover:scale-[1.02] active:scale-95 transition-all shadow-premium disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {isLoading ? 'Verifying...' : 'Verify & Enter'} <CheckCircle2 size={20} />
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        <div className="mt-12 pt-8 border-t border-black/5 text-center">
           <p className="text-black/20 text-xs font-bold uppercase tracking-widest">CattleOS v1.0 Production Environment</p>
        </div>
      </motion.div>
    </div>
  );
}
