import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import AIAssistantPanel from './components/AIAssistantPanel';
import AvatarModal from './components/AvatarModal';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Procurement from './pages/Procurement';
import Marketing from './pages/Marketing';
import Profile from './pages/Profile';
import VendorDashboard from './pages/VendorDashboard';
import VendorRequests from './pages/VendorRequests';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

// Route Guards for Authenticated Navigation
const OwnerRoute = ({ children }) => {
  const { currentUser, activeRole } = useApp();
  if (!currentUser) return <Navigate to="/" replace />;
  if (activeRole !== 'owner') return <Navigate to="/vendor/dashboard" replace />;
  return children;
};

const VendorRoute = ({ children }) => {
  const { currentUser, activeRole } = useApp();
  if (!currentUser) return <Navigate to="/" replace />;
  if (activeRole !== 'vendor') return <Navigate to="/owner/dashboard" replace />;
  return children;
};

const ProtectedRoute = ({ children }) => {
  const { currentUser } = useApp();
  if (!currentUser) return <Navigate to="/" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { currentUser, activeRole } = useApp();
  if (currentUser) {
    return <Navigate to={activeRole === 'owner' ? '/owner/dashboard' : '/vendor/dashboard'} replace />;
  }
  return children;
};

function ToastNotification() {
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
    const handleToast = (e) => {
      setToast({ show: true, message: e.detail.message, type: e.detail.type });
    };
    window.addEventListener('neurobiz-toast', handleToast);
    return () => window.removeEventListener('neurobiz-toast', handleToast);
  }, []);

  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast(prev => ({ ...prev, show: false }));
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast.show, toast.message]);

  if (!toast.show) return null;

  return (
    <div className={`fixed top-20 left-1/2 md:left-auto -translate-x-1/2 md:translate-x-0 right-auto md:right-8 z-50 p-4 rounded-2xl border text-xs font-bold shadow-2xl animate-in slide-in-from-top-4 duration-300 flex items-center gap-3 backdrop-blur-md w-[calc(100%-2rem)] sm:w-auto max-w-sm ${
      toast.type === 'error' 
        ? 'bg-rose-500/10 border-rose-500/30 text-rose-455' 
        : toast.type === 'warning'
        ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
        : toast.type === 'info'
        ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
        : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
    }`}>
      {toast.type === 'error' ? (
        <AlertTriangle className="h-4 w-4 text-rose-455 shrink-0" />
      ) : toast.type === 'warning' ? (
        <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
      ) : toast.type === 'info' ? (
        <Info className="h-4 w-4 text-blue-400 shrink-0" />
      ) : (
        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
      )}
      <span className="flex-1">{toast.message}</span>
      <button 
        onClick={() => setToast(prev => ({ ...prev, show: false }))} 
        className="ml-auto md:ml-2 hover:text-slate-200 transition-colors cursor-pointer text-slate-500 shrink-0"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

// Layout Shell to conditionally show Header and Sidebar
function LayoutWrapper({ children }) {
  const { currentUser } = useApp();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  if (!currentUser) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex relative">
      {/* Mobile Drawer Overlay Backdrop */}
      {mobileSidebarOpen && (
        <div 
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 bg-slate-955/65 backdrop-blur-xs z-25 md:hidden"
        />
      )}

      <Sidebar mobileOpen={mobileSidebarOpen} setMobileOpen={setMobileSidebarOpen} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header setMobileOpen={setMobileSidebarOpen} />
        <main className="flex-1">
          {children}
        </main>
        <AIAssistantPanel />
        <AvatarModal />
        <ToastNotification />
      </div>
    </div>
  );
}

function AppRoutes() {
  const { authLoading } = useApp();

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
        <div className="h-10 w-10 border-4 border-slate-855 border-t-indigo-500 rounded-full animate-spin"></div>
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-4">Syncing Security Session...</p>
      </div>
    );
  }

  return (
    <LayoutWrapper>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
        <Route path="/login" element={<PublicRoute><LandingPage /></PublicRoute>} />

        {/* Owner Dashboard Routes */}
        <Route 
          path="/owner/dashboard" 
          element={
            <OwnerRoute>
              <Dashboard />
            </OwnerRoute>
          } 
        />
        <Route 
          path="/owner/inventory" 
          element={
            <OwnerRoute>
              <Inventory />
            </OwnerRoute>
          } 
        />
        <Route 
          path="/owner/procurement" 
          element={
            <OwnerRoute>
              <Procurement />
            </OwnerRoute>
          } 
        />
        <Route 
          path="/owner/marketing" 
          element={
            <OwnerRoute>
              <Marketing />
            </OwnerRoute>
          } 
        />
        <Route 
          path="/owner/profile" 
          element={
            <OwnerRoute>
              <Profile />
            </OwnerRoute>
          } 
        />

        {/* Vendor Dashboard Routes */}
        <Route 
          path="/vendor/dashboard" 
          element={
            <VendorRoute>
              <VendorDashboard />
            </VendorRoute>
          } 
        />
        <Route 
          path="/vendor/requests" 
          element={
            <VendorRoute>
              <VendorRequests />
            </VendorRoute>
          } 
        />
        <Route 
          path="/vendor/profile" 
          element={
            <VendorRoute>
              <Profile />
            </VendorRoute>
          } 
        />

        {/* Fallback Catch-All */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </LayoutWrapper>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  );
}
