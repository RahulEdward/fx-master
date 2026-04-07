import React, { useEffect, useState } from 'react';
import { useBroker } from '../../store/BrokerContext';
import { tradingAPI } from '../../services/api';
import { useTerminalStore } from '../../hooks/useTerminalStore';
import { showToast } from '../common/ToastManager';
import { X, RefreshCw } from 'lucide-react';

export function PositionsPanel() {
  const { activeBrokerAccount } = useBroker();
  const { addLog } = useTerminalStore();
  const accId = activeBrokerAccount?.broker_account_id || activeBrokerAccount?.id;
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadTrades = async () => {
    if (!accId) return;
    setLoading(true);
    try {
      const res = await tradingAPI.getTrades(accId);
      const raw = res.data?.trades || res.data || [];
      // Normalize field names from backend (trade_id -> id, entry_price -> price, etc.)
      setTrades(raw.map(t => ({
        ...t,
        id: t.trade_id || t.id,
        price: t.entry_price || t.price,
        currentUnits: t.units || t.currentUnits,
        unrealizedPL: t.unrealized_pl ?? t.unrealizedPL ?? 0,
        instrument: t.instrument,
      })));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    loadTrades();
    const interval = setInterval(loadTrades, 5000);
    return () => clearInterval(interval);
  }, [accId]);

  const closeTrade = async (tradeId) => {
    try {
      await tradingAPI.closeTrade(accId, tradeId);
      addLog('trade', `Closed trade #${tradeId}`);
      showToast('success', 'Trade Closed', `Trade #${tradeId} closed`);
      loadTrades();
    } catch (e) {
      showToast('error', 'Close Failed', e.message);
    }
  };

  const totalPnl = trades.reduce((sum, t) => sum + (parseFloat(t.unrealizedPL) || 0), 0);

  return (
    <div className="h-full flex flex-col bg-[#0a0a12]">
      {/* Header */}
      <div className="flex items-center justify-between px-2 py-1 border-b border-[#1e1e30]">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-zinc-500">{trades.length} open</span>
          <span className={`text-[10px] font-bold ${totalPnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            P&L: {totalPnl >= 0 ? '+' : ''}{totalPnl.toFixed(2)}
          </span>
        </div>
        <button onClick={loadTrades} disabled={loading} className="p-1 hover:bg-[#1e1e30] rounded transition-colors">
          <RefreshCw size={10} className={`text-zinc-600 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Table Header */}
      <div className="flex items-center px-2 py-1 text-[8px] font-bold text-zinc-600 uppercase tracking-wider border-b border-[#1e1e30] bg-[#0e0e18]">
        <span className="w-20">Pair</span>
        <span className="w-14 text-right">Side</span>
        <span className="w-16 text-right">Units</span>
        <span className="w-20 text-right">Price</span>
        <span className="flex-1 text-right">P&L</span>
        <span className="w-8" />
      </div>

      {/* Trades */}
      <div className="flex-1 overflow-y-auto">
        {trades.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <span className="text-[10px] text-zinc-700">No open positions</span>
          </div>
        ) : (
          trades.map(trade => {
            const pnl = parseFloat(trade.unrealizedPL) || 0;
            const units = parseInt(trade.currentUnits || trade.units);
            const isBuy = units > 0;
            return (
              <div key={trade.id} className="flex items-center px-2 py-1.5 border-b border-[#1e1e30]/50 hover:bg-[#1e1e30]/30 group">
                <span className="w-20 text-[10px] font-bold text-zinc-300">
                  {(trade.instrument || '').replace('_', '/')}
                </span>
                <span className={`w-14 text-right text-[9px] font-bold uppercase ${isBuy ? 'text-emerald-400' : 'text-red-400'}`}>
                  {isBuy ? 'BUY' : 'SELL'}
                </span>
                <span className="w-16 text-right text-[10px] font-mono text-zinc-400">
                  {Math.abs(units).toLocaleString()}
                </span>
                <span className="w-20 text-right text-[10px] font-mono text-zinc-500">
                  {Number(trade.price).toFixed(5)}
                </span>
                <span className={`flex-1 text-right text-[10px] font-bold ${pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {pnl >= 0 ? '+' : ''}{pnl.toFixed(2)}
                </span>
                <button
                  onClick={() => closeTrade(trade.id)}
                  className="w-8 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={12} className="text-red-400 hover:text-red-300" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
