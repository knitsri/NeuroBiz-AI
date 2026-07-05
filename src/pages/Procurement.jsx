import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ShoppingCart, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  TrendingUp, 
  ArrowRight,
  ClipboardList
} from 'lucide-react';

const defaultProcurementRecs = {
  pharmacy: [
    { id: 'pr-p1', name: 'Paracetamol', currentStock: 12, recommendedStock: 150, vendor: 'PharmaDistribute Co.' },
    { id: 'pr-p3', name: 'Ibuprofen', currentStock: 8, recommendedStock: 100, vendor: 'BioMed Supplies' },
    { id: 'pr-p5', name: 'Band-Aids', currentStock: 0, recommendedStock: 200, vendor: 'Apex Pharma' }
  ],
  restaurant: [
    { id: 'pr-r1', name: 'Fresh Salmon', currentStock: 3, recommendedStock: 25, vendor: 'Ocean Fresh Seafood' },
    { id: 'pr-r3', name: 'Tomatoes', currentStock: 5, recommendedStock: 50, vendor: 'GreenGrow Organics' },
    { id: 'pr-r5', name: 'Premium Rice', currentStock: 1, recommendedStock: 40, vendor: 'Metro Food Services' }
  ],
  clothing: [
    { id: 'pr-c1', name: 'Denim Jackets', currentStock: 4, recommendedStock: 30, vendor: 'TexStyle Apparel' },
    { id: 'pr-c3', name: 'Summer Dresses', currentStock: 2, recommendedStock: 50, vendor: 'Urban Wear Wholesalers' },
    { id: 'pr-c5', name: 'Woolen Sweaters', currentStock: 0, recommendedStock: 40, vendor: 'TexStyle Apparel' }
  ]
};

export default function Procurement() {
  const { businessType, procurementRequests, approveRecommendation } = useApp();
  const [successMessage, setSuccessMessage] = useState('');

  const recommendations = defaultProcurementRecs[businessType] || [];

  const handleApprove = (rec) => {
    const success = approveRecommendation(rec);
    if (success) {
      setSuccessMessage(`Procurement Request for ${rec.recommendedStock} units of ${rec.name} was successfully sent to ${rec.vendor}!`);
      setTimeout(() => setSuccessMessage(''), 4000);
    } else {
      setSuccessMessage(`A pending request for ${rec.name} is already active. Awaiting vendor response.`);
      setTimeout(() => setSuccessMessage(''), 4000);
    }
  };

  return (
    <div className="pt-20 pl-72 pr-8 pb-12 min-h-screen text-slate-100 flex flex-col gap-6">
      
      {/* Page Title */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-200">Procurement Center</h2>
        <p className="text-xs text-slate-500">Approve AI-suggested resting stocks and track contract lifecycles with supplier networks.</p>
      </div>

      {/* Real-time Alert */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold animate-in fade-in duration-300">
          {successMessage}
        </div>
      )}

      {/* Section 1: AI Procurement Recommendations */}
      <div>
        <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
          <Sparkles className="h-4 w-4" /> AI Predictive Reorder Advice
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recommendations.map((rec) => {
            const hasPending = procurementRequests.some(r => r.item === rec.name && r.status === 'Pending');
            return (
              <div 
                key={rec.id}
                className="glass rounded-2xl p-5 border border-slate-800 flex flex-col justify-between gap-5 relative overflow-hidden group hover:border-indigo-500/30 transition-all duration-300"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-200">{rec.name}</span>
                    <span className="px-2 py-0.5 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-[9px] font-bold text-indigo-400">
                      High Priority
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Stock availability has dropped below threshold safety margins. Restock of <strong className="text-indigo-400">{rec.recommendedStock} units</strong> from <strong className="text-slate-350">{rec.vendor}</strong> is advised.
                  </p>

                  <div className="mt-4 flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-850 text-xs font-bold text-slate-500">
                    <div>
                      <p className="text-[9px] uppercase tracking-wider text-slate-500 mb-0.5">Current Stock</p>
                      <span className="text-slate-300">{rec.currentStock} Units</span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-700" />
                    <div>
                      <p className="text-[9px] uppercase tracking-wider text-slate-500 mb-0.5">Reorder Qty</p>
                      <span className="text-indigo-400">+{rec.recommendedStock} Units</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleApprove(rec)}
                  disabled={hasPending}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer shadow-md ${
                    hasPending
                      ? 'bg-slate-900 border border-slate-800 text-slate-500 cursor-not-allowed shadow-none'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/10'
                  }`}
                >
                  <ShoppingCart className="h-4 w-4" />
                  <span>{hasPending ? 'Pending Vendor Accept' : 'Approve Procurement'}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 2: Procurement Requests History */}
      <div>
        <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
          <ClipboardList className="h-4 w-4" /> Active Contract Tracking
        </h3>

        <div className="glass rounded-2xl border border-slate-805 overflow-hidden">
          {procurementRequests.length === 0 ? (
            <div className="py-16 flex flex-col items-center justify-center text-center">
              <Clock className="h-10 w-10 text-slate-700 mb-3" />
              <p className="text-sm font-bold text-slate-450">No active procurement history.</p>
              <p className="text-xs text-slate-500 mt-1">Approve one of the AI reorders above to initiate a contract draft with vendor suppliers.</p>
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-850 bg-slate-900/40 text-[10px] font-extrabold text-slate-450 uppercase tracking-wider">
                    <th className="py-4 px-6">Order ID</th>
                    <th className="py-4 px-6">Item Requested</th>
                    <th className="py-4 px-6">Quantity</th>
                    <th className="py-4 px-6">Target Supplier</th>
                    <th className="py-4 px-6">Submission Date</th>
                    <th className="py-4 px-6">Deal Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850/60 text-xs font-semibold text-slate-350">
                  {procurementRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-900/30 transition-colors">
                      <td className="py-4 px-6 font-mono text-[10px] text-slate-500">{req.id.toUpperCase()}</td>
                      <td className="py-4 px-6 font-bold text-slate-200">{req.item}</td>
                      <td className="py-4 px-6">{req.quantity} Units</td>
                      <td className="py-4 px-6 text-slate-400">{req.vendor}</td>
                      <td className="py-4 px-6 text-slate-500">{req.date}</td>
                      <td className="py-4 px-6">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider border flex items-center gap-1 w-fit ${
                          req.status === 'Approved'
                            ? 'bg-emerald-500/10 text-emerald-450 border-emerald-500/20'
                            : req.status === 'Rejected'
                            ? 'bg-rose-500/10 text-rose-450 border-rose-500/20'
                            : 'bg-yellow-500/10 text-yellow-450 border-yellow-500/20'
                        }`}>
                          {req.status === 'Approved' && <CheckCircle2 className="h-3 w-3" />}
                          {req.status === 'Rejected' && <XCircle className="h-3 w-3" />}
                          {req.status === 'Pending' && <Clock className="h-3 w-3 animate-pulse" />}
                          <span>{req.status}</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
