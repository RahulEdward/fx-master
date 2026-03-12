import React, { useEffect, useState } from 'react';
import { useBroker } from '../../store/BrokerContext';
import { brokerAPI, tradingAPI, marketAPI } from '../../services/api';
import { priceWS } from '../../services/websocket';

const WATCH_SYMBOLS = ['EUR_USD', 'GBP_USD', 'USD_JPY', 'XAU_USD'];

export default function TradingDashboard() {
  const { activeBrokerAccount } = useBroker();
  const [summary, setSummary] = useState(null);
  const [trades, setTrades] = useState([]);
  const [positions, setPositions] = useState([]);
  const [prices, setPrices] = useState({});
  const [loading, setLoading] = useState(true);

  const accId = activeBrokerAccount?.broker_account_id || activeBrokerAccount?.id;

  useEffect(() => {
    if (!accId) return;
    loadData();
    // Connect WebSocket for live prices
    priceWS.connect(WATCH_SYMBOLS);
    const unsubs = WATCH_SYMBOLS.map(sym =>
      priceWS.subscribe(sym, (tick) => {
        setPrices(prev => ({ ...prev, [tick.instrument]: tick }));
      })
    );
    return () => { unsubs.forEach(u => u()); priceWS.disconnect(); };
  }, [accId]);

  async function loadData() {
    if (!accId) return;
    setLoading(true);
    try {
      const [sumRes, trRes, posRes] = await Promise.all([
        brokerAPI.getAccountSummary(accId),
        tradingAPI.getTrades(accId),
        tradingAPI.getPositions(accId),
      ]);
      setSummary(sumRes.data);
      setTrades(trRes.data || []);
      setPositions(posRes.data || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  }

  if (!accId) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="text-6xl mb-4">🔗</div>
          <h2 className="text-xl font-bold text-white mb-2">No Broker Connected</h2>
          <p className="text-gray-500">Connect your OANDA account to start trading.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="flex items-center justify-center h-[60vh]"><div className="text-gray-500 animate-pulse text-lg">Loading dashboard...</div></div>;
  }

  return (
    <div className="space-y-6">
      {/* Account Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Balance', value: `$${summary?.balance?.toLocaleString() || '0'}`, color: 'text-white' },
          { label: 'Margin Available', value: `$${summary?.margin_available?.toLocaleString() || '0'}`, color: 'text-blue-400' },
          { label: 'Unrealized P/L', value: `$${summary?.unrealized_pl?.toFixed(2) || '0'}`,
            color: (summary?.unrealized_pl || 0) >= 0 ? 'text-green-400' : 'text-red-400' },
          { label: 'Open Trades', value: summary?.open_trade_count || 0, color: 'text-amber-400' },
        ].map(item => (
          <div key={item.label} className="bg-[#0d1117] border border-white/10 rounded-xl p-4">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{item.label}</div>
            <div className={`text-xl font-bold ${item.color}`}>{item.value}</div>
          </div>
        ))}
      </div>

      {/* Live Prices */}
      <div className="bg-[#0d1117] border border-white/10 rounded-xl p-5">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Live Prices</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {WATCH_SYMBOLS.map(sym => {
            const p = prices[sym];
            return (
              <div key={sym} className="bg-white/5 rounded-lg p-3 border border-white/5">
                <div className="text-xs text-gray-500 font-bold mb-1">{sym.replace('_', '/')}</div>
                {p ? (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-red-400 font-mono">{p.bid?.toFixed(5)}</span>
                      <span className="text-blue-400 font-mono">{p.ask?.toFixed(5)}</span>
                    </div>
                    <div className="text-[10px] text-gray-600 mt-1">Spread: {(p.spread * 10000).toFixed(1)} pips</div>
                  </>
                ) : (
                  <div className="text-gray-600 text-sm animate-pulse">Waiting...</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Open Trades */}
      <div className="bg-[#0d1117] border border-white/10 rounded-xl p-5">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Open Trades ({trades.length})</h3>
        {trades.length === 0 ? (
          <p className="text-gray-600 text-sm">No open trades</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-gray-500 text-xs uppercase border-b border-white/5">
                <th className="text-left pb-2 pr-4">Instrument</th>
                <th className="text-left pb-2 pr-4">Side</th>
                <th className="text-right pb-2 pr-4">Units</th>
                <th className="text-right pb-2 pr-4">Entry</th>
                <th className="text-right pb-2 pr-4">P/L</th>
                <th className="text-right pb-2">Actions</th>
              </tr></thead>
              <tbody>
                {trades.map(t => (
                  <tr key={t.trade_id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-3 pr-4 font-mono text-white">{t.instrument}</td>
                    <td className={`py-3 pr-4 font-bold ${t.side === 'LONG' ? 'text-green-400' : 'text-red-400'}`}>{t.side}</td>
                    <td className="py-3 pr-4 text-right font-mono text-white">{Math.abs(t.units)}</td>
                    <td className="py-3 pr-4 text-right font-mono text-gray-400">{t.entry_price}</td>
                    <td className={`py-3 pr-4 text-right font-mono ${t.unrealized_pl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      ${t.unrealized_pl?.toFixed(2)}
                    </td>
                    <td className="py-3 text-right">
                      <button onClick={() => handleCloseTrade(t.trade_id)}
                        className="px-3 py-1 rounded-md bg-red-500/10 text-red-400 text-xs font-bold hover:bg-red-500/20 transition-colors">
                        Close
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Positions */}
      <div className="bg-[#0d1117] border border-white/10 rounded-xl p-5">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Positions ({positions.length})</h3>
        {positions.length === 0 ? (
          <p className="text-gray-600 text-sm">No open positions</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-gray-500 text-xs uppercase border-b border-white/5">
                <th className="text-left pb-2 pr-4">Instrument</th>
                <th className="text-right pb-2 pr-4">Long</th>
                <th className="text-right pb-2 pr-4">Short</th>
                <th className="text-right pb-2">Unrealized P/L</th>
              </tr></thead>
              <tbody>
                {positions.map(p => (
                  <tr key={p.instrument} className="border-b border-white/5">
                    <td className="py-3 pr-4 font-mono text-white">{p.instrument}</td>
                    <td className="py-3 pr-4 text-right font-mono text-green-400">{p.long_units || '—'}</td>
                    <td className="py-3 pr-4 text-right font-mono text-red-400">{p.short_units || '—'}</td>
                    <td className={`py-3 text-right font-mono ${p.unrealized_pl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      ${p.unrealized_pl?.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  async function handleCloseTrade(tradeId) {
    if (!confirm('Close this trade?')) return;
    try {
      await tradingAPI.closeTrade(accId, tradeId);
      loadData();
    } catch (e) { alert(e.message); }
  }
}
