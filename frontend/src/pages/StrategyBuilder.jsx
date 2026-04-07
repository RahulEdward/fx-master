import React, { useState } from 'react';
import { Play, Save, FileCode2, Command } from 'lucide-react';
import { TopBar } from '../components/layout/TopBar';

export function StrategyBuilder() {
  const [code, setCode] = useState(`// FX-Master Custom Strategy
// Interface with the OANDA API via Python backend securely

def on_tick(self, tick):
    # Strategy logic executed on every incoming tick
    if tick.bid > self.indicators.ema(14):
        self.submit_order(side="BUY", units=1000)
    elif tick.bid < self.indicators.ema(14):
        self.submit_order(side="SELL", units=1000)

def on_candle(self, candle):
    # Strategy logic executed on candle close
    if candle.close > candle.open:
        # Bullish momentum
        pass
`);

  return (
    <div className="flex flex-col h-full w-full bg-[#08080d] text-zinc-200">
      <TopBar />
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Files */}
        <div className="w-64 border-r border-[#1e1e30] bg-[#0a0a12] flex flex-col">
          <div className="p-3 border-b border-[#1e1e30] font-bold text-xs uppercase tracking-wider text-zinc-500">
            Strategy Files
          </div>
          <div className="flex-1 p-2 space-y-1">
            <div className="flex items-center gap-2 px-2 py-1.5 bg-blue-500/10 text-blue-400 rounded cursor-pointer text-sm">
              <FileCode2 size={16} />
              <span>momentum_ema.py</span>
            </div>
            <div className="flex items-center gap-2 px-2 py-1.5 text-zinc-400 hover:bg-[#1e1e30] rounded cursor-pointer text-sm transition-colors">
              <FileCode2 size={16} />
              <span>mean_reversion.py</span>
            </div>
          </div>
        </div>

        {/* Right - Editor Area */}
        <div className="flex-1 flex flex-col">
          {/* Editor Toolbar */}
          <div className="h-12 border-b border-[#1e1e30] bg-[#0c0c14] flex items-center justify-between px-4">
            <div className="flex items-center gap-4 text-sm font-semibold text-zinc-300 shadow-sm">
               momentum_ema.py
               <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[10px] tracking-wider uppercase">Unsaved</span>
            </div>
            <div className="flex gap-2">
              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1e1e30] hover:bg-[#2a2a40] text-zinc-300 rounded text-xs font-bold transition-all">
                <Save size={14} /> Save
              </button>
              <button className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-400 rounded text-xs font-bold shadow-lg transition-all">
                <Command size={14} /> Compile
              </button>
            </div>
          </div>

          {/* Code Editor Mock */}
          <div className="flex-1 bg-[#1e1e1e] p-4 text-sm font-mono overflow-auto flex relative">
            <div className="w-8 flex flex-col text-right pr-4 text-[#858585] select-none opacity-50">
              {code.split('\n').map((_, i) => <div key={i}>{i + 1}</div>)}
            </div>
            <textarea
               value={code}
               onChange={(e) => setCode(e.target.value)}
               spellCheck="false"
               className="flex-1 bg-transparent border-none outline-none resize-none text-[#d4d4d4] leading-normal"
               style={{ tabSize: 4 }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
