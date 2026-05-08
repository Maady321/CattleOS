"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ShieldCheck, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const router = useRouter();

  const handleSocialLogin = async (provider: 'google') => {
    setIsLoading(provider);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      
      if (error) throw error;
    } catch (error: any) {
      console.error(`Registration error with ${provider}:`, error.message);
      alert(error.message || `Failed to sign up with ${provider}.`);
      setIsLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-ivory flex items-center justify-center px-4 py-12 md:py-20 overflow-hidden relative">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-1/2 h-full bg-grass-green/5 skew-x-12 -translate-x-1/2 pointer-events-none"></div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="bg-white p-8 md:p-12 rounded-[40px] md:rounded-[56px] border border-black/5 shadow-premium max-w-xl w-full my-8 relative z-10"
      >
        <button onClick={() => router.push('/')} className="mb-8 md:mb-10 flex items-center gap-2 text-black/30 font-bold text-[10px] md:text-xs uppercase tracking-widest hover:text-black transition-colors group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to home
        </button>

        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-grass-green/10 rounded-full mb-4">
            <Sparkles size={12} className="text-grass-green" />
            <span className="text-[10px] font-black text-grass-green uppercase tracking-widest">New Era of Farming</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">Join CattleOS</h1>
          <p className="text-black/40 font-medium text-base md:text-lg max-w-md">Secure your farm's future with the world's most advanced digital passport system.</p>
        </div>

        <div className="flex flex-col gap-4">
          {/* Google Register Button */}
          <button 
            onClick={() => handleSocialLogin('google')}
            disabled={isLoading !== null}
            className="w-full bg-patch-black text-white py-6 rounded-[32px] font-black text-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-4 relative shadow-premium group"
          >
            {isLoading === 'google' ? (
              <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <svg viewBox="0 0 24 24" className="w-7 h-7" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="white" opacity="0.9"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="white" opacity="0.7"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="white" opacity="0.5"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="white" opacity="0.8"/>
                </svg>
                Continue with Google
              </>
            )}
          </button>
        </div>

        <div className="mt-12 p-8 bg-black/5 rounded-[32px] border border-black/5 flex flex-col md:flex-row items-center gap-6">
           <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm shrink-0">
              <ShieldCheck className="text-grass-green" size={32} />
           </div>
           <div>
              <h3 className="font-black text-lg mb-1">Instant Activation</h3>
              <p className="text-black/40 text-sm font-medium leading-relaxed">By signing up, you agree to CattleOS terms of service and the digital governance protocols.</p>
           </div>
        </div>

        <div className="mt-12 text-center text-black/30 font-bold text-sm uppercase tracking-widest">
          Already a member? <a href="/login" className="text-grass-green border-b-2 border-grass-green/20 hover:border-grass-green transition-all">Sign In to Dashboard</a>
        </div>
      </motion.div>
    </div>
  );
}
