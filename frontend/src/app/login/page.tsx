"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Github, Globe, ArrowRight, ShieldCheck } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const router = useRouter();

  const handleSocialLogin = async (provider: 'google' | 'github') => {
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
      console.error(`Login error with ${provider}:`, error.message);
      alert(error.message || `Failed to sign in with ${provider}.`);
      setIsLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-ivory flex items-center justify-center px-4 overflow-hidden relative">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-grass-green/5 -skew-x-12 translate-x-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-patch-black/5 skew-x-12 -translate-x-1/4 pointer-events-none"></div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="bg-white p-8 md:p-12 rounded-[40px] md:rounded-[56px] border border-black/5 shadow-premium max-w-md w-full relative z-10 my-8"
      >
        <div className="mb-10 text-center">
           <motion.div 
             whileHover={{ scale: 1.05, rotate: 5 }}
             className="w-20 h-20 bg-patch-black rounded-[24px] flex items-center justify-center mx-auto mb-8 shadow-2xl relative overflow-hidden group"
           >
              <div className="absolute inset-0 bg-gradient-to-tr from-grass-green/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="w-8 h-8 bg-white rounded-lg z-10"></div>
           </motion.div>
           <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-3">CattleOS</h1>
           <div className="flex items-center justify-center gap-2 mb-2">
             <ShieldCheck size={14} className="text-grass-green" />
             <p className="text-black/30 font-bold uppercase tracking-[0.2em] text-[10px]">Secure Passport Gateway</p>
           </div>
        </div>

        <div className="space-y-4">
          <p className="text-center text-black/40 text-sm font-medium mb-6">Continue with your Google account to access your digital farm assets.</p>
          
          {/* Google Login Button */}
          <button 
            onClick={() => handleSocialLogin('google')}
            disabled={isLoading !== null}
            className="w-full bg-patch-black text-white py-6 rounded-[32px] font-bold text-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-4 shadow-premium group relative overflow-hidden"
          >
            {isLoading === 'google' ? (
              <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <svg viewBox="0 0 24 24" className="w-7 h-7" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="white" opacity="0.9"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="white" opacity="0.7"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="white" opacity="0.5"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="white" opacity="0.8"/>
                </svg>
                Sign in with Google
              </>
            )}
          </button>
        </div>

        <div className="mt-12 space-y-6">
          <div className="flex items-center gap-4">
            <div className="h-px bg-black/5 flex-1"></div>
            <p className="text-[10px] font-black uppercase tracking-widest text-black/20">Trust & Security</p>
            <div className="h-px bg-black/5 flex-1"></div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
             <div className="p-4 rounded-2xl bg-grass-green/5 text-center">
                <p className="text-[9px] font-black text-grass-green uppercase tracking-wider mb-1">Encrypted</p>
                <p className="text-[10px] text-black/40 font-bold">256-bit AES</p>
             </div>
             <div className="p-4 rounded-2xl bg-patch-black/5 text-center">
                <p className="text-[9px] font-black text-black/60 uppercase tracking-wider mb-1">Passport</p>
                <p className="text-[10px] text-black/40 font-bold">Verified Identity</p>
             </div>
          </div>
        </div>

        <div className="mt-10 text-center">
           <p className="text-black/20 text-[9px] font-bold uppercase tracking-widest leading-loose">
             Proprietary Asset of CattleOS Infrastructure<br/>
             © 2026 Digital Farm Management Systems
           </p>
        </div>
      </motion.div>
    </div>
  );
}
