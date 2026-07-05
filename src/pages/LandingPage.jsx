import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Briefcase, 
  Truck, 
  Stethoscope, 
  ChefHat, 
  Shirt, 
  ArrowRight 
} from 'lucide-react';

export default function LandingPage() {
  const { initializeBusiness } = useApp();
  const navigate = useNavigate();
  
  const [selectedRole, setSelectedRole] = useState(null); // 'owner' | 'vendor'
  const [selectedBizType, setSelectedBizType] = useState(null); // 'pharmacy' | 'restaurant' | 'clothing'

  const handleNext = () => {
    if (!selectedRole) return;

    if (selectedRole === 'vendor') {
      // Vendor initialization (doesn't need a specific biz type, defaults to pharmacy vendors or general)
      initializeBusiness('pharmacy', 'vendor', 'Alex Rivera', 'vendor@pharma-distribute.com', 'BioMed Supplies');
      navigate('/vendor/dashboard');
    } else {
      if (!selectedBizType) return;
      
      // Redirect to login page carrying the selections, or direct login for speed
      navigate(`/login?role=owner&type=${selectedBizType}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px]"></div>

      {/* Container */}
      <div className="max-w-4xl w-full z-10 text-center flex flex-col items-center">
        {/* Logo and Tagline */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3.5 bg-indigo-500/10 border border-indigo-500/25 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/5">
              <Brain className="h-9 w-9 text-indigo-400" />
            </div>
            <h1 className="text-4xl font-extrabold tracking-wider text-gradient">NEUROBIZ AI</h1>
          </div>
          <p className="text-xl text-slate-400 font-semibold italic">"The Brain Behind Your Business."</p>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-2.5">
            An advanced AI-driven management ecosystem for inventory, automated procurement, and predictive social marketing.
          </p>
        </motion.div>

        {/* Content Box */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full max-w-2xl glass rounded-3xl p-8 border border-slate-800 shadow-2xl relative"
        >
          <h2 className="text-xl font-bold text-slate-200 mb-6">Who are you?</h2>
          
          {/* Roles Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {/* Owner Role Card */}
            <button
              onClick={() => {
                setSelectedRole('owner');
                setSelectedBizType(null); // Reset biz selection
              }}
              className={`flex flex-col items-center justify-center p-6 rounded-2xl border text-center transition-all duration-300 cursor-pointer group ${
                selectedRole === 'owner'
                  ? 'bg-gradient-to-b from-indigo-500/10 to-indigo-500/5 border-indigo-500 text-indigo-300 shadow-lg shadow-indigo-500/10'
                  : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className={`p-4 rounded-xl mb-4 border transition-colors ${
                selectedRole === 'owner' 
                  ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300' 
                  : 'bg-slate-950 border-slate-800 text-slate-500 group-hover:text-slate-400'
              }`}>
                <Briefcase className="h-8 w-8" />
              </div>
              <h3 className="font-bold text-base mb-1">Business Owner</h3>
              <p className="text-xs text-slate-500 max-w-[200px]">
                Manage inventory, run AI business scans, and request inventory restocking.
              </p>
            </button>

            {/* Vendor Role Card */}
            <button
              onClick={() => {
                setSelectedRole('vendor');
                setSelectedBizType(null); // Reset biz selection
              }}
              className={`flex flex-col items-center justify-center p-6 rounded-2xl border text-center transition-all duration-300 cursor-pointer group ${
                selectedRole === 'vendor'
                  ? 'bg-gradient-to-b from-indigo-500/10 to-indigo-500/5 border-indigo-500 text-indigo-300 shadow-lg shadow-indigo-500/10'
                  : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className={`p-4 rounded-xl mb-4 border transition-colors ${
                selectedRole === 'vendor' 
                  ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300' 
                  : 'bg-slate-950 border-slate-800 text-slate-500 group-hover:text-slate-400'
              }`}>
                <Truck className="h-8 w-8" />
              </div>
              <h3 className="font-bold text-base mb-1">Vendor Partner</h3>
              <p className="text-xs text-slate-500 max-w-[200px]">
                Review incoming procurement contracts, accept orders, and ship stock.
              </p>
            </button>
          </div>

          {/* Business Type Selector (Owner only) */}
          <AnimatePresence>
            {selectedRole === 'owner' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden border-t border-slate-850 pt-6"
              >
                <h3 className="text-sm font-bold text-slate-400 mb-4 uppercase tracking-wider">Select Business Model</h3>
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {/* Pharmacy */}
                  <button
                    onClick={() => setSelectedBizType('pharmacy')}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border text-xs font-semibold transition-all duration-300 cursor-pointer ${
                      selectedBizType === 'pharmacy'
                        ? 'bg-indigo-500/10 border-indigo-500 text-indigo-300'
                        : 'bg-slate-900/40 border-slate-850 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <Stethoscope className="h-5 w-5" />
                    <span>Pharmacy</span>
                  </button>

                  {/* Restaurant */}
                  <button
                    onClick={() => setSelectedBizType('restaurant')}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border text-xs font-semibold transition-all duration-300 cursor-pointer ${
                      selectedBizType === 'restaurant'
                        ? 'bg-indigo-500/10 border-indigo-500 text-indigo-300'
                        : 'bg-slate-900/40 border-slate-850 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <ChefHat className="h-5 w-5" />
                    <span>Restaurant</span>
                  </button>

                  {/* Clothing Store */}
                  <button
                    onClick={() => setSelectedBizType('clothing')}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border text-xs font-semibold transition-all duration-300 cursor-pointer ${
                      selectedBizType === 'clothing'
                        ? 'bg-indigo-500/10 border-indigo-500 text-indigo-300'
                        : 'bg-slate-900/40 border-slate-850 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <Shirt className="h-5 w-5" />
                    <span>Clothing</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Button */}
          <button
            onClick={handleNext}
            disabled={!selectedRole || (selectedRole === 'owner' && !selectedBizType)}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 disabled:from-slate-800 disabled:to-slate-800 text-white font-bold text-sm transition-all duration-300 hover:from-indigo-500 hover:to-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-lg shadow-indigo-600/10 hover:shadow-indigo-500/20 group"
          >
            <span>Proceed to Login</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </motion.div>
      </div>
    </div>
  );
}
