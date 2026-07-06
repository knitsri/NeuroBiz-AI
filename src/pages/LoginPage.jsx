import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { motion } from 'framer-motion';
import { Brain, Lock, Mail, ArrowRight, ShieldCheck, RefreshCw } from 'lucide-react';
import { signUpUser, loginUser } from '../services/auth';

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Get initial role & type from URL query params
  const initialRole = searchParams.get('role') || 'owner';
  const initialType = searchParams.get('type') || 'pharmacy';

  const [role, setRole] = useState(initialRole);
  const [bizType, setBizType] = useState(initialType);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Auto populate values for demo accounts on switch
  useEffect(() => {
    setError('');
    if (!isRegistering) {
      if (role === 'owner') {
        setEmail(`owner-${bizType}@neurobiz.com`);
        setPassword('password123');
      } else {
        setEmail('vendor@biomedsupplies.com');
        setPassword('password123');
      }
    }
  }, [role, bizType, isRegistering]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    setError('');
    setLoading(true);

    try {
      if (isRegistering) {
        const finalName = name || (role === 'owner' ? 'Nitya Patel' : 'Alex Rivera');
        const finalBizName = businessName || (role === 'owner' 
          ? `NeuroBiz ${bizType.charAt(0).toUpperCase() + bizType.slice(1)}` 
          : 'BioMed Supplies');

        await signUpUser(email, password, role, bizType, finalBizName, finalName);
      } else {
        await loginUser(email, password);
      }

      if (role === 'owner') {
        navigate('/owner/dashboard');
      } else {
        navigate('/vendor/dashboard');
      }
    } catch (err) {
      console.error(err);
      let errMsg = err.message || 'Authentication failed. Please check credentials.';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        errMsg = isRegistering 
          ? 'Failed to register demo account.' 
          : 'Account not found. Please register an account first using the "Create new company" link below.';
      }
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (demoRole) => {
    setError('');
    setLoading(true);

    const demoEmail = demoRole === 'owner' 
      ? `owner-${bizType}@neurobiz.com` 
      : 'vendor@biomedsupplies.com';
    const demoPassword = 'password123';

    try {
      await loginUser(demoEmail, demoPassword);
      if (demoRole === 'owner') {
        navigate('/owner/dashboard');
      } else {
        navigate('/vendor/dashboard');
      }
    } catch (err) {
      console.error(err);
      setError('Demo account not found in your Firebase project. Please click "Create new company" below to register this email first.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px]"></div>

      <div className="max-w-md w-full z-10">
        {/* Header Branding */}
        <div className="flex items-center justify-center gap-3 mb-6 cursor-pointer" onClick={() => navigate('/')}>
          <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-center">
            <Brain className="h-7 w-7 text-indigo-400" />
          </div>
          <span className="font-extrabold text-2xl tracking-wider text-gradient">NEUROBIZ AI</span>
        </div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass rounded-3xl p-8 border border-slate-800 shadow-2xl"
        >
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-slate-200">{isRegistering ? 'Create Demo Account' : 'Welcome Back'}</h2>
            <p className="text-xs text-slate-400 mt-1.5">
              {isRegistering ? 'Sign up to experience the AI co-pilot' : 'Access your Executive Business Terminal'}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-xs font-semibold text-center leading-normal">
              {error}
            </div>
          )}

          {/* Role selector tab in Login */}
          <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-900 border border-slate-800/80 mb-6">
            <button
              type="button"
              onClick={() => { setRole('owner'); setIsRegistering(false); }}
              className={`py-2 text-xs font-semibold rounded-lg transition-all duration-300 cursor-pointer ${role === 'owner' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Business Owner
            </button>
            <button
              type="button"
              onClick={() => { setRole('vendor'); setIsRegistering(false); }}
              className={`py-2 text-xs font-semibold rounded-lg transition-all duration-300 cursor-pointer ${role === 'vendor' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Vendor Partner
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegistering && (
              <>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-xs transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Business Name</label>
                  <input
                    type="text"
                    required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. Metro Pharmacy"
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-xs transition-colors"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@business.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-xs transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Security Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-xs transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white font-bold text-xs transition-all duration-300 shadow-md shadow-indigo-600/10 cursor-pointer disabled:cursor-not-allowed"
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <span>{isRegistering ? 'Register & Initialize' : 'Sign In to Terminal'}</span>
                  <ArrowRight className="h-4.5 w-4.5" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Logins Section */}
          <div className="mt-6 pt-5 border-t border-slate-800/80">
            <div className="text-center mb-3">
              <span className="text-[10px] font-bold text-indigo-400 tracking-widest uppercase flex items-center justify-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5" /> Sandbox Hackathon Quick Access
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('owner')}
                className="py-2.5 px-3 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-[10px] font-bold text-slate-300 cursor-pointer transition-all duration-300"
              >
                Owner Demo (Auto)
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('vendor')}
                className="py-2.5 px-3 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-[10px] font-bold text-slate-300 cursor-pointer transition-all duration-300"
              >
                Vendor Demo (Auto)
              </button>
            </div>
          </div>

          {/* Switch Register/Login */}
          <div className="text-center mt-5">
            <button
              type="button"
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-[10px] font-bold text-slate-500 hover:text-slate-300 uppercase tracking-wider cursor-pointer"
            >
              {isRegistering ? 'Already have an account? Sign In' : 'Create new mock company'}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
