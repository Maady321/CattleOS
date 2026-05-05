"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pipette, Baby, Heart, Calendar, Plus, Clock, ChevronRight, Activity, Zap, History, User, X, CheckCircle2, AlertCircle, Download } from 'lucide-react';
import { useCattleStore } from '@/store/cattleStore';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';

export default function BreedingPage() {
  const { cattle, breedingLogs, addBreedingLog, hasHydrated } = useCattleStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHeatModalOpen, setIsHeatModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  
  const [newEvent, setNewEvent] = useState({
    cow: '',
    type: 'Heat' as any,
    status: 'Detected',
    technician: '',
    notes: ''
  });

  // Handle Hydration
  useEffect(() => {
    if (hasHydrated) {
      setIsLoading(false);
      if (cattle.length > 0 && !newEvent.cow) {
        setNewEvent(prev => ({ ...prev, cow: `${cattle[0].name} (#${cattle[0].tag})` }));
      }
    }
  }, [hasHydrated, cattle, newEvent.cow]);

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    const eventToAdd = {
      id: Date.now(),
      ...newEvent,
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    addBreedingLog(eventToAdd);
    setIsModalOpen(false);
    setNewEvent(prev => ({ ...prev, notes: '', technician: '' }));
  };

  const exportToCSV = (logsToExport = breedingLogs) => {
    if (logsToExport.length === 0) return;
    
    const data = Array.isArray(logsToExport) ? logsToExport : [logsToExport];

    const headers = ['Date', 'Time', 'Animal', 'Event Type', 'Status', 'Technician', 'Notes'];
    const rows = data.map(log => [
      log.date,
      log.timestamp,
      log.cow,
      log.type,
      log.status,
      log.technician || 'N/A',
      log.notes || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `Breeding_Report_${new Date().toLocaleDateString().replace(/\//g, '-')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!hasHydrated || isLoading) {
    return <div className="p-8"><Skeleton className="h-96 w-full rounded-[40px]" /></div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2">Breeding Management</h1>
          <p className="text-black/40 font-medium">Track cycles, pregnancy checks, and pedigree history.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => exportToCSV(breedingLogs)}
            className="bg-white border border-black/5 px-6 py-4 rounded-2xl font-black flex items-center gap-3 hover:bg-black/5 transition-all shadow-sm disabled:opacity-50"
            disabled={breedingLogs.length === 0}
          >
            <Download size={20} /> Export Report
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-patch-black text-white px-8 py-4 rounded-2xl font-black flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-xl"
          >
            <Plus size={20} /> Log Breeding Event
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        {[
          { label: 'Active Inseminations', value: breedingLogs.filter(l => l.type === 'Insemination').length, icon: Pipette, color: 'text-blue-500', bg: 'bg-blue-50' },
          { label: 'Confirmed Pregnancies', value: breedingLogs.filter(l => l.type === 'Pregnancy Check' && l.status === 'Confirmed').length, icon: Baby, color: 'text-grass-green', bg: 'bg-green-50' },
          { label: 'Cows in Heat', value: breedingLogs.filter(l => l.type === 'Heat').length, icon: Zap, color: 'text-orange-500', bg: 'bg-orange-50' },
          { label: 'Success Rate', value: '0%', icon: Activity, color: 'text-purple-500', bg: 'bg-purple-50' },
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-3xl border border-black/5 shadow-premium"
          >
            <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-4`}>
              <stat.icon size={24} />
            </div>
            <p className="text-xs font-black uppercase tracking-widest text-black/30 mb-1">{stat.label}</p>
            <p className="text-3xl font-black tracking-tight">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Breeding Timeline */}
        <div className="lg:col-span-2 bg-white rounded-[40px] border border-black/5 shadow-premium overflow-hidden">
          <div className="p-8 border-b border-black/5 flex justify-between items-center">
            <h3 className="text-2xl font-black tracking-tight">Recent Activity</h3>
            <button className="text-xs font-bold uppercase tracking-widest text-grass-green flex items-center gap-1 hover:gap-2 transition-all">
              View History <ChevronRight size={14} />
            </button>
          </div>
          
          <div className="p-8">
            <AnimatePresence mode="popLayout">
              {breedingLogs.length === 0 ? (
                <div className="py-20 text-center">
                   <div className="w-20 h-20 bg-black/5 rounded-full flex items-center justify-center mx-auto mb-6">
                      <History size={32} className="text-black/20" />
                   </div>
                   <p className="text-black/30 font-black uppercase tracking-widest">No breeding events logged yet</p>
                </div>
              ) : (
                breedingLogs.map((event, i) => (
                  <motion.div 
                    key={event.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => setSelectedEvent(event)}
                    className="flex gap-6 mb-8 last:mb-0 relative group cursor-pointer"
                  >
                    {i !== breedingLogs.length - 1 && <div className="absolute left-[15px] top-[32px] bottom-[-32px] w-0.5 bg-black/5"></div>}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white relative z-10 shrink-0 shadow-lg group-hover:scale-110 transition-transform ${
                      event.type === 'Heat' ? 'bg-orange-500' :
                      event.type === 'Insemination' ? 'bg-blue-500' :
                      event.type === 'Pregnancy Check' ? 'bg-grass-green' : 'bg-purple-500'
                    }`}>
                      {event.type === 'Heat' ? <Zap size={14} /> :
                       event.type === 'Insemination' ? <Pipette size={14} /> :
                       event.type === 'Pregnancy Check' ? <Baby size={14} /> : <Heart size={14} />}
                    </div>
                    <div className="flex-1 pb-8 border-b border-black/5 last:border-none">
                      <div className="flex justify-between items-start mb-1">
                        <p className="font-black text-lg">{event.type}: {event.status}</p>
                        <span className="text-xs font-bold text-black/20 uppercase tracking-widest">{event.date} • {event.timestamp}</span>
                      </div>
                      <p className="text-black/40 font-bold text-sm">Animal: <span className="text-black/60">{event.cow}</span></p>
                      {event.technician && <p className="text-[10px] font-black uppercase text-black/20 mt-2 tracking-widest">Technician: {event.technician}</p>}
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Action Sidebar */}
        <div className="space-y-8">
          {/* Heat Detection AI */}
          <div className="bg-patch-black text-white p-8 rounded-[40px] shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/20 blur-[60px]"></div>
            <div className="flex items-center gap-3 text-orange-400 font-black text-xs uppercase tracking-[0.2em] mb-6">
              <Zap size={16} fill="currentColor" />
              Smart Heat Alert
            </div>
            <h4 className="text-xl font-black mb-4">Activity spike detected in Group B.</h4>
            <p className="text-white/40 text-sm font-medium mb-8">Motion sensors indicate 3 cows may be entering their cycle.</p>
            <button 
              onClick={() => setIsHeatModalOpen(true)}
              className="w-full py-4 bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl font-black text-sm transition-all"
            >
              Identify Animals
            </button>
          </div>

          {/* Calving Countdown */}
          <div className="bg-white p-8 rounded-[40px] border border-black/5 shadow-premium">
             <div className="flex items-center gap-3 text-grass-green font-black text-xs uppercase tracking-[0.2em] mb-6">
                <Baby size={18} /> Next Calving
             </div>
             <div className="flex items-baseline gap-2 mb-2">
                <span className="text-5xl font-black tracking-tighter">12</span>
                <span className="text-lg font-black text-black/30">Days</span>
             </div>
             <p className="font-bold text-black/60 mb-8">Expected for Mother: <span className="text-black">No confirmed calving soon</span></p>
             <div className="h-2 bg-black/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '85%' }}
                  className="h-full bg-grass-green"
                />
             </div>
             <p className="mt-4 text-xs font-bold text-black/20 uppercase tracking-widest">Gestation Progress: 85%</p>
          </div>
        </div>
      </div>

      {/* Log Breeding Event Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-[200]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-white z-[201] shadow-2xl p-10 overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-10">
                 <h2 className="text-3xl font-black">Log Breeding Event</h2>
                 <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-black/5 rounded-full transition-colors text-black/20 hover:text-black">
                    <X size={24} />
                 </button>
              </div>

              <form onSubmit={handleAddEvent} className="space-y-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-black/30 ml-1">Select Animal</label>
                  <select 
                    value={newEvent.cow}
                    onChange={(e) => setNewEvent({...newEvent, cow: e.target.value})}
                    className="w-full px-6 py-4 bg-black/5 rounded-2xl border-none font-bold outline-none focus:ring-2 focus:ring-black/5 transition-all appearance-none"
                  >
                    {cattle.map(cow => (
                      <option key={cow.id}>{cow.name} (#{cow.tag})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-black/30 ml-1">Event Type</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: 'Heat', icon: Zap },
                      { id: 'Insemination', icon: Pipette },
                      { id: 'Pregnancy Check', icon: Baby },
                      { id: 'Calving', icon: Heart }
                    ].map(type => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setNewEvent({...newEvent, type: type.id})}
                        className={`p-4 rounded-2xl border-2 flex items-center gap-3 transition-all ${
                          newEvent.type === type.id ? 'border-patch-black bg-patch-black text-white' : 'border-black/5 hover:border-black/20'
                        }`}
                      >
                        <type.icon size={18} />
                        <span className="font-bold text-sm">{type.id}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {newEvent.type === 'Insemination' && (
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-black/30 ml-1">Technician / Semen ID</label>
                      <input 
                        type="text"
                        placeholder="e.g. Dr. Sabari / ABS-776"
                        value={newEvent.technician}
                        onChange={(e) => setNewEvent({...newEvent, technician: e.target.value})}
                        className="w-full px-6 py-4 bg-black/5 rounded-2xl border-none font-bold outline-none focus:ring-2 focus:ring-black/5 transition-all"
                      />
                   </div>
                )}

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-black/30 ml-1">Status / Result</label>
                  <select 
                    value={newEvent.status}
                    onChange={(e) => setNewEvent({...newEvent, status: e.target.value})}
                    className="w-full px-6 py-4 bg-black/5 rounded-2xl border-none font-bold outline-none focus:ring-2 focus:ring-black/5 transition-all appearance-none"
                  >
                    {newEvent.type === 'Heat' && (
                      <>
                        <option>Detected</option>
                        <option>Strong</option>
                        <option>Silent</option>
                      </>
                    )}
                    {newEvent.type === 'Insemination' && (
                      <>
                        <option>Successful</option>
                        <option>Repeat</option>
                      </>
                    )}
                    {newEvent.type === 'Pregnancy Check' && (
                      <>
                        <option>Confirmed</option>
                        <option>Negative</option>
                        <option>Suspicious</option>
                      </>
                    )}
                    {newEvent.type === 'Calving' && (
                      <>
                        <option>Healthy Calf</option>
                        <option>Twins</option>
                        <option>Complication</option>
                      </>
                    )}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-black/30 ml-1">Additional Notes</label>
                  <textarea 
                    placeholder="Describe any observations..."
                    value={newEvent.notes}
                    onChange={(e) => setNewEvent({...newEvent, notes: e.target.value})}
                    className="w-full px-6 py-4 bg-black/5 rounded-2xl border-none font-bold outline-none focus:ring-2 focus:ring-black/5 transition-all min-h-[120px]"
                  />
                </div>

                <div className="pt-6">
                   <button type="submit" className="w-full py-5 bg-patch-black text-white rounded-[24px] font-black shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3">
                      Complete Record
                   </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Breeding Event Detail Modal */}
      <AnimatePresence>
        {selectedEvent && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedEvent(null)}
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
                  onClick={() => setSelectedEvent(null)}
                  className="absolute top-8 right-8 p-3 hover:bg-black/5 rounded-full transition-colors text-black/20 hover:text-black"
                >
                  <X size={24} />
                </button>

                <div className="flex items-center gap-6 mb-10">
                  <div className={`w-20 h-20 rounded-[28px] flex items-center justify-center shadow-lg text-white ${
                    selectedEvent.type === 'Heat' ? 'bg-orange-500' :
                    selectedEvent.type === 'Insemination' ? 'bg-blue-500' :
                    selectedEvent.type === 'Pregnancy Check' ? 'bg-grass-green' : 'bg-purple-500'
                  }`}>
                    {selectedEvent.type === 'Heat' ? <Zap size={32} /> :
                     selectedEvent.type === 'Insemination' ? <Pipette size={32} /> :
                     selectedEvent.type === 'Pregnancy Check' ? <Baby size={32} /> : <Heart size={32} />}
                  </div>
                  <div>
                    <h2 className="text-3xl font-black tracking-tight">{selectedEvent.type} Report</h2>
                    <p className="text-black/30 font-bold uppercase tracking-widest text-sm">{selectedEvent.date} • {selectedEvent.timestamp}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-10">
                   <div className="p-8 bg-black/[0.02] rounded-[32px] border border-black/5">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-black/30 mb-2">Animal Identity</p>
                      <p className="text-xl font-black">{selectedEvent.cow}</p>
                   </div>
                   <div className="p-8 bg-black/[0.02] rounded-[32px] border border-black/5">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-black/30 mb-2">Event Status</p>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={18} className="text-grass-green" />
                        <p className="text-xl font-black">{selectedEvent.status}</p>
                      </div>
                   </div>
                </div>

                {selectedEvent.technician && (
                   <div className="mb-10 p-8 bg-blue-50/50 rounded-[32px] border border-blue-100 flex items-center gap-6">
                      <div className="w-12 h-12 bg-blue-500 text-white rounded-2xl flex items-center justify-center">
                         <User size={24} />
                      </div>
                      <div>
                         <p className="text-[10px] font-black uppercase text-blue-500 tracking-widest">Technician / Semen ID</p>
                         <p className="text-lg font-black text-blue-900">{selectedEvent.technician}</p>
                      </div>
                   </div>
                )}

                <div className="mb-12">
                   <p className="text-[10px] font-black uppercase tracking-widest text-black/30 mb-4 ml-1">Clinical Observations</p>
                   <div className="p-8 bg-black/[0.02] rounded-[32px] border border-black/5 italic text-black/60">
                      {selectedEvent.notes || "No additional observations recorded for this event."}
                   </div>
                </div>

                <div className="pt-10 border-t border-black/5 flex justify-end gap-4">
                   <button 
                     onClick={() => exportToCSV(selectedEvent)}
                     className="px-8 py-4 bg-black/5 rounded-2xl font-black text-black/40 hover:bg-black/10 transition-all flex items-center gap-2"
                   >
                      <Download size={18} /> Export CSV
                   </button>
                   <button 
                     onClick={() => setSelectedEvent(null)}
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

      {/* Smart Heat AI Identification Modal */}
      <AnimatePresence>
        {isHeatModalOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsHeatModalOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[220]"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 m-auto w-full max-w-3xl h-fit bg-patch-black text-white z-[221] rounded-[48px] shadow-2xl overflow-hidden p-12"
            >
              <div className="flex justify-between items-center mb-12">
                 <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center text-white">
                       <Zap size={32} />
                    </div>
                    <div>
                       <h2 className="text-3xl font-black tracking-tight">Smart Heat Analysis</h2>
                       <p className="text-white/40 font-medium">Real-time behavioral pattern identification.</p>
                    </div>
                 </div>
                 <button onClick={() => setIsHeatModalOpen(false)} className="p-3 hover:bg-white/10 rounded-full transition-colors text-white/20 hover:text-white">
                    <X size={32} />
                 </button>
              </div>

              <div className="space-y-6">
                 <div className="py-20 text-center bg-white/5 rounded-[32px] border border-white/10">
                    <p className="text-white/20 font-black uppercase tracking-widest">No activity alerts at this time</p>
                 </div>
              </div>

              <div className="mt-12 p-8 bg-orange-500/10 rounded-[32px] border border-orange-500/20 flex items-center gap-6">
                 <AlertCircle className="text-orange-500" size={32} />
                 <p className="text-white/60 font-medium leading-relaxed">
                    Heat detection is based on sensor activity. Manual confirmation is recommended before initiating insemination procedures.
                 </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
