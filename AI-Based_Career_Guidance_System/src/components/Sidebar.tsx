import React from 'react';
import { User } from '../types';
import {
  LayoutDashboard,
  ClipboardCheck,
  Award,
  MessageSquare,
  Compass,
  Map,
  FileText,
  UserCheck,
  GraduationCap,
  Settings,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';

interface SidebarProps {
  currentUser: User | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export default function Sidebar({
  currentUser,
  activeTab,
  setActiveTab,
  isOpen,
  setIsOpen,
  isCollapsed,
  setIsCollapsed
}: SidebarProps) {
  if (!currentUser) return null;

  // Student Menu Items
  const studentItems = [
    { id: 'dashboard', label: 'Student Dashboard', icon: LayoutDashboard },
    { id: 'assessment', label: 'AI Assessment', icon: ClipboardCheck },
    { id: 'recommendations', label: 'Career Matches', icon: Award },
    { id: 'counselor', label: 'AI Counselor Bot', icon: MessageSquare },
    { id: 'explorer', label: 'Career Explorer', icon: Compass },
    { id: 'roadmaps', label: 'Learning Roadmaps', icon: Map },
    { id: 'resume', label: 'Resume Suite', icon: FileText },
    { id: 'interview', label: 'Mock Interview', icon: UserCheck },
    { id: 'listings', label: 'Jobs & Academy', icon: GraduationCap }
  ];

  // Counselor Menu Items
  const counselorItems = [
    { id: 'counselor_dashboard', label: 'Counselor Desk', icon: LayoutDashboard },
    { id: 'explorer', label: 'Career Database', icon: Compass }
  ];

  // Admin Menu Items
  const adminItems = [
    { id: 'admin_dashboard', label: 'Admin Terminal', icon: Settings },
    { id: 'explorer', label: 'Career Database', icon: Compass }
  ];

  const getMenuItems = () => {
    switch (currentUser.role) {
      case 'counselor':
        return counselorItems;
      case 'admin':
        return adminItems;
      case 'student':
      default:
        return studentItems;
    }
  };

  const menuItems = getMenuItems();

  const handleMenuItemClick = (id: string) => {
    setActiveTab(id);
    setIsOpen(false); // Auto-close on mobile/tablet select
  };

  // Helper to render navigation items
  const renderNavList = (isMobileOrTablet: boolean) => {
    return (
      <nav className="space-y-1.5" role="navigation" aria-label="Main Navigation">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const showLabel = isMobileOrTablet || !isCollapsed;

          return (
            <button
              key={item.id}
              onClick={() => handleMenuItemClick(item.id)}
              className={`flex w-full items-center rounded-xl px-3 py-2.5 text-xs font-semibold transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                showLabel ? 'space-x-3 justify-start' : 'justify-center'
              } ${
                isActive
                  ? 'bg-slate-900 text-white shadow-sm dark:bg-blue-600'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
              id={`${isMobileOrTablet ? 'mobile-' : ''}sidebar-item-${item.id}`}
              title={!showLabel ? item.label : undefined}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className={`h-4.5 w-4.5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-400'}`} />
              {showLabel && <span className="truncate">{item.label}</span>}
            </button>
          );
        })}
      </nav>
    );
  };

  return (
    <>
      {/* 1. MOBILE/TABLET SIDEBAR OVERLAY BACKGROUND */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
          id="mobile-sidebar-overlay"
          aria-hidden="true"
        />
      )}

      {/* 2. MOBILE/TABLET DRAWER SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col justify-between border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-4 transition-transform duration-300 ease-in-out lg:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        id="mobile-sidebar-drawer"
        aria-label="Mobile Navigation Sidebar"
      >
        <div className="space-y-6">
          {/* Header row with Close button */}
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 dark:bg-blue-600 text-white font-bold">
                A
              </div>
              <div>
                <span className="font-bold text-slate-900 dark:text-white text-sm block leading-none">CareerAI Pro</span>
                <span className="text-[9px] text-slate-550 dark:text-slate-400 font-semibold block mt-0.5">by Sumit & Vivek</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-white transition"
              id="btn-close-mobile-sidebar"
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="px-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Main Navigation</p>
          </div>

          {renderNavList(true)}
        </div>

        {/* User Identity in Footer (Mobile) */}
        <div className="rounded-xl bg-slate-100/80 dark:bg-slate-800/60 p-3.5 text-left border border-slate-200/50 dark:border-slate-700/50" id="mobile-sidebar-footer">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 leading-none">Logged In Account</p>
          <div className="mt-2.5 flex items-center space-x-2.5">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[150px]">
              {currentUser.email}
            </span>
          </div>
        </div>
      </aside>


      {/* 3. DESKTOP PERMANENT SIDEBAR */}
      <aside
        className={`hidden lg:flex flex-col justify-between border-r border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 p-4 transition-all duration-300 shrink-0 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
        id="desktop-sidebar"
        aria-label="Desktop Navigation Sidebar"
      >
        <div className="space-y-6">
          {/* Collapse/Expand Row */}
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} px-2`}>
            {!isCollapsed && (
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Main Navigation</span>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-white transition outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              id="btn-toggle-sidebar-collapse"
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>
          </div>

          {/* Nav List */}
          {renderNavList(false)}
        </div>

        {/* Footer Identity (Desktop) */}
        <div
          className={`rounded-xl bg-slate-100/80 dark:bg-slate-800/60 p-3.5 border border-slate-200/50 dark:border-slate-700/50 ${
            isCollapsed ? 'flex justify-center items-center' : 'text-left'
          }`}
          id="desktop-sidebar-footer"
        >
          {isCollapsed ? (
            <div className="relative group">
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50 bg-slate-900 text-white text-[10px] rounded px-2 py-1 whitespace-nowrap shadow-md">
                {currentUser.email}
              </div>
            </div>
          ) : (
            <>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 leading-none">Logged In Account</p>
              <div className="mt-2.5 flex items-center space-x-2.5">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[150px]" title={currentUser.email}>
                  {currentUser.email}
                </span>
              </div>
            </>
          )}
        </div>
      </aside>
    </>
  );
}
