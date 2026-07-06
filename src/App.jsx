import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import AIAssistantPanel from './components/AIAssistantPanel';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Procurement from './pages/Procurement';
import Marketing from './pages/Marketing';
import Profile from './pages/Profile';
import VendorDashboard from './pages/VendorDashboard';
import VendorRequests from './pages/VendorRequests';

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

// Layout Shell to conditionally show Header and Sidebar
function LayoutWrapper({ children }) {
  const { currentUser } = useApp();

  if (!currentUser) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <AIAssistantPanel />
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
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />

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
