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
  ClipboardList,
  Building2,
  ChevronRight,
  PackageOpen,
  RefreshCw,
  Mail,
  Award,
  ShieldCheck
} from 'lucide-react';

export default function Procurement() {
  const { businessType, procurementRequests, approveRecommendation, vendorsList, inventory, addSupplier } = useApp();
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [orderQuantities, setOrderQuantities] = useState({});
  const [orderLoading, setOrderLoading] = useState({});

  // Modal registration states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [supName, setSupName] = useState('');
  const [supCategory, setSupCategory] = useState('');
  const [supEmail, setSupEmail] = useState('');
  const [supPhone, setSupPhone] = useState('');
  const [supProducts, setSupProducts] = useState('');

  const recommendations = inventory
    .filter(item => item.stock <= item.minimumStock)
    .map(item => ({
      id: `rec-${item.id}`,
      name: item.name,
      currentStock: item.stock,
      recommendedStock: Math.max(25, (item.minimumStock * 4) - item.stock),
      vendor: item.vendor || 'A-1 Logistics'
    }))
    .filter(rec =>
      !procurementRequests.some(r => r.item === rec.name && (r.status === 'Pending' || r.status === 'Accepted' || r.status === 'Fulfilled & Shipped'))
    );

  // Filter vendors list to remove duplicate entries by name
  const uniqueVendors = [];
  const vendorNamesSeen = new Set();
  for (const v of vendorsList) {
    if (!v.name) continue;
    const norm = v.name.trim().toLowerCase();
    if (!vendorNamesSeen.has(norm)) {
      vendorNamesSeen.add(norm);
      uniqueVendors.push(v);
    }
  }

  const handleAddSupplier = async (e) => {
    e.preventDefault();
    if (!supName || !supCategory || !supEmail) return;
    try {
      await addSupplier({
        name: supName,
        category: supCategory,
        email: supEmail,
        phone: supPhone,
        products: supProducts
      });
      setSuccessMessage(`Supplier "${supName}" has been successfully registered.`);
      setTimeout(() => setSuccessMessage(''), 4000);
      setSupName('');
      setSupCategory('');
      setSupEmail('');
      setSupPhone('');
      setSupProducts('');
      setIsAddModalOpen(false);
    } catch (err) {
      console.error(err);
      setSuccessMessage(`Failed to add supplier: ${err.message}`);
      setTimeout(() => setSuccessMessage(''), 4000);
    }
  };

  const handleApprove = async (rec) => {
    const success = await approveRecommendation(rec);
    if (success) {
      setSuccessMessage(`Procurement Request for ${rec.recommendedStock} units of ${rec.name} was successfully sent to ${rec.vendor}!`);
      setTimeout(() => setSuccessMessage(''), 4000);
    } else {
      setSuccessMessage(`A pending request for ${rec.name} is already active. Awaiting vendor response.`);
      setTimeout(() => setSuccessMessage(''), 4000);
    }
  };

  const getProductsForVendor = (vendor) => {
    if (!vendor) return [];
    const invItems = inventory.filter(item => item.vendor === vendor.name);
    const offeredNames = [];
    if (vendor.products) {
      if (Array.isArray(vendor.products)) {
        offeredNames.push(...vendor.products);
      } else if (typeof vendor.products === 'string') {
        offeredNames.push(...vendor.products.split(',').map(p => p.trim()).filter(Boolean));
      }
    }
    const combined = [...invItems];
    offeredNames.forEach(name => {
      const exists = combined.some(item => item.name.toLowerCase() === name.toLowerCase());
      if (!exists) {
        combined.push({
          id: `offered-${name.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
          name: name,
          category: vendor.category || 'Supplies',
          stock: 0,
          minimumStock: 10,
          vendor: vendor.name,
          status: 'Out of Stock'
        });
      }
    });
    return combined;
  };

  const handlePlaceOrder = async (product, vendorName) => {
    const qty = Number(orderQuantities[product.name] || 25);
    if (qty <= 0) return;

    setOrderLoading(prev => ({ ...prev, [product.name]: true }));
    try {
      const success = await approveRecommendation({
        name: product.name,
        recommendedStock: qty,
        vendor: vendorName
      });

      if (success) {
        setSuccessMessage(`Custom Procurement Order for ${qty} units of ${product.name} was successfully placed with ${vendorName}!`);
        setTimeout(() => setSuccessMessage(''), 4050);
      } else {
        setSuccessMessage(`Failed to place order. A pending request is already active.`);
        setTimeout(() => setSuccessMessage(''), 4050);
      }
    } catch (err) {
      console.error(err);
      setSuccessMessage(`Error placing order: ${err.message}`);
      setTimeout(() => setSuccessMessage(''), 4050);
    } finally {
      setOrderLoading(prev => ({ ...prev, [product.name]: false }));
    }
  };

  const pastOwnerRequests = procurementRequests;

  return (
    <div className="pt-20 pl-72 pr-8 pb-12 min-h-screen text-slate-100 flex flex-col gap-6">

      {/* Page Title */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-200">Procurement Center</h2>
        <p className="text-xs text-slate-505">Approve AI-suggested resting stocks and track contract lifecycles with supplier networks.</p>
      </div>

      {/* Real-time Alert */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold animate-in fade-in duration-300">
          {successMessage}
        </div>
      )}

      {/* Section 1: Supplier Directory */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-1.5 mb-0">
            <Building2 className="h-4 w-4" /> Supplier Directory
          </h3>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-8 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[13px] font-bold transition-all cursor-pointer flex items-center gap-1 shadow-md shadow-indigo-600/10"
          >
            <span>+ Add Supplier</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Vendors List Column */}
          <div className="lg:col-span-1 flex flex-col gap-3">
            <div className="glass rounded-2xl p-4 border border-slate-800 flex flex-col gap-2 max-h-[400px] overflow-y-auto">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Select a Supplier</span>
              {uniqueVendors.length === 0 ? (
                <p className="text-xs text-slate-505 italic p-4 text-center">No suppliers found.</p>
              ) : (
                uniqueVendors.map((vendor) => {
                  const vendorProducts = getProductsForVendor(vendor);
                  const isSelected = selectedVendor?.id === vendor.id;
                  const categories = Array.from(new Set(vendorProducts.map(p => p.category)));

                  return (
                    <button
                      key={vendor.id}
                      onClick={() => setSelectedVendor(vendor)}
                      className={`w-full text-left p-3.5 rounded-xl border transition-all duration-300 flex items-center justify-between cursor-pointer group ${isSelected
                        ? 'bg-gradient-to-r from-indigo-500/10 to-indigo-500/5 border-indigo-500 text-indigo-300'
                        : 'bg-slate-900/40 border-slate-850 hover:border-slate-700 text-slate-400 hover:text-slate-200'
                        }`}
                    >
                      <div className="flex-1 min-w-0 pr-2">
                        <div className="flex items-center gap-2">
                          <span className={`font-bold text-xs truncate ${isSelected ? 'text-indigo-300' : 'text-slate-200 group-hover:text-white'}`}>
                            {vendor.name}
                          </span>
                        </div>
                        {categories.length > 0 && (
                          <span className="text-[9px] text-slate-500 truncate block mt-1">
                            Offers: {categories.join(', ')}
                          </span>
                        )}
                        <span className="text-[8px] font-semibold text-indigo-400 uppercase tracking-wider block mt-1.5">
                          {vendorProducts.length} {vendorProducts.length === 1 ? 'Product' : 'Products'} Available
                        </span>
                      </div>
                      <ChevronRight className={`h-4 w-4 shrink-0 transition-transform duration-300 ${isSelected ? 'text-indigo-400 translate-x-0.5' : 'text-slate-600 group-hover:text-slate-400'}`} />
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Selected Vendor Products Column */}
          <div className="lg:col-span-2">
            {selectedVendor ? (
              <div className="glass rounded-2xl p-5 border border-slate-800 flex flex-col gap-4 min-h-[300px]">
                <div className="flex items-center justify-between border-b border-slate-850 pb-3">
                  <div>
                    <h4 className="text-sm font-bold text-slate-250">{selectedVendor.name}</h4>
                    <p className="text-[10px] text-indigo-400 font-semibold tracking-wider uppercase mt-0.5">Offered Product Catalog</p>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-lg bg-indigo-500/10 border border-indigo-500/25 text-[9px] font-bold text-indigo-400">
                    Direct Restock channel
                  </span>
                </div>

                {/* Supplier Profile Info Block */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-900/60 border border-slate-850 text-xs text-slate-450">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400 shrink-0">
                      <Mail className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[9px] uppercase tracking-wider text-slate-500 block font-bold">Contact Email</span>
                      <span className="text-slate-300 font-medium truncate block">
                        {selectedVendor.email || `${selectedVendor.name.toLowerCase().replace(/[^a-z0-9]/g, '')}@supplier.com`}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400 shrink-0">
                      <Award className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[9px] uppercase tracking-wider text-slate-500 block font-bold">Performance</span>
                      <span className="text-amber-400 font-bold block truncate">
                        {selectedVendor.performanceScore || '96% (Excellent)'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 shrink-0">
                      <ShieldCheck className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[9px] uppercase tracking-wider text-slate-500 block font-bold">Trust Verification</span>
                      <span className="text-emerald-400 font-bold block truncate">
                        Verified Supplier
                      </span>
                    </div>
                  </div>
                </div>

                {getProductsForVendor(selectedVendor).length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <PackageOpen className="h-9 w-9 text-slate-700 mb-2" />
                    <p className="text-xs font-bold text-slate-450">No products linked to this vendor.</p>
                    <p className="text-[9px] text-slate-550 max-w-[250px] mt-1">
                      Associate this vendor name in your inventory items or list them as offered products to show them in this catalog.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-850/60 max-h-[350px] overflow-y-auto pr-1 flex flex-col">
                    {getProductsForVendor(selectedVendor).map((product) => {
                      const hasPending = procurementRequests.some(r => r.item === product.name && r.status === 'Pending');
                      const currentQty = orderQuantities[product.name] ?? 25;
                      const isLoading = orderLoading[product.name] ?? false;

                      return (
                        <div key={product.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 first:pt-0 last:pb-0">
                          <div>
                            <span className="text-xs font-bold text-slate-200">{product.name}</span>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-800 text-[9px] text-slate-400">
                                {product.category}
                              </span>
                              <span className="text-[10px] text-slate-500">
                                Stock: <strong className={product.stock <= product.minimumStock ? 'text-rose-400' : 'text-slate-300'}>{product.stock} units</strong>
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold">Qty:</span>
                              <input
                                type="number"
                                min="1"
                                max="1000"
                                value={currentQty}
                                onChange={(e) => setOrderQuantities(prev => ({
                                  ...prev,
                                  [product.name]: e.target.value
                                }))}
                                className="w-16 px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-850 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 text-center font-bold"
                              />
                            </div>

                            <button
                              onClick={() => handlePlaceOrder(product, selectedVendor.name)}
                              disabled={hasPending || isLoading || currentQty <= 0}
                              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 flex items-center gap-1.5 cursor-pointer shadow-md ${hasPending
                                ? 'bg-slate-900 border border-slate-800 text-slate-500 cursor-not-allowed shadow-none'
                                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/10'
                                }`}
                            >
                              {isLoading ? (
                                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <ShoppingCart className="h-3.5 w-3.5" />
                              )}
                              <span>{hasPending ? 'Pending' : 'Place Order'}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div className="glass rounded-2xl p-5 border border-slate-800 flex flex-col items-center justify-center text-center min-h-[300px] h-full text-slate-500">
                <Building2 className="h-10 w-10 text-slate-800 mb-3" />
                <p className="text-sm font-bold text-slate-450">No Supplier Selected</p>
                <p className="text-xs text-slate-505 max-w-sm mt-1">Select a vendor from the list on the left to browse their catalog and order directly.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Section 2: AI Procurement Recommendations */}
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
                  className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer shadow-md ${hasPending
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

      {/* Section 3: Procurement Requests History */}
      <div>
        <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
          <ClipboardList className="h-4 w-4" /> Active Contract Tracking
        </h3>

        <div className="glass rounded-2xl border border-slate-805 overflow-hidden">
          {pastOwnerRequests.length === 0 ? (
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
                  {pastOwnerRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-900/30 transition-colors">
                      <td className="py-4 px-6 font-mono text-[10px] text-slate-500">{req.id.toUpperCase()}</td>
                      <td className="py-4 px-6 font-bold text-slate-200">{req.item}</td>
                      <td className="py-4 px-6">{req.quantity} Units</td>
                      <td className="py-4 px-6 text-slate-400">{req.vendor}</td>
                      <td className="py-4 px-6 text-slate-500">{req.date}</td>
                      <td className="py-4 px-6">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider border flex items-center gap-1 w-fit ${req.status === 'Approved' || req.status === 'Accepted' || req.status === 'Fulfilled & Shipped'
                          ? 'bg-emerald-500/10 text-emerald-450 border-emerald-500/20'
                          : req.status === 'Rejected'
                            ? 'bg-rose-500/10 text-rose-455 border-rose-500/20'
                            : 'bg-yellow-500/10 text-yellow-455 border-yellow-500/20'
                          }`}>
                          {(req.status === 'Approved' || req.status === 'Accepted' || req.status === 'Fulfilled & Shipped') && <CheckCircle2 className="h-3 w-3" />}
                          {req.status === 'Rejected' && <XCircle className="h-3 w-3" />}
                          {req.status === 'Pending' && <Clock className="h-3 w-3 animate-pulse" />}
                          <span>
                            {req.status === 'Accepted' ? 'Accepted' :
                              req.status === 'Approved' || req.status === 'Fulfilled & Shipped' ? 'Fulfilled & Shipped' :
                                req.status}
                          </span>
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

      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 flex flex-col gap-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-850 pb-3">
              <span className="font-bold text-sm text-slate-200">Register New Supplier</span>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-500 hover:text-slate-355 cursor-pointer font-bold text-lg">×</button>
            </div>

            <form onSubmit={handleAddSupplier} className="space-y-4">
              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Supplier Name</label>
                <input
                  type="text"
                  required
                  value={supName}
                  onChange={(e) => setSupName(e.target.value)}
                  placeholder="e.g. Acme Supplies Corp"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-955 border border-slate-850 text-slate-200 focus:outline-none focus:border-indigo-500 text-xs transition-colors"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Business Category</label>
                <input
                  type="text"
                  required
                  value={supCategory}
                  onChange={(e) => setSupCategory(e.target.value)}
                  placeholder="e.g. Food & Beverage, Pharmaceuticals"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-955 border border-slate-850 text-slate-200 focus:outline-none focus:border-indigo-500 text-xs transition-colors"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Contact Email</label>
                <input
                  type="email"
                  required
                  value={supEmail}
                  onChange={(e) => setSupEmail(e.target.value)}
                  placeholder="e.g. orders@acme.com"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-955 border border-slate-850 text-slate-200 focus:outline-none focus:border-indigo-500 text-xs transition-colors"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Phone Number (Optional)</label>
                <input
                  type="text"
                  value={supPhone}
                  onChange={(e) => setSupPhone(e.target.value)}
                  placeholder="e.g. +1 555-0199"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-955 border border-slate-850 text-slate-200 focus:outline-none focus:border-indigo-500 text-xs transition-colors"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Products Offered (comma-separated)</label>
                <input
                  type="text"
                  value={supProducts}
                  onChange={(e) => setSupProducts(e.target.value)}
                  placeholder="e.g. Premium Rice, Fresh Tomatoes, Organic Garlic"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-955 border border-slate-850 text-slate-200 focus:outline-none focus:border-indigo-500 text-xs transition-colors"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-800 hover:bg-slate-800/40 text-slate-400 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors cursor-pointer shadow-md shadow-indigo-600/10"
                >
                  Save Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
