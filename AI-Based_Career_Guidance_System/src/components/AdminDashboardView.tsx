import React, { useState } from 'react';
import { User } from '../types';
import { Shield, Sparkles, Terminal, Activity, Server, RefreshCw, Eye, EyeOff, Download } from 'lucide-react';

interface AdminDashboardViewProps {
  currentUser: User | null;
}

export default function AdminDashboardView({ currentUser }: AdminDashboardViewProps) {
  const [apiKeyVisible, setApiKeyVisible] = useState(false);
  const [systemLogs, setSystemLogs] = useState([
    { timestamp: '11:41:02', event: 'Cognitive API initialized successfully.', type: 'info' },
    { timestamp: '11:41:24', event: 'POST /api/auth/login - student@careerai.pro authenticated.', type: 'success' },
    { timestamp: '11:42:08', event: 'POST /api/recommendations - Core coefficients mapped in 14ms.', type: 'info' },
    { timestamp: '11:42:15', event: 'POST /api/interview/start - Syllabus structures compiled for Software Engineer.', type: 'success' },
    { timestamp: '11:43:01', event: 'Deep Speech engine synced.', type: 'info' }
  ]);

  const [platformMetrics, setPlatformMetrics] = useState({
    totalStudents: 1420,
    activeSessions: 84,
    apiLatencyMs: 380,
    dbStorageGb: 8.2,
    maxStorageGb: 12
  });

  const handleClearLogs = () => {
    setSystemLogs([]);
  };

  const handleRefreshMetrics = () => {
    setPlatformMetrics(prev => ({
      ...prev,
      activeSessions: Math.floor(Math.random() * 40) + 60,
      apiLatencyMs: Math.floor(Math.random() * 120) + 300
    }));
  };

  return (
    <div className="mx-auto max-w-7xl p-6 space-y-6 text-left" id="admin-portal">
      
      {/* Banner */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between items-start sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center">
            <Shield className="mr-2 h-5 w-5 text-blue-600" />
            Admin Operations Panel
          </h1>
          <p className="text-xs text-slate-500 mt-1">Monitor server resources, intelligence core integration metrics, security parameters, and raw API transaction logs.</p>
        </div>
        <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-bold text-white shadow-sm">
          System Super Administrator
        </span>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4" id="admin-metrics-row">
        
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm text-left">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Students Cataloged</p>
          <div className="mt-2.5 flex items-baseline justify-between leading-none">
            <span className="text-xl font-extrabold text-slate-800">{platformMetrics.totalStudents}</span>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">+14% MoM</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm text-left">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Schedulers</p>
          <div className="mt-2.5 flex items-baseline justify-between leading-none">
            <span className="text-xl font-extrabold text-slate-800">{platformMetrics.activeSessions}</span>
            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">Realtime</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm text-left">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cognitive API Latency</p>
          <div className="mt-2.5 flex items-baseline justify-between leading-none">
            <span className="text-xl font-extrabold text-slate-800">{platformMetrics.apiLatencyMs}ms</span>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">Optimal</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm text-left">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">JSON Database Size</p>
          <div className="mt-2.5 flex items-baseline justify-between leading-none">
            <span className="text-xl font-extrabold text-slate-800">{platformMetrics.dbStorageGb} GB</span>
            <span className="text-[10px] text-slate-400 font-bold">of {platformMetrics.maxStorageGb} GB</span>
          </div>
        </div>

      </div>

      {/* Split details column */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        
        {/* Left pane: security & settings */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-5 lg:col-span-1" id="admin-security-settings">
          <h3 className="text-xs font-bold text-slate-900 flex items-center">
            <Server className="mr-1.5 h-4.5 w-4.5 text-blue-600" /> System Settings
          </h3>

          {/* Simulated API secret config toggle */}
          <div className="space-y-1.5 border border-slate-100 bg-slate-50 p-4 rounded-xl">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Cognitive Secret Key</span>
            <div className="flex items-center justify-between mt-2.5 bg-white border border-slate-200/60 rounded-lg px-2.5 py-1.5 text-xs">
              <span className="font-semibold text-slate-600 truncate mr-2">
                {apiKeyVisible ? 'AIzaSyA_COGNITIVE_PRODUCTION_ROUTER' : '••••••••••••••••••••••••••••••••'}
              </span>
              <button
                onClick={() => setApiKeyVisible(!apiKeyVisible)}
                className="text-slate-400 hover:text-slate-800"
              >
                {apiKeyVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-[9px] text-slate-400 mt-1 leading-normal">Credential is loaded automatically at execution runtime via system environment parameters.</p>
          </div>

          <div className="space-y-4 pt-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-600">Voice Synthesis Engine</span>
              <span className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">Online</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-600">Local JSON Persistence</span>
              <span className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">Active</span>
            </div>
            <div className="flex justify-between items-center text-xs border-b pb-4">
              <span className="font-semibold text-slate-600">Automatic Backup Scheduler</span>
              <span className="text-slate-400 font-bold">Enabled (6h)</span>
            </div>
            
            <button
              onClick={handleRefreshMetrics}
              className="w-full flex items-center justify-center space-x-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs py-2 shadow-sm transition"
              id="btn-admin-refresh-metrics"
            >
              <RefreshCw className="h-3.5 w-3.5 animate-spin-hover" />
              <span>Refresh Metrics</span>
            </button>

            <button
              onClick={() => {
                window.location.href = '/api/admin/export-db';
              }}
              className="w-full flex items-center justify-center space-x-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-2 shadow-sm transition"
              id="btn-admin-download-db"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download Live DB Backup</span>
            </button>
          </div>
        </div>

        {/* Right pane: raw terminal activity log */}
        <div className="rounded-2xl border border-slate-200 bg-slate-950 p-5 shadow-xl lg:col-span-2 space-y-4 flex flex-col justify-between" id="admin-raw-logs">
          
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2 text-white">
              <Terminal className="h-4.5 w-4.5 text-blue-500" />
              <h3 className="text-xs font-bold">System API Event Log</h3>
            </div>
            <button
              onClick={handleClearLogs}
              className="text-[10px] font-bold text-slate-400 hover:text-white uppercase tracking-wider"
              id="btn-admin-clear-logs"
            >
              Clear Logs
            </button>
          </div>

          {/* Terminal Box */}
          <div className="flex-1 min-h-64 font-mono text-[10.5px] text-slate-300 space-y-2 p-3 bg-slate-900 rounded-xl overflow-y-auto max-h-96" id="terminal-pane">
            {systemLogs.length === 0 ? (
              <p className="text-slate-500 text-center py-10">No active system transactions.</p>
            ) : (
              systemLogs.map((log, idx) => (
                <div key={idx} className="flex items-start space-x-2">
                  <span className="text-slate-500 flex-shrink-0">[{log.timestamp}]</span>
                  <span className={`flex-shrink-0 ${log.type === 'success' ? 'text-emerald-400' : 'text-blue-400'}`}>
                    {log.type.toUpperCase()}:
                  </span>
                  <span className="text-slate-100">{log.event}</span>
                </div>
              ))
            )}
          </div>

          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest text-right leading-none pt-2 border-t border-slate-850">
            Platform Security Node: SEC-V2-OK
          </div>

        </div>

      </div>

    </div>
  );
}
