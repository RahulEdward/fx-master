import React, { useState } from 'react';
import { useBroker } from '../store/BrokerContext';
import { tradingAPI } from '../services/api';

const POPULAR_PAIRS = ['EUR_USD', 'GBP_USD', 'USD_JPY', 'AUD_USD', 'USD_CAD', 'USD_CHF', 'NZD_USD', 'XAU_USD'];

export default function OrderPanel() {
  const { activeBrokerAccount } = useBroker();
  const accId = activeBrokerAccount?.broker_account_id || activeBrokerAccount?.id;
  const [order, setOrder] = useState({
    instrument: 'EUR_USD', units: 1000, order_type: 'MARKET',
    price: '', take_profit: '', stop_loss: '', time_in_force: 'FOK',
  });
  const [side, setSide] = useState('BUY');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!accId) { setError('No broker connected'); return; }
    setLoading(true); setError(''); setResult(null);
    try {
      const units = side === 'BUY' ? Math.abs(order.units) : -Math.abs(order.units);
      const body = {
        instrument: order.instrument,
        units,
        order_type: order.order_type,
        time_in_force: order.order_type === 'MARKET' ? 'FOK' : 'GTC',
      };
      if (order.price && order.order_type !== 'MARKET') body.price = parseFloat(order.price);
      if (order.take_profit) body.take_profit = parseFloat(order.take_profit);
      if (order.stop_loss) body.stop_loss = parseFloat(order.stop_loss);

      const res = await tradingAPI.placeOrder(accId, body);
      setResult(res.data);
    } catch (err) { setError(err.message); }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-[#0d1117] border border-white/10 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-5">Place Order</h2>

        {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-lg p-3 mb-4">{error}</div>}
        {result && (
          <div className="bg-green-500/10 border border-green-500/30 text-green-400 text-xs rounded-lg p-3 mb-4">
            Order {result.status} — {result.instrument} @ {result.price}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Instrument */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Instrument</label>
            <select value={order.instrument} onChange={e => setOrder({ ...order, instrument: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500/50">
              {POPULAR_PAIRS.map(p => <option key={p} value={p} className="bg-[#0d1117]">{p.replace('_', '/')}</option>)}
            </select>
          </div>

          {/* Buy / Sell Toggle */}
          <div className="grid grid-cols-2 gap-3">
            <button type="button" onClick={() => setSide('BUY')}
              className={`py-3 rounded-lg font-bold text-sm transition-all ${
                side === 'BUY' ? 'bg-green-500/20 border border-green-500/50 text-green-400 shadow-lg shadow-green-500/10' : 'bg-white/5 border border-white/10 text-gray-500'
              }`}>BUY</button>
            <button type="button" onClick={() => setSide('SELL')}
              className={`py-3 rounded-lg font-bold text-sm transition-all ${
                side === 'SELL' ? 'bg-red-500/20 border border-red-500/50 text-red-400 shadow-lg shadow-red-500/10' : 'bg-white/5 border border-white/10 text-gray-500'
              }`}>SELL</button>
          </div>

          {/* Order Type */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Order Type</label>
            <div className="grid grid-cols-4 gap-2">
              {['MARKET', 'LIMIT', 'STOP', 'STOP_LIMIT'].map(t => (
                <button key={t} type="button" onClick={() => setOrder({ ...order, order_type: t })}
                  className={`py-2 rounded-md text-[10px] font-bold uppercase transition-all ${
                    order.order_type === t ? 'bg-blue-500/20 border border-blue-500/50 text-blue-400' : 'bg-white/5 border border-white/10 text-gray-500'
                  }`}>{t.replace('_', ' ')}</button>
              ))}
            </div>
          </div>

          {/* Units */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Units</label>
            <input type="number" required min="1" value={order.units}
              onChange={e => setOrder({ ...order, units: parseInt(e.target.value) || 0 })}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm font-mono focus:outline-none focus:border-blue-500/50" />
          </div>

          {/* Price (for non-market orders) */}
          {order.order_type !== 'MARKET' && (
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Price</label>
              <input type="number" step="0.00001" value={order.price}
                onChange={e => setOrder({ ...order, price: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm font-mono focus:outline-none focus:border-blue-500/50" />
            </div>
          )}

          {/* TP / SL */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Take Profit</label>
              <input type="number" step="0.00001" value={order.take_profit}
                onChange={e => setOrder({ ...order, take_profit: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm font-mono focus:outline-none focus:border-green-500/50"
                placeholder="Optional" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Stop Loss</label>
              <input type="number" step="0.00001" value={order.stop_loss}
                onChange={e => setOrder({ ...order, stop_loss: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm font-mono focus:outline-none focus:border-red-500/50"
                placeholder="Optional" />
            </div>
          </div>

          <button type="submit" disabled={loading}
            className={`w-full py-3.5 rounded-lg font-bold text-sm transition-all disabled:opacity-50 shadow-lg ${
              side === 'BUY'
                ? 'bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 shadow-green-500/20'
                : 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 shadow-red-500/20'
            } text-white`}>
            {loading ? 'Placing...' : `${side} ${order.instrument.replace('_', '/')}`}
          </button>
        </form>
      </div>
    </div>
  );
}
