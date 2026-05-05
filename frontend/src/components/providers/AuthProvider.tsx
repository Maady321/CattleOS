"use client";

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { useRouter, usePathname } from 'next/navigation';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { setAuth, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // 1. Check current session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setAuth(session.access_token, {
          id: session.user.id,
          email: session.user.email,
          full_name: session.user.user_metadata?.full_name || 'Farm Owner',
          profile_image: session.user.user_metadata?.profile_image
        });
        if (pathname === '/' || pathname === '/login') {
          router.push('/dashboard');
        }
      }
    });

    // 2. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setAuth(session.access_token, {
          id: session.user.id,
          email: session.user.email,
          full_name: session.user.user_metadata?.full_name || 'Farm Owner'
        });
        
        // Only redirect if we're on a public page
        if (window.location.pathname === '/' || window.location.pathname === '/login') {
          router.push('/dashboard');
        }
      } else if (event === 'SIGNED_OUT') {
        logout();
        router.push('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [setAuth, logout, router, pathname]);

  return <>{children}</>;
};
