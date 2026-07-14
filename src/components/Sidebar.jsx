import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  Boxes,
  ShoppingCart,
  Megaphone,
  User,
  LogOut,
  Brain,
  FileText,
  Activity
} from 'lucide-react';

export default function Sidebar({ mobileOpen, setMobileOpen }) {
  const { currentUser, logout, activeRole } = useApp();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!currentUser) return null;

  // Define links based on current role
  const ownerLinks = [
    { name: 'Dashboard', path: '/owner/dashboard', icon: LayoutDashboard },
    { name: 'Inventory', path: '/owner/inventory', icon: Boxes },
    { name: 'Procurement', path: '/owner/procurement', icon: ShoppingCart },
    { name: 'AI Marketing Studio', path: '/owner/marketing', icon: Megaphone },
    { name: 'Profile', path: '/owner/profile', icon: User },
  ];

  const vendorLinks = [
    { name: 'Dashboard', path: '/vendor/dashboard', icon: LayoutDashboard },
    { name: 'Procurement Requests', path: '/vendor/requests', icon: FileText },
    { name: 'Profile', path: '/vendor/profile', icon: User },
  ];

  const links = activeRole === 'owner' ? ownerLinks : vendorLinks;

  return (
    <aside className={`w-64 glass border-r border-slate-800 flex flex-col h-screen fixed left-0 top-0 z-30 transition-transform duration-300 md:translate-x-0 ${
      mobileOpen ? 'translate-x-0' : '-translate-x-full'
    }`}>
      {/* Logo Area */}
      <div className="p-6 flex items-center gap-3 border-b border-slate-800/80">
        <div className="p-2 bg-indigo-500/10 border border-indigo-500/30 rounded-xl flex items-center justify-center animate-pulse-slow">
          <Brain className="h-6 w-6 text-indigo-400" />
        </div>
        <div>
          <span className="font-extrabold text-lg tracking-wider text-gradient">NEUROBIZ AI</span>
          <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">SME Co-Pilot</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.path}
              to={link.path}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium text-sm group
                ${isActive
                  ? 'bg-gradient-to-r from-indigo-500/20 to-indigo-500/5 text-indigo-300 border border-indigo-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'}
              `}
            >
              {({ isActive }) => (
                <>
                  <Icon className={`h-5 w-5 transition-transform duration-300 group-hover:scale-110 
                    ${isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-indigo-400'}
                  `} />
                  <span>{link.name}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User Footer Profile & Logout */}
      <div className="p-4 border-t border-slate-800/80">
        <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-900/40 border border-slate-800/50 mb-3">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center font-bold text-white shadow-md">
            {(currentUser?.name || currentUser?.email || 'U').charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-200 truncate">{currentUser?.name || currentUser?.email || 'User'}</p>
            <p className="text-[10px] text-slate-500 font-medium capitalize truncate">
              {activeRole} • {currentUser?.businessType || 'N/A'}
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-rose-500/20 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 font-semibold text-xs transition-all duration-300"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
