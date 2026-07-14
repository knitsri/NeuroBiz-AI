import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  ShoppingCart, 
  CheckCircle2, 
  Users, 
  Package, 
  ArrowRight,
  ShieldCheck,
  Activity,
  FileCheck2,
  TrendingUp,
  Check,
  X
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

export default function VendorDashboard() {
  const { procurementRequests, currentUser, handleVendorAction } = useApp();
  const navigate = useNavigate();
  const [actionAlert, setActionAlert] = useState('');

  const handleAction = async (requestId, item, action) => {
    try {
      await handleVendorAction(requestId, action);
      setActionAlert(`Order for ${item} has been ${action === 'accept' ? 'Accepted' : action === 'complete' ? 'Fulfilled & Shipped' : 'Rejected'}.`);
      setTimeout(() => setActionAlert(''), 4000);
    } catch (err) {
      console.error(err);
      setActionAlert(`Failed to update order: ${err.message}`);
      setTimeout(() => setActionAlert(''), 4000);
    }
  };

  // Metrics
  const pendingRequests = procurementRequests.filter(r => r.status === 'Pending');
  const pendingCount = pendingRequests.length;
  const activeContracts = procurementRequests.filter(r => r.status === 'Accepted');
  const activeCount = activeContracts.length;
  const approvedCount = procurementRequests.filter(r => r.status === 'Completed').length;
  const rejectedCount = procurementRequests.filter(r => r.status === 'Rejected').length;
  const totalRequestsCount = procurementRequests.length;

  // Shared partner statistics
  const partnerSet = new Set(procurementRequests.map(r => r.businessName));
  const activeSMEsCount = Math.max(partnerSet.size, 1); // at least 1 (the owner)

  // Chart data simulation: Shipped units per week
  const shipData = [
    { name: 'Week 1', units: 250 },
    { name: 'Week 2', units: 480 },
    { name: 'Week 3', units: 310 },
    { name: 'Week 4', units: 620 },
    { name: 'Week 5', units: approvedCount * 100 + 400 } // dynamic based on accepted orders
  ];

  return (
    <div className="pt-20 pl-4 md:pl-72 pr-4 md:pr-8 pb-12 min-h-screen text-slate-100 flex flex-col gap-6">
      
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pending Requests */}
        <div className="glass p-5 rounded-2xl border border-slate-800 flex items-center gap-4 relative overflow-hidden group hover:border-yellow-500/30 transition-all duration-300">
          <div className="p-3 bg-yellow-500/10 text-yellow-400 rounded-xl">
            <ShoppingCart className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Pending Orders</p>
            <h3 className="text-2xl font-black text-slate-100 mt-1">{pendingCount}</h3>
          </div>
          <div className="absolute right-0 bottom-[-15px] opacity-5 text-yellow-500 font-extrabold text-7xl select-none group-hover:scale-110 transition-transform">
            ORDERS
          </div>
        </div>

        {/* Fulfilled Requests */}
        <div className="glass p-5 rounded-2xl border border-slate-800 flex items-center gap-4 relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-300">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Completed Deals</p>
            <h3 className="text-2xl font-black text-slate-100 mt-1">{approvedCount}</h3>
          </div>
          <div className="absolute right-0 bottom-[-15px] opacity-5 text-emerald-500 font-extrabold text-7xl select-none group-hover:scale-110 transition-transform">
            SHIPPED
          </div>
        </div>

        {/* Connected clients */}
        <div className="glass p-5 rounded-2xl border border-slate-800 flex items-center gap-4 relative overflow-hidden group hover:border-indigo-500/30 transition-all duration-300">
          <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Active SME Clients</p>
            <h3 className="text-2xl font-black text-slate-100 mt-1">{activeSMEsCount}</h3>
          </div>
          <div className="absolute right-0 bottom-[-15px] opacity-5 text-indigo-500 font-extrabold text-7xl select-none group-hover:scale-110 transition-transform">
            CLIENTS
          </div>
        </div>

        {/* Rejected Orders */}
        <div className="glass p-5 rounded-2xl border border-slate-800 flex items-center gap-4 relative overflow-hidden group hover:border-rose-500/30 transition-all duration-300">
          <div className="p-3 bg-rose-500/10 text-rose-450 rounded-xl">
            <Package className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Rejected Drafts</p>
            <h3 className="text-2xl font-black text-slate-100 mt-1">{rejectedCount}</h3>
          </div>
          <div className="absolute right-0 bottom-[-15px] opacity-5 text-rose-500 font-extrabold text-7xl select-none group-hover:scale-110 transition-transform">
            REJECTS
          </div>
        </div>
      </div>

      {/* Main Grid content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: Active Contracts */}
        <div className="lg:col-span-2 glass rounded-3xl p-6 border border-slate-800 flex flex-col justify-between min-h-[350px]">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-slate-850 pb-3">
              <div className="flex items-center gap-2">
                <Activity className="h-4.5 w-4.5 text-emerald-400 animate-pulse" />
                <h2 className="text-sm font-bold text-slate-200">Active Contracts</h2>
              </div>
              
              <button
                onClick={() => navigate('/vendor/requests')}
                className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 uppercase tracking-widest cursor-pointer flex items-center gap-1"
              >
                <span>Process Board</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>

            {/* Real-time Alert inside Active Contracts */}
            {actionAlert && (
              <div className="mb-4 p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold animate-in fade-in duration-305 flex items-center justify-between">
                <span>{actionAlert}</span>
                <button onClick={() => setActionAlert('')} className="text-slate-500 hover:text-slate-350 cursor-pointer font-bold text-xs pl-2">×</button>
              </div>
            )}

            {activeCount === 0 ? (
              <div className="py-16 text-center flex flex-col items-center justify-center">
                <FileCheck2 className="h-10 w-10 text-slate-700 mb-2" />
                <p className="text-xs font-bold text-slate-400">No active contracts.</p>
                <p className="text-[10px] text-slate-500 mt-1">Contracts will appear here once you accept orders on the requests board.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activeContracts.slice(0, 5).map((req) => (
                  <div 
                    key={req.id}
                    className="p-4 rounded-xl bg-slate-900/60 border border-slate-850 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-200">{req.item}</span>
                        <span className="px-2 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[8px] font-black uppercase text-emerald-400">
                          {req.quantity} Units
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1">Requested by: <strong className="text-slate-450">{req.businessName}</strong></p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleAction(req.id, req.item, 'complete')}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold transition-colors cursor-pointer flex items-center gap-1 shadow-md shadow-emerald-600/10"
                      >
                        <Check className="h-3.5 w-3.5" />
                        <span>Mark as Shipped</span>
                      </button>
                    </div>
                  </div>
                ))}
                {activeCount > 5 && (
                  <p className="text-[10px] text-slate-500 text-center font-bold">And {activeCount - 5} more active contracts...</p>
                )}
              </div>
            )}
          </div>
          
          <div className="pt-4 border-t border-slate-850 text-[10px] font-bold text-slate-500 flex items-center gap-1.5 uppercase">
            <ShieldCheck className="h-4 w-4 text-emerald-400 animate-pulse" /> Channel secure. Sync state operational.
          </div>
        </div>

        {/* Right Col: Logistics charts */}
        <div className="lg:col-span-1 glass rounded-3xl p-6 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4.5 w-4.5 text-indigo-400" />
              <h2 className="text-base font-bold text-slate-200">Logistics Volume</h2>
            </div>
            <p className="text-[11px] text-slate-505 leading-relaxed font-semibold mb-4">
              Historical shipping loads showing the aggregate volume of fulfilled orders delivered to SME networks.
            </p>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={shipData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={9} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={9} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0f172a', 
                    borderColor: '#1e293b', 
                    borderRadius: '8px',
                    fontSize: '11px',
                    color: '#f8fafc' 
                  }} 
                />
                <Bar dataKey="units" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 p-3 rounded-xl bg-slate-900/40 border border-slate-850 flex items-center justify-between text-[10px] font-bold text-slate-400">
            <span>Peak Deliver: <strong className="text-emerald-400">620 Units</strong></span>
            <span>Active SMEs: <strong className="text-indigo-400">{activeSMEsCount}</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}
