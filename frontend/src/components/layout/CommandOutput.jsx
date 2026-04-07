import React from 'react';
import { useTerminalStore } from '../../hooks/useTerminalStore';
import { X } from 'lucide-react';

export function CommandOutput() {
  const { logs, showCommandOutput, setShowCommandOutput, clearLogs } = useTerminalStore();

  if (!showCommandOutput || logs.length === 0) return null;

  const typeColors = {
    system: 'text-emerald-400',
    order: 'text-blue-400',
    error: 'text-red-400',
    price: 'text-zinc-500',
    trade: 'text-amber-400',
  };

  return (
    <div className="h-32 bg-[#08080d] border-t border-[#1e1e30] flex flex-col shrink-0 animate-in slide-in-from-bottom duration-200">
      <div className="flex items-center justify-between px-3 py-1 border-b border-[#1e1e30]">
        <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">Terminal Output</span>
        <div className="flex items-center gap-1">
          <button onClick={clearLogs} className="text-[9px] text-zinc-600 hover:text-zinc-400 px-1">CLEAR</button>
          <button onClick={() => setShowCommandOutput(false)} className="p-0.5 hover:bg-white/5 rounded">
            <X size={10} className="text-zinc-600" />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-1 font-mono text-[10px] space-y-0.5">
        {logs.slice(-50).map((log, i) => (
          <div key={i} className="flex items-start gap-2">
            <span className="text-zinc-700 shrink-0">{new Date(log.time).toLocaleTimeString()}</span>
            <span className={`shrink-0 uppercase text-[8px] font-bold w-10 ${typeColors[log.type] || 'text-zinc-500'}`}>[{log.type}]</span>
            <span className="text-zinc-400">{log.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
