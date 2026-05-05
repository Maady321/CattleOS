"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Shield, Bell, MapPin, Globe, Save, Camera, Smartphone, Mail, Lock, Languages } from 'lucide-react';
import { useCattleStore } from '@/store/cattleStore';
import { useAuthStore } from '@/store/authStore';

export default function SettingsPage() {
  const { cattle } = useCattleStore();
  const { user, updateUser } = useAuthStore();
  const [activeSection, setActiveSection] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    phone_number: user?.phone_number || '',
    email: user?.email || '',
    language: user?.language || 'English',
    profile_image: user?.profile_image || ''
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, profile_image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus(null);
    
    // Update Global Store
    updateUser(formData);
    
    // Simulate API Call
    setTimeout(() => {
      setIsSaving(false);
      setSaveStatus('Profile updated successfully!');
      setTimeout(() => setSaveStatus(null), 3000);
    }, 1000);
  };

  const sections = [
    { id: 'profile', label: 'Personal Profile', icon: User },
    { id: 'farm', label: 'Farm Configuration', icon: MapPin },
    { id: 'notifications', label: 'Alert Preferences', icon: Bell },
    { id: 'security', label: 'Account Security', icon: Shield },
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-black tracking-tight mb-2">Settings</h1>
        <p className="text-black/40 font-medium">Manage your personal profile, farm data, and account security.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        {/* Settings Navigation */}
        <div className="space-y-2">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              suppressHydrationWarning
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all ${
                activeSection === section.id 
                  ? 'bg-patch-black text-white shadow-premium' 
                  : 'text-black/40 hover:bg-black/5 hover:text-black'
              }`}
            >
              <section.icon size={20} />
              {section.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3 space-y-8">
          <div className="bg-white p-10 rounded-[40px] border border-black/5 shadow-premium">
            {activeSection === 'profile' && (
              <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-10">
                <div className="flex items-center gap-8 pb-10 border-b border-black/5">
                  <div className="relative group">
                    <div className="w-24 h-24 bg-patch-black rounded-3xl flex items-center justify-center text-white text-2xl font-black shadow-2xl overflow-hidden">
                      {formData.profile_image ? (
                        <img src={formData.profile_image} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        (formData.full_name || 'SJ').split(' ').map(n => n[0]).join('').toUpperCase()
                      )}
                    </div>
                    <label className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-xl shadow-xl border border-black/5 flex items-center justify-center text-black/40 hover:text-grass-green transition-colors cursor-pointer">
                      <Camera size={18} />
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    </label>
                  </div>
                   <div>
                    <h3 className="text-xl font-black mb-1">{formData.full_name || 'Owner Name'}</h3>
                    <p className="text-sm font-bold text-black/30 uppercase tracking-widest">Farmer ID: #OS-{user?.id || 'PENDING'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-xs font-black uppercase tracking-widest text-black/30 ml-1">Full Name</label>
                    <div className="relative">
                       <User size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-black/20" />
                       <input 
                         type="text" 
                         suppressHydrationWarning 
                         value={formData.full_name} 
                         onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                         className="w-full pl-14 pr-6 py-4 bg-black/5 rounded-2xl border-none outline-none focus:ring-2 focus:ring-black/5 font-bold" 
                       />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-black uppercase tracking-widest text-black/30 ml-1">Phone Number</label>
                    <div className="relative">
                       <Smartphone size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-black/20" />
                       <input 
                         type="tel" 
                         suppressHydrationWarning 
                         value={formData.phone_number} 
                         onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                         className="w-full pl-14 pr-6 py-4 bg-black/5 rounded-2xl border-none outline-none focus:ring-2 focus:ring-black/5 font-bold" 
                       />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-black uppercase tracking-widest text-black/30 ml-1">Email Address</label>
                    <div className="relative">
                       <Mail size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-black/20" />
                       <input 
                         type="email" 
                         suppressHydrationWarning 
                         value={formData.email} 
                         onChange={(e) => setFormData({...formData, email: e.target.value})}
                         className="w-full pl-14 pr-6 py-4 bg-black/5 rounded-2xl border-none outline-none focus:ring-2 focus:ring-black/5 font-bold" 
                       />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-black uppercase tracking-widest text-black/30 ml-1">Preferred Language</label>
                    <div className="relative">
                       <Languages size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-black/20" />
                       <select 
                         suppressHydrationWarning 
                         value={formData.language}
                         onChange={(e) => setFormData({...formData, language: e.target.value})}
                         className="w-full pl-14 pr-6 py-4 bg-black/5 rounded-2xl border-none outline-none focus:ring-2 focus:ring-black/5 font-bold appearance-none"
                       >
                          <option>English</option>
                          <option>മലയാളം (Malayalam)</option>
                       </select>
                    </div>
                  </div>
                </div>

                <div className="pt-6 flex items-center gap-6">
                  <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    suppressHydrationWarning 
                    className="bg-patch-black text-white px-10 py-5 rounded-[24px] font-black shadow-2xl flex items-center gap-3 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {isSaving ? 'Saving...' : <><Save size={20} /> Save Changes</>}
                  </button>
                  {saveStatus && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-grass-green font-bold">
                      {saveStatus}
                    </motion.p>
                  )}
                </div>
              </motion.div>
            )}

            {activeSection === 'farm' && (
              <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                 <h3 className="text-2xl font-black tracking-tight mb-8">Farm Details</h3>
                 <div className="p-8 bg-black/5 rounded-[32px] border border-black/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-grass-green/5 blur-[50px]"></div>
                    <div className="flex justify-between items-start mb-6">
                       <div>
                          <p className="text-lg font-black">Farm Branch 1</p>
                          <p className="text-sm font-bold text-black/40 flex items-center gap-1"><MapPin size={14}/> Not Set</p>
                       </div>
                       <span className="bg-grass-green/10 text-grass-green px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">Primary Farm</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                       <div className="p-4 bg-white rounded-2xl shadow-sm">
                          <p className="text-[10px] font-black text-black/20 uppercase tracking-widest mb-1">Total Herd</p>
                          <p className="text-xl font-black">{cattle.length}</p>
                       </div>
                       <div className="p-4 bg-white rounded-2xl shadow-sm">
                          <p className="text-[10px] font-black text-black/20 uppercase tracking-widest mb-1">Capacity</p>
                          <p className="text-xl font-black">--</p>
                       </div>
                       <div className="p-4 bg-white rounded-2xl shadow-sm">
                          <p className="text-[10px] font-black text-black/20 uppercase tracking-widest mb-1">Workers</p>
                          <p className="text-xl font-black">--</p>
                       </div>
                    </div>
                 </div>
                 <button className="w-full py-5 border-2 border-dashed border-black/10 rounded-[32px] text-black/40 font-black hover:border-black/20 hover:text-black transition-all">
                    + Add New Farm Branch
                 </button>
              </motion.div>
            )}

            {activeSection === 'security' && (
              <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-10">
                 <h3 className="text-2xl font-black tracking-tight mb-8">Security & Password</h3>
                 <div className="space-y-8">
                    <div className="space-y-3">
                      <label className="text-xs font-black uppercase tracking-widest text-black/30 ml-1">Current Password</label>
                      <div className="relative">
                        <Lock size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-black/20" />
                        <input type="password" placeholder="••••••••" className="w-full pl-14 pr-6 py-4 bg-black/5 rounded-2xl border-none outline-none focus:ring-2 focus:ring-black/5 font-bold" />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-xs font-black uppercase tracking-widest text-black/30 ml-1">New Password</label>
                      <div className="relative">
                        <Lock size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-black/20" />
                        <input type="password" placeholder="••••••••" className="w-full pl-14 pr-6 py-4 bg-black/5 rounded-2xl border-none outline-none focus:ring-2 focus:ring-black/5 font-bold" />
                      </div>
                    </div>
                 </div>
                 <div className="p-6 bg-red-50 rounded-[32px] border border-red-100">
                    <h4 className="text-red-600 font-black mb-2 flex items-center gap-2"><Shield size={18}/> Danger Zone</h4>
                    <p className="text-red-500/60 text-sm font-medium mb-6">Once you delete your account, there is no going back. Please be certain.</p>
                    <button className="px-8 py-4 bg-red-600 text-white rounded-2xl font-black text-sm hover:bg-red-700 transition-colors shadow-lg">Delete Account</button>
                 </div>
              </motion.div>
            )}

            {activeSection === 'notifications' && (
              <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                 <h3 className="text-2xl font-black tracking-tight mb-8">Notification Preferences</h3>
                 <div className="space-y-4">
                    {[
                      { label: 'Push Notifications', desc: 'Get instant alerts on your device for critical health events.' },
                      { label: 'WhatsApp Updates', desc: 'Receive daily production summaries and vaccination reminders.' },
                      { label: 'Email Reports', desc: 'Monthly performance and financial analytics reports.' },
                      { label: 'SMS Emergency Alerts', desc: 'Critical alerts when offline or in low connectivity areas.' },
                    ].map((n, i) => (
                      <div key={i} className="flex items-center justify-between p-6 bg-black/5 rounded-3xl">
                         <div className="max-w-md">
                            <p className="font-black mb-1">{n.label}</p>
                            <p className="text-xs font-medium text-black/40">{n.desc}</p>
                         </div>
                         <div className="w-14 h-8 bg-grass-green rounded-full p-1 relative cursor-pointer">
                            <div className="absolute right-1 top-1 w-6 h-6 bg-white rounded-full shadow-lg"></div>
                         </div>
                      </div>
                    ))}
                 </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
