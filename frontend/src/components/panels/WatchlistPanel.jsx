import React, { useState, useEffect, useRef } from 'react';
import { useTerminalStore } from '../../hooks/useTerminalStore';
import { FOREX_PAIRS } from '../../lib/constants';
import { Plus, Star } from 'lucide-react';

function PriceCell({ value, symbol, direction, flashAt }) {
  const [flash, setFlash] = useState(null);
  const prevFlashAt = useRef(0);

  useEffect(() => {
    if (flashAt && flashAt !== prevFlashAt.current) {
      const dir = direction || 'up';
      setFlash(dir);
      prevFlashAt.current = flashAt;
      const timer = setTimeout(() => setFlash(null), 500);
      return () => clearTimeout(timer);
    }
  }, [flashAt, direction]);

  const pair = FOREX_PAIRS.find(p => p.symbol === symbol);
  const decimals = pair?.pip === 0.01 ? 3 : 5;
  const formatted = value != null ? Number(value).toFixed(decimals) : '—';

  let cls = 'text-zinc-400';
  if (flash === 'up') cls = 'text-white bg-emerald-600/40';
  else if (flash === 'down') cls = 'text-white bg-red-600/40';
  else if (direction === 'up') cls = 'text-emerald-400';
  else if (direction === 'down') cls = 'text-red-400';

  return (
    <span className={`text-[10px] font-mono rounded px-1 py-0.5 transition-all duration-200 ${cls}`}>
      {formatted}
    </span>
  );
}

export function WatchlistPanel() {
  const {
    watchlists = {}, activeWatchlist, setActiveWatchlist, createWatchlist, deleteWatchlist,
    prices, selectedSymbol, setSelectedSymbol, addToWatchlist, removeFromWatchlist
  } = useTerminalStore();
  const watchlist = watchlists[activeWatchlist] || [];
  const [search, setSearch] = useState('');
  const [showAll, setShowAll] = useState(false);

  const displayPairs = showAll
    ? FOREX_PAIRS.filter(p => p.display.toLowerCase().includes(search.toLowerCase()))
    : watchlist.map(s => FOREX_PAIRS.find(p => p.symbol === s)).filter(Boolean);

  return (
    <div className="h-full flex flex-col bg-[#0a0a12] overflow-hidden">
      {/* Watchlist Selection & Search */}
      <div className="p-2 border-b border-[#1e1e30] space-y-2 shrink-0">
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
            >✕</button>
          )}
        </div>
        <div className="flex gap-1">
          <input
            type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${showAll ? 'all pairs' : activeWatchlist}...`}
            className="flex-1 bg-[#0e0e16] border border-[#1e1e30] rounded px-2 py-1 text-[10px] text-zinc-300 outline-none focus:border-emerald-500/50"
          />
          <button
            onClick={() => setShowAll(!showAll)}
            className={`px-2 py-1 rounded text-[9px] font-bold transition-colors ${
              showAll ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-[#1e1e30] text-zinc-500 hover:text-zinc-300 border border-transparent'
            }`}
          >{showAll ? 'MY' : 'ALL'}</button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 bg-[#0a0a12] z-10">
            <tr className="text-[8px] font-bold text-zinc-600 uppercase tracking-wider border-b border-[#1e1e30]">
              <th className="w-5 py-1 px-1" />
              <th className="text-left py-1 px-1">Pair</th>
              <th className="text-right py-1 px-1 whitespace-nowrap">%Chg</th>
              <th className="text-right py-1 px-1">Bid</th>
              <th className="text-right py-1 px-1">Ask</th>
              <th className="text-right py-1 px-1 pr-2">Sprd</th>
            </tr>
          </thead>
          <tbody>
            {displayPairs.map(pair => {
              const tick = prices[pair.symbol];
              const isSelected = selectedSymbol === pair.symbol;
              const isInWatchlist = watchlist.includes(pair.symbol);
              const chg = (tick?.bid && tick?.openBid) ? ((tick.bid - tick.openBid) / tick.openBid) * 100 : null;

              return (
                <tr
                  key={pair.symbol}
                  onClick={() => setSelectedSymbol(pair.symbol)}
                  className={`cursor-pointer transition-colors border-b border-[#1e1e30]/50 group ${
                    isSelected
                      ? 'bg-emerald-500/10'
                      : 'hover:bg-[#1e1e30]/50'
                  }`}
                >
                  {/* Star */}
                  <td className="py-1.5 px-1 w-5">
                    <button onClick={(e) => { e.stopPropagation(); isInWatchlist ? removeFromWatchlist(pair.symbol) : addToWatchlist(pair.symbol); }}>
                      {showAll ? (
                        isInWatchlist ? <Star size={9} className="text-amber-400 fill-amber-400" /> : <Plus size={9} className="text-zinc-700 group-hover:text-zinc-400" />
                      ) : <Star size={9} className="text-amber-400/50" />}
                    </button>
                  </td>

                  {/* Pair */}
                  <td className="py-1.5 px-1">
                    <span className={`text-[10px] font-bold whitespace-nowrap ${isSelected ? 'text-white' : 'text-zinc-300'}`}>
                      {pair.display}
                    </span>
                  </td>

                  {/* %Chg */}
                  <td className="py-1.5 px-1 text-right">
                    <span className={`text-[9px] font-bold font-mono whitespace-nowrap ${
                      chg != null ? (chg > 0 ? 'text-emerald-400' : chg < 0 ? 'text-red-400' : 'text-zinc-500') : 'text-zinc-600'
                    }`}>
                      {chg != null ? `${chg > 0 ? '+' : ''}${chg.toFixed(2)}%` : '—'}
                    </span>
                  </td>

                  {/* Bid */}
                  <td className="py-1.5 px-1 text-right">
                    <PriceCell value={tick?.bid} symbol={pair.symbol} direction={tick?.bidDir} flashAt={tick?.flashAt} />
                  </td>

                  {/* Ask */}
                  <td className="py-1.5 px-1 text-right">
                    <PriceCell value={tick?.ask} symbol={pair.symbol} direction={tick?.askDir} flashAt={tick?.flashAt} />
                  </td>

                  {/* Spread */}
                  <td className="py-1.5 px-1 pr-2 text-right">
                    <span className="text-[9px] font-mono text-zinc-600 whitespace-nowrap">
                      {tick ? ((tick.ask - tick.bid) / (pair.pip || 0.0001)).toFixed(1) : '—'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
