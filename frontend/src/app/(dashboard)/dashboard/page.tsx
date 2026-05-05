"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Milk, Activity, TrendingUp, DollarSign, Bell, Clock, Calendar, X, HeartPulse, Zap, Info, QrCode } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useCattleStore, Alert, AlertType } from '@/store/cattleStore';
import { useRouter } from 'next/navigation';
import { QRScannerModal } from '@/components/QRScannerModal';

export default function OverviewPage() {
  const router = useRouter();
  const { productionLogs, cattle, alerts, markAlertRead, removeAlert } = useCattleStore();
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannedCow, setScannedCow] = useState<any>(null);

  const totalYield = productionLogs.reduce((acc, log) => acc + parseFloat(log.yield || '0'), 0);
  const revenue = totalYield * 45; // Assuming ₹45 per Liter

  const stats = [
    { label: 'Total Milk', value: `${totalYield.toFixed(0)}L`, icon: Milk, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Total Animals', value: cattle.length.toString(), icon: Activity, color: 'text-grass-green', bg: 'bg-green-50' },
    { label: 'Monthly Growth', value: '0%', icon: TrendingUp, color: 'text-orange-500', bg: 'bg-orange-50' },
    { label: 'Estimated Revenue', value: `₹${revenue.toLocaleString()}`, icon: DollarSign, color: 'text-purple-500', bg: 'bg-purple-50' },
  ];

  const getTypeStyles = (type: AlertType) => {
    switch (type) {
      case 'health': return { icon: HeartPulse, color: 'text-red-500', bg: 'bg-red-50' };
      case 'breeding': return { icon: Zap, color: 'text-orange-500', bg: 'bg-orange-50' };
      case 'reminder': return { icon: Bell, color: 'text-blue-500', bg: 'bg-blue-50' };
      case 'warning': return { icon: Info, color: 'text-orange-600', bg: 'bg-orange-50' };
      default: return { icon: Info, color: 'text-gray-500', bg: 'bg-gray-50' };
    }
  };

  const handleOpenAlert = (alert: Alert) => {
    setSelectedAlert(alert);
    if (!alert.isRead) {
      markAlertRead(alert.id);
    }
  };

  const chartData = React.useMemo(() => {
    const grouped = productionLogs.slice(0, 7).reduce((acc: any, log) => {
      const date = log.date;
      if (!acc[date]) acc[date] = 0;
      acc[date] += parseFloat(log.yield || '0');
      return acc;
    }, {});

    return Object.entries(grouped).map(([name, liters]) => ({ name, liters }));
  }, [productionLogs]);

  const handleScan = (data: string) => {
    try {
      const parsed = JSON.parse(data);
      if (parsed.id) {
        const cow = cattle.find(c => c.id === parsed.id);
        if (cow) {
          setScannedCow(cow);
          setIsScannerOpen(false);
        }
      }
    } catch (e) {
      // Not a JSON QR
      const cow = cattle.find(c => c.tag === data || c.name.toLowerCase() === data.toLowerCase());
      if (cow) {
        setScannedCow(cow);
        setIsScannerOpen(false);
      }
    }
  };

  return (
    <div className="space-y-10 relative">
      {/* Action Bar */}
      <div className="flex justify-between items-center bg-patch-black p-4 rounded-[32px] shadow-2xl">
         <div className="flex items-center gap-4 pl-4">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
               <Activity size={20} className="text-grass-green" />
            </div>
            <div>
               <p className="text-white text-sm font-black">Digital Passport Active</p>
               <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Real-time herd tracking enabled</p>
            </div>
         </div>
         <button 
           onClick={() => setIsScannerOpen(true)}
           className="bg-white text-patch-black px-8 py-4 rounded-2xl font-black flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-xl"
         >
            <QrCode size={20} /> Scan Animal Tag
         </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-8 bg-white rounded-[24px] border border-black/5 shadow-sm"
          >
            <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center ${stat.color} mb-6`}>
              <stat.icon size={24} />
            </div>
            <p className="text-black/40 font-bold text-sm uppercase tracking-wider mb-1">{stat.label}</p>
            <h3 className="text-3xl font-extrabold">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      {/* Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-[32px] border border-black/5 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold">Milk Production Trend</h3>
            <select className="bg-black/5 px-4 py-2 rounded-xl text-sm font-bold outline-none border-none">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#bbb', fontSize: 12, fontWeight: 600 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#bbb', fontSize: 12, fontWeight: 600 }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                    itemStyle={{ fontWeight: 700 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="liters" 
                    stroke="#2D5A27" 
                    strokeWidth={4} 
                    dot={{ r: 6, fill: '#2D5A27', strokeWidth: 0 }} 
                    activeDot={{ r: 8, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-black/20 font-bold uppercase tracking-widest text-sm bg-black/[0.02] rounded-3xl border border-dashed border-black/10">
                No production data recorded
              </div>
            )}
          </div>
        </div>

        {/* Recent Alerts */}
        <div className="bg-white p-8 rounded-[32px] border border-black/5 shadow-sm flex flex-col h-full">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold">Recent Alerts</h3>
            {alerts.filter(a => !a.isRead).length > 0 && (
              <span className="px-3 py-1 bg-red-500 text-white text-[10px] font-black rounded-full animate-pulse">
                {alerts.filter(a => !a.isRead).length} NEW
              </span>
            )}
          </div>
          
          {alerts.length > 0 ? (
            <div className="space-y-6 flex-1 overflow-y-auto pr-2 max-h-[350px] scrollbar-hide">
              {alerts.slice(0, 5).map((alert, i) => (
                <div 
                  key={alert.id} 
                  onClick={() => handleOpenAlert(alert)}
                  className="flex gap-4 group cursor-pointer hover:bg-black/[0.02] p-2 -m-2 rounded-xl transition-all"
                >
                  <div className={`w-1.5 h-12 rounded-full shrink-0 ${
                    alert.type === 'warning' ? 'bg-orange-500' : 
                    alert.type === 'health' ? 'bg-red-500' : 
                    'bg-grass-green'
                  }`}></div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-0.5">
                      <h4 className={`font-bold text-sm ${alert.isRead ? 'text-black/40' : 'text-black'}`}>{alert.title}</h4>
                      <span className="text-[10px] text-black/20 font-black uppercase whitespace-nowrap ml-2">{alert.time}</span>
                    </div>
                    <p className={`text-xs line-clamp-1 ${alert.isRead ? 'text-black/20' : 'text-black/40'} font-medium`}>{alert.message}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-10">
               <div className="w-16 h-16 bg-black/5 rounded-full flex items-center justify-center mb-6 text-black/10">
                  <Bell size={32} />
               </div>
               <p className="text-black/20 font-bold uppercase tracking-widest text-xs">No active alerts</p>
            </div>
          )}
          
          <button 
            onClick={() => router.push('/dashboard/alerts')}
            className="w-full mt-6 py-4 rounded-2xl bg-black/5 text-sm font-bold hover:bg-black/10 transition-all shrink-0"
          >
            View All Notifications
          </button>
        </div>
      </div>

      {/* QR Scanner Modal */}
      <QRScannerModal 
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScan={handleScan}
      />

      {/* Scanned Animal Detail Modal */}
      <AnimatePresence>
        {scannedCow && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setScannedCow(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-[400]"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-0 m-auto w-full max-w-2xl h-fit bg-white z-[401] rounded-[48px] shadow-2xl overflow-hidden p-12"
            >
               <div className="flex justify-between items-center mb-10">
                  <div className="flex items-center gap-6">
                     <div className="w-20 h-20 bg-patch-black rounded-[28px] flex items-center justify-center text-white text-2xl font-black shadow-lg">
                        {scannedCow.tag.slice(-4)}
                     </div>
                     <div>
                        <h2 className="text-3xl font-black">{scannedCow.name}</h2>
                        <p className="text-black/30 font-bold uppercase tracking-widest">Tag ID: {scannedCow.tag}</p>
                     </div>
                  </div>
                  <button onClick={() => setScannedCow(null)} className="p-3 hover:bg-black/5 rounded-full transition-colors text-black/20 hover:text-black">
                     <X size={24} />
                  </button>
               </div>

               <div className="grid grid-cols-2 gap-6 mb-10">
                  <div className="p-8 bg-black/[0.02] rounded-[32px] border border-black/5">
                     <p className="text-[10px] font-black uppercase text-black/30 tracking-widest mb-2">Breed / Origin</p>
                     <p className="text-xl font-black">{scannedCow.breed}</p>
                  </div>
                  <div className="p-8 bg-black/[0.02] rounded-[32px] border border-black/5">
                     <p className="text-[10px] font-black uppercase text-black/30 tracking-widest mb-2">Avg Production</p>
                     <p className="text-xl font-black text-grass-green">{scannedCow.production}</p>
                  </div>
               </div>

               <div className="flex flex-col gap-3">
                  <button 
                    onClick={() => {
                        router.push('/dashboard/cattle');
                        setScannedCow(null);
                    }}
                    className="w-full py-5 bg-patch-black text-white rounded-[24px] font-black shadow-xl hover:scale-105 transition-all"
                  >
                     View Complete Digital Passport
                  </button>
                  <button 
                    onClick={() => setScannedCow(null)}
                    className="w-full py-4 text-black/30 font-black hover:text-black transition-all"
                  >
                     Close
                  </button>
               </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Alert Detail Modal */}
      <AnimatePresence>
        {selectedAlert && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedAlert(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-[200]"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-0 m-auto w-full max-w-xl h-fit bg-white z-[201] rounded-[48px] shadow-2xl overflow-hidden"
            >
              <div className="relative p-12 text-left">
                <button 
                  onClick={() => setSelectedAlert(null)}
                  className="absolute top-8 right-8 p-3 hover:bg-black/5 rounded-full transition-colors text-black/20 hover:text-black"
                >
                  <X size={24} />
                </button>

                {(() => {
                  const styles = getTypeStyles(selectedAlert.type);
                  return (
                    <>
                      <div className="flex items-center gap-6 mb-10">
                        <div className={`w-20 h-20 rounded-[28px] ${styles.bg} ${statColor(selectedAlert.type)} flex items-center justify-center shadow-lg`}>
                          <styles.icon size={32} />
                        </div>
                        <div>
                          <h2 className="text-3xl font-black tracking-tight text-black">{selectedAlert.title}</h2>
                          <div className="flex items-center gap-4 mt-1">
                            <span className="flex items-center gap-1.5 text-black/30 font-bold uppercase tracking-widest text-[10px]">
                              <Clock size={12} /> {selectedAlert.time}
                            </span>
                            <span className="flex items-center gap-1.5 text-black/30 font-bold uppercase tracking-widest text-[10px]">
                              <Calendar size={12} /> {selectedAlert.date}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="p-8 bg-black/5 rounded-[32px] mb-10">
                        <p className="text-lg font-medium leading-relaxed text-black/70 italic">
                          "{selectedAlert.message}"
                        </p>
                      </div>

                      <div className="flex justify-end gap-4">
                         <button 
                           onClick={() => {
                             removeAlert(selectedAlert.id);
                             setSelectedAlert(null);
                           }}
                           className="px-8 py-4 bg-red-50 text-red-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-100 transition-all"
                         >
                            Delete
                         </button>
                         <button 
                           onClick={() => setSelectedAlert(null)}
                           className="px-10 py-4 bg-patch-black text-white rounded-2xl font-black shadow-lg hover:scale-105 active:scale-95 transition-all"
                         >
                            Dismiss
                         </button>
                      </div>
                    </>
                  );
                })()}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function statColor(type: AlertType) {
  switch (type) {
    case 'health': return 'text-red-500';
    case 'breeding': return 'text-orange-500';
    case 'reminder': return 'text-blue-500';
    case 'warning': return 'text-orange-600';
    default: return 'text-gray-500';
  }
}


