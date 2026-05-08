"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HeartPulse, Syringe, Pill, Activity, AlertTriangle, Plus, Search, Filter, ChevronRight, Stethoscope, Clock, X, Calendar } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { translations, Language } from '@/lib/translations';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { useCattleStore } from '@/store/cattleStore';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function HealthPage() {
  const { cattle, productionLogs, alerts, addAlert, isAiMonitorEnabled, toggleAiMonitor, hasHydrated } = useCattleStore();
  const { user } = useAuthStore();
  
  const lang = (user?.language || 'en') as Language;
  const t = translations[lang] || translations.en;
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiInsights, setAiInsights] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'records' | 'vaccinations' | 'medications'>('records');
  const [records, setRecords] = useState<any[]>([]);
  const [newLog, setNewLog] = useState({
    cow: '',
    type: 'Diagnosis',
    notes: '',
    temp: '38.5'
  });

  const [selectedLog, setSelectedLog] = useState<any>(null);

  const downloadPDF = (log: any) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(0, 0, 0);
    doc.text('CattleOS Medical Report', 20, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 28);
    
    // Horizontal Line
    doc.setDrawColor(230, 230, 230);
    doc.line(20, 35, 190, 35);
    
    // Animal Info
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text('ANIMAL IDENTITY', 20, 45);
    
    doc.setFont('helvetica', 'normal');
    doc.text(`Name/Tag: ${log.cow}`, 20, 52);
    
    // Event Info
    doc.setFont('helvetica', 'bold');
    doc.text('EVENT SUMMARY', 20, 65);
    
    autoTable(doc, {
      startY: 70,
      head: [['Category', 'Date', 'Time', 'Temperature']],
      body: [[log.type, log.date, log.time, `${log.temp}°C`]],
      headStyles: { fillColor: [0, 0, 0] },
      theme: 'grid'
    });
    
    // Notes
    const finalY = (doc as any).lastAutoTable.finalY || 80;
    doc.setFont('helvetica', 'bold');
    doc.text('CLINICAL NOTES', 20, finalY + 15);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    const splitNotes = doc.splitTextToSize(log.notes || "No additional notes provided. Animal appeared in normal condition during observation.", 170);
    doc.text(splitNotes, 20, finalY + 22);
    
    // Footer
    doc.setFontSize(9);
    doc.setTextColor(180, 180, 180);
    doc.text('This is a computer-generated medical record from CattleOS Full-Stack Platform.', 20, 280);

    doc.save(`Health_Report_${log.cow.split(' ')[0]}_${log.date.replace(/ /g, '_')}.pdf`);
  };

  // AI Monitoring Logic
  useEffect(() => {
    if (isAiMonitorEnabled && hasHydrated && !isAnalyzing) {
      setIsAnalyzing(true);
      const timer = setTimeout(() => {
        const insights: any[] = [];
        
        // Simple logic: check for yield drops > 20%
        cattle.forEach(cow => {
          const cowLogs = productionLogs.filter(l => l.cow.includes(cow.name));
          if (cowLogs.length >= 2) {
            const currentYield = parseFloat(cowLogs[0].yield);
            const prevYield = parseFloat(cowLogs[1].yield);
            
            if (currentYield < prevYield * 0.8) {
              const dropPercent = (((prevYield - currentYield) / prevYield) * 100).toFixed(0);
              insights.push({
                type: 'warning',
                title: 'Potential Mastitis Alert',
                animal: cow.name,
                tag: cow.tag,
                detail: `Yield drop of ${dropPercent}% detected in last session.`,
                confidence: '92%'
              });

              // Add a global alert if not already present
              const alertExists = alerts.find(a => a.title.includes(cow.name) && a.type === 'health');
              if (!alertExists) {
                addAlert({
                  id: `ai-health-${cow.id}-${Date.now()}`,
                  type: 'health',
                  title: `Health Alert: ${cow.name}`,
                  message: `AI detected a sudden ${dropPercent}% drop in milk yield. Immediate physical check recommended for Mastitis signs.`,
                  time: 'Just now',
                  isRead: false,
                  date: new Date().toLocaleDateString()
                });
              }
            }
          }
        });

        // Add heat stress check if many cows are slightly down
        const totalAvg = productionLogs.reduce((acc, l) => acc + parseFloat(l.yield), 0) / productionLogs.length;
        const recentAvg = productionLogs.slice(0, 5).reduce((acc, l) => acc + parseFloat(l.yield), 0) / 5;
        if (recentAvg < totalAvg * 0.9 && cattle.length > 3) {
          insights.push({
            type: 'reminder',
            title: 'Heat Stress Warning',
            animal: 'Global Herd',
            detail: 'Average herd yield is down 10%. Check ventilation and water access.',
            confidence: '85%'
          });
        }

        setAiInsights(insights);
        setIsAnalyzing(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isAiMonitorEnabled, productionLogs, cattle, hasHydrated, addAlert, alerts]);

  // Handle Hydration and initialize first cow
  useEffect(() => {
    if (hasHydrated) {
      setIsLoading(false);
      if (cattle.length > 0 && !newLog.cow) {
        setNewLog(prev => ({ ...prev, cow: `${cattle[0].name} (#${cattle[0].tag})` }));
      }
    }
  }, [hasHydrated, cattle, newLog.cow]);

  // Filter records based on active tab
  const filteredRecords = records.filter(record => {
    if (activeTab === 'records') return true;
    if (activeTab === 'vaccinations') return record.type === 'Vaccination';
    if (activeTab === 'medications') return record.type === 'Medication';
    return true;
  });

  const tabs = [
    { id: 'records', label: t.health.tabs.all, icon: Activity },
    { id: 'vaccinations', label: t.health.tabs.vaccinations, icon: Syringe },
    { id: 'medications', label: t.health.tabs.medications, icon: Pill },
  ];

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    const logToAdd = {
      id: Date.now(),
      ...newLog,
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setRecords([logToAdd, ...records]);
    setIsModalOpen(false);
  };

  const upcomingEvents = [
    { date: '12 May', event: 'FMD Vaccination', status: 'Scheduled', cow: 'All Herd' },
    { date: '15 May', event: 'Deworming Cycle', status: 'Pending', cow: 'Batch B' },
    { date: '20 May', event: 'Vet Monthly Audit', status: 'Confirmed', cow: 'Full Farm' },
  ];

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto relative">
      {/* Header - Hidden on mobile as Layout handles it */}
      <div className="hidden lg:flex justify-between items-center mb-12">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2">{t.health.title}</h1>
          <p className="text-black/40 font-medium">{t.health.sub}</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-patch-black text-white px-8 py-4 rounded-2xl font-black flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-xl"
        >
          <Plus size={20} /> {t.health.logEvent}
        </button>
      </div>

      {/* MOBILE QUICK ACTION */}
      <div className="lg:hidden mb-10 mt-[-20px]">
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-full bg-patch-black text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 shadow-2xl active:scale-[0.98] transition-all text-sm"
        >
          <Plus size={20} /> {t.health.logEvent}
        </button>
      </div>

       {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-8">
        {[
          { label: t.health.stats.critical, value: '0', icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50' },
          { label: 'Vaccinations', value: '0', icon: Syringe, color: 'text-blue-500', bg: 'bg-blue-50' },
          { label: 'Medications', value: '0', icon: Pill, color: 'text-orange-500', bg: 'bg-orange-50' },
          { label: t.health.stats.score, value: '100%', icon: HeartPulse, color: 'text-grass-green', bg: 'bg-green-50' },
        ].map((stat, i) => (
           <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`p-4 md:p-6 rounded-[28px] border transition-all duration-300 flex flex-col items-center text-center ${
               stat.label === t.health.stats.score 
               ? 'bg-patch-black text-white border-white/10 shadow-2xl' 
               : 'bg-white border-black/5 shadow-sm'
            }`}
          >
            <div className={`w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center mb-2 md:mb-4 ${
               stat.label === t.health.stats.score ? 'bg-grass-green text-white shadow-[0_0_20px_rgba(46,204,113,0.4)]' : `${stat.bg} ${stat.color}`
            }`}>
              <stat.icon size={18} className="md:size-[24px]" />
            </div>
            <p className={`text-[9px] font-black uppercase tracking-tight mb-0.5 leading-tight ${stat.label === t.health.stats.score ? 'text-white/40' : 'text-black/30'}`}>
              {stat.label}
            </p>
            <p className="text-xl md:text-3xl font-black tracking-tight">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Navigation Tabs */}
      <div className="flex justify-center mb-10">
        <div className="flex items-center gap-1.5 p-1.5 bg-black/5 rounded-[20px] overflow-x-auto no-scrollbar max-w-full">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all ${
               activeTab === tab.id 
                 ? 'bg-white text-black shadow-md' 
                 : 'text-black/30 hover:text-black'
            }`}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-[40px] border border-black/5 shadow-premium overflow-hidden min-h-[400px]">
        {isLoading ? (
          <div className="p-12 space-y-6">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : filteredRecords.length === 0 ? (
          <EmptyState 
            icon={Stethoscope}
            title={`No ${activeTab} found`}
            description={`You haven't recorded any ${activeTab} for your herd yet. Start tracking to see insights.`}
            actionLabel="Record First Event"
            onAction={() => setIsModalOpen(true)}
          />
        ) : (
          <div className="p-10 space-y-8">
             <AnimatePresence mode="popLayout">
               {filteredRecords.map((log) => (
                 <motion.div 
                   key={log.id}
                   initial={{ opacity: 0, x: -20 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, scale: 0.95 }}
                   onClick={() => setSelectedLog(log)}
                   className="flex gap-8 items-start p-6 bg-black/[0.02] rounded-[32px] border border-black/5 hover:border-black/20 hover:bg-white hover:shadow-premium transition-all group cursor-pointer"
                 >
                    <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex flex-col items-center justify-center shrink-0 border border-black/5">
                       <span className="text-[10px] font-black uppercase text-black/30 tracking-widest">{log.date.split(' ')[1]}</span>
                       <span className="text-xl font-black">{log.date.split(' ')[0]}</span>
                    </div>
                    <div className="flex-1">
                       <div className="flex justify-between items-start mb-2">
                          <h4 className="text-xl font-black tracking-tight flex items-center gap-3">
                             {log.type === 'Vaccination' && <Syringe size={18} className="text-blue-500" />}
                             {log.type === 'Medication' && <Pill size={18} className="text-orange-500" />}
                             {log.type === 'Diagnosis' && <Activity size={18} className="text-red-500" />}
                             {log.type} for {log.cow.split(' ')[0]}
                          </h4>
                          <span className="text-xs font-bold text-black/20 uppercase tracking-widest">{log.time}</span>
                       </div>
                       <p className="text-black/50 font-medium mb-4 line-clamp-1">{log.notes || 'Routine checkup and physical examination.'}</p>
                       <div className="flex items-center gap-4">
                          <span className="px-4 py-1.5 bg-white rounded-full text-xs font-black uppercase tracking-widest border border-black/5 text-black/60 shadow-sm">
                             Temp: {log.temp}°C
                          </span>
                       </div>
                    </div>
                 </motion.div>
               ))}
             </AnimatePresence>
          </div>
        )}
      </div>

      {/* Upcoming Schedule & Vet Connect */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
         <div className="bg-patch-black p-10 rounded-[40px] border border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[60px]"></div>
            <div className="relative z-10">
               <div className="flex justify-between items-center mb-8">
                  <h4 className="text-2xl font-black text-white tracking-tight">Upcoming Schedule</h4>
                  <Calendar className="text-white/20" size={24} />
               </div>
               <div className="space-y-6">
                  {upcomingEvents.map((event, i) => (
                     <div key={i} className="flex items-center gap-6 p-4 bg-white/5 rounded-2xl border border-white/5">
                        <div className="w-12 h-12 bg-white/5 rounded-xl flex flex-col items-center justify-center border border-white/10 shrink-0">
                           <span className="text-[10px] font-black text-white/30 uppercase">{event.date.split(' ')[1]}</span>
                           <span className="text-lg font-black text-white">{event.date.split(' ')[0]}</span>
                        </div>
                        <div className="flex-1">
                           <p className="font-bold text-white text-base">{event.event}</p>
                           <p className="text-xs text-white/40">{event.cow}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                           event.status === 'Scheduled' ? 'bg-blue-500/20 text-blue-400' : 'bg-orange-500/20 text-orange-400'
                        }`}>
                           {event.status}
                        </span>
                     </div>
                  ))}
               </div>
            </div>
         </div>

         <div className="bg-gradient-to-br from-grass-green to-emerald-900 p-10 rounded-[40px] flex flex-col justify-between group cursor-pointer hover:scale-[1.02] transition-transform shadow-2xl">
            <div>
               <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-white mb-8 border border-white/20">
                  <Stethoscope size={32} />
               </div>
               <h4 className="text-3xl font-black text-white mb-4 leading-tight">Professional Vet Consultation</h4>
               <p className="text-white/60 font-medium text-lg max-w-sm">Need professional advice? Connect with our panel of certified veterinarians instantly.</p>
            </div>
            <div className="flex items-center gap-4 mt-12">
               <button className="flex-1 py-5 bg-white text-patch-black rounded-2xl font-black shadow-xl hover:bg-emerald-50 transition-colors">
                  Contact Vet
               </button>
               <button className="w-16 h-16 bg-black/20 text-white rounded-2xl flex items-center justify-center border border-white/10 hover:bg-black/30 transition-colors">
                  <Clock size={24} />
               </button>
            </div>
         </div>
      </div>

      {/* AI Insights Section */}
      <div className="mt-12 space-y-8">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`p-10 rounded-[40px] relative overflow-hidden group transition-all duration-500 ${
            isAiMonitorEnabled ? 'bg-patch-black' : 'bg-gradient-to-br from-patch-black to-black/80'
          }`}
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-grass-green/20 blur-[100px] group-hover:bg-grass-green/30 transition-all"></div>
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-10">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 text-grass-green font-black text-xs uppercase tracking-[0.2em] mb-6">
                <Activity size={16} className={isAnalyzing ? 'animate-pulse' : ''} />
                {isAiMonitorEnabled ? (isAnalyzing ? t.health.ai.scanning : t.health.ai.active) : t.health.ai.title}
              </div>
              <h2 className="text-3xl font-black mb-4 leading-tight text-white">
                {isAiMonitorEnabled ? 'Your herd is being monitored in real-time.' : 'Predict potential illnesses before symptoms appear.'}
              </h2>
              <p className="text-white/50 font-medium text-lg leading-relaxed">
                {isAiMonitorEnabled 
                  ? 'Our models are currently scanning production logs and behavior spikes for early warning signs.' 
                  : 'Our advanced ML models analyze behavior and production patterns to alert you of early signs of Mastitis.'}
              </p>
            </div>
            <button 
              onClick={() => toggleAiMonitor()}
              className={`px-10 py-5 rounded-[24px] font-black transition-all shadow-2xl flex items-center gap-3 whitespace-nowrap ${
                isAiMonitorEnabled 
                  ? 'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white' 
                  : 'bg-white text-black hover:scale-105'
              }`}
            >
              {isAiMonitorEnabled ? t.health.ai.disable : t.health.ai.enable} <ChevronRight size={20} />
            </button>
          </div>
        </motion.div>

        {isAiMonitorEnabled && (
          <AnimatePresence>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {isAnalyzing ? (
                 [1, 2].map(i => <Skeleton key={i} className="h-32 w-full rounded-3xl" />)
               ) : aiInsights.length === 0 ? (
                 <div className="md:col-span-2 p-10 bg-white rounded-[32px] border border-dashed border-black/10 text-center">
                    <p className="text-black/20 font-black uppercase tracking-widest">No anomalies detected in the current session</p>
                 </div>
               ) : (
                 aiInsights.map((insight, i) => (
                   <motion.div 
                     key={i}
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     className="bg-white p-8 rounded-[32px] border border-black/5 shadow-premium flex items-start gap-6"
                   >
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                        insight.type === 'warning' ? 'bg-red-50 text-red-500' : 'bg-orange-50 text-orange-500'
                      }`}>
                         {insight.type === 'warning' ? <AlertTriangle size={24} /> : <Activity size={24} />}
                      </div>
                      <div className="flex-1">
                         <div className="flex justify-between items-start mb-1">
                            <h4 className="font-black text-lg">{insight.title}</h4>
                            <span className="text-[10px] font-black uppercase text-grass-green tracking-widest">{insight.confidence} Conf.</span>
                         </div>
                         <p className="text-sm font-bold text-black/30 uppercase tracking-widest mb-2">{insight.animal} {insight.tag && `(#${insight.tag})`}</p>
                         <p className="text-sm font-medium text-black/60">{insight.detail}</p>
                      </div>
                   </motion.div>
                 ))
               )}
            </div>
          </AnimatePresence>
        )}
      </div>

      {/* Slide-over Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-[101] shadow-2xl p-10 overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-8">
                 <h2 className="text-3xl font-black">Log Health Event</h2>
                 <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-black/5 rounded-full transition-colors text-black/20 hover:text-black">
                    <X size={24} />
                 </button>
              </div>
              
              <form onSubmit={handleAddLog} className="space-y-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-black/30 ml-1">Select Animal</label>
                  <select 
                    value={newLog.cow}
                    onChange={(e) => setNewLog({...newLog, cow: e.target.value})}
                    className="w-full px-6 py-4 bg-black/5 rounded-2xl border-none font-bold outline-none focus:ring-2 focus:ring-black/5 transition-all appearance-none"
                  >
                    {cattle.map(cow => (
                      <option key={cow.id}>{cow.name} (#{cow.tag})</option>
                    ))}
                  </select>
                </div>


                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-black/30 ml-1">Event Category</label>
                  <div className="grid grid-cols-3 gap-3">
                    {['Diagnosis', 'Vaccination', 'Medication'].map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setNewLog({...newLog, type: cat})}
                        className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                          newLog.type === cat ? 'bg-patch-black text-white border-patch-black shadow-lg' : 'bg-white text-black/40 border-black/5'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-black/30 ml-1">Temperature (°C)</label>
                  <input 
                    type="number"
                    step="0.1"
                    value={newLog.temp}
                    onChange={(e) => setNewLog({...newLog, temp: e.target.value})}
                    className="w-full px-6 py-4 bg-black/5 rounded-2xl border-none font-bold outline-none focus:ring-2 focus:ring-black/5 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-black/30 ml-1">Medical Notes</label>
                  <textarea 
                    value={newLog.notes}
                    onChange={(e) => setNewLog({...newLog, notes: e.target.value})}
                    placeholder="Describe symptoms, treatment, or vaccine batch ID..."
                    rows={4}
                    className="w-full px-6 py-4 bg-black/5 rounded-2xl border-none font-bold outline-none focus:ring-2 focus:ring-black/5 transition-all resize-none"
                  />
                </div>

                <div className="pt-6">
                  <button type="submit" className="w-full py-5 bg-patch-black text-white rounded-2xl font-black shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3">
                    <HeartPulse size={20} /> Record Health Entry
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Detail Popup Modal */}
      <AnimatePresence>
        {selectedLog && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedLog(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-[200]"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-0 m-auto w-full max-w-2xl h-fit bg-white z-[201] rounded-[48px] shadow-2xl overflow-hidden"
            >
              <div className="relative p-12">
                <button 
                  onClick={() => setSelectedLog(null)}
                  className="absolute top-8 right-8 p-3 hover:bg-black/5 rounded-full transition-colors text-black/20 hover:text-black"
                >
                  <X size={24} />
                </button>

                <div className="flex items-center gap-6 mb-10">
                  <div className={`w-20 h-20 rounded-[28px] flex items-center justify-center shadow-lg ${
                    selectedLog.type === 'Vaccination' ? 'bg-blue-50 text-blue-500' :
                    selectedLog.type === 'Medication' ? 'bg-orange-50 text-orange-500' :
                    'bg-red-50 text-red-500'
                  }`}>
                    {selectedLog.type === 'Vaccination' ? <Syringe size={32} /> :
                     selectedLog.type === 'Medication' ? <Pill size={32} /> :
                     <Activity size={32} />}
                  </div>
                  <div>
                    <h2 className="text-3xl font-black tracking-tight">{selectedLog.type} Report</h2>
                    <p className="text-black/30 font-bold uppercase tracking-widest text-sm">{selectedLog.date} • {selectedLog.time}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-10">
                   <div className="p-6 bg-black/[0.02] rounded-3xl border border-black/5">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-black/30 mb-2">Animal Identity</p>
                      <p className="text-xl font-black">{selectedLog.cow}</p>
                   </div>
                   <div className="p-6 bg-black/[0.02] rounded-3xl border border-black/5">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-black/30 mb-2">Body Temperature</p>
                      <p className="text-xl font-black">{selectedLog.temp}° Celsius</p>
                   </div>
                </div>

                <div className="space-y-4">
                   <p className="text-[10px] font-black uppercase tracking-[0.2em] text-black/30 ml-1">Full Medical Notes</p>
                   <div className="p-8 bg-black/5 rounded-[32px] text-lg font-medium leading-relaxed text-black/70">
                      {selectedLog.notes || "No additional notes provided for this record. Animal appeared in normal condition during the observation. Routine checkup and physical examination performed."}
                   </div>
                </div>

                <div className="mt-12 pt-10 border-t border-black/5 flex justify-end gap-4">
                   <button 
                     onClick={() => downloadPDF(selectedLog)}
                     className="px-8 py-4 bg-black/5 rounded-2xl font-black text-black/40 hover:bg-black/10 transition-all flex items-center gap-2"
                   >
                      Download PDF
                   </button>
                   <button 
                     onClick={() => setSelectedLog(null)}
                     className="px-10 py-4 bg-patch-black text-white rounded-2xl font-black shadow-lg hover:scale-105 active:scale-95 transition-all"
                   >
                     Close Report
                   </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
