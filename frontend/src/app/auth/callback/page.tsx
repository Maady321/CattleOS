"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';

export default function AuthCallback() {
  const router = useRouter();
  const { setAuth } = useAuthStore();

  useEffect(() => {
    const handleAuthCallback = async () => {
      // Check if there's a code in the URL (PKCE flow)
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');

      if (code) {
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        if (data?.session) {
          setAuth(data.session.access_token, {
            id: data.session.user.id,
            email: data.session.user.email,
            full_name: data.session.user.user_metadata?.full_name || 'Farm Owner'
          });
          router.push('/dashboard');
          return;
        }
        if (error) {
          console.error('Error exchanging code:', error.message);
          router.push('/login?error=code_exchange_failed');
          return;
        }
      }

      // Otherwise check for existing session (Implicit flow/hash or already exchanged)
      const { data, error } = await supabase.auth.getSession();
      
      if (data?.session) {
        setAuth(data.session.access_token, {
          id: data.session.user.id,
          email: data.session.user.email,
          full_name: data.session.user.user_metadata?.full_name || 'Farm Owner'
        });
        router.push('/dashboard');
      } else if (error) {
        console.error('Error during auth callback:', error.message);
        router.push('/login?error=auth_failed');
      } else {
        router.push('/login');
      }
    };

    handleAuthCallback();
  }, [router, setAuth]);

  return (
    <div className="min-h-screen bg-ivory flex flex-col items-center justify-center">
      <div className="w-16 h-16 border-4 border-grass-green border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-black/50 font-bold uppercase tracking-widest text-xs animate-pulse">
        Authenticating Secure Digital Passport...
      </p>
    </div>
  );
}
