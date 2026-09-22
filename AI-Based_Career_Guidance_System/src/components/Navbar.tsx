import React, { useState } from 'react';
import { User } from '../types';
import { Sparkles, Brain, LogOut, Bell, HelpCircle, Laptop, Sun, Moon, Menu } from 'lucide-react';

interface NavbarProps {
  currentUser: User | null;
  onLogout: () => void;
  onSwitchUser: (email: string) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onToggleSidebarMobile: () => void;
}

export default function Navbar({
  currentUser,
  onLogout,
  onSwitchUser,
  theme,
  onToggleTheme,
  onToggleSidebarMobile
}: NavbarProps) {
  const [showNotification, setShowNotification] = useState(false);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);

  const notifications = [
    { id: 1, title: 'AI Recommendation Ready', desc: 'Your Career Assessment results have been evaluated.', time: '2 mins ago' },
    { id: 2, title: 'Session Scheduled', desc: 'Dr. Evelyn Carter is confirmed for Aug 25.', time: '1 hr ago' }
  ];

  const getInitials = (userName: string) => {
    if (!userName) return 'U';
    const parts = userName.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    const cleanParts = parts.filter(p => !['dr.', 'dr', 'prof.', 'prof', 'mr.', 'mr', 'ms.', 'ms', 'mrs.', 'mrs'].includes(p.toLowerCase()));
    if (cleanParts.length === 0) return parts[0].charAt(0).toUpperCase();
    if (cleanParts.length === 1) return cleanParts[0].substring(0, 2).toUpperCase();
    return (cleanParts[0].charAt(0) + cleanParts[cleanParts.length - 1].charAt(0)).toUpperCase();
  };

  const getRoleBadgeStyles = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-slate-900 text-slate-100 border border-slate-700 dark:bg-slate-800 dark:border-slate-700';
      case 'counselor':
        return 'bg-emerald-600 text-emerald-50 border border-emerald-500';
      case 'student':
      default:
        return 'bg-blue-600 text-blue-50 border border-blue-500';
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md" id="header-nav">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Logo & Mobile Menu Toggle */}
        <div className="flex items-center space-x-3" id="nav-brand">
          {currentUser && (
            <button
              onClick={onToggleSidebarMobile}
              className="lg:hidden rounded-lg p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition outline-none focus:ring-2 focus:ring-blue-600"
              id="btn-mobile-sidebar-toggle"
              aria-label="Open navigation menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 dark:bg-slate-800 text-white shadow-md">
            <Brain className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-bold tracking-tight text-slate-900 dark:text-white text-md">CareerAI</span>
              <span className="rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">Pro</span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Guidance Systems by Sumit & Vivek</p>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-3 sm:space-x-4" id="nav-actions">
          {currentUser ? (
            <>
              {/* Role Switcher */}
              <div className="relative">
                <button
                  onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
                  className="flex items-center space-x-1 rounded-lg bg-slate-100 dark:bg-slate-850 px-2 sm:px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
                  id="btn-role-switcher"
                >
                  <Laptop className="h-3.5 w-3.5 shrink-0" />
                  <span className="hidden sm:inline">Role: </span>
                  <strong className="capitalize">{currentUser.role}</strong>
                </button>
                
                {showRoleSwitcher && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-1 shadow-lg ring-1 ring-black/5 z-50 animate-fade-in">
                    <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Sandbox Role Swapper
                    </div>
                    <button
                      onClick={() => {
                        onSwitchUser('student@careerai.pro');
                        setShowRoleSwitcher(false);
                      }}
                      className="flex w-full items-center px-3 py-2 text-left text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white rounded-lg transition"
                    >
                      Student view (Alex Rivera)
                    </button>
                    <button
                      onClick={() => {
                        onSwitchUser('counselor@careerai.pro');
                        setShowRoleSwitcher(false);
                      }}
                      className="flex w-full items-center px-3 py-2 text-left text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white rounded-lg transition"
                    >
                      Counselor view (Dr. Carter)
                    </button>
                    <button
                      onClick={() => {
                        onSwitchUser('admin@careerai.pro');
                        setShowRoleSwitcher(false);
                      }}
                      className="flex w-full items-center px-3 py-2 text-left text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white rounded-lg transition"
                    >
                      System Admin view
                    </button>
                  </div>
                )}
              </div>

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotification(!showNotification)}
                  className="relative rounded-full p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 focus:outline-none"
                  id="btn-notifications"
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-950"></span>
                </button>

                {showNotification && (
                  <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-lg ring-1 ring-black/5 z-50 animate-fade-in">
                    <div className="mb-2 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">Notifications</span>
                      <span className="rounded bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-700 dark:text-emerald-400">2 New</span>
                    </div>
                    <div className="space-y-3">
                      {notifications.map((n) => (
                        <div key={n.id} className="text-left">
                          <p className="text-xs font-semibold text-slate-900 dark:text-slate-200">{n.title}</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">{n.desc}</p>
                          <span className="text-[9px] text-slate-400 dark:text-slate-500">{n.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Theme Toggle */}
              <button 
                onClick={onToggleTheme}
                className="rounded-full p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition"
                id="btn-navbar-theme-toggle"
                title="Toggle Dark/Light Mode"
              >
                {theme === 'dark' ? <Sun className="h-5 w-5 text-amber-500" /> : <Moon className="h-5 w-5" />}
              </button>

              {/* User Identity */}
              <div className="flex items-center space-x-2 sm:space-x-3 border-l border-slate-200 dark:border-slate-800 pl-3 sm:pl-4" id="nav-user-profile">
                {currentUser.avatar ? (
                  <img
                    className="h-8 w-8 rounded-full object-cover shadow referrer-policy-no-referrer"
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold shadow-sm ${getRoleBadgeStyles(currentUser.role)}`}>
                    {getInitials(currentUser.name)}
                  </div>
                )}
                <div className="hidden md:block text-left">
                  <p className="text-xs font-semibold text-slate-900 dark:text-white leading-none">{currentUser.name}</p>
                  <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500 leading-none mt-1 uppercase tracking-wide">{currentUser.role}</p>
                </div>
                <button
                  onClick={onLogout}
                  className="rounded-lg p-1.5 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-300 transition"
                  title="Sign Out"
                  id="btn-logout"
                >
                  <LogOut className="h-4.5 w-4.5" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center space-x-2" id="nav-unauth-info">
              <HelpCircle className="h-4 w-4 text-slate-400 dark:text-slate-500" />
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Local Sandboxed Instance</span>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
