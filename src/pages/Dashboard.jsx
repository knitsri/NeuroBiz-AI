import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';

import {
  Boxes,
  ShoppingCart,
  UserCheck,
  Megaphone,
  Activity,
  AlertTriangle,
  CornerDownLeft,
  Cpu,
  RefreshCcw,
  Sparkles,
  ArrowRight,
  TrendingUp,
  FileCheck2,
  Trash2
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export default function Dashboard() {
  const {
    inventory,
    procurementRequests,
    marketingCampaigns,
    lastScanResults,
    runAiScan,
    getAiChatResponse,
    approveRecommendation,
    businessType
  } = useApp();
  const navigate = useNavigate();

  // Scanning simulation states
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [scanComplete, setScanComplete] = useState(false);

  const scanSteps = [
    'Analyzing Inventory...',
    'Checking Procurement...',
    'Evaluating Vendor Performance...',
    'Detecting Dead Stock...',
    'Reviewing Marketing Opportunities...',
    'Calculating Business Health...',
    'Preparing Final Report...'
  ];

  const handleStartScan = () => {
    setIsScanning(true);
    setScanStep(0);
    setScanComplete(false);
  };

  // Run the multi-step scan animation
  useEffect(() => {
    if (isScanning && scanStep < scanSteps.length) {
      const timer = setTimeout(() => {
        setScanStep(prev => prev + 1);
      }, 600); // 7 steps * 600ms = 4.2 seconds
      return () => clearTimeout(timer);
    } else if (isScanning && scanStep === scanSteps.length) {
      runAiScan();
      setIsScanning(false);
      setScanComplete(true);
    }
  }, [isScanning, scanStep]);



  // Stat Calculations
  const totalItemsCount = inventory.length;
  const pendingRequestsCount = procurementRequests.filter(r => r.status === 'Pending').length;
  const activeVendorsSet = new Set(inventory.map(i => i.vendor).filter(Boolean));
  const activeVendorsCount = activeVendorsSet.size;
  const marketingCampaignsCount = marketingCampaigns.length;

  // Chart data simulation: shows hypothetical weekly Health Scores
  const chartData = [
    { name: 'Mon', score: 62 },
    { name: 'Tue', score: 68 },
    { name: 'Wed', score: 71 },
    { name: 'Thu', score: 75 },
    { name: 'Fri', score: 70 },
    { name: 'Sat', score: 82 },
    { name: 'Sun', score: lastScanResults ? lastScanResults.score : 80 }
  ];

  // Handle recommendation action
  const handleRecAction = (rec) => {
    if (rec.action === 'marketing') {
      navigate('/owner/marketing');
    } else {
      // Create procurement request from this recommendation
      const formattedRec = {
        name: rec.item,
        recommendedStock: rec.recommendedQuantity,
        vendor: rec.vendor
      };
      const success = approveRecommendation(formattedRec);
      if (success) {
        alert(`Procurement Request for ${rec.recommendedQuantity} units of ${rec.item} submitted successfully!`);
        navigate('/owner/procurement');
      } else {
        alert(`A pending request for ${rec.item} already exists.`);
      }
    }
  };

  return (
    <div className="pt-20 pl-72 pr-8 pb-12 min-h-screen text-slate-100 flex flex-col gap-6">
      {/* Top Grid: Operational Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Inventory Items */}
        <div className="glass p-5 rounded-2xl border border-slate-800 flex items-center gap-4 relative overflow-hidden group hover:border-indigo-500/30 transition-all duration-300">
          <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl">
            <Boxes className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Total Inventory Items</p>
            <h3 className="text-2xl font-black text-slate-100 mt-1">{totalItemsCount}</h3>
          </div>
          <div className="absolute right-0 bottom-[-15px] opacity-5 text-indigo-500 font-extrabold text-7xl select-none group-hover:scale-110 transition-transform">
            ITEMS
          </div>
        </div>

        {/* Pending Requests */}
        <div className="glass p-5 rounded-2xl border border-slate-800 flex items-center gap-4 relative overflow-hidden group hover:border-yellow-500/30 transition-all duration-300">
          <div className="p-3 bg-yellow-500/10 text-yellow-400 rounded-xl">
            <ShoppingCart className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Pending Requests</p>
            <h3 className="text-2xl font-black text-slate-100 mt-1">{pendingRequestsCount}</h3>
          </div>
          <div className="absolute right-0 bottom-[-15px] opacity-5 text-yellow-500 font-extrabold text-7xl select-none group-hover:scale-110 transition-transform">
            PROCUR
          </div>
        </div>

        {/* Active Vendors */}
        <div className="glass p-5 rounded-2xl border border-slate-800 flex items-center gap-4 relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-300">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <UserCheck className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Active Vendors</p>
            <h3 className="text-2xl font-black text-slate-100 mt-1">{activeVendorsCount}</h3>
          </div>
          <div className="absolute right-0 bottom-[-15px] opacity-5 text-emerald-500 font-extrabold text-7xl select-none group-hover:scale-110 transition-transform">
            VENDOR
          </div>
        </div>

        {/* Running Campaigns */}
        <div className="glass p-5 rounded-2xl border border-slate-800 flex items-center gap-4 relative overflow-hidden group hover:border-purple-500/30 transition-all duration-300">
          <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl">
            <Megaphone className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Active Marketing</p>
            <h3 className="text-2xl font-black text-slate-100 mt-1">{marketingCampaignsCount}</h3>
          </div>
          <div className="absolute right-0 bottom-[-15px] opacity-5 text-purple-500 font-extrabold text-7xl select-none group-hover:scale-110 transition-transform">
            MARKET
          </div>
        </div>
      </div>

      {/* Main Section layout: 2 columns (AI Health Check & Business Health Trend) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Col: AI Health Scan (Takes 2 columns) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* AI Health Scan Card */}
          <div className="glass rounded-3xl p-6 border border-slate-800 relative overflow-hidden h-[730px] flex flex-col">
            {/* Background design elements */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>

            {/* Scanning Scan line animation */}
            {isScanning && (
              <div className="absolute left-0 right-0 h-0.5 scan-glow z-10 animate-scan-line"></div>
            )}

            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-500/15 border border-indigo-500/30 rounded-xl flex items-center justify-center text-indigo-400">
                  <Activity className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-200">AI Health Scan</h2>
                  <p className="text-xs text-slate-500">Real-time risk assessment, stock health metrics, and automated ordering suggestions.</p>
                </div>
              </div>

              {!isScanning && lastScanResults && (
                <button
                  onClick={handleStartScan}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all duration-300 shadow-lg shadow-indigo-600/20 cursor-pointer group"
                >
                  <Cpu className="h-4 w-4" />
                  <span>Run AI Health Scan</span>
                  <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                </button>
              )}
            </div>

            {/* SCANNING ACTIVE VIEW */}
            {isScanning && (
              <div className="flex-1 flex flex-col items-center justify-center py-6">
                <div className="h-12 w-12 rounded-full border-4 border-slate-800 border-t-indigo-500 animate-spin mb-6"></div>
                <h3 className="text-sm font-bold text-slate-300 mb-2">Analyzing System Health</h3>
                <p className="text-xs text-indigo-400 font-semibold animate-pulse-slow">{scanSteps[scanStep]}</p>
                <div className="w-64 bg-slate-900 h-1.5 rounded-full mt-4 overflow-hidden border border-slate-850">
                  <div
                    className="bg-indigo-500 h-full rounded-full transition-all duration-1000"
                    style={{ width: `${(scanStep / scanSteps.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* STATIC NO RESULTS STATE */}
            {!isScanning && !lastScanResults && !scanComplete && (
              <div className="flex-1 border border-slate-850 bg-slate-900/10 rounded-2xl flex flex-col items-center justify-between text-center relative overflow-hidden py-10 px-8">
                {/* Glow behind */}
                <div className="absolute inset-0 bg-radial-gradient from-indigo-500/5 to-transparent pointer-events-none"></div>

                {/* Big centered SVG neural network */}
                <div className="flex items-center justify-center relative flex-1 min-h-[300px]">
                  <svg viewBox="0 0 400 400" className="w-[300px] h-[300px] md:w-[360px] md:h-[360px] max-h-[300px] md:max-h-[360px] h-auto">
                    <style>{`
                      @keyframes dash {
                        to {
                          stroke-dashoffset: -40;
                        }
                      }
                      .data-line {
                        stroke-dasharray: 6, 6;
                        animation: dash 1.5s linear infinite;
                      }
                      .data-line-reverse {
                        stroke-dasharray: 6, 6;
                        animation: dash 1.5s linear infinite reverse;
                      }
                      .pulse-node {
                        animation: pulse 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                      }
                    `}</style>
                    
                    {/* Connecting lines */}
                    <line x1="200" y1="200" x2="80" y2="80" stroke="rgba(99, 102, 241, 0.4)" strokeWidth="2" className="data-line-reverse" />
                    <line x1="200" y1="200" x2="320" y2="80" stroke="rgba(99, 102, 241, 0.4)" strokeWidth="2" className="data-line" />
                    <line x1="200" y1="200" x2="80" y2="320" stroke="rgba(99, 102, 241, 0.4)" strokeWidth="2" className="data-line" />
                    <line x1="200" y1="200" x2="320" y2="320" stroke="rgba(99, 102, 241, 0.4)" strokeWidth="2" className="data-line-reverse" />
                    
                    {/* Outer Orbit */}
                    <circle cx="200" cy="200" r="169" fill="none" stroke="rgba(99, 102, 241, 0.08)" strokeWidth="1" strokeDasharray="4,4" />

                    {/* Central CPU */}
                    <circle cx="200" cy="200" r="50" fill="rgba(15, 23, 42, 0.9)" stroke="#6366f1" strokeWidth="2" className="pulse-node" />
                    <circle cx="200" cy="200" r="42" fill="none" stroke="rgba(99, 102, 241, 0.3)" strokeWidth="1" strokeDasharray="5,3" />
                    <rect x="185" y="185" width="30" height="30" rx="6" fill="#6366f1" fillOpacity="0.2" stroke="#6366f1" strokeWidth="2" />
                    <circle cx="200" cy="200" r="5" fill="#6366f1" />

                    {/* Node 1: Inventory */}
                    <g transform="translate(80, 80)">
                      <circle cx="0" cy="0" r="28" fill="rgba(15, 23, 42, 0.9)" stroke="#a78bfa" strokeWidth="1.5" />
                      <circle cx="0" cy="0" r="32" fill="none" stroke="rgba(167, 139, 250, 0.2)" strokeWidth="1" className="pulse-node" />
                      <path d="M-8,-8 L8,-8 L8,8 L-8,8 Z M-8,-8 L0,0 L8,-8 M-8,8 L0,0 M8,8 L0,0" stroke="#a78bfa" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    </g>

                    {/* Node 2: Procurement */}
                    <g transform="translate(320, 80)">
                      <circle cx="0" cy="0" r="28" fill="rgba(15, 23, 42, 0.9)" stroke="#f59e0b" strokeWidth="1.5" />
                      <circle cx="0" cy="0" r="32" fill="none" stroke="rgba(245, 158, 11, 0.2)" strokeWidth="1" className="pulse-node" />
                      <path d="M-10,-6 L-6,-6 L-2,4 L8,4 L11,-2 L-4,-2" stroke="#f59e0b" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx="-1" cy="7" r="2" fill="#f59e0b" />
                      <circle cx="7" cy="7" r="2" fill="#f59e0b" />
                    </g>

                    {/* Node 3: Marketing */}
                    <g transform="translate(80, 320)">
                      <circle cx="0" cy="0" r="28" fill="rgba(15, 23, 42, 0.9)" stroke="#ec4899" strokeWidth="1.5" />
                      <circle cx="0" cy="0" r="32" fill="none" stroke="rgba(236, 72, 153, 0.2)" strokeWidth="1" className="pulse-node" />
                      <path d="M-8,-2 L-4,-2 L2,-8 L5,-8 L5,8 L2,8 L-4,2 L-8,2 Z" stroke="#ec4899" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    </g>

                    {/* Node 4: Analytics */}
                    <g transform="translate(320, 320)">
                      <circle cx="0" cy="0" r="28" fill="rgba(15, 23, 42, 0.9)" stroke="#10b981" strokeWidth="1.5" />
                      <circle cx="0" cy="0" r="32" fill="none" stroke="rgba(16, 185, 129, 0.2)" strokeWidth="1" className="pulse-node" />
                      <path d="M-8,6 L-2,-2 L3,2 L9,-6 M-8,8 L10,8" stroke="#10b981" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    </g>
                  </svg>
                </div>

                {/* Capabilities Capsules Row */}
                <div className="flex flex-wrap items-center justify-center gap-2.5 max-w-2xl mt-4">
                  {[
                    { text: 'Inventory Analysis', color: 'border-purple-500/20 text-purple-400' },
                    { text: 'Procurement Intelligence', color: 'border-amber-500/20 text-amber-400' },
                    { text: 'Vendor Performance', color: 'border-emerald-500/20 text-emerald-400' },
                    { text: 'Marketing Analysis', color: 'border-pink-500/20 text-pink-400' },
                    { text: 'Business Health Assessment', color: 'border-blue-500/20 text-blue-400' }
                  ].map((cap, i) => (
                    <span key={i} className={`px-3 py-1.5 rounded-full border text-[10px] font-bold ${cap.color} bg-slate-950/40 backdrop-blur-sm shadow-sm transition-all duration-300 hover:scale-105`}>
                      {cap.text}
                    </span>
                  ))}
                </div>

                {/* Explanatory Message */}
                <div className="max-w-md mt-4">
                  <h3 className="text-base font-extrabold text-slate-100">AI Health Command Center</h3>
                  <p className="text-xs leading-relaxed mt-2 text-slate-400 font-medium">
                    Execute a multi-module diagnostic run to evaluate stock constraints, safety margins, vendor delivery risks, campaign engagements, and overall system solvency.
                  </p>
                </div>

                {/* Big Centered CTA Button */}
                <div className="mt-6">
                  <button
                    onClick={handleStartScan}
                    className="flex items-center gap-2.5 px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-650 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-black transition-all duration-300 shadow-xl shadow-indigo-650/15 hover:shadow-indigo-500/25 cursor-pointer group"
                  >
                    <Cpu className="h-4.5 w-4.5 animate-pulse" />
                    <span>Run AI Health Scan</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>

                {/* Scan Info */}
                <div className="flex items-center gap-6 text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-6 border-t border-slate-850 pt-4 w-full max-w-md justify-center">
                  <span>Est. Speed: <strong className="text-indigo-400">~5 Sec</strong></span>
                  <span className="h-3 w-px bg-slate-850"></span>
                  <span>Last Scan: <strong className="text-slate-350">{lastScanResults ? lastScanResults.timestamp : 'Never'}</strong></span>
                </div>
              </div>
            )}

            {/* SCAN COMPLETED RESULTS */}
            {((!isScanning && lastScanResults) || scanComplete) && lastScanResults && (
              <div className="flex-1 flex flex-col min-h-0 gap-4 mt-2">
                {/* Metrics Bar */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-900/40 border border-slate-850/80 shrink-0">
                  {/* Gauge */}
                  <div className="flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-850 pb-2 md:pb-0 md:pr-4">
                    <div className="relative h-20 w-20 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle
                          cx="40"
                          cy="40"
                          r="32"
                          stroke="rgba(255,255,255,0.03)"
                          strokeWidth="6"
                          fill="transparent"
                        />
                        <circle
                          cx="40"
                          cy="40"
                          r="32"
                          stroke={lastScanResults.score > 80 ? "#10b981" : lastScanResults.score > 60 ? "#f59e0b" : "#ef4444"}
                          strokeWidth="6"
                          fill="transparent"
                          strokeDasharray={2 * Math.PI * 32}
                          strokeDashoffset={2 * Math.PI * 32 * (1 - lastScanResults.score / 100)}
                          className="transition-all duration-1000 ease-out"
                        />
                      </svg>
                      <div className="absolute flex flex-col items-center">
                        <span className="text-lg font-black text-slate-100">{lastScanResults.score}%</span>
                        <span className="text-[7px] font-bold text-slate-500 uppercase tracking-widest leading-none">Health</span>
                      </div>
                    </div>
                  </div>

                  {/* Low Stock Items */}
                  <div className="flex flex-col items-center md:items-start justify-center border-b md:border-b-0 md:border-r border-slate-850 pb-2 md:pb-0 md:px-4">
                    <span className="text-slate-500 font-bold text-[9px] tracking-wider uppercase">Low/Out Stock</span>
                    <span className="text-xl font-black text-slate-200 mt-0.5">{lastScanResults.lowStockCount} Items</span>
                    <span className="text-[9px] font-medium text-slate-400">Requires reorder</span>
                  </div>

                  {/* Dead Stock */}
                  <div className="flex flex-col items-center md:items-start justify-center border-b md:border-b-0 md:border-r border-slate-850 pb-2 md:pb-0 md:px-4">
                    <span className="text-slate-500 font-bold text-[9px] tracking-wider uppercase">Stagnant Stock</span>
                    <span className="text-xs font-bold text-slate-200 mt-1 truncate w-full max-w-[120px]" title={lastScanResults.deadStockItem}>
                      {lastScanResults.deadStockItem}
                    </span>
                    <span className="text-[9px] font-medium text-purple-400">Promo suggested</span>
                  </div>

                  {/* Pending Orders */}
                  <div className="flex flex-col items-center md:items-start justify-center md:pl-4">
                    <span className="text-slate-500 font-bold text-[9px] tracking-wider uppercase">Pending Deals</span>
                    <span className="text-xl font-black text-slate-200 mt-0.5">{lastScanResults.pendingRequests} Active</span>
                    <span className="text-[9px] font-medium text-slate-400">Awaiting Vendor accepts</span>
                  </div>
                </div>

                {/* AI Recommendations List */}
                <div className="flex-1 flex flex-col min-h-0">
                  <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2 shrink-0 flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4" /> AI Tactical Recommendations
                  </h3>

                  <div className="flex-1 overflow-y-auto pr-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-2">
                      {lastScanResults.recommendations.map((rec) => (
                        <div
                          key={rec.id}
                          className="p-4 rounded-xl bg-slate-900/60 border border-slate-850 hover:border-slate-800 transition-colors flex flex-col justify-between gap-4"
                        >
                          <div>
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${rec.type === 'Low Stock'
                                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                  : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                                }`}>
                                {rec.type}
                              </span>
                              <span className="text-xs font-bold text-slate-300">{rec.item}</span>
                            </div>
                            <p className="text-xs text-slate-400 leading-relaxed font-medium">{rec.message}</p>

                            {rec.type === 'Low Stock' && (
                              <div className="mt-2.5 flex items-center gap-4 text-[10px] font-bold text-slate-500">
                                <span>Current: <strong className="text-slate-400">{rec.currentStock} Units</strong></span>
                                <span>Recommended: <strong className="text-indigo-400">+{rec.recommendedQuantity} Units</strong></span>
                              </div>
                            )}
                          </div>

                          <button
                            onClick={() => handleRecAction(rec)}
                            className="w-full py-2.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/20 text-[10px] font-bold transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            {rec.type === 'Low Stock' ? (
                              <>
                                <span>Submit Reorder Proposal</span>
                                <ShoppingCart className="h-3 w-3" />
                              </>
                            ) : (
                              <>
                                <span>Go to Marketing Center</span>
                                <Megaphone className="h-3 w-3" />
                              </>
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Score Trend chart */}
        <div className="lg:col-span-1 glass rounded-3xl p-6 border border-slate-800 flex flex-col justify-between h-[730px]">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4.5 w-4.5 text-indigo-400" />
              <h2 className="text-base font-bold text-slate-200">Business Health Trend</h2>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed font-medium mb-4">
              Historical view of weekly health metrics calculated by NeuroBiz AI. Shows the effectiveness of your restock frequency.
            </p>
          </div>

          <div className="flex-1 min-h-[360px] my-6 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#64748b" fontSize={9} tickLine={false} axisLine={false} />
                <YAxis domain={[0, 100]} stroke="#64748b" fontSize={9} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#1e293b',
                    borderRadius: '8px',
                    fontSize: '11px',
                    color: '#f8fafc'
                  }}
                />
                <Area type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorScore)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 p-3 rounded-xl bg-slate-900/40 border border-slate-850 flex items-center justify-between text-[10px] font-bold text-slate-400">
            <span>Peak Health: <strong className="text-emerald-400">82%</strong></span>
            <span>Target Health: <strong className="text-indigo-400">90%</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}
