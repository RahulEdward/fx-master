import React, { useState } from 'react';
import { useTerminalStore } from '../../hooks/useTerminalStore';
import { FOREX_PAIRS } from '../../lib/constants';
import { Plus, Minus, Star, TrendingUp, TrendingDown } from 'lucide-react';

export function WatchlistPanel() {
  const { 
    watchlists = {}, activeWatchlist, setActiveWatchlist, createWatchlist, deleteWatchlist, 
    prices, selectedSymbol, setSelectedSymbol, addToWatchlist, removeFromWatchlist 
  } = useTerminalStore();
  const watchlist = watchlists[activeWatchlist] || [];
  const [search, setSearch] = useState('');
  const [showAll, setShowAll] = useState(false);

  const formatPrice = (val, sym) => {
    if (!val) return '—';
    const pair = FOREX_PAIRS.find(p => p.symbol === sym);
    const decimals = pair?.pip === 0.01 ? 3 : 5;
    return Number(val).toFixed(decimals);
  };

  const displayPairs = showAll
    ? FOREX_PAIRS.filter(p => p.display.toLowerCase().includes(search.toLowerCase()))
    : watchlist.map(s => FOREX_PAIRS.find(p => p.symbol === s)).filter(Boolean);

  return (
    <div className="h-full flex flex-col bg-[#0a0a12]">
      {/* Watchlist Selection & Search */}
      <div className="p-2 border-b border-[#1e1e30] space-y-2">
        <div className="flex items-center gap-1 justify-between">
          <select 
            value={activeWatchlist} 
            onChange={(e) => {
               if (e.target.value === '__add__') {
                 const name = prompt('New Watchlist Name:');
                 if (name && name.trim()) createWatchlist(name.trim());
               } else {
                 setActiveWatchlist(e.target.value);
               }
            }}
            className="flex-1 bg-[#1e1e30] border border-[#1e1e30] text-[10px] px-2 py-1 rounded outline-none text-white font-semibold cursor-pointer"
          >
            {Object.keys(watchlists).map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
            <option disabled>──────</option>
            <option value="__add__">+ Create New List</option>
          </select>

          {activeWatchlist !== 'Favorites' && (
            <button 
              onClick={() => { if(window.confirm(`Delete ${activeWatchlist}?`)) deleteWatchlist(activeWatchlist); }}
              className="px-2 py-1 bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 rounded text-[9px] font-bold"
              title="Delete Playlist"
            >
              ✕
            </button>
          )}
        </div>
        
        <div className="flex gap-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${showAll ? 'all pairs' : activeWatchlist}...`}
            className="flex-1 bg-[#0e0e16] border border-[#1e1e30] rounded px-2 py-1 text-[10px] text-zinc-300 outline-none focus:border-emerald-500/50"
          />
          <button
            onClick={() => setShowAll(!showAll)}
            className={`px-2 py-1 rounded text-[9px] font-bold transition-colors ${
              showAll ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-[#1e1e30] text-zinc-500 hover:text-zinc-300 border border-transparent'
            }`}
          >
            {showAll ? 'MY' : 'ALL'}
          </button>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center px-2 py-1 text-[8px] font-bold text-zinc-600 uppercase tracking-wider border-b border-[#1e1e30]">
        <span className="w-4" />
        <span className="flex-1">Pair</span>
        <span className="w-20 text-right">Bid</span>
        <span className="w-20 text-right">Ask</span>
        <span className="w-14 text-right">Spread</span>
      </div>

      {/* Pairs List */}
      <div className="flex-1 overflow-y-auto">
        {displayPairs.map(pair => {
          const tick = prices[pair.symbol];
          const isSelected = selectedSymbol === pair.symbol;
          const isInWatchlist = watchlist.includes(pair.symbol);
          const change = tick ? (tick.bid - (tick.prevBid || tick.bid)) : 0;

          return (
            <div
              key={pair.symbol}
              onClick={() => setSelectedSymbol(pair.symbol)}
              className={`flex items-center px-2 py-1.5 cursor-pointer transition-colors border-b border-[#1e1e30]/50 group ${
                isSelected
                  ? 'bg-emerald-500/10 border-l-2 border-l-emerald-500'
                  : 'hover:bg-[#1e1e30]/50 border-l-2 border-l-transparent'
              }`}
            >
              {/* Star / Add */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  isInWatchlist ? removeFromWatchlist(pair.symbol) : addToWatchlist(pair.symbol);
                }}
                className="w-4 shrink-0"
              >
                {showAll ? (
                  isInWatchlist
                    ? <Star size={10} className="text-amber-400 fill-amber-400" />
                    : <Plus size={10} className="text-zinc-700 group-hover:text-zinc-400" />
                ) : (
                  <Star size={10} className="text-amber-400/50" />
                )}
              </button>

              {/* Pair Name */}
              <div className="flex-1 min-w-0">
                <span className={`text-[11px] font-bold ${isSelected ? 'text-white' : 'text-zinc-300'}`}>
                  {pair.display}
                </span>
              </div>

              {/* Bid */}
              <span className={`w-20 text-right text-[11px] font-mono ${
                change > 0 ? 'text-emerald-400' : change < 0 ? 'text-red-400' : 'text-zinc-400'
              }`}>
                {tick ? formatPrice(tick.bid, pair.symbol) : '—'}
              </span>

              {/* Ask */}
              <span className="w-20 text-right text-[11px] font-mono text-zinc-400">
                {tick ? formatPrice(tick.ask, pair.symbol) : '—'}
              </span>

              {/* Spread */}
              <span className="w-14 text-right text-[10px] font-mono text-zinc-600">
                {tick ? ((tick.ask - tick.bid) / (FOREX_PAIRS.find(p => p.symbol === pair.symbol)?.pip || 0.0001)).toFixed(1) : '—'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
