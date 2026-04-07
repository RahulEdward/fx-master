import React, { useState, useEffect } from 'react';
import { useTerminalStore } from '../../hooks/useTerminalStore';
import { useAuth } from '../../store/AuthContext';
import { useBroker } from '../../store/BrokerContext';
import { useNavigate } from 'react-router-dom';
import {
  Settings, Wifi, WifiOff, Activity, LayoutGrid, Lock, Unlock,
  Save, ChevronDown, Monitor, Moon,
} from 'lucide-react';

export function TopBar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { activeBrokerAccount } = useBroker();
  const {
    connection, isEditMode, setEditMode, panels, togglePanel,
    activeLayoutName, savedLayouts, saveLayout, setActiveLayout,
    isAutosaveEnabled, maximizedPanelId, setMaximizedPanel,
  } = useTerminalStore();

  const [showPanelMenu, setShowPanelMenu] = useState(false);
  const [showLayoutMenu, setShowLayoutMenu] = useState(false);

  // Market status
  const now = new Date();
  const day = now.getUTCDay();
  const hour = now.getUTCHours();
  const marketOpen = !(day === 6 || (day === 5 && hour >= 22) || (day === 0 && hour < 22));

  const apiStatus = connection.api;
  const wsStatus = connection.ws;

  return (
    <div className="h-9 bg-[#0a0a12] border-b border-[#1e1e30] flex items-center justify-between px-3 select-none shrink-0">
      {/* Left: Logo + Status */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
            <span className="text-[7px] font-black text-white">FX</span>
          </div>
          <span className="text-[11px] font-bold text-white tracking-tight">FX-Master</span>
        </div>

        <div className="h-4 w-px bg-[#1e1e30]" />

        {/* Connection Status */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1" title={`API: ${apiStatus}`}>
            {apiStatus === 'online' ? (
              <Wifi size={11} className="text-emerald-400" />
            ) : apiStatus === 'checking' ? (
              <Activity size={11} className="text-amber-400 animate-pulse" />
            ) : (
              <WifiOff size={11} className="text-red-400" />
            )}
            <span className={`text-[9px] font-bold uppercase tracking-wider ${
              apiStatus === 'online' ? 'text-emerald-400' : apiStatus === 'checking' ? 'text-amber-400' : 'text-red-400'
            }`}>API</span>
          </div>

          <div className="flex items-center gap-1" title={`WebSocket: ${wsStatus}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${
              wsStatus === 'connected' ? 'bg-emerald-400' : 'bg-red-400'
            }`} />
            <span className={`text-[9px] font-bold uppercase tracking-wider ${
              wsStatus === 'connected' ? 'text-emerald-400' : 'text-red-400'
            }`}>WS</span>
          </div>

          <div className="flex items-center gap-1">
            <span className={`w-1.5 h-1.5 rounded-full ${marketOpen ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-600'}`} />
            <span className={`text-[9px] font-bold uppercase tracking-wider ${marketOpen ? 'text-emerald-400' : 'text-zinc-600'}`}>
              {marketOpen ? 'MARKET OPEN' : 'CLOSED'}
            </span>
          </div>
        </div>
      </div>

      {/* Center: Panel Toggles + Layout */}
      <div className="flex items-center gap-1">
        {/* Panel Menu */}
        <div className="relative">
          <button
            onClick={() => { setShowPanelMenu(!showPanelMenu); setShowLayoutMenu(false); }}
            className="flex items-center gap-1 px-2 py-1 rounded text-[10px] text-zinc-500 hover:text-zinc-300 hover:bg-[#1e1e30] transition-colors"
          >
            <Monitor size={11} /> Panels <ChevronDown size={9} />
          </button>
          {showPanelMenu && (
            <div className="absolute top-full left-0 mt-1 bg-[#0e0e18] border border-[#1e1e30] rounded shadow-xl z-50 min-w-[160px] py-1">
              {panels.map(p => (
                <button key={p.id} onClick={() => togglePanel(p.id)}
                  className="w-full text-left px-3 py-1.5 text-[10px] hover:bg-[#1e1e30] flex items-center justify-between"
                >
                  <span className={p.visible ? 'text-emerald-400' : 'text-zinc-500'}>{p.title}</span>
                  <span className={`text-[8px] ${p.visible ? 'text-emerald-400' : 'text-zinc-700'}`}>
                    {p.visible ? '●' : '○'}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Layout Mode Toggle */}
        <button
          onClick={() => setEditMode(!isEditMode)}
          className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] transition-colors ${
            isEditMode
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              : 'text-zinc-500 hover:text-zinc-300 hover:bg-[#1e1e30]'
          }`}
        >
          {isEditMode ? <Unlock size={11} /> : <Lock size={11} />}
          {isEditMode ? 'EDITING' : 'LOCKED'}
        </button>

        {/* Save Layout */}
        {isEditMode && (
          <button
            onClick={() => {
              const currentLayouts = useTerminalStore.getState().pendingLayouts || savedLayouts[activeLayoutName];
              if (currentLayouts) saveLayout(activeLayoutName, currentLayouts);
            }}
            className="flex items-center gap-1 px-2 py-1 rounded text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 transition-colors"
          >
            <Save size={11} /> SAVE
          </button>
        )}

        {maximizedPanelId && (
          <button
            onClick={() => setMaximizedPanel(null)}
            className="flex items-center gap-1 px-2 py-1 rounded text-[10px] bg-blue-500/20 text-blue-400 border border-blue-500/30"
          >
            EXIT FULLSCREEN
          </button>
        )}
      </div>

      {/* Right: Account + Settings */}
      <div className="flex items-center gap-2">
        {activeBrokerAccount && (
          <div className="flex items-center gap-2 px-2 py-1 rounded bg-[#1e1e30]/50">
            <span className="text-[9px] text-zinc-500 uppercase tracking-wider">BAL</span>
            <span className="text-[10px] font-bold text-white">
              {Number(activeBrokerAccount.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-[9px] text-zinc-500">{activeBrokerAccount.currency || 'USD'}</span>
          </div>
        )}

        <button onClick={() => navigate('/connect')}
          className="p-1.5 hover:bg-[#1e1e30] rounded transition-colors" title="Settings">
          <Settings size={13} className="text-zinc-500 hover:text-zinc-300" />
        </button>
      </div>

      {/* Click-away listener */}
      {(showPanelMenu || showLayoutMenu) && (
        <div className="fixed inset-0 z-40" onClick={() => { setShowPanelMenu(false); setShowLayoutMenu(false); }} />
      )}
    </div>
  );
}
