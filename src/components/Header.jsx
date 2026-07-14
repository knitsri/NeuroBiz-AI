import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  Bell,
  User,
  ShieldAlert,
  CheckCircle2,
  Clock,
  Info,
  XCircle,
  Menu
} from 'lucide-react';

export default function Header({ setMobileOpen }) {
  const {
    currentUser,
    activeRole,
    notifications,
    markNotificationsAsRead,
    setIsAvatarModalOpen
  } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  // Clock state
  const [timeStr, setTimeStr] = useState('');
  const [dayStr, setDayStr] = useState('');
  const [dateStr, setDateStr] = useState('');

  // Dropdown toggles
  const [showNotifications, setShowNotifications] = useState(false);

  // Live clock interval
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();

      // Time: HH:MM:SS AM/PM
      let hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      const hoursStr = String(hours).padStart(2, '0');

      setTimeStr(`${hoursStr}:${minutes}:${seconds} ${ampm}`);

      // Day
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      setDayStr(days[now.getDay()]);

      // Date: Month DD, YYYY
      const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      setDateStr(`${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`);
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!currentUser) return null;

  // Get page title matching current routing path
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('dashboard')) return 'Executive Dashboard';
    if (path.includes('inventory')) return 'Smart Inventory';
    if (path.includes('procurement')) return 'Procurement Engine';
    if (path.includes('requests')) return 'Incoming Requests';
    if (path.includes('marketing')) return 'AI Marketing Studio';
    if (path.includes('profile')) return 'Account Profile';
    return 'NeuroBiz Operations';
  };

  const unreadNotifCount = notifications.filter(n => !n.read).length;

  const handleNotificationsToggle = () => {
    setShowNotifications(prev => {
      const nextState = !prev;
      if (nextState) {
        // Mark all as read when opening dropdown
        markNotificationsAsRead();
      }
      return nextState;
    });
  };

  // Helper to choose corresponding notification icon
  const getNotifIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-emerald-450 shrink-0 mt-0.5" />;
      case 'warning':
        return <ShieldAlert className="h-4 w-4 text-amber-450 shrink-0 mt-0.5" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-rose-455 shrink-0 mt-0.5" />;
      default:
        return <Info className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />;
    }
  };

  return (
    <header className="h-16 glass border-b border-slate-800/80 flex items-center justify-between px-4 md:px-8 fixed top-0 right-0 left-0 md:left-64 z-20">
      {/* Title */}
      <div className="flex items-center gap-2 md:gap-4">
        <button 
          onClick={() => setMobileOpen(prev => !prev)}
          className="p-1.5 rounded-lg text-slate-450 hover:text-slate-200 hover:bg-slate-800/40 md:hidden cursor-pointer shrink-0 transition-colors"
          title="Open Menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-base sm:text-xl font-bold tracking-tight text-slate-100 truncate">{getPageTitle()}</h1>
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-semibold tracking-wider uppercase animate-pulse-slow">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
          AI Engine Online
        </div>
      </div>

      {/* Control Actions / Switchers */}
      <div className="flex items-center gap-4">
        {/* Live Digital Clock */}
        <div className="hidden md:flex flex-col items-end px-4 py-1 border-r border-slate-850/80 mr-1 text-right">
          <span className="font-mono text-xs font-bold text-indigo-400 tracking-wider leading-none">{timeStr}</span>
          <span className="text-[9px] text-slate-500 font-bold mt-1 uppercase tracking-wider">{dayStr} • {dateStr}</span>
        </div>

        {/* Notifications Icon & Dropdown */}
        <div className="relative">
          <button
            onClick={handleNotificationsToggle}
            className={`relative p-2 rounded-lg cursor-pointer transition-all duration-300 ${showNotifications ? 'text-indigo-400 bg-slate-900/60' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
          >
            <Bell className="h-5 w-5" />
            {unreadNotifCount > 0 && (
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-indigo-500 animate-ping"></span>
            )}
            {unreadNotifCount > 0 && (
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-indigo-500"></span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {showNotifications && (
            <div className="absolute right-0 mt-3.5 w-80 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-1 z-50 overflow-hidden animate-in fade-in slide-in-from-top-3 duration-200">
              <div className="p-3 border-b border-slate-850 flex items-center justify-between bg-slate-950/20">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">System Alerts</span>
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-[8px] font-bold">
                  {notifications.length} Logs
                </span>
              </div>

              <div className="max-h-64 overflow-y-auto divide-y divide-slate-850/60">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">No active logs</p>
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-3 text-[11px] font-medium leading-relaxed transition-all flex gap-3 items-start cursor-pointer hover:bg-slate-850/30 ${notif.read ? 'text-slate-450' : 'text-slate-200 bg-indigo-500/5'
                        }`}
                    >
                      {getNotifIcon(notif.type)}
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-350 text-[11px] truncate">{notif.title}</p>
                        <p className="text-[10px] text-slate-500 leading-snug mt-0.5">{notif.message}</p>
                        <div className="flex items-center gap-1.5 mt-1 text-[8px] font-semibold text-slate-600">
                          <Clock className="h-2.5 w-2.5" />
                          <span>{notif.timestamp}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Info */}
        <div 
          onClick={() => navigate(activeRole === 'vendor' ? '/vendor/profile' : '/owner/profile')}
          className="flex items-center gap-3 pl-2 cursor-pointer group"
        >
          <div 
            onClick={(e) => {
              e.stopPropagation();
              setIsAvatarModalOpen(true);
            }}
            className="h-8 w-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center font-bold text-indigo-400 overflow-hidden cursor-pointer hover:border-indigo-400 transition-colors shrink-0"
            title="Change Profile Picture"
          >
            {currentUser?.avatarUrl ? (
              <img src={currentUser.avatarUrl} className="h-full w-full object-cover" alt="Avatar" />
            ) : (
              (currentUser?.name || currentUser?.email || 'U').charAt(0).toUpperCase()
            )}
          </div>
          <div className="hidden lg:block text-left hover:opacity-80 transition-opacity">
            <p className="text-xs font-semibold text-slate-200 leading-3">{currentUser?.name || currentUser?.email || 'User'}</p>
            <p className="text-[10px] font-medium text-slate-500 capitalize">{currentUser?.businessName || 'Business'}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
