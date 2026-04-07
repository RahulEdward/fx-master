import React from 'react';
import { Minus, Maximize2, Minimize2, X, GripHorizontal } from 'lucide-react';

export function PanelWrapper({ title, children, minimized, maximized, onMinimize, onMaximize, onClose, draggable }) {
  return (
    <div className={`h-full flex flex-col bg-[#0a0a12] border border-[#1e1e30] rounded-sm overflow-hidden ${minimized ? 'max-h-8' : ''}`}>
      {/* Panel Header */}
      <div className={`flex items-center justify-between px-2 h-7 bg-[#0e0e18] border-b border-[#1e1e30] shrink-0 ${draggable ? 'panel-drag-handle cursor-grab active:cursor-grabbing' : ''}`}>
        <div className="flex items-center gap-1.5">
          {draggable && <GripHorizontal size={10} className="text-zinc-700" />}
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest select-none">{title}</span>
        </div>
        <div className="flex items-center gap-0.5">
          {onMinimize && (
            <button onClick={onMinimize} className="p-1 hover:bg-white/5 rounded transition-colors" title="Minimize">
              <Minus size={10} className="text-zinc-600" />
            </button>
          )}
          {onMaximize && (
            <button onClick={onMaximize} className="p-1 hover:bg-white/5 rounded transition-colors" title={maximized ? 'Restore' : 'Maximize'}>
              {maximized ? <Minimize2 size={10} className="text-zinc-600" /> : <Maximize2 size={10} className="text-zinc-600" />}
            </button>
          )}
          {onClose && (
            <button onClick={onClose} className="p-1 hover:bg-red-500/20 rounded transition-colors" title="Close">
              <X size={10} className="text-zinc-600" />
            </button>
          )}
        </div>
      </div>
      {/* Panel Content */}
      {!minimized && (
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      )}
    </div>
  );
}
