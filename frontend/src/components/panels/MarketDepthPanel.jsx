import React, { useMemo } from 'react';
import { useTerminalStore } from '../../hooks/useTerminalStore';
import { FOREX_PAIRS } from '../../lib/constants';

export function MarketDepthPanel() {
  const { prices, selectedSymbol } = useTerminalStore();
  const tick = prices[selectedSymbol] || {};
  
  const bids = tick.bids || [];
  const asks = tick.asks || [];
  const pair = FOREX_PAIRS.find(p => p.symbol === selectedSymbol);
  const decimals = pair?.pip === 0.01 ? 3 : 5;

  const maxVolume = useMemo(() => {
    let m = 0;
    bids.forEach(b => m = Math.max(m, Number(b.liquidity) || 0));
    asks.forEach(a => m = Math.max(m, Number(a.liquidity) || 0));
    return m || 1; // Prevent division by zero
  }, [bids, asks]);

  if (!tick.bid && !tick.ask) {
    return (
      <div className="h-full flex items-center justify-center bg-[#0a0a12] text-zinc-500 text-xs">
        Connecting DOM...
      </div>
    );
  }

  // Reverse asks so the best ask (lowest price) is at the bottom of the top half
  // (Standard Level 2 view: highest ask at top, lowest ask at bottom, spread, then highest bid at top)
  const displayAsks = [...asks].reverse();

  return (
    <div className="h-full flex flex-col bg-[#0a0a12] overflow-hidden text-[10px] font-mono select-none">
      <div className="flex px-2 py-1 bg-[#1e1e30] border-b border-[#1e1e30] font-bold text-zinc-400">
        <div className="flex-1">Price</div>
        <div className="w-16 text-right">Volume</div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {displayAsks.map((ask, i) => {
          const liquidity = Number(ask.liquidity) || 0;
          const width = (liquidity / maxVolume) * 100;
          return (
            <div key={`ask-${i}`} className="relative flex px-2 py-1 cursor-crosshair hover:bg-white/5">
              <div 
                className="absolute top-0 right-0 h-full bg-red-500/10 transition-all duration-300"
                style={{ width: `${width}%` }}
              />
              <div className="flex-1 text-red-400 z-10">{Number(ask.price).toFixed(decimals)}</div>
              <div className="w-16 text-right text-zinc-300 z-10">{liquidity.toLocaleString()}</div>
            </div>
          );
        })}

        <div className="flex px-2 py-1.5 my-1 bg-white/5 border-y border-white/10 items-center justify-between font-bold text-[11px]">
          <span className="text-zinc-500">SPREAD</span>
          <span className="text-zinc-300">
             {((tick.ask - tick.bid) / (pair?.pip || 0.0001)).toFixed(1)} PIPS
          </span>
        </div>

        {bids.map((bid, i) => {
          const liquidity = Number(bid.liquidity) || 0;
          const width = (liquidity / maxVolume) * 100;
          return (
            <div key={`bid-${i}`} className="relative flex px-2 py-1 cursor-crosshair hover:bg-white/5">
              <div 
                className="absolute top-0 right-0 h-full bg-emerald-500/10 transition-all duration-300"
                style={{ width: `${width}%` }}
              />
              <div className="flex-1 text-emerald-400 z-10">{Number(bid.price).toFixed(decimals)}</div>
              <div className="w-16 text-right text-zinc-300 z-10">{liquidity.toLocaleString()}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
