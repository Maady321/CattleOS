'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  RefreshCcw, 
  History,
  CheckCircle2,
  XCircle,
  Search,
  RotateCcw
} from 'lucide-react';

// Mock data for the dashboard
const mockStats = {
  healthScore: 98.4,
  openAnomalies: 3,
  lastCheck: '2 hours ago',
  totalProcessed: '1.2M records',
  dailyChecks: 24
};

const mockAnomalies = [
  { id: 1, type: 'OUTLIER', severity: 'HIGH', domain: 'Milk Logs', description: 'Cow #402 reported 450L in single session', date: '2026-05-06 14:20' },
  { id: 2, type: 'INCONSISTENCY', severity: 'MEDIUM', domain: 'Breeding', description: 'Calving event without previous pregnancy check', date: '2026-05-06 10:15' },
  { id: 3, type: 'DUPLICATE', severity: 'LOW', domain: 'Feed Logs', description: 'Identical grain entries for Herd B within 2ms', date: '2026-05-05 18:30' },
];

export default function IntegrityDashboard() {
  const [loading, setLoading] = useState(false);

  const runReconciliation = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">
            Data Integrity & Reconciliation
          </h1>
          <p className="text-slate-400 mt-1">Real-time correctness monitoring and audit provenance.</p>
        </div>
        <button 
          onClick={runReconciliation}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-800 text-white rounded-xl transition-all shadow-lg shadow-emerald-500/20 group"
        >
          <RefreshCcw className={`w-5 h-5 ${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
          {loading ? 'Reconciling...' : 'Run Global Reconciliation'}
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="System Health Score" 
          value={`${mockStats.healthScore}%`} 
          icon={<ShieldCheck className="w-8 h-8 text-emerald-400" />}
          trend="+0.2% from yesterday"
          color="emerald"
        />
        <StatCard 
          title="Open Anomalies" 
          value={mockStats.openAnomalies} 
          icon={<AlertTriangle className="w-8 h-8 text-amber-400" />}
          trend="Action required"
          color="amber"
        />
        <StatCard 
          title="Last Sync Status" 
          value="Synchronized" 
          icon={<CheckCircle2 className="w-8 h-8 text-cyan-400" />}
          trend={mockStats.lastCheck}
          color="cyan"
        />
        <StatCard 
          title="Records Verified" 
          value={mockStats.totalProcessed} 
          icon={<History className="w-8 h-8 text-purple-400" />}
          trend="Deterministic Audit Trail"
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Anomalies List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900/50 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-amber-400" />
                Detected Anomalies
              </h2>
              <span className="px-3 py-1 bg-amber-500/10 text-amber-400 text-xs font-bold rounded-full border border-amber-500/20">
                {mockAnomalies.length} NEW
              </span>
            </div>
            <div className="divide-y divide-white/5">
              {mockAnomalies.map((anomaly) => (
                <div key={anomaly.id} className="p-6 hover:bg-white/5 transition-colors group">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-4">
                      <div className={`mt-1 w-2 h-2 rounded-full ${anomaly.severity === 'HIGH' ? 'bg-red-500 animate-pulse' : 'bg-amber-500'}`} />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-300 uppercase tracking-wider">{anomaly.type}</span>
                          <span className="text-xs text-slate-500">• {anomaly.domain}</span>
                        </div>
                        <p className="text-slate-100 font-medium mt-1">{anomaly.description}</p>
                        <p className="text-xs text-slate-500 mt-2">{anomaly.date}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 text-xs font-bold rounded-lg border border-emerald-500/20 hover:bg-emerald-500/20">
                        Repair
                      </button>
                      <button className="px-3 py-1.5 bg-white/5 text-slate-400 text-xs font-bold rounded-lg border border-white/10 hover:bg-white/10">
                        Ignore
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Audit Log / Sidebar */}
        <div className="space-y-6">
          <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <History className="w-6 h-6 text-purple-400" />
              Audit Stream
            </h2>
            <div className="space-y-6">
              <AuditItem 
                action="SYSTEM_CHECK" 
                detail="Reconciliation completed for 1,240 records" 
                time="2h ago" 
                status="success" 
              />
              <AuditItem 
                action="MANUAL_REPAIR" 
                detail="Financial record #891 corrected by Admin" 
                time="5h ago" 
                status="success" 
              />
              <AuditItem 
                action="DUP_DETECT" 
                detail="3 duplicates auto-merged in Feed Logs" 
                time="1d ago" 
                status="warning" 
              />
              <AuditItem 
                action="AUTH_ADMIN" 
                detail="Integrity settings modified by Principal Eng" 
                time="2d ago" 
                status="success" 
              />
            </div>
            <button className="w-full mt-8 py-3 text-sm font-medium text-slate-400 hover:text-white border border-white/5 hover:border-white/10 rounded-xl transition-all">
              View Full Audit Trail
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, trend, color }: any) {
  return (
    <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6 backdrop-blur-xl hover:border-white/20 transition-all group">
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 rounded-xl bg-white/5 group-hover:scale-110 transition-transform duration-500">
          {icon}
        </div>
      </div>
      <h3 className="text-slate-400 text-sm font-medium">{title}</h3>
      <div className="text-3xl font-bold mt-1 text-white">{value}</div>
      <div className={`text-xs mt-2 font-medium ${color === 'emerald' ? 'text-emerald-400' : color === 'amber' ? 'text-amber-400' : 'text-slate-500'}`}>
        {trend}
      </div>
    </div>
  );
}

function AuditItem({ action, detail, time, status }: any) {
  return (
    <div className="flex gap-4 relative">
      <div className="mt-1.5 shrink-0">
        <div className={`w-2 h-2 rounded-full ${status === 'success' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-amber-500'}`} />
      </div>
      <div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{action}</span>
          <span className="text-[10px] text-slate-600 tracking-wider">• {time}</span>
        </div>
        <p className="text-xs text-slate-300 mt-1 leading-relaxed">{detail}</p>
      </div>
    </div>
  );
}
