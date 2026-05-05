"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { ArrowLeft, User, Phone, Mail, Lock } from 'lucide-react';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    full_name: '',
    phone_number: '',
    email: '',
    password: '',
    language: 'en'
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const { email, ...dataToSend } = formData;
    const finalData = email ? formData : dataToSend;

    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/auth/register`, finalData);
      alert('Registration successful! Please login.');
      router.push('/login');
    } catch (error) {
      alert('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ivory flex items-center justify-center px-4 py-20">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-12 rounded-[40px] border border-black/5 shadow-premium max-w-xl w-full"
      >
        <button onClick={() => router.push('/')} className="mb-10 flex items-center gap-2 text-black/30 font-bold text-xs uppercase tracking-widest hover:text-black transition-colors">
          <ArrowLeft size={16} /> Back to home
        </button>

        <h1 className="text-4xl font-black mb-2 tracking-tight">Create your account</h1>
        <p className="text-black/40 font-medium mb-12">Join the community of modern cattle farmers.</p>

        <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="flex items-center gap-2 text-sm font-black mb-3 ml-1 uppercase tracking-widest text-black/30">
              <User size={14} /> Full Name
            </label>
            <input 
              type="text" 
              value={formData.full_name}
              onChange={(e) => setFormData({...formData, full_name: e.target.value})}
              placeholder="Enter your full name"
              className="w-full px-6 py-4 rounded-2xl bg-black/5 border-none outline-none focus:bg-white focus:ring-2 focus:ring-grass-green/20 font-bold transition-all"
              required
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-black mb-3 ml-1 uppercase tracking-widest text-black/30">
              <Phone size={14} /> Phone Number
            </label>
            <input 
              type="tel" 
              value={formData.phone_number}
              onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
              placeholder="+91 0000000000"
              className="w-full px-6 py-4 rounded-2xl bg-black/5 border-none outline-none focus:bg-white focus:ring-2 focus:ring-grass-green/20 font-bold transition-all"
              required
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-black mb-3 ml-1 uppercase tracking-widest text-black/30">
              <Mail size={14} /> Email (Optional)
            </label>
            <input 
              type="email" 
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="name@example.com"
              className="w-full px-6 py-4 rounded-2xl bg-black/5 border-none outline-none focus:bg-white focus:ring-2 focus:ring-grass-green/20 font-bold transition-all"
            />
          </div>

          <div className="md:col-span-2">
            <label className="flex items-center gap-2 text-sm font-black mb-3 ml-1 uppercase tracking-widest text-black/30">
              <Lock size={14} /> Password
            </label>
            <input 
              type="password" 
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              placeholder="••••••••"
              className="w-full px-6 py-4 rounded-2xl bg-black/5 border-none outline-none focus:bg-white focus:ring-2 focus:ring-grass-green/20 font-bold transition-all"
              required
            />
          </div>
          
          <button 
            type="submit"
            disabled={isLoading}
            className="md:col-span-2 mt-4 bg-patch-black text-white py-6 rounded-[24px] font-black text-xl hover:scale-[1.02] active:scale-95 transition-all shadow-2xl disabled:opacity-50"
          >
            {isLoading ? 'Creating account...' : 'Register Now'}
          </button>
        </form>

        <div className="mt-12 text-center text-black/30 font-bold text-sm uppercase tracking-widest">
          Already have an account? <a href="/login" className="text-grass-green border-b-2 border-grass-green/20 hover:border-grass-green transition-all">Sign In</a>
        </div>
      </motion.div>
    </div>
  );
}
