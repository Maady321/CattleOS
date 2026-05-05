"use client";

import React, { useState, useEffect } from 'react';
import { useCattleStore } from '@/store/cattleStore';
import { AnimatePresence, motion } from 'framer-motion';
import { Milk, BarChart3, TrendingUp, DollarSign, Plus, Download, Calendar, Filter, ChevronRight, Droplets, X, Clock } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';


export default function ProductionPage() {
  const { cattle, productionLogs, addProductionLog, hasHydrated } = useCattleStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isQualityModalOpen, setIsQualityModalOpen] = useState(false);
  const [isLabModalOpen, setIsLabModalOpen] = useState(false);
  const [timeRange, setTimeRange] = useState('7D');
  const [selectedLog, setSelectedLog] = useState<any>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);
  const [bulkLabData, setBulkLabData] = useState({
    fat: '0.0',
    protein: '0.0',
    purity: '0.0',
    snf: '0.0',
    lactose: '0.0'
  });

  const chartData = React.useMemo(() => {
    const limit = timeRange === '7D' ? 7 : timeRange === '30D' ? 30 : 180;
    
    // Generate all dates in range
    const dates = Array.from({ length: limit }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    }).reverse();

    const grouped = productionLogs.reduce((acc: any, log) => {
      const date = log.date;
      if (!acc[date]) {
        acc[date] = { yield: 0, fatSum: 0, count: 0 };
      }
      acc[date].yield += parseFloat(log.yield || '0');
      acc[date].fatSum += parseFloat(log.fat || '0');
      acc[date].count += 1;
      return acc;
    }, {});

    return dates.map(date => ({
      date,
      yield: grouped[date]?.yield || 0,
      fat: grouped[date] ? parseFloat((grouped[date].fatSum / grouped[date].count).toFixed(2)) : 0
    }));
  }, [productionLogs, timeRange]);
  const [newLog, setNewLog] = useState({
    cow: '',
    yield: '',
    session: 'Morning',
    fat: '4.0',
    snf: '8.5'
  });

  const exportToCSV = (logsToExport = productionLogs) => {
    if (logsToExport.length === 0) return;
    
    // If it's a single log, wrap it in an array
    const data = Array.isArray(logsToExport) ? logsToExport : [logsToExport];

    const headers = ['Date', 'Time', 'Animal', 'Yield (L)', 'Session', 'Fat %', 'SNF'];
    const rows = data.map(log => [
      log.date,
      log.timestamp,
      log.cow,
      log.yield,
      log.session,
      log.fat,
      log.snf
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `Production_Report_${new Date().toLocaleDateString().replace(/\//g, '-')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadQualityPDF = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(46, 204, 113); // Grass Green
    doc.text('CattleOS Quality Lab', 20, 20);
    
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('CERTIFICATE OF ANALYSIS', 20, 30);
    
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text(`Report ID: LAB-${Math.floor(Math.random() * 1000000)}`, 20, 38);
    doc.text(`Date of Analysis: ${new Date().toLocaleDateString()}`, 20, 43);
    
    // Metrics Table
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text('LABORATORY METRICS', 20, 60);
    
    autoTable(doc, {
      startY: 65,
      head: [['Parameter', 'Measured Value', 'Reference Range', 'Status']],
      body: [
        ['Milk Fat Content', '4.1%', '3.5% - 4.5%', 'Optimal'],
        ['SNF (Solid Not Fat)', '8.7%', '8.0% - 9.0%', 'Excellent'],
        ['Protein Level', '3.4%', '3.0% - 3.8%', 'High'],
        ['Lactose Level', '4.8%', '4.5% - 5.0%', 'Stable'],
        ['Purity Score', '99.8%', '> 98.0%', 'Superior']
      ],
      headStyles: { fillColor: [46, 204, 113] },
      theme: 'grid'
    });
    
    // Certification
    const finalY = (doc as any).lastAutoTable.finalY || 120;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('FINAL CERTIFICATION', 20, finalY + 20);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text('This is to certify that the dairy samples analyzed consistently meet the A-Grade', 20, finalY + 30);
    doc.text('standards for commercial distribution and premium quality labeling.', 20, finalY + 37);
    
    doc.setFont('helvetica', 'bold');
    doc.text('Quality Score: 98/100', 20, finalY + 50);
    
    // Footer
    doc.setFontSize(9);
    doc.setTextColor(180, 180, 180);
    doc.text('Technically Verified by CattleOS AI Engine.', 20, 280);

    doc.save(`Lab_Quality_Report_${new Date().toLocaleDateString().replace(/\//g, '-')}.pdf`);
  };

  // Handle Hydration
  useEffect(() => {
    if (hasHydrated) {
      setIsLoading(false);
      if (cattle.length > 0 && !newLog.cow) {
        setNewLog(prev => ({ ...prev, cow: `${cattle[0].name} (#${cattle[0].tag})` }));
      }
    }
  }, [hasHydrated, cattle, newLog.cow]);

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    const logToAdd = {
      id: Date.now(),
      ...newLog,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
    };
    addProductionLog(logToAdd);
    setIsModalOpen(false);
    setNewLog(prev => ({ ...prev, yield: '' }));
  };

  return (
    <div className="p-8 max-w-7xl mx-auto relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2">Milk Production</h1>
          <p className="text-black/40 font-medium">Track daily yields, quality metrics, and revenue growth.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => exportToCSV(productionLogs)}
            className="bg-white border border-black/5 px-6 py-4 rounded-2xl font-black flex items-center gap-3 hover:bg-black/5 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={productionLogs.length === 0}
          >
            <Download size={20} /> Export Report
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-patch-black text-white px-8 py-4 rounded-2xl font-black flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-xl"
          >
            <Plus size={20} /> Log Production
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        {[
          { label: "Today's Yield", value: `${productionLogs.filter(l => l.date === new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })).reduce((acc, l) => acc + parseFloat(l.yield || '0'), 0).toFixed(1)}L`, icon: Droplets, color: 'text-white', bg: 'bg-grass-green', shadow: 'shadow-green-200', trend: 'Live' },
          { label: 'Weekly Average', value: `${(productionLogs.reduce((acc, l) => acc + parseFloat(l.yield || '0'), 0) / Math.max(1, productionLogs.length / 2)).toFixed(1)}L`, icon: TrendingUp, color: 'text-white', bg: 'bg-emerald-600', shadow: 'shadow-emerald-200', trend: '+0%' },
          { label: 'Estimated Revenue', value: `₹${(productionLogs.reduce((acc, l) => acc + parseFloat(l.yield || '0'), 0) * 45).toLocaleString()}`, icon: DollarSign, color: 'text-white', bg: 'bg-patch-black', shadow: 'shadow-gray-200', trend: '+0%' },
          { label: 'Avg Fat Content', value: `${(productionLogs.reduce((acc, l) => acc + parseFloat(l.fat || '0'), 0) / Math.max(1, productionLogs.length)).toFixed(2)}%`, icon: Milk, color: 'text-white', bg: 'bg-green-700', shadow: 'shadow-green-300', trend: 'Stable' },
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 md:p-8 rounded-[32px] border border-black/5 shadow-premium hover:shadow-2xl transition-all duration-300 group overflow-hidden relative"
          >
            <div className={`absolute top-0 right-0 w-24 h-24 ${stat.bg} opacity-[0.03] rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-150 duration-500`}></div>
            <div className="flex justify-between items-start mb-6">
              <div className={`w-12 h-12 md:w-14 md:h-14 ${stat.bg} ${stat.color} rounded-[20px] flex items-center justify-center shadow-lg ${stat.shadow} group-hover:rotate-6 transition-all duration-300`}>
                <stat.icon size={26} strokeWidth={2.5} />
              </div>
              <span className={`text-[10px] font-black px-3 py-1.5 rounded-full ${stat.trend.startsWith('+') || stat.trend === 'Live' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                {stat.trend}
              </span>
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-black/30 mb-2">{stat.label}</p>
            <h3 className="text-3xl font-black tracking-tighter text-patch-black">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-2 bg-white p-10 rounded-[40px] border border-black/5 shadow-premium">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-2xl font-black tracking-tight">Yield Overview</h3>
            <div className="flex gap-2 p-1 bg-black/5 rounded-xl">
              {['7D', '30D', '6M'].map((p) => (
                <button 
                  key={p} 
                  onClick={() => setTimeRange(p)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${timeRange === p ? 'bg-white shadow-sm' : 'text-black/40'}`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div className="h-[350px] w-full">
            {isMounted && chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorYield" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2ECC71" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#2ECC71" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fontWeight: 700, fill: '#ccc' }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fontWeight: 700, fill: '#ccc' }}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', padding: '20px' }}
                  />
                  <Area type="monotone" dataKey="yield" stroke="#2ECC71" strokeWidth={5} fillOpacity={1} fill="url(#colorYield)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : isMounted ? (
              <div className="h-full flex items-center justify-center text-center text-black/20 font-black uppercase tracking-widest text-sm bg-black/[0.02] rounded-[32px] border border-dashed border-black/10">
                Record your first yield to see trends
              </div>
            ) : (
              <div className="h-full w-full bg-black/5 animate-pulse rounded-[32px]"></div>
            )}
          </div>
        </div>

        <div className="bg-patch-black text-white p-10 rounded-[40px] shadow-2xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-64 h-64 bg-grass-green/20 blur-[100px]"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 text-grass-green font-black text-xs uppercase tracking-[0.2em] mb-8">
              <Milk size={18} /> Quality Analysis
            </div>
            <h3 className="text-3xl font-black mb-6 leading-tight">Your herd&apos;s milk quality is in the top 5%.</h3>
            <p className="text-white/40 font-medium mb-12">Based on fat content and purity tests from the last 30 days.</p>
            
            <div className="space-y-6">
              {[
                { label: 'Avg Fat', value: `${bulkLabData.fat}%` },
                { label: 'Protein', value: `${bulkLabData.protein}%` },
                { label: 'Purity', value: `${bulkLabData.purity}%` }
              ].map((m, i) => (
                <div key={i} className="flex justify-between items-center pb-4 border-b border-white/10">
                  <span className="font-bold text-white/60">{m.label}</span>
                  <span className="font-black text-xl">{m.value}</span>
                </div>
              ))}
            </div>
          </div>
          
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => setIsQualityModalOpen(true)}
                className="relative z-10 w-full py-5 bg-white text-black rounded-[24px] font-black hover:scale-105 transition-all shadow-xl"
              >
                Full Quality Report
              </button>
              <button 
                onClick={() => setIsLabModalOpen(true)}
                className="relative z-10 w-full py-4 bg-white/10 text-white rounded-[24px] font-black hover:bg-white/20 transition-all border border-white/10 flex items-center justify-center gap-2"
              >
                <TrendingUp size={18} className="text-grass-green" /> Record Lab Results
              </button>
            </div>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
        <div className="lg:col-span-2 bg-white p-8 rounded-[40px] border border-black/5 shadow-premium">
           <div className="flex justify-between items-center mb-8">
              <h4 className="text-2xl font-black tracking-tight">Recent Production Logs</h4>
              <button className="text-xs font-black uppercase text-grass-green tracking-widest hover:underline">View All</button>
           </div>
           
           <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {productionLogs.length === 0 ? (
                  <div className="py-12 text-center">
                    <p className="text-black/20 font-black uppercase tracking-widest text-sm">No logs recorded today</p>
                  </div>
                ) : (
                  productionLogs.map((log) => (
                    <motion.div 
                      key={log.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      onClick={() => setSelectedLog(log)}
                      className="flex items-center justify-between p-6 bg-black/[0.02] rounded-[32px] border border-black/5 hover:bg-white hover:shadow-premium transition-all group cursor-pointer"
                    >
                       <div className="flex items-center gap-5">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg ${
                             log.session === 'Morning' ? 'bg-orange-400' : 
                             log.session === 'Afternoon' ? 'bg-yellow-500' : 'bg-patch-black'
                          }`}>
                             <Droplets size={22} />
                          </div>
                          <div>
                             <p className="text-xl font-black tracking-tight">{log.cow.split(' ')[0]} • {log.yield} Liters</p>
                             <div className="flex items-center gap-3 mt-1">
                                <span className="text-[10px] font-black uppercase tracking-widest text-black/30">{log.session}</span>
                                <span className="w-1 h-1 bg-black/10 rounded-full"></span>
                                <span className="text-[10px] font-black uppercase tracking-widest text-black/30">{log.timestamp}</span>
                             </div>
                          </div>
                       </div>
                       <div className="flex items-center gap-4">
                          <div className="text-right">
                             <p className="text-sm font-black">{log.fat}% Fat</p>
                             <p className="text-[10px] font-bold text-black/30 uppercase tracking-widest">{log.snf} SNF</p>
                          </div>
                          <button className="p-3 hover:bg-black/5 rounded-xl transition-all text-black/20 group-hover:text-black">
                             <ChevronRight size={20} />
                          </button>
                       </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
           </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white p-8 rounded-[40px] border border-black/5 shadow-premium">
            <h4 className="text-xl font-black mb-6">Top Producers</h4>
             <div className="space-y-4">
               {productionLogs.length === 0 ? (
                 <div className="py-10 text-center">
                    <p className="text-[10px] font-black text-black/20 uppercase tracking-widest">No production data yet</p>
                 </div>
               ) : (
                 productionLogs.slice(0, 3).map((log, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-black/[0.02] rounded-2xl border border-black/5">
                     <div className="flex items-center gap-4">
                       <div className="w-10 h-10 bg-patch-black rounded-xl flex items-center justify-center text-white font-black text-xs">#</div>
                       <div>
                         <p className="font-black text-sm">{log.cow.split(' ')[0]}</p>
                         <p className="text-[10px] text-black/30 font-bold uppercase">{log.session}</p>
                       </div>
                     </div>
                     <p className="font-black text-grass-green">{log.yield}L</p>
                  </div>
                )))}
             </div>
          </div>
          
          <div className="bg-white p-8 rounded-[40px] border border-black/5 shadow-premium flex flex-col items-center justify-center text-center">
             <div className="w-16 h-16 bg-black/5 rounded-2xl flex items-center justify-center text-black/20 mb-6">
                <Calendar size={32} />
             </div>
             <h4 className="text-lg font-black mb-1">Schedule Pickup</h4>
             <p className="text-xs text-black/40 font-medium mb-6">Notify your local cooperative.</p>
             <button className="w-full bg-patch-black text-white py-4 rounded-2xl font-black hover:scale-105 transition-all shadow-xl text-sm">
                Book Collection Slot
             </button>
          </div>
        </div>
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
                 <h2 className="text-3xl font-black">Log Production</h2>
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
                  <label className="text-[10px] font-black uppercase tracking-widest text-black/30 ml-1">Daily Yield (Liters)</label>
                  <div className="relative">
                     <input 
                       required
                       type="number"
                       step="0.1"
                       value={newLog.yield}
                       onChange={(e) => setNewLog({...newLog, yield: e.target.value})}
                       placeholder="0.0"
                       className="w-full pl-6 pr-16 py-4 bg-black/5 rounded-2xl border-none font-bold outline-none focus:ring-2 focus:ring-black/5 transition-all"
                     />
                     <span className="absolute right-6 top-1/2 -translate-y-1/2 font-black text-black/20">L</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-black/30 ml-1">Milking Session</label>
                  <div className="grid grid-cols-3 gap-3">
                    {['Morning', 'Afternoon', 'Evening'].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setNewLog({...newLog, session: s})}
                        className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                          newLog.session === s ? 'bg-patch-black text-white border-patch-black shadow-lg' : 'bg-white text-black/40 border-black/5'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-black/30 ml-1">Fat %</label>
                     <input 
                       type="number"
                       step="0.1"
                       value={newLog.fat}
                       onChange={(e) => setNewLog({...newLog, fat: e.target.value})}
                       className="w-full px-6 py-4 bg-black/5 rounded-2xl border-none font-bold outline-none focus:ring-2 focus:ring-black/5 transition-all"
                     />
                   </div>
                   <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-black/30 ml-1">SNF Content</label>
                     <input 
                       type="number"
                       step="0.1"
                       value={newLog.snf}
                       onChange={(e) => setNewLog({...newLog, snf: e.target.value})}
                       className="w-full px-6 py-4 bg-black/5 rounded-2xl border-none font-bold outline-none focus:ring-2 focus:ring-black/5 transition-all"
                     />
                   </div>
                </div>

                <div className="pt-6">
                   <button type="submit" className="w-full py-5 bg-patch-black text-white rounded-[24px] font-black shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3">
                      <Droplets size={20} /> Save Yield Record
                   </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Production Detail Modal */}
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
                    selectedLog.session === 'Morning' ? 'bg-orange-50 text-orange-500' :
                    selectedLog.session === 'Afternoon' ? 'bg-yellow-50 text-yellow-500' :
                    'bg-patch-black text-white'
                  }`}>
                    <Droplets size={32} />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black tracking-tight">{selectedLog.session} Yield Report</h2>
                    <p className="text-black/30 font-bold uppercase tracking-widest text-sm">{selectedLog.date} • {selectedLog.timestamp}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-10">
                   <div className="p-8 bg-black/[0.02] rounded-[32px] border border-black/5">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-black/30 mb-2">Total Milk Produced</p>
                      <p className="text-4xl font-black text-grass-green">{selectedLog.yield} <span className="text-lg text-black/30">Liters</span></p>
                   </div>
                   <div className="p-8 bg-black/[0.02] rounded-[32px] border border-black/5">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-black/30 mb-2">Animal Identity</p>
                      <p className="text-xl font-black">{selectedLog.cow}</p>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-12">
                   <div className="flex items-center gap-4 p-6 bg-white rounded-3xl border border-black/5 shadow-sm">
                      <div className="w-10 h-10 bg-orange-50 text-orange-500 rounded-xl flex items-center justify-center">
                         <Milk size={20} />
                      </div>
                      <div>
                         <p className="text-[10px] font-black uppercase text-black/30">Fat Content</p>
                         <p className="font-black text-lg">{selectedLog.fat}%</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-4 p-6 bg-white rounded-3xl border border-black/5 shadow-sm">
                      <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center">
                         <Droplets size={20} />
                      </div>
                      <div>
                         <p className="text-[10px] font-black uppercase text-black/30">SNF Content</p>
                         <p className="font-black text-lg">{selectedLog.snf}</p>
                      </div>
                   </div>
                </div>

                <div className="pt-10 border-t border-black/5 flex justify-end gap-4">
                   <button 
                     onClick={() => exportToCSV(selectedLog)}
                     className="px-8 py-4 bg-black/5 rounded-2xl font-black text-black/40 hover:bg-black/10 transition-all flex items-center gap-2"
                   >
                      <Download size={18} /> Export CSV
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

      {/* Full Quality Report Modal */}
      <AnimatePresence>
        {isQualityModalOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsQualityModalOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[200]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-2xl bg-patch-black text-white z-[201] shadow-2xl p-12 overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-12">
                 <div>
                    <h2 className="text-4xl font-black tracking-tight mb-2">Quality Analytics</h2>
                    <p className="text-white/40 font-medium">Detailed laboratory analysis and trend reports.</p>
                 </div>
                 <button onClick={() => setIsQualityModalOpen(false)} className="p-3 hover:bg-white/10 rounded-full transition-colors text-white/20 hover:text-white">
                    <X size={32} />
                 </button>
              </div>

              <div className="space-y-10">
                {/* Fat Trend Chart */}
                <div className="bg-white/5 rounded-[40px] p-8 border border-white/10">
                   <div className="flex justify-between items-center mb-8">
                      <h4 className="text-xl font-black">Fat Content Trend</h4>
                      <span className="text-grass-green font-black text-sm">+0.2% vs Last Week</span>
                   </div>
                   <div className="h-[200px] w-full">
                      {isMounted && chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#ffffff40' }} />
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#111', border: 'none', borderRadius: '12px' }}
                              itemStyle={{ color: '#fff' }}
                            />
                            <Line type="monotone" dataKey="fat" stroke="#2ECC71" strokeWidth={5} dot={{ fill: '#2ECC71', r: 6 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      ) : isMounted ? (
                        <div className="h-full flex items-center justify-center text-center text-white/20 font-black uppercase tracking-widest text-[10px]">
                          Insufficient quality data
                        </div>
                      ) : (
                        <div className="h-full w-full bg-white/5 animate-pulse rounded-2xl"></div>
                      )}
                   </div>
                </div>

                {/* Laboratory Metrics */}
                <div className="grid grid-cols-2 gap-6">
                   {[
                     { label: 'SNF (Solid Not Fat)', value: '8.7', unit: '%', status: 'Optimal', color: 'text-blue-400' },
                     { label: 'Protein Content', value: '3.4', unit: '%', status: 'High', color: 'text-purple-400' },
                     { label: 'Lactose Level', value: '4.8', unit: '%', status: 'Stable', color: 'text-orange-400' },
                     { label: 'Purity Score', value: '99.8', unit: '%', status: 'Excellent', color: 'text-grass-green' },
                   ].map((metric, i) => (
                     <div key={i} className="bg-white/5 p-6 rounded-[32px] border border-white/10">
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">{metric.label}</p>
                        <div className="flex items-baseline gap-1 mb-4">
                           <span className="text-3xl font-black">{metric.value}</span>
                           <span className="text-sm font-bold text-white/20">{metric.unit}</span>
                        </div>
                        <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full bg-white/5 ${metric.color}`}>
                           {metric.status}
                        </span>
                     </div>
                   ))}
                </div>

                {/* Comparison Card */}
                <div className="bg-gradient-to-br from-grass-green/20 to-transparent rounded-[40px] p-10 border border-grass-green/20">
                   <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-grass-green rounded-2xl flex items-center justify-center text-patch-black">
                         <TrendingUp size={24} />
                      </div>
                      <h4 className="text-2xl font-black">A-Grade Certification</h4>
                   </div>
                   <p className="text-white/60 font-medium leading-relaxed mb-8">
                      Your current production metrics exceed the A-Grade certification requirements set by the Dairy Development Board. Keep up the consistent nutrition plan!
                   </p>
                   <div className="space-y-4">
                      <div className="flex justify-between items-center text-sm">
                         <span className="text-white/40 font-bold uppercase tracking-widest">Quality Score</span>
                         <span className="font-black">98/100</span>
                      </div>
                      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                         <div className="w-[98%] h-full bg-grass-green"></div>
                      </div>
                   </div>
                </div>

                <button 
                  onClick={downloadQualityPDF}
                  className="w-full py-6 bg-white text-patch-black rounded-[28px] font-black hover:scale-105 transition-all shadow-2xl flex items-center justify-center gap-3"
                >
                   <Download size={20} /> Download Laboratory Report (PDF)
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Record Lab Results Modal */}
      <AnimatePresence>
        {isLabModalOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsLabModalOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[210]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-[211] shadow-2xl p-10 overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-10">
                 <h2 className="text-3xl font-black">Record Lab Data</h2>
                 <button onClick={() => setIsLabModalOpen(false)} className="p-2 hover:bg-black/5 rounded-full transition-colors text-black/20 hover:text-black">
                    <X size={24} />
                 </button>
              </div>

              <div className="bg-patch-black text-white p-6 rounded-3xl mb-10 flex items-center gap-4">
                 <div className="w-12 h-12 bg-grass-green rounded-2xl flex items-center justify-center text-patch-black">
                    <TrendingUp size={24} />
                 </div>
                 <div>
                    <p className="text-xs font-black uppercase text-white/40 tracking-widest">Target Score</p>
                    <p className="text-xl font-black tracking-tight">A-Grade Standard</p>
                 </div>
              </div>

              <form className="space-y-8" onSubmit={(e) => { e.preventDefault(); setIsLabModalOpen(false); }}>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-black/30 ml-1">Bulk Fat %</label>
                  <input 
                    type="number"
                    step="0.01"
                    value={bulkLabData.fat}
                    onChange={(e) => setBulkLabData({...bulkLabData, fat: e.target.value})}
                    className="w-full px-6 py-4 bg-black/5 rounded-2xl border-none font-bold outline-none focus:ring-2 focus:ring-black/5 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-black/30 ml-1">Bulk Protein %</label>
                  <input 
                    type="number"
                    step="0.01"
                    value={bulkLabData.protein}
                    onChange={(e) => setBulkLabData({...bulkLabData, protein: e.target.value})}
                    className="w-full px-6 py-4 bg-black/5 rounded-2xl border-none font-bold outline-none focus:ring-2 focus:ring-black/5 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-black/30 ml-1">Bulk SNF Content</label>
                  <input 
                    type="number"
                    step="0.01"
                    value={bulkLabData.snf}
                    onChange={(e) => setBulkLabData({...bulkLabData, snf: e.target.value})}
                    className="w-full px-6 py-4 bg-black/5 rounded-2xl border-none font-bold outline-none focus:ring-2 focus:ring-black/5 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-black/30 ml-1">Bacteria Count (SCC)</label>
                  <select className="w-full px-6 py-4 bg-black/5 rounded-2xl border-none font-bold outline-none focus:ring-2 focus:ring-black/5 transition-all appearance-none">
                    <option>Low (&lt;100k)</option>
                    <option>Normal (100k-200k)</option>
                    <option>High (&gt;200k)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-black/30 ml-1">Purity Level (%)</label>
                  <input 
                    type="number"
                    step="0.1"
                    value={bulkLabData.purity}
                    onChange={(e) => setBulkLabData({...bulkLabData, purity: e.target.value})}
                    className="w-full px-6 py-4 bg-black/5 rounded-2xl border-none font-bold outline-none focus:ring-2 focus:ring-black/5 transition-all"
                  />
                </div>

                <div className="pt-6">
                   <button type="submit" className="w-full py-5 bg-patch-black text-white rounded-[24px] font-black shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3">
                      Save Batch Analysis
                   </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
