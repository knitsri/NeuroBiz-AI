import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  FileText, 
  Check, 
  X, 
  Clock, 
  CheckCircle2, 
  XCircle,
  Inbox,
  Sparkles
} from 'lucide-react';

export default function VendorRequests() {
  const { procurementRequests, handleVendorAction } = useApp();
  const [actionAlert, setActionAlert] = useState('');

  const pendingRequests = procurementRequests.filter(r => r.status === 'Pending');

  const handleAction = (requestId, item, action) => {
    handleVendorAction(requestId, action);
    setActionAlert(`Order for ${item} has been ${action === 'accept' ? 'Approved & Shipped' : 'Rejected'}.`);
    setTimeout(() => setActionAlert(''), 3000);
  };

  return (
    <div className="pt-20 pl-72 pr-8 pb-12 min-h-screen text-slate-100 flex flex-col gap-6">
      
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-200">Procurement Requests</h2>
        <p className="text-xs text-slate-500">Process incoming restock contracts requested by SME owners.</p>
      </div>

      {/* Real-time Alert */}
      {actionAlert && (
        <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold animate-in fade-in duration-300">
          {actionAlert}
        </div>
      )}

      {/* Section 1: Inbound Pending Requests */}
      <div>
        <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
          <Clock className="h-4 w-4" /> Inbound Requests Awaiting Review
        </h3>

        {pendingRequests.length === 0 ? (
          <div className="glass rounded-2xl p-12 border border-slate-805 flex flex-col items-center justify-center text-center">
            <Inbox className="h-12 w-12 text-slate-700 mb-3" />
            <p className="text-sm font-bold text-slate-400">Zero pending orders.</p>
            <p className="text-xs text-slate-500 max-w-sm mt-1">Excellent! All incoming procurement orders have been cleared and shipped.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingRequests.map((req) => (
              <div 
                key={req.id}
                className="glass rounded-2xl p-5 border border-slate-800 flex flex-col justify-between gap-4 relative overflow-hidden group hover:border-yellow-500/30 transition-all duration-300"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono text-slate-500 uppercase">{req.id.toUpperCase()}</span>
                    <span className="px-2 py-0.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-[9px] font-black uppercase text-yellow-400 flex items-center gap-1">
                      <Clock className="h-2.5 w-2.5 animate-pulse" /> Pending Process
                    </span>
                  </div>

                  <h4 className="text-sm font-extrabold text-slate-200 mt-1">{req.item}</h4>
                  <p className="text-xs text-slate-400 mt-1">Requested Qty: <strong className="text-slate-200">{req.quantity} Units</strong></p>
                  
                  <div className="mt-4 p-3 rounded-xl bg-slate-900/60 border border-slate-850 text-xs font-semibold text-slate-450">
                    <span className="text-[10px] text-slate-500 block uppercase tracking-wider mb-0.5">Purchasing SME Client</span>
                    <strong className="text-indigo-400">{req.businessName}</strong>
                    <span className="block text-[10px] text-slate-500 mt-1">Requested on: {req.date}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-2">
                  <button
                    onClick={() => handleAction(req.id, req.item, 'reject')}
                    className="py-2.5 rounded-xl border border-rose-500/20 hover:bg-rose-500/10 text-rose-455 font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1"
                  >
                    <X className="h-4 w-4" />
                    <span>Reject Contract</span>
                  </button>
                  <button
                    onClick={() => handleAction(req.id, req.item, 'accept')}
                    className="py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1 shadow-md shadow-emerald-600/10"
                  >
                    <Check className="h-4 w-4" />
                    <span>Approve & Ship</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Operations Logs have been moved to the Dashboard Contracts section according to lifecycle rules. */}
    </div>
  );
}
