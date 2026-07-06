import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { motion } from 'framer-motion';
import { Brain, Lock, Mail, ArrowRight, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { signUpUser, loginUser } from '../services/auth';

const defaultDemoAccounts = {
  // Owners
  'owner-pharmacy@neurobiz.com': { name: 'Nitya Patel', businessName: 'NeuroBiz Pharmacy', role: 'owner', type: 'pharmacy' },
  'owner-restaurant@neurobiz.com': { name: 'Nitya Patel', businessName: 'NeuroBiz Restaurant', role: 'owner', type: 'restaurant' },
  'owner-clothing@neurobiz.com': { name: 'Nitya Patel', businessName: 'NeuroBiz Clothing', role: 'owner', type: 'clothing' },

  // Pharmacy Vendors
  'vendor@biomedsupplies.com': { name: 'Alex Rivera', businessName: 'BioMed Supplies', role: 'vendor', type: 'pharmacy' },
  'vendor@pharmadistribute.com': { name: 'John Pharma', businessName: 'PharmaDistribute Co.', role: 'vendor', type: 'pharmacy' },
  'vendor@apexpharma.com': { name: 'Apex Agent', businessName: 'Apex Pharma', role: 'vendor', type: 'pharmacy' },

  // Restaurant Vendors
  'vendor@metrofoodservices.com': { name: 'Metro Agent', businessName: 'Metro Food Services', role: 'vendor', type: 'restaurant' },
  'vendor@oceanfresh.com': { name: 'Ocean Agent', businessName: 'Ocean Fresh Seafood', role: 'vendor', type: 'restaurant' },
  'vendor@greengrow.com': { name: 'Grower Agent', businessName: 'GreenGrow Organics', role: 'vendor', type: 'restaurant' },

  // Clothing Vendors
  'vendor@texstyleapparel.com': { name: 'Style Agent', businessName: 'TexStyle Apparel', role: 'vendor', type: 'clothing' },
  'vendor@urbanwear.com': { name: 'Urban Agent', businessName: 'Urban Wear Wholesalers', role: 'vendor', type: 'clothing' },
  'vendor@eliteaccessories.com': { name: 'Elite Agent', businessName: 'Elite Accessories', role: 'vendor', type: 'clothing' }
};

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
  const [showDemoHelper, setShowDemoHelper] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
      let finalRole = role;
      if (isRegistering) {
        const finalName = name || (role === 'owner' ? 'Nitya Patel' : 'Alex Rivera');
        const finalBizName = businessName || (role === 'owner' 
          ? `NeuroBiz ${bizType.charAt(0).toUpperCase() + bizType.slice(1)}` 
          : 'BioMed Supplies');

        await signUpUser(email, password, role, bizType, finalBizName, finalName);
      } else {
        let profile;
        try {
          profile = await loginUser(email, password);
        } catch (err) {
          // If the demo user doesn't exist yet, automatically create it!
          const demoAccount = defaultDemoAccounts[email.toLowerCase()];
          if (demoAccount && password === 'password123') {
            profile = await signUpUser(
              email, 
              password, 
              demoAccount.role, 
              demoAccount.type, 
              demoAccount.businessName, 
              demoAccount.name
            );
          } else {
            throw err;
          }
        }
        if (profile && profile.role) {
          finalRole = profile.role;
        }
      }

      if (finalRole === 'owner') {
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
            <h2 className="text-2xl font-extrabold text-slate-200 tracking-tight">
              {isRegistering ? 'Register Page' : 'Login Page'}
            </h2>
            <div className="h-0.5 w-12 bg-indigo-500 mx-auto my-3 rounded-full"></div>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-xs font-semibold text-center leading-normal">
              {error}
            </div>
          )}

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
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-xs transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 h-5 w-5 text-slate-550 hover:text-slate-350 cursor-pointer flex items-center justify-center animate-in fade-in"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
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

          {/* Switch Register/Login */}
          <div className="text-center mt-6 pt-4 border-t border-slate-800/80">
            <button
              type="button"
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-[10px] font-bold text-slate-500 hover:text-slate-300 uppercase tracking-wider cursor-pointer"
            >
              {isRegistering ? 'Already have an account? Sign In' : 'Sign In'}
            </button>
          </div>

          {/* Quick Demo Credentials Panel */}
          <div className="mt-6 bg-slate-900/40 border border-slate-800/60 rounded-2xl p-4 text-xs">
            <button 
              type="button" 
              onClick={() => setShowDemoHelper(!showDemoHelper)}
              className="flex items-center justify-between w-full text-slate-400 font-bold hover:text-slate-200 transition-colors cursor-pointer"
            >
              <span>Demo accounts helper</span>
              <span className="text-[9px] bg-slate-800 px-2 py-0.5 rounded text-slate-400">
                {showDemoHelper ? 'Hide' : 'Show'}
              </span>
            </button>

            {showDemoHelper && (
              <div className="mt-3.5 space-y-4 animate-in fade-in duration-200 text-[11px] text-left">
                <div className="border-t border-slate-800/80 pt-3">
                  <h5 className="font-bold text-indigo-400 text-[9px] uppercase tracking-wider mb-2">Pharmacy Network</h5>
                  <div className="space-y-1.5 text-slate-400">
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-0.5">
                      <span className="text-slate-500">Owner:</span>
                      <code className="text-slate-300 select-all">owner-pharmacy@neurobiz.com</code>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-0.5">
                      <span className="text-slate-500">BioMed:</span>
                      <code className="text-slate-300 select-all">vendor@biomedsupplies.com</code>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-0.5">
                      <span className="text-slate-500">PharmaDistribute:</span>
                      <code className="text-slate-300 select-all">vendor@pharmadistribute.com</code>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-0.5">
                      <span className="text-slate-500">Apex Pharma:</span>
                      <code className="text-slate-300 select-all">vendor@apexpharma.com</code>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-800/80 pt-3">
                  <h5 className="font-bold text-indigo-400 text-[9px] uppercase tracking-wider mb-2">Restaurant Network</h5>
                  <div className="space-y-1.5 text-slate-400">
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-0.5">
                      <span className="text-slate-500">Owner:</span>
                      <code className="text-slate-300 select-all">owner-restaurant@neurobiz.com</code>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-0.5">
                      <span className="text-slate-500">Metro Food:</span>
                      <code className="text-slate-300 select-all">vendor@metrofoodservices.com</code>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-0.5">
                      <span className="text-slate-500">Ocean Fresh:</span>
                      <code className="text-slate-300 select-all">vendor@oceanfresh.com</code>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-0.5">
                      <span className="text-slate-500">GreenGrow:</span>
                      <code className="text-slate-300 select-all">vendor@greengrow.com</code>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-800/80 pt-3">
                  <h5 className="font-bold text-indigo-400 text-[9px] uppercase tracking-wider mb-2">Clothing Network</h5>
                  <div className="space-y-1.5 text-slate-400">
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-0.5">
                      <span className="text-slate-500">Owner:</span>
                      <code className="text-slate-300 select-all">owner-clothing@neurobiz.com</code>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-0.5">
                      <span className="text-slate-500">TexStyle Apparel:</span>
                      <code className="text-slate-300 select-all">vendor@texstyleapparel.com</code>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-0.5">
                      <span className="text-slate-500">Urban Wear:</span>
                      <code className="text-slate-300 select-all">vendor@urbanwear.com</code>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-0.5">
                      <span className="text-slate-500">Elite Accessories:</span>
                      <code className="text-slate-300 select-all">vendor@eliteaccessories.com</code>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-800/80 pt-3 text-[10px] text-emerald-400 font-semibold text-center uppercase tracking-wider">
                  Password: <code className="text-slate-200 select-all lowercase font-bold">password123</code>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
