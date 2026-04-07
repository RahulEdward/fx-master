import React, { useEffect, useState } from 'react';
import { useBroker } from '../../store/BrokerContext';
import { brokerAPI } from '../../services/api';
import { RefreshCw, Link as LinkIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function FundsPanel() {
  const { activeBrokerAccount } = useBroker();
  const accId = activeBrokerAccount?.broker_account_id || activeBrokerAccount?.id;
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const loadSummary = async () => {
    if (!accId) return;
    setLoading(true);
    try {
      const res = await brokerAPI.getAccountSummary(accId);
      setSummary(res.data || res);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    loadSummary();
    const interval = setInterval(loadSummary, 10000);
    return () => clearInterval(interval);
  }, [accId]);

  const fmt = (val) => val != null ? Number(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '—';
  const currency = summary?.currency || activeBrokerAccount?.currency || 'USD';

  const items = [
    { label: 'Balance', value: fmt(summary?.balance), color: 'text-white' },
    { label: 'Equity', value: fmt(summary?.NAV || summary?.equity), color: 'text-white' },
    { label: 'Unrealized P&L', value: fmt(summary?.unrealizedPL || summary?.unrealized_pl), color: Number(summary?.unrealizedPL || summary?.unrealized_pl || 0) >= 0 ? 'text-emerald-400' : 'text-red-400' },
    { label: 'Margin Used', value: fmt(summary?.marginUsed || summary?.margin_used), color: 'text-amber-400' },
    { label: 'Margin Available', value: fmt(summary?.marginAvailable || summary?.margin_available), color: 'text-zinc-300' },
    { label: 'Open Trades', value: summary?.openTradeCount || summary?.open_trade_count || '0', color: 'text-zinc-400' },
  ];

  return (
    <div className="h-full bg-[#0a0a12] p-2 flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[9px] text-zinc-600 uppercase tracking-wider font-bold">{currency} Account</span>
        <button onClick={loadSummary} disabled={loading} className="p-1 hover:bg-[#1e1e30] rounded transition-colors">
          <RefreshCw size={10} className={`text-zinc-600 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {!accId ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 py-4">
          <p className="text-[10px] text-zinc-600">No broker connected</p>
          <button 
            onClick={() => navigate('/connect')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30 transition-colors text-[10px] font-bold uppercase tracking-wider"
          >
            <LinkIcon size={10} />
            Connect Broker
          </button>
        </div>
      ) : (
        <div className="space-y-1.5">
          {items.map(item => (
            <div key={item.label} className="flex items-center justify-between">
              <span className="text-[9px] text-zinc-600 uppercase tracking-wider">{item.label}</span>
              <span className={`text-[11px] font-bold font-mono ${item.color}`}>{item.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
