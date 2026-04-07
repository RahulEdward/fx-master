import React, { useEffect, useState } from 'react';
import { useBroker } from '../store/BrokerContext';
import { brokerAPI, tradingAPI, marketAPI } from '../services/api';
import { priceWS } from '../services/websocket';

const WATCH_SYMBOLS = ['EUR_USD', 'GBP_USD', 'USD_JPY', 'AUD_USD', 'USD_CAD', 'NZD_USD', 'EUR_GBP', 'XAU_USD'];

export default function TradingDashboard() {
  const { activeBrokerAccount } = useBroker();
  const [summary, setSummary] = useState(null);
  const [trades, setTrades] = useState([]);
  const [positions, setPositions] = useState([]);
  const [prices, setPrices] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('1D');
  const [marketStatus, setMarketStatus] = useState('OPEN');

  const accId = activeBrokerAccount?.broker_account_id || activeBrokerAccount?.id;

  useEffect(() => {
    if (!accId) return;
    loadData();
    const interval = setInterval(loadData, 5000); // Refresh every 5s
    
    // Connect WebSocket for live prices
    priceWS.connect(WATCH_SYMBOLS);
    const unsubs = WATCH_SYMBOLS.map(sym =>
      priceWS.subscribe(sym, (tick) => {
        setPrices(prev => ({ ...prev, [tick.instrument]: tick }));
      })
    );
    
    // Check market status
    checkMarketStatus();
    const statusInterval = setInterval(checkMarketStatus, 60000);
    
    return () => { 
      clearInterval(interval);
      clearInterval(statusInterval);
      unsubs.forEach(u => u()); 
      priceWS.disconnect(); 
    };
  }, [accId]);

  function checkMarketStatus() {
    const now = new Date();
    const day = now.getUTCDay();
    const hour = now.getUTCHours();
    // Forex market: Sunday 22:00 UTC to Friday 22:00 UTC
    if (day === 6 || (day === 5 && hour >= 22) || (day === 0 && hour < 22)) {
      setMarketStatus('CLOSED');
    } else {
      setMarketStatus('OPEN');
    }
  }

  async function loadData() {
    try {
      const [summaryData, tradesData, positionsData] = await Promise.allSettled([
        brokerAPI.getAccountSummary(accId),
        tradingAPI.getTrades(accId),
        tradingAPI.getPositions(accId),
      ]);
      if (summaryData.status === 'fulfilled') setSummary(summaryData.value);
      if (tradesData.status === 'fulfilled') setTrades(tradesData.value?.trades || []);
      if (positionsData.status === 'fulfilled') setPositions(positionsData.value?.positions || []);
    } catch (e) {
      console.error('Failed to load dashboard data:', e);
    } finally {
      setLoading(false);
    }
  }

  // --- No broker connected state ---
  if (!accId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center border border-white/10">
          <span className="text-4xl">🔗</span>
        </div>
        <h2 className="text-2xl font-bold text-white">Connect Your Broker</h2>
        <p className="text-gray-500 text-center max-w-md">
          Connect your OANDA account to start trading. Go to the <strong>Connect Broker</strong> page to get started.
        </p>
        <a href="/connect" className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold hover:opacity-90 transition-opacity">
          Connect Broker →
        </a>
      </div>
    );
  }

  // --- Loading state ---
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const formatCurrency = (val) => {
    if (val == null) return '—';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: summary?.currency || 'USD' }).format(val);
  };

  const formatPair = (sym) => sym?.replace('_', '/') || sym;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Trading Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Account: {accId}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
            marketStatus === 'OPEN' 
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' 
              : 'bg-red-500/15 text-red-400 border border-red-500/30'
          }`}>
            <span className={`w-2 h-2 rounded-full ${marketStatus === 'OPEN' ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
            Market {marketStatus}
          </span>
        </div>
      </div>

      {/* Account Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Balance', value: formatCurrency(summary.balance), icon: '💰', color: 'from-blue-500/10 to-blue-600/5' },
            { label: 'Unrealized P&L', value: formatCurrency(summary.unrealizedPL || summary.unrealized_pl), icon: '📈', color: (summary.unrealizedPL || summary.unrealized_pl || 0) >= 0 ? 'from-emerald-500/10 to-emerald-600/5' : 'from-red-500/10 to-red-600/5' },
            { label: 'Margin Used', value: formatCurrency(summary.marginUsed || summary.margin_used), icon: '🔒', color: 'from-amber-500/10 to-amber-600/5' },
            { label: 'Open Trades', value: summary.openTradeCount || summary.open_trade_count || trades.length, icon: '📊', color: 'from-purple-500/10 to-purple-600/5' },
          ].map((card) => (
            <div key={card.label} className={`rounded-2xl bg-gradient-to-br ${card.color} border border-white/5 p-5`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-500 text-sm font-medium">{card.label}</span>
                <span className="text-lg">{card.icon}</span>
              </div>
              <p className="text-xl font-bold text-white">{card.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Live Prices Grid */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-3">Live Prices</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {WATCH_SYMBOLS.map(sym => {
            const tick = prices[sym];
            return (
              <div key={sym} className="rounded-xl border border-white/5 bg-white/[0.02] p-4 hover:bg-white/[0.04] transition-colors">
                <p className="text-sm font-semibold text-white mb-2">{formatPair(sym)}</p>
                {tick ? (
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="text-xs text-gray-500">Bid</p>
                      <p className="text-sm font-mono text-blue-400">{Number(tick.bid).toFixed(5)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Ask</p>
                      <p className="text-sm font-mono text-emerald-400">{Number(tick.ask).toFixed(5)}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-gray-600">Waiting...</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Open Positions */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-3">Open Positions</h2>
        {positions.length === 0 ? (
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-8 text-center">
            <p className="text-gray-500">No open positions</p>
          </div>
        ) : (
          <div className="rounded-xl border border-white/5 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-white/[0.03] text-gray-500 text-xs uppercase tracking-wider">
                  <th className="text-left px-4 py-3">Instrument</th>
                  <th className="text-right px-4 py-3">Units</th>
                  <th className="text-right px-4 py-3">Avg Price</th>
                  <th className="text-right px-4 py-3">P&L</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {positions.map((pos, i) => (
                  <tr key={i} className="hover:bg-white/[0.02]">
                    <td className="px-4 py-3 font-medium text-white">{formatPair(pos.instrument)}</td>
                    <td className="px-4 py-3 text-right text-gray-300">
                      {pos.long?.units !== '0' ? pos.long.units : pos.short?.units}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-300 font-mono">
                      {pos.long?.averagePrice || pos.short?.averagePrice || '—'}
                    </td>
                    <td className={`px-4 py-3 text-right font-semibold ${
                      Number(pos.unrealizedPL) >= 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      {formatCurrency(pos.unrealizedPL)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Trades */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-3">Open Trades</h2>
        {trades.length === 0 ? (
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-8 text-center">
            <p className="text-gray-500">No open trades</p>
          </div>
        ) : (
          <div className="rounded-xl border border-white/5 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-white/[0.03] text-gray-500 text-xs uppercase tracking-wider">
                  <th className="text-left px-4 py-3">Instrument</th>
                  <th className="text-right px-4 py-3">Units</th>
                  <th className="text-right px-4 py-3">Open Price</th>
                  <th className="text-right px-4 py-3">Current P&L</th>
                  <th className="text-right px-4 py-3">Opened</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {trades.slice(0, 10).map((trade, i) => (
                  <tr key={i} className="hover:bg-white/[0.02]">
                    <td className="px-4 py-3 font-medium text-white">{formatPair(trade.instrument)}</td>
                    <td className={`px-4 py-3 text-right ${Number(trade.currentUnits || trade.units) > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {trade.currentUnits || trade.units}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-300 font-mono">{Number(trade.price).toFixed(5)}</td>
                    <td className={`px-4 py-3 text-right font-semibold ${
                      Number(trade.unrealizedPL) >= 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      {formatCurrency(trade.unrealizedPL)}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-500 text-xs">
                      {new Date(trade.openTime).toLocaleDateString()}
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
}
