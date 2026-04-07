import React, { useState } from 'react';
import { useTerminalStore } from '../../hooks/useTerminalStore';
import { useBroker } from '../../store/BrokerContext';
import { tradingAPI } from '../../services/api';
import { showToast } from '../common/ToastManager';
import { FOREX_PAIRS, ORDER_TYPES } from '../../lib/constants';
import { ArrowUpCircle, ArrowDownCircle } from 'lucide-react';

export function OrderTicketPanel() {
  const { selectedSymbol, prices, defaults, addLog } = useTerminalStore();
  const { activeBrokerAccount } = useBroker();
  const accId = activeBrokerAccount?.broker_account_id || activeBrokerAccount?.id;
  const tick = prices[selectedSymbol];

  const [side, setSide] = useState('BUY');
  const [orderType, setOrderType] = useState('MARKET');
  const [units, setUnits] = useState(defaults.lotSize * 100000);
  const [limitPrice, setLimitPrice] = useState('');
  const [sl, setSl] = useState('');
  const [tp, setTp] = useState('');
  const [loading, setLoading] = useState(false);

  const pair = FOREX_PAIRS.find(p => p.symbol === selectedSymbol);

  const handleSubmit = async () => {
    if (!accId) {
      showToast('error', 'No Broker', 'Connect a broker first');
      return;
    }
    setLoading(true);
    try {
      const order = {
        instrument: selectedSymbol,
        units: side === 'SELL' ? -Math.abs(units) : Math.abs(units),
        type: orderType,
        timeInForce: orderType === 'MARKET' ? 'FOK' : 'GTC',
      };
      if (orderType !== 'MARKET' && limitPrice) order.price = limitPrice;
      if (sl) order.stopLossOnFill = { price: sl };
      if (tp) order.takeProfitOnFill = { price: tp };

      await tradingAPI.placeOrder(accId, order);
      addLog('order', `${side} ${units} ${pair?.display || selectedSymbol} @ ${orderType}`);
      showToast('success', 'Order Placed', `${side} ${units} ${pair?.display}`);
    } catch (err) {
      addLog('error', `Order failed: ${err.message}`);
      showToast('error', 'Order Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#0a0a12] p-3 gap-3">
      {/* Symbol */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-white">{pair?.display || selectedSymbol}</span>
        {tick && (
          <span className="text-[10px] font-mono text-zinc-500">
            Spread: {((tick.ask - tick.bid) / (pair?.pip || 0.0001)).toFixed(1)} pips
          </span>
        )}
      </div>

      {/* Buy / Sell Toggle */}
      <div className="grid grid-cols-2 gap-1">
        <button
          onClick={() => setSide('BUY')}
          className={`py-2.5 rounded text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all ${
            side === 'BUY'
              ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 shadow-lg shadow-emerald-500/10'
              : 'bg-[#1e1e30] text-zinc-500 hover:text-emerald-400'
          }`}
        >
          <ArrowUpCircle size={14} />
          BUY {tick ? tick.ask?.toFixed(pair?.pip === 0.01 ? 3 : 5) : ''}
        </button>
        <button
          onClick={() => setSide('SELL')}
          className={`py-2.5 rounded text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all ${
            side === 'SELL'
              ? 'bg-red-500/20 border border-red-500/50 text-red-400 shadow-lg shadow-red-500/10'
              : 'bg-[#1e1e30] text-zinc-500 hover:text-red-400'
          }`}
        >
          <ArrowDownCircle size={14} />
          SELL {tick ? tick.bid?.toFixed(pair?.pip === 0.01 ? 3 : 5) : ''}
        </button>
      </div>

      {/* Order Type */}
      <div>
        <label className="text-[9px] text-zinc-600 uppercase tracking-wider font-bold">Order Type</label>
        <div className="flex gap-1 mt-1">
          {ORDER_TYPES.map(t => (
            <button key={t} onClick={() => setOrderType(t)}
              className={`flex-1 py-1.5 rounded text-[9px] font-bold transition-colors ${
                orderType === t
                  ? 'bg-[#1e1e30] text-white border border-[#2a2a42]'
                  : 'text-zinc-600 hover:text-zinc-400'
              }`}
            >{t}</button>
          ))}
        </div>
      </div>

      {/* Units */}
      <div>
        <label className="text-[9px] text-zinc-600 uppercase tracking-wider font-bold">Units</label>
        <input
          type="number"
          value={units}
          onChange={(e) => setUnits(Number(e.target.value))}
          className="w-full mt-1 bg-[#0e0e16] border border-[#1e1e30] rounded px-3 py-2 text-[11px] text-white font-mono outline-none focus:border-emerald-500/50"
        />
        <div className="flex gap-1 mt-1">
          {[1000, 5000, 10000, 50000, 100000].map(u => (
            <button key={u} onClick={() => setUnits(u)}
              className="flex-1 py-1 rounded text-[8px] bg-[#1e1e30] text-zinc-500 hover:text-zinc-300 font-bold"
            >{u >= 1000 ? `${u/1000}K` : u}</button>
          ))}
        </div>
      </div>

      {/* Limit Price */}
      {orderType !== 'MARKET' && (
        <div>
          <label className="text-[9px] text-zinc-600 uppercase tracking-wider font-bold">Price</label>
          <input type="number" step="any" value={limitPrice} onChange={(e) => setLimitPrice(e.target.value)}
            className="w-full mt-1 bg-[#0e0e16] border border-[#1e1e30] rounded px-3 py-2 text-[11px] text-white font-mono outline-none focus:border-emerald-500/50"
            placeholder="Limit/Stop price" />
        </div>
      )}

      {/* SL / TP */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[9px] text-zinc-600 uppercase tracking-wider font-bold">Stop Loss</label>
          <input type="number" step="any" value={sl} onChange={(e) => setSl(e.target.value)}
            className="w-full mt-1 bg-[#0e0e16] border border-[#1e1e30] rounded px-3 py-1.5 text-[10px] text-red-400 font-mono outline-none focus:border-red-500/50"
            placeholder="SL Price" />
        </div>
        <div>
          <label className="text-[9px] text-zinc-600 uppercase tracking-wider font-bold">Take Profit</label>
          <input type="number" step="any" value={tp} onChange={(e) => setTp(e.target.value)}
            className="w-full mt-1 bg-[#0e0e16] border border-[#1e1e30] rounded px-3 py-1.5 text-[10px] text-emerald-400 font-mono outline-none focus:border-emerald-500/50"
            placeholder="TP Price" />
        </div>
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={loading || !accId}
        className={`mt-auto py-3 rounded text-[11px] font-bold transition-all disabled:opacity-50 ${
          side === 'BUY'
            ? 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-lg shadow-emerald-500/20'
            : 'bg-red-500 hover:bg-red-400 text-white shadow-lg shadow-red-500/20'
        }`}
      >
        {loading ? 'Executing...' : `${side} ${units.toLocaleString()} ${pair?.display || selectedSymbol}`}
      </button>
    </div>
  );
}
